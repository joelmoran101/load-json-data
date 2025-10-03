import { useState, useEffect, useCallback } from 'react';
import chartService from '../services/chartService';
import { plotlyData } from '../data'; // Fallback data

const useChartData = (options = {}) => {
  const [chartData, setChartData] = useState(plotlyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchChartData = useCallback(async (fetchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Try to get the first chart from the database
      const data = await chartService.getFirstChart();

      // Validate the response structure (it should be Plotly data)
      if (data && data.data && data.layout) {
        setChartData(data);
        setLastFetch(new Date());
      } else {
        throw new Error('Invalid data structure received from server');
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
      setError(err.message || 'Failed to load chart data');
      // Fallback to static data on error
      setChartData(plotlyData);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed since we're not using options or external variables

  const refetch = useCallback(() => {
    return fetchChartData();
  }, [fetchChartData]);

  const updateChartOptions = useCallback((newOptions) => {
    return fetchChartData(newOptions);
  }, [fetchChartData]);

  // Initial fetch on mount
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Auto-refetch every 5 minutes (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchChartData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchChartData, loading]);

  return {
    chartData,
    loading,
    error,
    lastFetch,
    refetch,
    updateChartOptions,
    hasData: chartData && chartData.data && chartData.data.length > 0
  };
};

export default useChartData;