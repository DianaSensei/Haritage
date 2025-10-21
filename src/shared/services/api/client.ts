import { CONFIG } from "@/core/config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
}

export interface FileUpload {
  uri: string;
  name: string;
  type: string;
}

export interface FormDataOptions {
  files?: Record<string, FileUpload | FileUpload[]>;
  fields?: Record<string, string | number | boolean>;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  payload?: any;
  isClientError?: boolean; // 4xx
  isServerError?: boolean; // 5xx
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
}

function buildQueryString(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null)
      params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchWithTimeout(
  input: string,
  init: RequestOptions = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? CONFIG.NETWORK.TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = input + buildQueryString(init.query);
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    return response;
  } catch (err: any) {
    const error: ApiError = new Error(
      err?.name === "AbortError"
        ? "Request timed out"
        : err?.message || "Network error"
    );
    error.code = err?.name === "AbortError" ? "TIMEOUT" : "NETWORK";
    error.isTimeoutError = err?.name === "AbortError";
    error.isNetworkError = err?.name !== "AbortError";
    throw error;
  } finally {
    clearTimeout(id);
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetchWithTimeout(url, {
    ...options,
    method,
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch (parseError) {
    // If we can't parse the response, we'll still handle the HTTP error
    console.error("Failed to parse response:", parseError);
  }

  if (!response.ok) {
    const error: ApiError = new Error();
    error.status = response.status;
    error.payload = data;

    // Categorize error types
    if (response.status >= 400 && response.status < 500) {
      error.isClientError = true;
      error.message =
        data?.message || data?.error || `Client Error ${response.status}`;
    } else if (response.status >= 500) {
      error.isServerError = true;
      error.message =
        data?.message || data?.error || `Server Error ${response.status}`;
    } else {
      error.message = data?.message || data?.error || `HTTP ${response.status}`;
    }

    // Extract additional error details
    if (data) {
      error.details = data;
      error.code = data.code || data.error_code || `HTTP_${response.status}`;

      // Common error field patterns
      if (data.errors) {
        error.details = {
          ...(typeof error.details === "object" ? error.details : {}),
          validationErrors: data.errors,
        };
      }
      if (data.validation_errors) {
        error.details = {
          ...(typeof error.details === "object" ? error.details : {}),
          validationErrors: data.validation_errors,
        };
      }
    }

    throw error;
  }

  return data as T;
}

export async function uploadFiles<T = unknown>(
  path: string,
  formData: FormDataOptions,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  // Create FormData for file upload
  const uploadFormData = new FormData();

  // Add regular fields
  if (formData.fields) {
    Object.entries(formData.fields).forEach(([key, value]) => {
      uploadFormData.append(key, String(value));
    });
  }

  // Add files
  if (formData.files) {
    Object.entries(formData.files).forEach(([key, fileOrFiles]) => {
      const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      files.forEach((file, index) => {
        const fieldName = Array.isArray(fileOrFiles) ? `${key}[${index}]` : key;
        uploadFormData.append(fieldName, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });
    });
  }

  const response = await fetchWithTimeout(url, {
    ...options,
    method: "POST",
    body: uploadFormData,
    headers: {
      // Don't set Content-Type for FormData, let the browser set it with boundary
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (parseError) {
    // If we can't parse the response, we'll still handle the HTTP error
    console.warn("Failed to parse response:", parseError);
  }

  if (!response.ok) {
    const error: ApiError = new Error();
    error.status = response.status;
    error.payload = data;

    // Categorize error types
    if (response.status >= 400 && response.status < 500) {
      error.isClientError = true;
      error.message =
        data?.message || data?.error || `Client Error ${response.status}`;
    } else if (response.status >= 500) {
      error.isServerError = true;
      error.message =
        data?.message || data?.error || `Server Error ${response.status}`;
    } else {
      error.message = data?.message || data?.error || `HTTP ${response.status}`;
    }

    // Extract additional error details
    if (data) {
      error.details = data;
      error.code = data.code || data.error_code || `HTTP_${response.status}`;

      // Common error field patterns
      if (data.errors) {
        error.details = {
          ...(typeof error.details === "object" ? error.details : {}),
          validationErrors: data.errors,
        };
      }
      if (data.validation_errors) {
        error.details = {
          ...(typeof error.details === "object" ? error.details : {}),
          validationErrors: data.validation_errors,
        };
      }
    }

    throw error;
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, "GET", options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, "POST", {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  postForm: <T>(
    path: string,
    formData: FormDataOptions,
    options?: RequestOptions
  ) => uploadFiles<T>(path, formData, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, "PUT", {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, "PATCH", {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, "DELETE", options),

  // Convenience methods for common use cases
  postJson: <T>(path: string, data: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, "POST", {
      ...options,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    }),
  postText: <T>(path: string, text: string, options?: RequestOptions) =>
    apiRequest<T>(path, "POST", {
      ...options,
      body: text,
      headers: { "Content-Type": "text/plain", ...(options?.headers || {}) },
    }),
  postUrlEncoded: <T>(
    path: string,
    data: Record<string, string>,
    options?: RequestOptions
  ) =>
    apiRequest<T>(path, "POST", {
      ...options,
      body: new URLSearchParams(data).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(options?.headers || {}),
      },
    }),
};
