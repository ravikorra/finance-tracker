// ==========================================
// API SERVICE LAYER
// ==========================================
// This file handles ALL communication with backend
// When you make mobile app, just copy this file and change BASE_URL

// Backend server address
// For local development: localhost
// For family access: change to your PC's IP (e.g., 192.168.1.100)
// For production: change to your server URL
const BASE_URL = 'http://localhost:5000/v1/api';
const HEALTH_URL = 'http://localhost:5000/health';

// Check if backend is available
async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const health = await response.json();
      console.log('Backend health:', health.data || health);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Backend health check failed:', err.message);
    return false;
  }
}

// Generic request function - handles all HTTP calls
async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for requests

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // If request failed, throw error
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Parse JSON response
    const json = await response.json();
    
    // Backend wraps responses in {success, data} format
    // Extract the data field, or return the whole response if it doesn't have that structure
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timeout - server might be slow or down');
    }
    throw err;
  }
}

// Export all API functions
export const api = {
  // ===== HEALTH CHECK =====
  
  // Check if backend is available
  // Usage: const isUp = await api.checkHealth();
  checkHealth: checkBackendHealth,

  // ===== INVESTMENTS =====
  
  // Get all investments
  // Usage: const investments = await api.getInvestments();
  getInvestments: () => request('/investments'),

  // Create new investment
  // Usage: const newInv = await api.createInvestment({name: "HDFC", invested: 10000, ...});
  createInvestment: (data) => request('/investments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update existing investment
  // Usage: await api.updateInvestment("abc123", {name: "Updated Name", ...});
  updateInvestment: (id, data) => request(`/investments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Delete investment
  // Usage: await api.deleteInvestment("abc123");
  deleteInvestment: (id) => request(`/investments/${id}`, {
    method: 'DELETE'
  }),

  // Refresh NAV for investments
  // Usage: await api.refreshNAV([...updatedInvestments]);
  refreshNAV: (investments) => request('/investments/refresh-nav', {
    method: 'POST',
    body: JSON.stringify(investments)
  }),

  // ===== INCOMES =====
  
  getIncomes: () => request('/incomes'),

  createIncome: (data) => request('/incomes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateIncome: (id, data) => request(`/incomes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteIncome: (id) => request(`/incomes/${id}`, {
    method: 'DELETE'
  }),

  // ===== EXPENSES =====
  
  getExpenses: () => request('/expenses'),

  createExpense: (data) => request('/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateExpense: (id, data) => request(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteExpense: (id) => request(`/expenses/${id}`, {
    method: 'DELETE'
  }),

  // ===== SETTINGS =====
  
  getSettings: () => request('/settings'),

  updateSettings: (data) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // ===== EXPORT/IMPORT =====
  
  // Download all data as JSON (for backup)
  exportAll: () => request('/export'),

  // Upload JSON data (for restore)
  importAll: (data) => request('/import', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
