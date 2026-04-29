export const AUTH_STORAGE_KEY = 'tienthu.auth';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_DIGIT_REGEX = /\d/;
export const PASSWORD_SPECIAL_REGEX = /[^A-Za-z0-9]/;

export const NAME_MAX_LENGTH = 100;

export const VIETNAM_PHONE_REGEX = /^(?:\+?84|0)(?:3[2-9]|5[2|5|6|8|9]|7[0|6-9]|8[1-9]|9\d|2\d{1,2})\d{7}$/;

export const HTTP_STATUS_UNAUTHORIZED = 401;

export const API_VERSION_PREFIX = '/api/v1';

export const AUTH_API_PATHS = {
  LOGIN: `${API_VERSION_PREFIX}/auth/login`,
  REGISTER: `${API_VERSION_PREFIX}/auth/register`,
  REFRESH: `${API_VERSION_PREFIX}/auth/refresh-token`,
  LOGOUT: `${API_VERSION_PREFIX}/auth/logout`,
  ME: `${API_VERSION_PREFIX}/auth/me`,
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export const POST_LOGIN_REDIRECT = '/sale';
