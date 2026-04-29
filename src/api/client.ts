/**
 * HTTP Client — thin wrapper around fetch.
 *
 * Modes:
 * 1. VITE_API_BASE_URL = json-server URL → gọi json-server (REST chuẩn, trả raw JSON)
 * 2. VITE_API_BASE_URL = URL thật → gọi API production
 *
 * json-server trả raw data, API thật có thể trả { data: T }.
 * Client tự detect format và unwrap nếu cần.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:3001';
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // TODO: thêm Authorization header khi có auth
        // 'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        (errBody as Record<string, string>).message ?? `HTTP ${res.status}`,
      );
    }

    // Handle empty responses (204 No Content)
    const text = await res.text();
    if (!text) return undefined as T;

    const json = JSON.parse(text) as T | { data: T };

    // Auto-unwrap { data: T } nếu API production trả format wrapper
    if (
      json !== null &&
      typeof json === 'object' &&
      'data' in json &&
      Object.keys(json).length <= 2 // chỉ có { data, message? }
    ) {
      return (json as { data: T }).data;
    }

    // json-server trả raw data → trả thẳng
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get:    <T>(path: string)              => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string)              => request<T>('DELETE', path),
};
