import type { ApiErrorBody, ApiErrorDetail } from "@/types";

/**
 * Every failed request becomes one of these, so a component never has to know
 * whether the failure came from the API, the network or a thrown parse error.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorDetail[];
  readonly requestId?: string;

  constructor(
    status: number,
    message: string,
    errors: ApiErrorDetail[] = [],
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
  }

  /** True when the body carried this error code — used to branch on 401s. */
  hasCode(code: string) {
    return this.errors.some((e) => e.code === code);
  }

  /** `{ email: "already exists" }`, ready to hand to react-hook-form. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const detail of this.errors) {
      if (detail.field && detail.message && !out[detail.field]) {
        out[detail.field] = detail.message;
      }
    }
    return out;
  }
}

const NETWORK_MESSAGE =
  "Cannot reach the CityCare API. Check your connection and try again.";

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  const response = (
    error as { response?: { status?: number; _data?: unknown } }
  )?.response;

  if (!response) {
    return new ApiError(0, NETWORK_MESSAGE, [
      { code: "NETWORK_ERROR", message: NETWORK_MESSAGE },
    ]);
  }

  const status = response.status ?? 500;
  const body = response._data as ApiErrorBody | undefined;

  return new ApiError(
    status,
    body?.message ?? "Something went wrong",
    body?.errors ?? [],
    body?.requestId,
  );
};

/** The one line a toast should show for any failure. */
export const errorMessage = (error: unknown): string => {
  const api = toApiError(error);
  // A field-level message is more useful than "Validation failed".
  const first = api.errors.find((e) => e.message);
  if (api.message === "Validation failed" && first?.message)
    return first.message;
  return api.message;
};
