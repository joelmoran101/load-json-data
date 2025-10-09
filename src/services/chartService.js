import api from './api';

const chartService = {
  /**
   * Fetch all charts from MongoDB via the API
   * @param {Object} options - Optional parameters for the request
   * @param {number} options.page - Page number for pagination
   * @param {number} options.limit - Number of charts per page
   * @returns {Promise} Promise that resolves to charts list
   */
  getChartsData: async (options = {}) => {
    try {
      const response = await api.get('/charts', {
        params: {
          page: options.page || 1,
          limit: options.limit || 10,
          ...options
        }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw new Error('Failed to fetch chart data from server');
    }
  },

  /**
   * Fetch a specific chart by ID with full plotly data
   * @param {string} chartId - Chart ID to fetch
   * @returns {Promise} Promise that resolves to complete chart data
   */
  getChartById: async (chartId) => {
    // Input validation
    if (!chartId || typeof chartId !== 'string' || chartId.trim() === '') {
      throw new Error('Invalid chart ID provided');
    }

    try {
      const response = await api.get(`/charts/${chartId}`);
      
      if (response.data.success && response.data.data && response.data.data.chart) {
        return response.data.data.chart;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Don't log sensitive information in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching chart by ID:', error);
      }
      
      // Provide user-friendly error messages
      if (error.response?.status === 404) {
        throw new Error('Chart not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid chart ID format');
      } else {
        throw new Error('Failed to fetch chart data from server');
      }
    }
  },

  /**
   * Get all available charts with their metadata and plotly data
   * @returns {Promise} Promise that resolves to array of all charts with metadata
   */
  getAllCharts: async () => {
    try {
      // First get the list of all charts
      const chartsResponse = await api.get('/charts', {
        params: { page: 1, limit: 100 } // Get up to 100 charts
      });
      
      // Handle the API response structure
      if (chartsResponse.data.success && 
          chartsResponse.data.data && 
          chartsResponse.data.data.charts && 
          chartsResponse.data.data.charts.length > 0) {
        
        // Fetch full data for each chart
        const chartPromises = chartsResponse.data.data.charts.map(async (chart) => {
          try {
            const chartResponse = await api.get(`/charts/${chart._id}`);
            
            if (chartResponse.data.success && 
                chartResponse.data.data && 
                chartResponse.data.data.chart) {
              return {
                id: chart._id,
                title: chart.chartTitle || chartResponse.data.data.chart.chartTitle || 'Untitled Chart',
                description: chart.description || chartResponse.data.data.chart.description || '',
                plotlyData: chartResponse.data.data.chart.plotlyData,
                metadata: {
                  createdAt: chart.createdAt || chartResponse.data.data.chart.createdAt,
                  updatedAt: chart.updatedAt || chartResponse.data.data.chart.updatedAt
                }
              };
            }
            return null;
          } catch (err) {
            console.warn(`Failed to fetch chart ${chart._id}:`, err.message);
            return null;
          }
        });
        
        const allCharts = await Promise.all(chartPromises);
        return allCharts.filter(chart => chart !== null);
      }
      
      throw new Error('No charts available');
    } catch (error) {
      console.error('Error fetching all charts:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('API Response:', error.response.status, error.response.data);
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check if the API server is running.');
      } else {
        throw new Error('Failed to fetch chart data from server');
      }
    }
  },

  /**
   * Get the first available chart (for demo purposes)
   * @returns {Promise} Promise that resolves to the first chart's plotly data
   */
  getFirstChart: async () => {
    try {
      // First get the list of charts
      const chartsResponse = await api.get('/charts', {
        params: { page: 1, limit: 1 }
      });
      
      // Handle the API response structure
      if (chartsResponse.data.success && 
          chartsResponse.data.data && 
          chartsResponse.data.data.charts && 
          chartsResponse.data.data.charts.length > 0) {
        
        const firstChartId = chartsResponse.data.data.charts[0]._id;
        
        // Then get the full chart data including plotlyData
        const chartResponse = await api.get(`/charts/${firstChartId}`);
        
        if (chartResponse.data.success && 
            chartResponse.data.data && 
            chartResponse.data.data.chart && 
            chartResponse.data.data.chart.plotlyData) {
          return chartResponse.data.data.chart.plotlyData;
        }
      }
      
      throw new Error('No charts available');
    } catch (error) {
      console.error('Error fetching first chart:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('API Response:', error.response.status, error.response.data);
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check if the API server is running.');
      } else {
        throw new Error('Failed to fetch chart data from server');
      }
    }
  },

  /**
   * Post new chart configuration to the server
   * @param {Object} chartConfig - Chart configuration object
   * @returns {Promise} Promise that resolves to created chart data
   */
  createChart: async (chartConfig) => {
    try {
      const response = await api.post('/charts', chartConfig);
      return response.data;
    } catch (error) {
      console.error('Error creating chart:', error);
      throw new Error('Failed to create chart on server');
    }
  },

  /**
   * Update existing chart configuration
   * @param {string} chartId - Chart ID to update
   * @param {Object} chartConfig - Updated chart configuration
   * @returns {Promise} Promise that resolves to updated chart data
   */
  updateChart: async (chartId, chartConfig) => {
    try {
      const response = await api.put(`/charts/${chartId}`, chartConfig);
      return response.data;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw new Error('Failed to update chart on server');
    }
  },

  /**
   * Delete a chart
   * @param {string} chartId - Chart ID to delete
   * @returns {Promise} Promise that resolves when chart is deleted
   */
  deleteChart: async (chartId) => {
    try {
      const response = await api.delete(`/charts/${chartId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw new Error('Failed to delete chart from server');
    }
  }
};

export default chartService;