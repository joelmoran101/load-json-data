// src/components/fastapi/PlotlyChartViewer.js
import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import ErrorDisplay from '../ErrorDisplay';
import Loading from '../Loading';

const PlotlyChartViewer = ({ 
  chart, 
  showControls = true,
  enableFilters = true,
  className = '',
  width = '100%',
  height = 400 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(['CCP', 'LTD']);
  const [showFilters, setShowFilters] = useState(false);

  // Reset error and filters when chart changes
  useEffect(() => {
    setError(null);
    if (chart) {
      // Reset filters when chart changes
      setDateRange({ start: '', end: '' });
      setSelectedCompanies([]);
      setSelectedMetrics(['CCP', 'LTD']);
    }
  }, [chart]);

  // Extract available companies and date range from chart data
  const { availableCompanies, availableDates, hasTimeSeriesData } = useMemo(() => {
    if (!chart?.data) return { availableCompanies: [], availableDates: [], hasTimeSeriesData: false };
    
    const companies = new Set();
    const dates = new Set();
    let hasTimeSeries = false;
    
    chart.data.forEach(trace => {
      // Extract company names from trace names or other identifiers
      if (trace.name) {
        companies.add(trace.name);
      }
      
      // Check if data has time series (x-axis with dates)
      if (trace.x && Array.isArray(trace.x)) {
        trace.x.forEach(xVal => {
          const date = new Date(xVal);
          if (!isNaN(date.getTime())) {
            dates.add(xVal);
            hasTimeSeries = true;
          }
        });
      }
    });
    
    return {
      availableCompanies: Array.from(companies).sort(),
      availableDates: Array.from(dates).sort(),
      hasTimeSeriesData: hasTimeSeries
    };
  }, [chart]);

  // Initialize selected companies when chart loads
  useEffect(() => {
    if (availableCompanies.length > 0 && selectedCompanies.length === 0) {
      setSelectedCompanies(availableCompanies);
    }
  }, [availableCompanies]);

  // Filter the chart data based on current filter settings
  const filteredPlotData = useMemo(() => {
    if (!chart?.data || !enableFilters) return chart?.data || [];
    
    return chart.data.filter(trace => {
      // Company filter
      if (selectedCompanies.length > 0 && trace.name && !selectedCompanies.includes(trace.name)) {
        return false;
      }
      
      // Metric filter (assuming trace names contain CCP or LTD)
      if (selectedMetrics.length > 0 && trace.name) {
        const hasSelectedMetric = selectedMetrics.some(metric => 
          trace.name.toUpperCase().includes(metric.toUpperCase())
        );
        if (!hasSelectedMetric) {
          return false;
        }
      }
      
      return true;
    }).map(trace => {
      // Date range filter for time series data
      if (hasTimeSeriesData && (dateRange.start || dateRange.end) && trace.x && trace.y) {
        const filteredIndices = [];
        
        trace.x.forEach((xVal, index) => {
          const date = new Date(xVal);
          if (!isNaN(date.getTime())) {
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            
            if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
              filteredIndices.push(index);
            }
          }
        });
        
        return {
          ...trace,
          x: filteredIndices.map(i => trace.x[i]),
          y: filteredIndices.map(i => trace.y[i])
        };
      }
      
      return trace;
    });
  }, [chart, selectedCompanies, selectedMetrics, dateRange, enableFilters, hasTimeSeriesData]);

  // Reset filters function
  const resetFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedCompanies(availableCompanies);
    setSelectedMetrics(['CCP', 'LTD']);
  };

  if (!chart) {
    return <div className="chart-viewer-empty">No chart data provided</div>;
  }

  const plotLayout = {
    ...chart.layout,
    autosize: true,
    margin: { l: 50, r: 50, t: 50, b: 50 },
  };
  
  const plotConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
    responsive: true,
    ...chart.config
  };

  return (
    <div className={`plotly-chart-viewer ${className}`}>
      {showControls && (
        <div className="chart-controls">
          <div className="chart-info">
            <h3 className="chart-title">{chart.title}</h3>
            {chart.description && (
              <p className="chart-description">{chart.description}</p>
            )}
            <div className="chart-metadata">
              <span className="chart-id">ID: {chart.item_id}</span>
              {chart.created_at && (
                <span className="chart-date">
                  Created: {new Date(chart.created_at).toLocaleDateString()}
                </span>
              )}
              {chart.updated_at && chart.updated_at !== chart.created_at && (
                <span className="chart-date">
                  Updated: {new Date(chart.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="chart-actions">
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-button"
                title="Toggle filters"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      {enableFilters && showFilters && (
        <div className="chart-filters">
          <div className="filters-header">
            <h4>Chart Filters</h4>
            <button 
              onClick={resetFilters}
              className="reset-filters-button"
              title="Reset all filters"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="filters-grid">
            {/* Date Range Filter */}
            {hasTimeSeriesData && (
              <div className="filter-group">
                <label className="filter-label">Date Range:</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="date-input"
                    placeholder="Start date"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="date-input"
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
            
            {/* Company Filter */}
            {availableCompanies.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Companies:</label>
                <div className="checkbox-group">
                  {availableCompanies.map(company => (
                    <label key={company} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies(prev => [...prev, company]);
                          } else {
                            setSelectedCompanies(prev => prev.filter(c => c !== company));
                          }
                        }}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{company}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Metrics Filter */}
            <div className="filter-group">
              <label className="filter-label">Metrics:</label>
              <div className="checkbox-group">
                {['CCP', 'LTD'].map(metric => (
                  <label key={metric} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics(prev => [...prev, metric]);
                        } else {
                          setSelectedMetrics(prev => prev.filter(m => m !== metric));
                        }
                      }}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{metric}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="filter-summary">
            <small>
              Showing {filteredPlotData.length} of {chart.data.length} data series
              {selectedCompanies.length !== availableCompanies.length && 
                ` • ${selectedCompanies.length} companies selected`
              }
              {selectedMetrics.length < 2 && 
                ` • ${selectedMetrics.join(', ')} metrics`
              }
              {(dateRange.start || dateRange.end) && 
                ` • Date filtered`
              }
            </small>
          </div>
        </div>
      )}

      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={() => setError(null)} 
        />
      )}

      <div className="chart-container" style={{ position: 'relative' }}>
        {isLoading && <Loading />}
        
        <Plot
          data={filteredPlotData}
          layout={plotLayout}
          config={plotConfig}
          style={{ width, height }}
          onInitialized={() => setIsLoading(false)}
          onError={(err) => {
            console.error('Plotly error:', err);
            setError('Failed to render chart. Please check the chart data format.');
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default PlotlyChartViewer;