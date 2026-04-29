import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated } from '../auth.store';
import { AUTH_ROUTES } from '../auth.constants';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
