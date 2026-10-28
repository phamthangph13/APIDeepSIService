import { API_BASE_URL } from "./env";

const ACCESS_TOKEN_KEY = "deepsi.access_token";

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private mode. The token stays in memory.
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

function isAuthEndpoint(path: string): boolean {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout") ||
    path.startsWith("/auth/forgot-password") ||
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/auth/verify-email") ||
    path.startsWith("/auth/resend-verification") ||
    path.startsWith("/auth/oauth/exchange")
  );
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function envelope(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: unknown }).data;
  }
  return data;
}

function errorFromResponse(status: number, body: unknown): ApiError {
  if (body && typeof body === "object" && "error" in body) {
    const detail = (body as { error?: { code?: string; message?: string; request_id?: string } }).error;
    if (detail?.message) {
      return new ApiError(
        status,
        detail.code ?? "request_failed",
        detail.message,
        detail.request_id,
      );
    }
  }
  if (typeof body === "string" && body.trim()) {
    return new ApiError(status, "request_failed", body.trim());
  }
  if (status === 401) {
    return new ApiError(status, "unauthorized", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }
  if (status === 429) {
    return new ApiError(status, "rate_limited", "Bạn thao tác quá nhanh. Vui lòng thử lại sau.");
  }
  return new ApiError(status, "request_failed", "Máy chủ trả về lỗi. Vui lòng thử lại.");
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return false;
      const body = await parseBody(response);
      const data = envelope(body) as { access_token?: string } | undefined;
      if (!data?.access_token) return false;
      setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const url = /^https?:\/\//.test(path)
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "Không thể kết nối máy chủ DeepSI. Kiểm tra mạng hoặc thử lại sau.",
    );
  }

  if (response.status === 401 && retry && !isAuthEndpoint(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, false);
    notifyUnauthorized();
  }

  const parsed = await parseBody(response);
  if (!response.ok) {
    throw errorFromResponse(response.status, parsed);
  }
  return envelope(parsed) as T;
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
