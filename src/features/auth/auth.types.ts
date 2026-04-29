export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

export interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
