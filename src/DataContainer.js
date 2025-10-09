import React, { useState } from "react";
import Plot from 'react-plotly.js';
import "./App.css";
import useChartData from "./hooks/useChartData";
import Loading from "./components/Loading";
import ErrorDisplay from "./components/ErrorDisplay";
import ChartSelector from "./components/ChartSelector";

export const DataContainer = ({ children, chartOptions = {} }) => {
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' or 'single'
  
  const {
    loading,
    error,
    lastFetch,
    refetch,
    updateChartOptions,
    hasData,
    // New properties for multiple chart support
    allCharts,
    selectedCharts,
    selectedChartIds,
    selectChart,
    selectMultipleCharts,
    toggleChartSelection,
    hasCharts
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
        
        {/* Chart Selector */}
        {hasCharts && (
          <ChartSelector
            allCharts={allCharts}
            selectedChartIds={selectedChartIds}
            onSelectChart={selectChart}
            onToggleChart={toggleChartSelection}
            onSelectMultiple={selectMultipleCharts}
            loading={loading}
            allowMultiple={displayMode === 'grid'}
          />
        )}
        
        {/* Display Mode Toggle */}
        {selectedCharts.length > 1 && (
          <div className="display-mode-controls">
            <button 
              onClick={() => setDisplayMode('single')} 
              className={`mode-button ${displayMode === 'single' ? 'active' : ''}`}
            >
              Single View
            </button>
            <button 
              onClick={() => setDisplayMode('grid')} 
              className={`mode-button ${displayMode === 'grid' ? 'active' : ''}`}
            >
              Grid View
            </button>
          </div>
        )}

        {/* Chart display */}
        {selectedCharts.length > 0 && (
          <div className={`charts-display ${displayMode}`}>
            {loading && (
              <div className="chart-loading-overlay">
                <Loading message="Updating charts..." />
              </div>
            )}
            
            {displayMode === 'single' ? (
              // Single chart view - show first selected chart
              <div className="single-chart-container">
                <h3>{selectedCharts[0].title}</h3>
                {selectedCharts[0].description && (
                  <p className="chart-description">{selectedCharts[0].description}</p>
                )}
                <Plot
                  data={selectedCharts[0].plotlyData.data}
                  layout={{
                    ...selectedCharts[0].plotlyData.layout,
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
            ) : (
              // Grid view - show all selected charts
              <div className="charts-grid">
                {selectedCharts.map((chart, index) => (
                  <div key={chart.id} className="chart-item-grid">
                    <div className="chart-header">
                      <h4>{chart.title}</h4>
                      {chart.description && (
                        <p className="chart-description-small">{chart.description}</p>
                      )}
                    </div>
                    <Plot
                      data={chart.plotlyData.data}
                      layout={{
                        ...chart.plotlyData.layout,
                        autosize: true,
                        // Adjust layout for smaller grid items
                        margin: { l: 50, r: 30, t: 30, b: 50 }
                      }}
                      config={{
                        displayModeBar: false,
                        displaylogo: false,
                        responsive: true
                      }}
                      style={{ 
                        width: '100%', 
                        height: selectedCharts.length === 1 ? '600px' : '400px' 
                      }}
                      useResizeHandler={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* No charts selected message */}
        {hasCharts && selectedCharts.length === 0 && (
          <div className="no-charts-selected">
            <p>Please select at least one chart to display.</p>
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
