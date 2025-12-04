import { useState, useCallback } from 'react';
import { api } from '../api';

/**
 * Custom hook for managing investments
 * @returns {Object} Investment state and methods
 */
export const useInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInvestments();
      setInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addInvestment = useCallback(async (investment) => {
    try {
      const newInvestment = await api.createInvestment(investment);
      setInvestments(prev => [...prev, newInvestment]);
      return newInvestment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateInvestment = useCallback(async (id, updates) => {
    try {
      const updated = await api.updateInvestment(id, updates);
      setInvestments(prev => prev.map(inv => inv.id === id ? updated : inv));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteInvestment = useCallback(async (id) => {
    if (!window.confirm('Delete this investment?')) return false;
    try {
      await api.deleteInvestment(id);
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    investments,
    loading,
    error,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};
