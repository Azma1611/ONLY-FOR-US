import { Suspense } from 'react';
import { Routes, Route } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PublicRoute from '@/components/layout/PublicRoute';
import ToastContainer from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  NotFoundPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  ProfilePage,
  ChatPage,
  CalendarPage,
  PlannerPage,
  FinancePage,
  MemoriesPage,
  EcosystemPage,
  AIPage,
  NotificationCenter,
  PWASettings,
  MediaPage,
} from '@/routes';

/**
 * Root application component — defines all routes and global providers
 */
export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Publicly accessible general routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Guest-only routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Authenticated + Verified routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/memories" element={<MemoriesPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/ecosystem" element={<EcosystemPage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/settings" element={<PWASettings />} />
            </Route>
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Global toast notifications */}
      <ToastContainer />
    </>
  );
}
