// src/services/fastApiService.js
import axios from 'axios';

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

// Create axios instance with default config
const fastApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
fastApiClient.interceptors.request.use(
  (config) => {
    console.log(`FastAPI Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('FastAPI Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
fastApiClient.interceptors.response.use(
  (response) => {
    console.log(`FastAPI Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('FastAPI Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error(`Resource not found: ${error.response.data?.detail || 'Unknown resource'}`);
    }
    
    if (error.response?.status === 422) {
      throw new Error(`Validation error: ${error.response.data?.detail || 'Invalid data'}`);
    }
    
    if (error.response?.status >= 500) {
      throw new Error(`Server error: ${error.response.data?.detail || 'Internal server error'}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('FastAPI server is not running. Please start the backend server.');
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'An unknown error occurred');
  }
);

/**
 * FastAPI Service for Plotly Chart Operations
 */
export const fastApiService = {
  /**
   * Health check endpoint
   */
  async healthCheck() {
    try {
      const response = await fastApiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Get API information
   */
  async getApiInfo() {
    try {
      const response = await fastApiClient.get('/');
      return response.data;
    } catch (error) {
      console.error('Failed to get API info:', error);
      throw error;
    }
  },

  /**
   * Plotly Chart Operations
   */
  plotly: {
    /**
     * Get all Plotly charts
     */
    async getAllCharts() {
      try {
        const response = await fastApiClient.get('/plotly/');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch Plotly charts:', error);
        throw error;
      }
    },

    /**
     * Get a specific Plotly chart by ID
     * @param {number} itemId - The chart ID
     */
    async getChartById(itemId) {
      try {
        const response = await fastApiClient.get(`/plotly/${itemId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch chart ${itemId}:`, error);
        throw error;
      }
    },

    /**
     * Create a new Plotly chart
     * @param {Object} chartData - Chart data object
     * @param {string} chartData.title - Chart title
     * @param {string} chartData.description - Chart description  
     * @param {Object} chartData.data - Plotly data array
     * @param {Object} chartData.layout - Plotly layout object
     * @param {Object} [chartData.config] - Plotly config object (optional)
     * @param {Array} [chartData.frames] - Plotly frames array (optional)
     */
    async createChart(chartData) {
      try {
        // Validate required fields
        if (!chartData.title) {
          throw new Error('Chart title is required');
        }
        if (!chartData.data) {
          throw new Error('Chart data is required');
        }
        if (!chartData.layout) {
          throw new Error('Chart layout is required');
        }

        const response = await fastApiClient.post('/plotly/', {
          title: chartData.title,
          description: chartData.description || '',
          data: chartData.data,
          layout: chartData.layout,
          config: chartData.config || {},
          frames: chartData.frames || []
        });
        
        return response.data;
      } catch (error) {
        console.error('Failed to create chart:', error);
        throw error;
      }
    },

    /**
     * Update an existing Plotly chart
     * @param {number} itemId - The chart ID
     * @param {Object} updateData - Partial chart data to update
     */
    async updateChart(itemId, updateData) {
      try {
        const response = await fastApiClient.put(`/plotly/${itemId}`, updateData);
        return response.data;
      } catch (error) {
        console.error(`Failed to update chart ${itemId}:`, error);
        throw error;
      }
    },

    /**
     * Delete a Plotly chart
     * @param {number} itemId - The chart ID
     */
    async deleteChart(itemId) {
      try {
        const response = await fastApiClient.delete(`/plotly/${itemId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to delete chart ${itemId}:`, error);
        throw error;
      }
    },
  },

  /**
   * Generic data operations (for simple data storage)
   */
  data: {
    /**
     * Get all data with pagination
     * @param {Object} options - Query options
     * @param {number} [options.limit=100] - Maximum results to return
     * @param {number} [options.skip=0] - Number of results to skip
     */
    async getAllData(options = {}) {
      try {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.skip) params.append('skip', options.skip);
        
        const response = await fastApiClient.get(`/data/?${params}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
      }
    },

    /**
     * Get specific data item by ID
     * @param {number} itemId - The data item ID
     */
    async getDataById(itemId) {
      try {
        const response = await fastApiClient.get(`/data/${itemId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch data item ${itemId}:`, error);
        throw error;
      }
    },

    /**
     * Create new data item
     * @param {Object} data - Data object to store
     */
    async createData(data) {
      try {
        const response = await fastApiClient.post('/data/', data);
        return response.data;
      } catch (error) {
        console.error('Failed to create data:', error);
        throw error;
      }
    },

    /**
     * Update existing data item
     * @param {number} itemId - The data item ID
     * @param {Object} updateData - Data to update
     */
    async updateData(itemId, updateData) {
      try {
        const response = await fastApiClient.put(`/data/${itemId}`, updateData);
        return response.data;
      } catch (error) {
        console.error(`Failed to update data item ${itemId}:`, error);
        throw error;
      }
    },

    /**
     * Delete data item
     * @param {number} itemId - The data item ID
     */
    async deleteData(itemId) {
      try {
        const response = await fastApiClient.delete(`/data/${itemId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to delete data item ${itemId}:`, error);
        throw error;
      }
    },
  },
};

export default fastApiService;