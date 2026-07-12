import { clsx } from 'clsx';

/**
 * Merge class names conditionally
 * @param {...any} inputs - Class names or conditional objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format a date to a readable string
 * @param {Date|string} date 
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Calculate days between two dates
 * @param {Date|string} date1 
 * @param {Date|string} date2 
 * @returns {number}
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get a greeting based on time of day
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * Truncate a string to a maximum length
 * @param {string} str 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  return str.length <= maxLength ? str : str.slice(0, maxLength) + '...';
}

/**
 * Generate initials from a name
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format number with commas
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Debounce a function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms 
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get relative time string (e.g. "2 hours ago")
 * @param {Date|string} date 
 * @returns {string}
 */
export function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}
