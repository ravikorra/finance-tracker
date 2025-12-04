/**
 * Calculate total invested amount
 * @param {Array} investments - Array of investment objects
 * @returns {number} Total invested amount
 */
export const calculateTotalInvested = (investments) => {
  return investments.reduce((sum, inv) => sum + (inv.invested || 0), 0);
};

/**
 * Calculate total current value
 * @param {Array} investments - Array of investment objects
 * @returns {number} Total current value
 */
export const calculateTotalCurrent = (investments) => {
  return investments.reduce((sum, inv) => sum + (inv.current || 0), 0);
};

/**
 * Calculate total gain/loss
 * @param {Array} investments - Array of investment objects
 * @returns {number} Total gain/loss
 */
export const calculateTotalGain = (investments) => {
  const totalInvested = calculateTotalInvested(investments);
  const totalCurrent = calculateTotalCurrent(investments);
  return totalCurrent - totalInvested;
};

/**
 * Calculate gain percentage
 * @param {Array} investments - Array of investment objects
 * @returns {number} Gain percentage
 */
export const calculateGainPercentage = (investments) => {
  const totalInvested = calculateTotalInvested(investments);
  const totalGain = calculateTotalGain(investments);
  return totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;
};

/**
 * Calculate monthly expenses
 * @param {Array} expenses - Array of expense objects
 * @param {string} month - Month in YYYY-MM format (optional, defaults to current month)
 * @returns {number} Total monthly expenses
 */
export const calculateMonthlyExpenses = (expenses, month) => {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  return expenses
    .filter(exp => exp.date?.startsWith(targetMonth))
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
};

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by category
 */
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((acc, exp) => {
    if (exp.category) {
      acc[exp.category] = (acc[exp.category] || 0) + (exp.amount || 0);
    }
    return acc;
  }, {});
};

/**
 * Group expenses by member
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by member
 */
export const groupExpensesByMember = (expenses) => {
  return expenses.reduce((acc, exp) => {
    const member = exp.addedBy || 'Unknown';
    acc[member] = (acc[member] || 0) + (exp.amount || 0);
    return acc;
  }, {});
};

/**
 * Group investments by type
 * @param {Array} investments - Array of investment objects
 * @returns {Object} Investments grouped by type with invested and current values
 */
export const groupInvestmentsByType = (investments) => {
  return investments.reduce((acc, inv) => {
    if (!acc[inv.type]) {
      acc[inv.type] = { invested: 0, current: 0 };
    }
    acc[inv.type].invested += inv.invested || 0;
    acc[inv.type].current += inv.current || 0;
    return acc;
  }, {});
};
