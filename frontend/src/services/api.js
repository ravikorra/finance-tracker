// ==========================================
// API SERVICE LAYER
// ==========================================
// This file handles ALL communication with backend
// When you make mobile app, just copy this file and change BASE_URL

// Backend server address
// For local development: localhost
// For family access: change to your PC's IP (e.g., 192.168.1.100)
// For production: change to your server URL
const BASE_URL = 'http://localhost:4100/api';

// Generic request function - handles all HTTP calls
async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // If request failed, throw error
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  // Return JSON data
  return response.json();
}

// Export all API functions
export const api = {
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
