import api from './api';

/**
 * Authentication service wrapper
 */
const authService = {
  /**
   * Register a new user account
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Log in a user with credentials
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Verify account using email and OTP code
   */
  verifyEmail: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose: 'verification' });
    return response.data;
  },

  /**
   * Request resend of verification 6-digit OTP code
   */
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email, purpose: 'verification' });
    return response.data;
  },

  /**
   * Request password reset link
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Log out a user session
   */
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Get currently authenticated user details
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
