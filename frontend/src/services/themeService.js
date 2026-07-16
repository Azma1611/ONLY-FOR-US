import api from './api';

/**
 * Theme API service — manages mood theme CRUD operations.
 * @module themeService
 */

/**
 * Fetches the current shared mood theme for the relationship.
 * @returns {Promise<import('axios').AxiosResponse>} Theme document
 */
export const getTheme = () => api.get('/theme');

/**
 * Updates the shared mood theme for the relationship.
 * @param {string} theme - One of: 'love', 'normal', 'sad', 'angry'
 * @returns {Promise<import('axios').AxiosResponse>} Updated theme document
 */
export const updateTheme = (theme) => api.put('/theme', { theme });

const themeService = { getTheme, updateTheme };
export default themeService;
