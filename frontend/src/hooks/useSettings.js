import { useState, useCallback } from 'react';
import { api } from '../api';

/**
 * Custom hook for managing settings
 * @returns {Object} Settings state and methods
 */
export const useSettings = () => {
  const [settings, setSettings] = useState({
    categories: [],
    investmentTypes: [],
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSettings();
      setSettings(data || { categories: [], investmentTypes: [], members: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
};
