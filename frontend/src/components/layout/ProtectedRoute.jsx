import { Navigate, Outlet } from 'react-router';
import useAuthStore from '@/store/authStore';

/**
 * Guard that allows access only to authenticated and email-verified users
 */
export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to verification screen if account is not verified yet
  if (user && !user.emailVerified) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
  }

  return <Outlet />;
}
