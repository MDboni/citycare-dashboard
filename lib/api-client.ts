import { ofetch } from "ofetch";
import type { ApiMeta, ApiResponse } from "@/types";
import { ApiError, toApiError } from "./api-error";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./session";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** `undefined` and `""` are dropped so a cleared filter leaves the URL alone. */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

const toSearchParams = (query?: QueryParams) => {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = String(value);
  }
  return Object.keys(params).length ? params : undefined;
};

const raw = ofetch.create({ baseURL: BASE_URL, credentials: "include" });

/**
 * Refreshing is single-flight. Ten queries can fail their 401 in the same tick;
 * without this they would each burn a refresh token and the rotation check
 * server-side would read the reuse as a stolen token and revoke the session.
 */
let refreshInFlight: Promise<string> | null = null;

const refreshTokens = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "Session expired");

  const body = await raw<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh-token", { method: "POST", body: { refreshToken } });

  saveSession(body.data);
  return body.data.accessToken;
};

const runRefresh = () => {
  refreshInFlight ??= refreshTokens().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  /** Skips both the Authorization header and the refresh retry. */
  anonymous?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const isAuthFailure = (error: unknown) => {
  const api = toApiError(error);
  return (
    api.status === 401 &&
    !api.hasCode("ACCOUNT_BLOCKED") &&
    !api.hasCode("INVALID_CREDENTIALS")
  );
};

const send = async <T>(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = { ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return raw<ApiResponse<T>>(path, {
    method: options.method ?? "GET",
    // FormData has to keep its own multipart boundary, so it goes through as is.
    body: options.body as never,
    query: toSearchParams(options.query),
    headers,
    signal: options.signal,
  });
};

/**
 * The single door to the API. Returns the whole envelope, because list
 * endpoints put their counters in `meta` and callers need both halves.
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const token = options.anonymous ? null : getAccessToken();

  try {
    return await send<T>(path, options, token);
  } catch (error) {
    if (options.anonymous || !isAuthFailure(error)) throw toApiError(error);

    // One retry, and only after a refresh actually produced a new token.
    try {
      const fresh = await runRefresh();
      return await send<T>(path, options, fresh);
    } catch (refreshError) {
      clearSession();
      throw toApiError(refreshError);
    }
  }
};

/** For the common case where only `data` matters. */
export const api = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => (await apiRequest<T>(path, options)).data;

/** For list endpoints: rows and counters, already separated. */
export const apiList = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ items: T[]; meta: ApiMeta }> => {
  const response = await apiRequest<T[] | { items: T[] }>(path, options);
  const data = response.data;
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return { items, meta: response.meta ?? {} };
};

export { BASE_URL };
