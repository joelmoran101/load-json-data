import React, { useState } from "react";
import Plot from 'react-plotly.js';
import "./App.css";
import useChartData from "./hooks/useChartData";
import Loading from "./components/Loading";
import ErrorDisplay from "./components/ErrorDisplay";
import ChartSelector from "./components/ChartSelector";

export const DataContainer = ({ children, chartOptions = {} }) => {
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' or 'single'
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  
  const {
    chartData,
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
    refetch(); // Refetch data with new options
  };
  
  // Navigation handlers
  const navigateChart = (direction) => {
    if (direction === 'next') {
      setCurrentChartIndex(prev => 
        prev >= selectedCharts.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentChartIndex(prev => 
        prev <= 0 ? selectedCharts.length - 1 : prev - 1
      );
    }
  };
  
  // Reset index when selection changes
  React.useEffect(() => {
    setCurrentChartIndex(0);
  }, [selectedChartIds.join(',')]);

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
              // Single chart view with navigation
              <div className="single-chart-container">
                {selectedCharts.length > 1 && (
                  <div className="chart-navigation">
                    <button 
                      onClick={() => navigateChart('prev')}
                      className="nav-button"
                    >
                      ← Previous
                    </button>
                    <span className="chart-counter">
                      {currentChartIndex + 1} of {selectedCharts.length}
                    </span>
                    <button 
                      onClick={() => navigateChart('next')}
                      className="nav-button"
                    >
                      Next →
                    </button>
                  </div>
                )}
                <h3>{selectedCharts[currentChartIndex].title}</h3>
                <Plot
                  key={`single-${selectedCharts[currentChartIndex].id}`}
                  data={selectedCharts[currentChartIndex].plotlyData.data}
                  layout={{
                    ...selectedCharts[currentChartIndex].plotlyData.layout,
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
                  /* Fixed pixel height so the SVG cannot overlap following content */
                  style={{ width: '100%', height: '600px' }}
                  useResizeHandler={true}
                />

                {selectedCharts[currentChartIndex].description && (
                  <p className="chart-description chart-description-below">
                    {selectedCharts[currentChartIndex].description}
                  </p>
                )}
              </div>
            ) : (
              // Grid view - show all selected charts stacked vertically
              <div className="charts-grid-display">
                {selectedCharts.map((chart, index) => (
                  <div key={chart.id} className="grid-chart-item">
                  <div className="chart-header">
                    <h4>{chart.title}</h4>
                  </div>
                  <div className="chart-container">
                    <Plot
                      key={`grid-${chart.id}`}
                      data={chart.plotlyData.data}
                      layout={{
                        ...chart.plotlyData.layout,
                        autosize: true,
                        margin: { l: 50, r: 50, t: 50, b: 50 }, // from PlotlyChartViewer
                      }}
                      config={{
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ['pan2d', 'lasso2d'], // same toolbar
                        responsive: true
                      }}
                      /* Fixed pixel height to avoid Plotly overflowing and covering the description */
                      style={{ width: '100%', height: '600px' }}
                      useResizeHandler={true}
                    />
                  </div>

                  {chart.description && (
                    <p className="chart-description chart-description-below">
                      {chart.description}
                    </p>
                  )}
                    
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
        
        {/* Fallback chart display when API fails but we have cached data */}
        {!hasCharts && hasData && error && (
          <div className="fallback-chart-display">
            <h3>Displaying Fallback Chart Data</h3>
            <p>Showing cached chart while backend is unavailable</p>
            <Plot
              data={chartData.data}
              layout={{
                ...chartData.layout,
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
        
        
        {children}
      </div>
    </>
  );
};
