import React from "react";
import Plot from 'react-plotly.js';
import "./App.css";
import useChartData from "./hooks/useChartData";
import Loading from "./components/Loading";
import ErrorDisplay from "./components/ErrorDisplay";

export const DataContainer = ({ children, chartOptions = {} }) => {
  const {
    chartData,
    loading,
    error,
    lastFetch,
    refetch,
    updateChartOptions,
    hasData
  } = useChartData(chartOptions);

  // Handle chart options updates from parent
  const handleUpdateOptions = (newOptions) => {
    updateChartOptions(newOptions);
  };

  return (
    <>
      <div className="data-container">
        <div className="header-section">
          <h1>Welcome to Financial Data Tracker</h1>
          {lastFetch && (
            <p className="last-update">
              Last updated: {lastFetch.toLocaleString()}
            </p>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            onRetry={refetch}
            showFallback={hasData}
          />
        )}
        
        {/* Loading state */}
        {loading && !hasData && (
          <Loading message="Loading chart data from MongoDB..." />
        )}
        
        {/* Chart display */}
        {hasData && (
          <div className="chart-container">
            {loading && (
              <div className="chart-loading-overlay">
                <Loading message="Updating chart..." />
              </div>
            )}
            <Plot
              data={chartData.data}
              layout={{
                ...chartData.layout,
                // Override dimensions for responsiveness
                autosize: true
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                responsive: true,
                modeBarButtonsToRemove: [
                  'pan2d',
                  'select2d', 
                  'lasso2d',
                  'autoScale2d'
                ]
              }}
              style={{ width: '100%', height: '600px' }}
              useResizeHandler={true}
            />
          </div>
        )}
        
        {/* Control panel for testing different options */}
        <div className="controls-section">
          <button 
            onClick={refetch}
            disabled={loading}
            className="refresh-button"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          {/* Example: Add filters for different companies/metrics */}
          <div className="filters">
            <button 
              onClick={() => handleUpdateOptions({ company: 'AAPL' })}
              disabled={loading}
              className="filter-button"
            >
              Show AAPL
            </button>
            <button 
              onClick={() => handleUpdateOptions({ company: 'MSFT' })}
              disabled={loading}
              className="filter-button"
            >
              Show MSFT
            </button>
            <button 
              onClick={() => handleUpdateOptions({})}
              disabled={loading}
              className="filter-button"
            >
              Show All
            </button>
          </div>
        </div>
        
        {children}
      </div>
    </>
  );
};
