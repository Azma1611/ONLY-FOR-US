import { lazy } from 'react';

// Lazy-loaded page components
export const LandingPage = lazy(() => import('@/pages/Landing/LandingPage'));
export const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
export const RegisterPage = lazy(() => import('@/pages/Register/RegisterPage'));
export const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
export const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));
export const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword/ForgotPasswordPage'));
export const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword/ResetPasswordPage'));
export const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmail/VerifyEmailPage'));
export const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'));
export const ChatPage = lazy(() => import('@/pages/Chat/ChatPage'));
export const CalendarPage = lazy(() => import('@/pages/Calendar/CalendarPage'));
export const PlannerPage = lazy(() => import('@/pages/Planner/PlannerPage'));
export const FinancePage = lazy(() => import('@/pages/Finance/FinancePage'));
export const MemoriesPage = lazy(() => import('@/pages/Memories/MemoriesPage'));
export const EcosystemPage = lazy(() => import('@/pages/Ecosystem/EcosystemPage'));
export const AIPage = lazy(() => import('@/pages/AI/AIPage'));
export const NotificationCenter = lazy(() => import('@/pages/Notifications/NotificationCenter'));
export const PWASettings = lazy(() => import('@/pages/Settings/PWASettings'));
export const MediaPage = lazy(() => import('@/pages/Media/MediaPage'));

// Error Pages
