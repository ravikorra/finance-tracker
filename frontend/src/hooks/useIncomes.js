import { useState, useEffect } from 'react';
import { api } from '../api';

export const useIncomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch incomes from backend
  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIncomes();
      setIncomes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch incomes:', err);
      setError(err.message);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load incomes on mount
  useEffect(() => {
    fetchIncomes();
  }, []);

  // Add new income
  const addIncome = async (incomeData) => {
    try {
      const newIncome = await api.createIncome(incomeData);
      setIncomes(prev => [...prev, newIncome]);
      return newIncome;
    } catch (err) {
      console.error('Failed to add income:', err);
      throw err;
    }
  };

  // Update existing income
  const updateIncome = async (id, updates) => {
    try {
      const updated = await api.updateIncome(id, updates);
      setIncomes(prev => prev.map(inc => inc.id === id ? updated : inc));
      return updated;
    } catch (err) {
      console.error('Failed to update income:', err);
      throw err;
    }
  };

  // Delete income
  const deleteIncome = async (id) => {
    try {
      await api.deleteIncome(id);
      setIncomes(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      console.error('Failed to delete income:', err);
      throw err;
    }
  };

  return {
    incomes,
    loading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    refreshIncomes: fetchIncomes
  };
};
