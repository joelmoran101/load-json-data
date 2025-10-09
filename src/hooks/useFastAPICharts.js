// src/hooks/useFastAPICharts.js
import { useState, useEffect, useCallback } from 'react';
import { fastApiService } from '../services/fastApiService';

export const useFastAPICharts = () => {
  const [charts, setCharts] = useState([]);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // 'connected', 'disconnected', 'unknown'

  // Check FastAPI backend health on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Check connection to FastAPI backend
  const checkConnection = useCallback(async () => {
    try {
      await fastApiService.healthCheck();
      setConnectionStatus('connected');
      setError(null);
    } catch (err) {
      setConnectionStatus('disconnected');
      console.warn('FastAPI backend connection failed:', err.message);
      // Don't set error here as it's just a connection check
    }
  }, []);

  // Load all charts from FastAPI backend
  const loadCharts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const chartsData = await fastApiService.plotly.getAllCharts();
      setCharts(chartsData);
      setConnectionStatus('connected');
      
      // Clear selected charts if any of them no longer exist
      setSelectedCharts(prev => 
        prev.filter(selectedId => 
          chartsData.some(chart => chart.item_id === selectedId)
        )
      );
    } catch (err) {
      setError(err.message);
      setConnectionStatus('disconnected');
      console.error('Failed to load charts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load charts on mount if connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadCharts();
    }
  }, [connectionStatus, loadCharts]);

  // Get a specific chart by ID
  const getChartById = useCallback(async (chartId) => {
    try {
      const chart = await fastApiService.plotly.getChartById(chartId);
      return chart;
    } catch (err) {
      console.error(`Failed to get chart ${chartId}:`, err);
      throw err;
    }
  }, []);

  // Delete a chart
  const deleteChart = useCallback(async (chartId) => {
    try {
      await fastApiService.plotly.deleteChart(chartId);
      
      // Remove from local state
      setCharts(prev => prev.filter(chart => chart.item_id !== chartId));
      setSelectedCharts(prev => prev.filter(id => id !== chartId));
      
      return true;
    } catch (err) {
      console.error(`Failed to delete chart ${chartId}:`, err);
      throw err;
    }
  }, []);

  // Update a chart
  const updateChart = useCallback(async (chartId, updateData) => {
    try {
      await fastApiService.plotly.updateChart(chartId, updateData);
      
      // Refresh the chart list to get updated data
      await loadCharts();
      
      return true;
    } catch (err) {
      console.error(`Failed to update chart ${chartId}:`, err);
      throw err;
    }
  }, [loadCharts]);

  // Create a new chart
  const createChart = useCallback(async (chartData) => {
    try {
      const result = await fastApiService.plotly.createChart(chartData);
      
      // Refresh the chart list to include new chart
      await loadCharts();
      
      return result;
    } catch (err) {
      console.error('Failed to create chart:', err);
      throw err;
    }
  }, [loadCharts]);

  // Chart selection management
  const selectChart = useCallback((chartId) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartId)) {
        return prev.filter(id => id !== chartId);
      } else {
        return [...prev, chartId];
      }
    });
  }, []);

  const selectCharts = useCallback((chartIds) => {
    setSelectedCharts(chartIds);
  }, []);

  const selectAllCharts = useCallback(() => {
    setSelectedCharts(charts.map(chart => chart.item_id));
  }, [charts]);

  const deselectAllCharts = useCallback(() => {
    setSelectedCharts([]);
  }, []);

  // Get selected chart objects
  const getSelectedCharts = useCallback(() => {
    return charts.filter(chart => selectedCharts.includes(chart.item_id));
  }, [charts, selectedCharts]);

  // Utility functions
  const isChartSelected = useCallback((chartId) => {
    return selectedCharts.includes(chartId);
  }, [selectedCharts]);

  const getChartCount = useCallback(() => {
    return charts.length;
  }, [charts]);

  const getSelectedCount = useCallback(() => {
    return selectedCharts.length;
  }, [selectedCharts]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    await checkConnection();
    if (connectionStatus === 'connected') {
      await loadCharts();
    }
  }, [checkConnection, connectionStatus, loadCharts]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    charts,
    selectedCharts,
    isLoading,
    error,
    connectionStatus,
    
    // Chart operations
    loadCharts,
    getChartById,
    deleteChart,
    updateChart,
    createChart,
    
    // Selection management
    selectChart,
    selectCharts,
    selectAllCharts,
    deselectAllCharts,
    getSelectedCharts,
    isChartSelected,
    
    // Utilities
    getChartCount,
    getSelectedCount,
    checkConnection,
    retryConnection,
    clearError,
  };
};

export default useFastAPICharts;