/**
 * Mutual Fund API Service
 * Uses free MF API from https://api.mfapi.in/
 */

const MF_API_BASE = 'https://api.mfapi.in';

/**
 * Fetch all mutual fund schemes
 * @returns {Promise<Array>} Array of mutual fund schemes
 */
export const getAllMutualFunds = async () => {
  try {
    const response = await fetch(`${MF_API_BASE}/mf`);
    if (!response.ok) {
      throw new Error('Failed to fetch mutual funds');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    return [];
  }
};

/**
 * Search mutual funds by name
 * @param {string} query - Search query
 * @param {Array} allFunds - Pre-fetched list of all funds (optional)
 * @returns {Promise<Array>} Filtered array of mutual funds
 */
export const searchMutualFunds = async (query, allFunds = null) => {
  try {
    // If allFunds not provided, fetch them
    const funds = allFunds || await getAllMutualFunds();
    
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Search in scheme name
    const results = funds.filter(fund => 
      fund.schemeName.toLowerCase().includes(searchTerm)
    );

    // Limit results to 10 for better UX
    return results.slice(0, 10);
  } catch (error) {
    console.error('Error searching mutual funds:', error);
    return [];
  }
};

/**
 * Get mutual fund details by scheme code
 * @param {string} schemeCode - Scheme code
 * @returns {Promise<Object>} Mutual fund details
 */
export const getMutualFundDetails = async (schemeCode) => {
  try {
    const response = await fetch(`${MF_API_BASE}/mf/${schemeCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mutual fund details');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching mutual fund details:', error);
    return null;
  }
};

/**
 * Get latest NAV for a mutual fund
 * @param {string} schemeCode - Scheme code
 * @returns {Promise<number|null>} Latest NAV value
 */
export const getLatestNAV = async (schemeCode) => {
  try {
    const details = await getMutualFundDetails(schemeCode);
    if (details && details.data && details.data.length > 0) {
      return parseFloat(details.data[0].nav);
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest NAV:', error);
    return null;
  }
};

/**
 * Get NAV on a specific date (or closest available date)
 * @param {string} schemeCode - Scheme code
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<number|null>} NAV value on that date
 */
export const getNAVOnDate = async (schemeCode, date) => {
  try {
    const details = await getMutualFundDetails(schemeCode);
    if (!details || !details.data || details.data.length === 0) {
      return null;
    }

    // Find NAV for the specified date or closest previous date
    const targetDate = new Date(date);
    let closestNAV = null;
    let closestDate = null;

    for (const record of details.data) {
      const recordDate = new Date(record.date);
      
      // If exact match, return it
      if (record.date === date) {
        return parseFloat(record.nav);
      }

      // If record is before target date, check if it's the closest
      if (recordDate <= targetDate) {
        if (!closestDate || recordDate > closestDate) {
          closestDate = recordDate;
          closestNAV = parseFloat(record.nav);
        }
      }
    }

    return closestNAV;
  } catch (error) {
    console.error('Error fetching NAV on date:', error);
    return null;
  }
};

/**
 * Calculate units purchased based on invested amount and NAV
 * @param {number} investedAmount - Amount invested
 * @param {number} nav - NAV on purchase date
 * @returns {number} Number of units purchased
 */
export const calculateUnits = (investedAmount, nav) => {
  if (!investedAmount || !nav || nav === 0) {
    return 0;
  }
  return investedAmount / nav;
};

/**
 * Calculate current value based on units and current NAV
 * @param {number} units - Number of units
 * @param {number} currentNav - Current NAV
 * @returns {number} Current value
 */
export const calculateCurrentValue = (units, currentNav) => {
  if (!units || !currentNav) {
    return 0;
  }
  return units * currentNav;
};

/**
 * Refresh NAV for an investment
 * @param {Object} investment - Investment object with schemeCode
 * @returns {Promise<Object>} Updated investment with new current value
 */
export const refreshInvestmentNAV = async (investment) => {
  try {
    if (!investment.schemeCode) {
      console.warn('No scheme code for investment:', investment.name);
      return investment;
    }

    const latestNAV = await getLatestNAV(investment.schemeCode);
    if (!latestNAV) {
      console.warn('Could not fetch NAV for:', investment.name);
      return investment;
    }

    // If we have units, calculate new current value
    if (investment.units && investment.units > 0) {
      const newCurrent = calculateCurrentValue(investment.units, latestNAV);
      return {
        ...investment,
        current: newCurrent
      };
    }

    // If no units but we have invested amount and date, calculate units first
    if (investment.invested && investment.date) {
      const purchaseNAV = await getNAVOnDate(investment.schemeCode, investment.date);
      if (purchaseNAV) {
        const units = calculateUnits(investment.invested, purchaseNAV);
        const newCurrent = calculateCurrentValue(units, latestNAV);
        return {
          ...investment,
          units,
          current: newCurrent
        };
      }
    }

    return investment;
  } catch (error) {
    console.error('Error refreshing NAV:', error);
    return investment;
  }
};
