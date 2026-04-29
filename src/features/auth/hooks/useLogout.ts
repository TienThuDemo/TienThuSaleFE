import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../auth.api';
import { useAuthStore } from '../auth.store';
import { showToast } from '../../../utils/toastService';
import { AUTH_ROUTES } from '../auth.constants';

interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

export function useLogout(): UseLogoutResult {
  const navigate = useNavigate();
  const [logoutRequest, { isLoading }] = useLogoutMutation();
  const clearSession = useAuthStore((state) => state.clearSession);

  const logout = useCallback(async () => {
    const refreshToken = useAuthStore.getState().tokens?.refreshToken;
    try {
      if (refreshToken) {
        await logoutRequest({ refreshToken }).unwrap();
      }
    } catch {
      // Logout is idempotent on the server side; ignore errors and clear locally.
    } finally {
      clearSession();
      showToast('Đã đăng xuất.', 'info');
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    }
  }, [logoutRequest, clearSession, navigate]);

  return { logout, isLoggingOut: isLoading };
}
