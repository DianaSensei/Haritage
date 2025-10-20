import { CONFIG } from '@/core/config';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends RequestInit {
    timeoutMs?: number;
    query?: Record<string, string | number | boolean | undefined | null>;
    headers?: Record<string, string>;
}

export interface ApiError extends Error {
    status?: number;
    code?: string;
    details?: unknown;
}

function buildQueryString(query?: RequestOptions['query']): string {
    if (!query) return '';
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
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
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(init.headers ?? {}),
            },
        });
        return response;
    } catch (err: any) {
        const error: ApiError = new Error(
            err?.name === 'AbortError' ? 'Request timed out' : (err?.message || 'Network error')
        );
        error.code = err?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK';
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
    const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, '');
    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

    const response = await fetchWithTimeout(url, options);

    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
    } else {
        data = await response.text().catch(() => null);
    }

    if (!response.ok) {
        const error: ApiError = new Error(data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.details = data;
        throw error;
    }

    return data as T;
}

export const http = {
    get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, 'GET', options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(path, 'POST', { ...options, body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(path, 'PUT', { ...options, body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(path, 'PATCH', { ...options, body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, 'DELETE', options),
};


