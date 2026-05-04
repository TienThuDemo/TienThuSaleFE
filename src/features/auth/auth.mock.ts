/**
 * Dev-mode auth stub.
 *
 * Behavior: if the form passes Zod validation, the request always succeeds.
 * No password matching, no user persistence — purely a UI-level pass-through
 * so we can develop screens without the NestJS backend (port 8181) while
 * keeping json-server (port 3001) for the rest of the app.
 *
 * Hooks mimic the RTK Query mutation shape (`[trigger, { isLoading }]` with
 * `trigger(args).unwrap()`) so consuming pages don't need to change.
 */

import { useCallback, useState } from 'react';
import type { AuthResult, AuthTokens, AuthenticatedUser } from './auth.types';

const MOCK_NETWORK_DELAY_MS = 300;

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

const buildAuthResult = (email: string): AuthResult => {
  const id = generateMockId();
  const user: AuthenticatedUser = { id, email };
  return { user, tokens: issueMockTokens(id) };
};

const mockLogin = async (args: MockLoginRequest): Promise<AuthResult> => {
  await sleep(MOCK_NETWORK_DELAY_MS);
  return buildAuthResult(args.email);
};

const mockRegister = async (args: MockRegisterRequest): Promise<AuthResult> => {
  await sleep(MOCK_NETWORK_DELAY_MS);
  return buildAuthResult(args.email);
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
