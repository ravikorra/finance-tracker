/**
 * Format number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date as readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month
 */
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};
