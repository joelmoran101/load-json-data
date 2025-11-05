// src/hooks/useSupabaseCharts.js
import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';

/**
 * Custom hook for managing Supabase Plotly charts
 * Similar to useFastAPICharts but for Supabase backend
 */
export const useSupabaseCharts = () => {
  const [charts, setCharts] = useState([]);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // 'connected', 'disconnected', 'unknown'

  /**
   * Check connection to Supabase
   */
  const checkConnection = useCallback(async () => {
    try {
      const result = await supabaseService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      return result.success;
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus('disconnected');
      return false;
    }
  }, []);

  /**
   * Load all charts from Supabase
   */
  const loadCharts = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Not connected to Supabase');
      }

      const data = await supabaseService.getAllCharts(options);
      setCharts(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load charts from Supabase';
      setError(errorMessage);
      console.error('Load charts error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  /**
   * Get a specific chart by ID
   */
  const getChartById = useCallback(async (chartId) => {
    setIsLoading(true);
    setError(null);

    try {
      const chart = await supabaseService.getChartById(chartId);
      return chart;
    } catch (err) {
      const errorMessage = err.message || `Failed to load chart ${chartId}`;
      setError(errorMessage);
      console.error('Get chart error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search charts
   */
  const searchCharts = useCallback(async (searchTerm) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await supabaseService.searchCharts(searchTerm);
      setCharts(results);
      return results;
    } catch (err) {
      const errorMessage = err.message || 'Failed to search charts';
      setError(errorMessage);
      console.error('Search charts error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Select a single chart
   */
  const selectChart = useCallback((chartId) => {
    setSelectedCharts([chartId]);
  }, []);

  /**
   * Select multiple charts
   */
  const selectCharts = useCallback((chartIds) => {
    setSelectedCharts(chartIds);
  }, []);

  /**
   * Toggle chart selection
   */
  const toggleChartSelection = useCallback((chartId) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartId)) {
        return prev.filter(id => id !== chartId);
      }
      return [...prev, chartId];
    });
  }, []);

  /**
   * Select all charts
   */
  const selectAllCharts = useCallback(() => {
    setSelectedCharts(charts.map(chart => chart.item_id));
  }, [charts]);

  /**
   * Deselect all charts
   */
  const deselectAllCharts = useCallback(() => {
    setSelectedCharts([]);
  }, []);

  /**
   * Get selected chart objects
   */
  const getSelectedCharts = useCallback(() => {
    return charts.filter(chart => selectedCharts.includes(chart.item_id));
  }, [charts, selectedCharts]);

  /**
   * Get chart count
   */
  const getChartCount = useCallback(() => {
    return charts.length;
  }, [charts]);

  /**
   * Get selected count
   */
  const getSelectedCount = useCallback(() => {
    return selectedCharts.length;
  }, [selectedCharts]);

  /**
   * Retry connection
   */
  const retryConnection = useCallback(async () => {
    await checkConnection();
    if (connectionStatus === 'connected') {
      await loadCharts();
    }
  }, [checkConnection, connectionStatus, loadCharts]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    const initialize = async () => {
      const isConnected = await checkConnection();
      if (isConnected) {
        await loadCharts();
      }
    };

    initialize();
  }, [checkConnection, loadCharts]);

  return {
    // State
    charts,
    selectedCharts,
    isLoading,
    error,
    connectionStatus,

    // Actions
    loadCharts,
    getChartById,
    searchCharts,
    selectChart,
    selectCharts,
    toggleChartSelection,
    selectAllCharts,
    deselectAllCharts,
    getSelectedCharts,
    getChartCount,
    getSelectedCount,
    retryConnection,
    clearError,
  };
};

export default useSupabaseCharts;
