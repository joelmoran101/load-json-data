// src/services/supabaseService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Supabase Service for Plotly Chart Operations
 * Fetches Plotly JSON files stored in Supabase by Nataly's Python backend
 */
export const supabaseService = {
  /**
   * Check if Supabase is configured
   */
  isConfigured() {
    return !!(supabaseUrl && supabaseAnonKey);
  },

  /**
   * Test connection to Supabase
   */
  async testConnection() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'Supabase not configured'
        };
      }

      // Try to fetch from the table to test connection
      const { error } = await supabase
        .from('Visualizations')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: 'Connected to Supabase'
      };
    } catch (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        message: error.message || 'Unknown error'
      };
    }
  },

  /**
   * Get all Plotly charts from Supabase
   * @param {Object} options - Query options
   * @param {number} [options.limit] - Maximum results to return
   * @param {number} [options.offset] - Number of results to skip
   * @param {string} [options.orderBy='created_at'] - Column to order by
   * @param {boolean} [options.ascending=false] - Sort order
   */
  async getAllCharts(options = {}) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase not configured. Please add credentials to .env file.');
      }

      const {
        limit = 100,
        offset = 0,
        orderBy = 'id',
        ascending = true
      } = options;

      let query = supabase
        .from('Visualizations')
        .select('*')
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch charts from Supabase:', error);
        throw new Error(error.message);
      }

      // Debug logging
      console.log('📊 Raw Supabase data count:', data?.length);
      if (data && data.length > 0) {
        console.log('📊 First chart fields:', Object.keys(data[0]));
        console.log('📊 First chart raw:', data[0]);
      }

      // Transform data to match expected format
      return data.map(chart => {
        // Nataly's structure: chart_json contains {data, layout, config, frames}
        const chartJson = chart.chart_json || {};
        
        // Parse if it's a string
        let parsedJson = chartJson;
        if (typeof chartJson === 'string') {
          try {
            parsedJson = JSON.parse(chartJson);
          } catch (e) {
            console.error('Failed to parse chart_json:', e);
            parsedJson = {};
          }
        }

        const transformed = {
          id: chart.id,
          item_id: chart.id,
          title: chart.chart_name || chart.title || 'Untitled Chart',
          description: chart.description || '',
          data: parsedJson.data || [],
          layout: parsedJson.layout || {},
          config: parsedJson.config || {},
          frames: parsedJson.frames || [],
          created_at: chart.created_at,
          updated_at: chart.updated_at,
          source: 'supabase'
        };
        
        console.log('✅ Transformed chart:', transformed.title, '- data points:', transformed.data?.length);
        return transformed;
      });
    } catch (error) {
      console.error('Supabase getAllCharts error:', error);
      throw error;
    }
  },

  /**
   * Get a specific chart by ID
   * @param {string|number} chartId - The chart ID
   */
  async getChartById(chartId) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase not configured. Please add credentials to .env file.');
      }

      const { data, error } = await supabase
        .from('Visualizations')
        .select('*')
        .eq('id', chartId)
        .single();

      if (error) {
        console.error(`Failed to fetch chart ${chartId} from Supabase:`, error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(`Chart ${chartId} not found`);
      }

      // Transform data to match expected format
      return {
        id: data.id,
        item_id: data.id,
        title: data.title || 'Untitled Chart',
        description: data.description || '',
        data: data.plot_data || data.data || [],
        layout: data.plot_layout || data.layout || {},
        config: data.plot_config || data.config || {},
        frames: data.plot_frames || data.frames || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        source: 'supabase'
      };
    } catch (error) {
      console.error('Supabase getChartById error:', error);
      throw error;
    }
  },

  /**
   * Search charts by title or description
   * @param {string} searchTerm - Search term
   */
  async searchCharts(searchTerm) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Supabase not configured. Please add credentials to .env file.');
      }

      const { data, error } = await supabase
        .from('Visualizations')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (error) {
        console.error('Failed to search charts in Supabase:', error);
        throw new Error(error.message);
      }

      // Transform data to match expected format
      return data.map(chart => ({
        id: chart.id,
        item_id: chart.id,
        title: chart.title || 'Untitled Chart',
        description: chart.description || '',
        data: chart.plot_data || chart.data || [],
        layout: chart.plot_layout || chart.layout || {},
        config: chart.plot_config || chart.config || {},
        frames: chart.plot_frames || chart.frames || [],
        created_at: chart.created_at,
        updated_at: chart.updated_at,
        source: 'supabase'
      }));
    } catch (error) {
      console.error('Supabase searchCharts error:', error);
      throw error;
    }
  },

  /**
   * Get chart count
   */
  async getChartCount() {
    try {
      if (!this.isConfigured()) {
        return 0;
      }

      const { count, error } = await supabase
        .from('Visualizations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Failed to get chart count from Supabase:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Supabase getChartCount error:', error);
      return 0;
    }
  }
};

export default supabaseService;
