import { useCallback, useState } from 'react';
import type { AuthResult, AuthTokens, AuthenticatedUser } from './auth.types';

const MOCK_USERS_STORAGE_KEY = 'tienthu.mock.users';
const MOCK_NETWORK_DELAY_MS = 400;

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_CONFLICT = 409;

const ERROR_CODE_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
const ERROR_CODE_EMAIL_EXISTS = 'EMAIL_ALREADY_REGISTERED';

const ERROR_MESSAGE_INVALID_CREDENTIALS = 'Email hoặc mật khẩu không đúng.';
const ERROR_MESSAGE_EMAIL_EXISTS = 'Email đã được đăng ký.';

interface MockUserRecord {
  id: string;
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
}

interface MockApiErrorPayload {
  success: false;
  error: { code: string; message: string };
}

class MockApiError extends Error {
  readonly status: number;
  readonly data: MockApiErrorPayload;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
    this.data = { success: false, error: { code, message } };
  }
}

const readMockUsers = (): MockUserRecord[] => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MockUserRecord[]) : [];
  } catch {
    return [];
  }
};

const writeMockUsers = (users: MockUserRecord[]): void => {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
};

const generateMockId = (): string =>
  `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const issueMockTokens = (userId: string): AuthTokens => {
  const issuedAt = Date.now().toString(36);
  return {
    accessToken: `mock-access.${userId}.${issuedAt}`,
    refreshToken: `mock-refresh.${userId}.${issuedAt}`,
  };
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface MockLoginRequest {
  email: string;
  password: string;
}

interface MockRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  phoneNumber?: string;
}

interface MockLogoutRequest {
  refreshToken: string;
}

interface MockLogoutResponse {
  success: true;
}

const mockLogin = async (args: MockLoginRequest): Promise<AuthResult> => {
  await sleep(MOCK_NETWORK_DELAY_MS);
  const users = readMockUsers();
  const found = users.find((u) => u.email === args.email);
  if (!found || found.password !== args.password) {
    throw new MockApiError(
      HTTP_STATUS_UNAUTHORIZED,
      ERROR_CODE_INVALID_CREDENTIALS,
      ERROR_MESSAGE_INVALID_CREDENTIALS,
    );
  }
  const user: AuthenticatedUser = { id: found.id, email: found.email };
  return { user, tokens: issueMockTokens(found.id) };
};

const mockRegister = async (args: MockRegisterRequest): Promise<AuthResult> => {
  await sleep(MOCK_NETWORK_DELAY_MS);
  const users = readMockUsers();
  if (users.some((u) => u.email === args.email)) {
    throw new MockApiError(
      HTTP_STATUS_CONFLICT,
      ERROR_CODE_EMAIL_EXISTS,
      ERROR_MESSAGE_EMAIL_EXISTS,
    );
  }
  const id = generateMockId();
  const record: MockUserRecord = {
    id,
    email: args.email,
    password: args.password,
    name: args.name,
    phoneNumber: args.phoneNumber,
  };
  writeMockUsers([...users, record]);
  const user: AuthenticatedUser = { id, email: args.email };
  return { user, tokens: issueMockTokens(id) };
};

const mockLogout = async (args: MockLogoutRequest): Promise<MockLogoutResponse> => {
  void args;
  await sleep(MOCK_NETWORK_DELAY_MS);
  return { success: true };
};

interface MutationTriggerResult<T> {
  unwrap: () => Promise<T>;
}

interface MutationState {
  isLoading: boolean;
}

const useMockMutation = <TArgs, TResponse>(
  fn: (args: TArgs) => Promise<TResponse>,
): readonly [(args: TArgs) => MutationTriggerResult<TResponse>, MutationState] => {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = useCallback(
    (args: TArgs): MutationTriggerResult<TResponse> => {
      setIsLoading(true);
      const promise = fn(args).finally(() => {
        setIsLoading(false);
      });
      return { unwrap: () => promise };
    },
    [fn],
  );
  return [trigger, { isLoading }] as const;
};

export const useMockLoginMutation = () => useMockMutation(mockLogin);
export const useMockRegisterMutation = () => useMockMutation(mockRegister);
export const useMockLogoutMutation = () => useMockMutation(mockLogout);
