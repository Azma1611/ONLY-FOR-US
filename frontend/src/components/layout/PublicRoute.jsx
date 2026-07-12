import { Navigate, Outlet } from 'react-router';
import useAuthStore from '@/store/authStore';

/**
 * Guard that redirects authenticated users to the dashboard
 */
export default function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
