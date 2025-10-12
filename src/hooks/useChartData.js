import { useState, useEffect, useCallback, useRef } from 'react';
import chartService from '../services/chartService';
import { plotlyData } from '../data'; // Fallback data

const useChartData = (options = {}) => {
  const [allCharts, setAllCharts] = useState([]);
  const [selectedChartIds, setSelectedChartIds] = useState([]);
  const [chartData, setChartData] = useState(plotlyData); // Keep for backward compatibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false); // Track if we've done initial auto-selection
  const selectedChartIdsRef = useRef(selectedChartIds);

  // Keep ref in sync with state
  selectedChartIdsRef.current = selectedChartIds;

  const fetchAllCharts = useCallback(async (fetchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all charts from the database
      const charts = await chartService.getAllCharts();

      if (charts && charts.length > 0) {
        setAllCharts(charts);
        
        // Only auto-select the first chart on initial load, not on subsequent fetches
        if (selectedChartIdsRef.current.length === 0 && !hasAutoSelected) {
          setSelectedChartIds([charts[0].id]);
          setChartData(charts[0].plotlyData);
          setHasAutoSelected(true);
        } else if (selectedChartIdsRef.current.length > 0) {
          // Update chartData with the first selected chart for backward compatibility
          const firstSelected = charts.find(chart => selectedChartIdsRef.current.includes(chart.id));
          if (firstSelected) {
            setChartData(firstSelected.plotlyData);
          }
        }
        
        setLastFetch(new Date());
      } else {
        throw new Error('No charts available in database');
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load chart data';
      if (err.message) {
        if (err.message.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('Server error')) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else if (err.message.includes('No charts available')) {
          errorMessage = 'No charts found in the database. Please add some chart data first.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      // Fallback to static data on error
      setChartData(plotlyData);
      
      // Log additional debug info in development
      if (import.meta.env.DEV) {
        console.log('🔍 Debug info:', {
          errorType: err.constructor.name,
          errorMessage: err.message,
          errorStack: err.stack,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [hasAutoSelected]); // Only depend on hasAutoSelected to prevent refetch loops

  // Chart selection functions
  const selectChart = useCallback((chartId) => {
    setSelectedChartIds(prev => {
      const newSelection = prev.length === 1 && prev[0] === chartId ? [] : [chartId];
      
      // Update chart data based on new selection
      if (newSelection.length > 0) {
        const selectedChart = allCharts.find(chart => chart.id === chartId);
        if (selectedChart) {
          setChartData(selectedChart.plotlyData);
        }
      } else {
        // Clear chart data when no charts are selected
        setChartData({ data: [], layout: {} });
      }
      
      return newSelection;
    });
  }, [allCharts]);

  const selectMultipleCharts = useCallback((chartIds) => {
    setSelectedChartIds(chartIds);
    // Update chartData with the first selected chart for backward compatibility
    if (chartIds.length > 0) {
      const firstSelected = allCharts.find(chart => chartIds.includes(chart.id));
      if (firstSelected) {
        setChartData(firstSelected.plotlyData);
      }
    } else {
      // Clear chart data when no charts are selected
      setChartData({ data: [], layout: {} });
    }
  }, [allCharts]);

  const toggleChartSelection = useCallback((chartId) => {
    console.log('toggleChartSelection called with chartId:', chartId);
    console.log('Current selectedChartIds:', selectedChartIdsRef.current);
    
    setSelectedChartIds(prev => {
      const newSelection = prev.includes(chartId)
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId];
      
      console.log('New selection will be:', newSelection);
      
      // Update chartData with the first selected chart
      if (newSelection.length > 0) {
        const firstSelected = allCharts.find(chart => newSelection.includes(chart.id));
        if (firstSelected) {
          setChartData(firstSelected.plotlyData);
        }
      } else {
        // Clear chart data when no charts are selected
        setChartData({ data: [], layout: {} });
      }
      
      return newSelection;
    });
  }, [allCharts]);

  const refetch = useCallback(() => {
    return fetchAllCharts();
  }, [fetchAllCharts]);

  const updateChartOptions = useCallback((newOptions) => {
    return fetchAllCharts(newOptions);
  }, [fetchAllCharts]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAllCharts();
  }, [fetchAllCharts]);

  // Auto-refetch every 5 minutes (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAllCharts();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAllCharts, loading]);

  // Get selected charts data
  const selectedCharts = allCharts.filter(chart => selectedChartIds.includes(chart.id));

  return {
    // Original properties for backward compatibility
    chartData,
    loading,
    error,
    lastFetch,
    refetch,
    updateChartOptions,
    hasData: chartData && chartData.data && chartData.data.length > 0,
    
    // New properties for multiple chart support
    allCharts,
    selectedCharts,
    selectedChartIds,
    selectChart,
    selectMultipleCharts,
    toggleChartSelection,
    hasCharts: allCharts.length > 0
  };
};

export default useChartData;