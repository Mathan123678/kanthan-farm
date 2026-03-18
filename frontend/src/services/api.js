const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Birds
  getBirds: () => fetch(`${API_URL}/birds`).then(handleResponse),
  getBird: (id) => fetch(`${API_URL}/birds/${id}`).then(handleResponse),
  createBird: (data) =>
    fetch(`${API_URL}/birds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateBird: (id, data) =>
    fetch(`${API_URL}/birds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteBird: (id) =>
    fetch(`${API_URL}/birds/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Sales
  getSales: () => fetch(`${API_URL}/sales`).then(handleResponse),
  createSale: (data) =>
    fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Expenses
  getExpenses: () => fetch(`${API_URL}/expenses`).then(handleResponse),
  createExpense: (data) =>
    fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Health Records
  getHealthRecords: () => fetch(`${API_URL}/health-records`).then(handleResponse),
  createHealthRecord: (data) =>
    fetch(`${API_URL}/health-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Matches
  getMatches: () => fetch(`${API_URL}/matches`).then(handleResponse),
  createMatch: (data) =>
    fetch(`${API_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Buyers
  getBuyers: () => fetch(`${API_URL}/buyers`).then(handleResponse),
  createBuyer: (data) =>
    fetch(`${API_URL}/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Dashboard
  getDashboardSummary: () => fetch(`${API_URL}/dashboard/summary`).then(handleResponse),
  getMonthlyStats: () => fetch(`${API_URL}/dashboard/monthly`).then(handleResponse),
  getInventoryAnalytics: () => fetch(`${API_URL}/analytics/inventory`).then(handleResponse),
};
