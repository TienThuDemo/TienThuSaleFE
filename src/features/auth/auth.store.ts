import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AUTH_STORAGE_KEY } from './auth.constants';
import type { AuthenticatedUser, AuthTokens } from './auth.types';

interface AuthState {
  user: AuthenticatedUser | null;
  tokens: AuthTokens | null;
  hydrated: boolean;
  setSession: (payload: { user: AuthenticatedUser; tokens: AuthTokens }) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthenticatedUser) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      hydrated: false,
      setSession: ({ user, tokens }) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null, tokens: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.tokens !== null && state.user !== null;

export const selectAccessToken = (state: AuthState): string | null =>
  state.tokens?.accessToken ?? null;

export const selectRefreshToken = (state: AuthState): string | null =>
  state.tokens?.refreshToken ?? null;
