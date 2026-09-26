/**
 * The backend answers with exactly one success envelope and exactly one error
 * envelope (see `sendResponse` and `globalErrorHandler` server-side). Every
 * type here mirrors those two shapes, so nothing downstream has to guess.
 */

export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorDetail = {
  field?: string;
  code?: string;
  message?: string;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
  requestId?: string;
};

/** A list endpoint returns its rows in `data` and its counters in `meta`. */
export type Paginated<T> = {
  items: T[];
  meta: ApiMeta;
};

export type ListQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  q?: string;
};
