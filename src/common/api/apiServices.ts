import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { PortalTagTypeE } from '../enums/tag-type';
import { useAuthStore } from '../../features/auth/auth.store';
import {
  AUTH_API_PATHS,
  HTTP_STATUS_UNAUTHORIZED,
} from '../../features/auth/auth.constants';
import { showToast } from '../../utils/toastService';
import type { AuthTokens } from '../../features/auth/auth.types';

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://tienthu-api.onrender.com';

const AUTH_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer';
const REFRESH_TIMEOUT_MS = 15_000;

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: { timestamp: string };
}

interface ApiErrorEnvelope {
  success: false;
  error: { code: string; message: string; details?: unknown };
  meta?: { timestamp: string; path: string };
}

const isApiSuccessEnvelope = <T>(value: unknown): value is ApiSuccessEnvelope<T> =>
  typeof value === 'object' &&
  value !== null &&
  'success' in value &&
  (value as { success: unknown }).success === true &&
  'data' in value;

const isApiErrorEnvelope = (value: unknown): value is ApiErrorEnvelope =>
  typeof value === 'object' &&
  value !== null &&
  'success' in value &&
  (value as { success: unknown }).success === false &&
  'error' in value;

const isAuthTokensShape = (value: unknown): value is AuthTokens =>
  typeof value === 'object' &&
  value !== null &&
  'accessToken' in value &&
  'refreshToken' in value &&
  typeof (value as AuthTokens).accessToken === 'string' &&
  typeof (value as AuthTokens).refreshToken === 'string';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (token && !headers.has(AUTH_HEADER)) {
      headers.set(AUTH_HEADER, `${BEARER_PREFIX} ${token}`);
    }
    return headers;
  },
});

let inflightRefresh: Promise<AuthTokens | null> | null = null;

const performRefresh = async (): Promise<AuthTokens | null> => {
  const refreshToken = useAuthStore.getState().tokens?.refreshToken;
  if (!refreshToken) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${AUTH_API_PATHS.REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    const json = JSON.parse(text) as unknown;
    if (isApiSuccessEnvelope<AuthTokens>(json) && isAuthTokensShape(json.data)) {
      return json.data;
    }
    if (isAuthTokensShape(json)) {
      return json;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const refreshTokensOnce = (): Promise<AuthTokens | null> => {
  if (!inflightRefresh) {
    inflightRefresh = performRefresh().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
};

const forceLogoutWithToast = (): void => {
  showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
  useAuthStore.getState().clearSession();
};

const isRefreshEndpoint = (args: string | FetchArgs): boolean => {
  const url = typeof args === 'string' ? args : args.url;
  return url === AUTH_API_PATHS.REFRESH;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status !== HTTP_STATUS_UNAUTHORIZED ||
    isRefreshEndpoint(args) ||
    !useAuthStore.getState().tokens
  ) {
    return result;
  }

  const newTokens = await refreshTokensOnce();
  if (!newTokens) {
    forceLogoutWithToast();
    return result;
  }

  useAuthStore.getState().setTokens(newTokens);
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const portalService = createApi({
  reducerPath: 'portalApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(PortalTagTypeE),
  endpoints: () => ({}),
});

export const unwrapApiResponse = <T>(response: unknown): T => {
  if (isApiSuccessEnvelope<T>(response)) {
    return response.data;
  }
  return response as T;
};

export const extractApiErrorMessage = (
  error: FetchBaseQueryError | undefined,
  fallback: string,
): string => {
  if (!error) {
    return fallback;
  }
  if ('data' in error && isApiErrorEnvelope(error.data)) {
    return error.data.error.message;
  }
  if ('error' in error && typeof error.error === 'string') {
    return error.error;
  }
  return fallback;
};
