import { useState, useCallback } from 'react';
import { api } from '../api';

/**
 * Custom hook for managing expenses
 * @returns {Object} Expense state and methods
 */
export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback(async (expense) => {
    try {
      const newExpense = await api.createExpense(expense);
      setExpenses(prev => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (id, updates) => {
    try {
      const updated = await api.updateExpense(id, updates);
      setExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    if (!window.confirm('Delete this expense?')) return false;
    try {
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
