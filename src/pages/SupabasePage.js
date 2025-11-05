// src/pages/SupabasePage.js
import React, { useState, useCallback } from 'react';
import { useSupabaseCharts } from '../hooks/useSupabaseCharts';
import ChartList from '../components/fastapi/ChartList';
import PlotlyChartViewer from '../components/fastapi/PlotlyChartViewer';
import ErrorDisplay from '../components/ErrorDisplay';
import Loading from '../components/Loading';

const SupabasePage = () => {
  const {
    charts,
    selectedCharts,
    isLoading,
    error,
    connectionStatus,
    loadCharts,
    selectChart,
    selectCharts,
    selectAllCharts,
    deselectAllCharts,
    getSelectedCharts,
    getChartCount,
    getSelectedCount,
    retryConnection,
    clearError,
  } = useSupabaseCharts();

  const [displayMode, setDisplayMode] = useState('single'); // 'single', 'grid'
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  // Get selected chart objects
  const selectedChartObjects = getSelectedCharts();

  // Handle chart selection from list
  const handleChartSelect = useCallback((chartIds) => {
    selectCharts(chartIds);
    if (chartIds.length > 0) {
      setCurrentChartIndex(0); // Reset to first chart when selection changes
    }
  }, [selectCharts]);

  // Navigation between selected charts in single mode
  const navigateChart = useCallback((direction) => {
    if (selectedChartObjects.length === 0) return;
    
    if (direction === 'next') {
      setCurrentChartIndex(prev => 
        prev >= selectedChartObjects.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentChartIndex(prev => 
        prev <= 0 ? selectedChartObjects.length - 1 : prev - 1
      );
    }
  }, [selectedChartObjects.length]);

  // Connection status indicator
  const renderConnectionStatus = () => {
    const statusConfig = {
      connected: { color: '#28a745', text: 'Connected to Supabase' },
      disconnected: { color: '#dc3545', text: 'Supabase not configured or unavailable' },
      unknown: { color: '#6c757d', text: 'Checking connection...' }
    };
    
    const config = statusConfig[connectionStatus];
    
    return (
      <div className="connection-status" style={{ color: config.color }}>
        <span className="status-indicator">●</span>
        <span className="status-text">{config.text}</span>
        {connectionStatus === 'disconnected' && (
          <button 
            onClick={retryConnection}
            className="retry-button"
            disabled={isLoading}
          >
            Retry
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fastapi-page">
      <div className="page-header">
        <h1>Supabase Plotly Dashboard</h1>
        <p>View Plotly charts stored in Supabase by Nataly's Python backend</p>
        {renderConnectionStatus()}
      </div>

      {/* Connection Error */}
      {connectionStatus === 'disconnected' && !isLoading && (
        <div className="connection-error">
          <ErrorDisplay 
            error="Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
            onRetry={null}
          />
        </div>
      )}

      {/* Main Content - only show if connected */}
      {connectionStatus === 'connected' && (
        <>
          {/* Chart List Section */}
          <div className="chart-list-section">
            <ChartList
              charts={charts}
              onChartSelect={handleChartSelect}
              onChartDelete={null} // Read-only for Supabase
              onChartEdit={null}   // Read-only for Supabase
              onRefresh={loadCharts}
              selectedChartIds={selectedCharts}
              isLoading={isLoading}
              error={error}
              allowMultiSelect={true}
            />
          </div>

          {/* Display Mode Controls */}
          {selectedChartObjects.length > 0 && (
            <div className="display-mode-controls">
              <h3>Display Mode</h3>
              <div className="mode-buttons">
                <button
                  onClick={() => setDisplayMode('single')}
                  className={`mode-button ${displayMode === 'single' ? 'active' : ''}`}
                >
                  Single Chart View
                </button>
                <button
                  onClick={() => setDisplayMode('grid')}
                  className={`mode-button ${displayMode === 'grid' ? 'active' : ''}`}
                >
                  Grid View ({selectedChartObjects.length} charts)
                </button>
              </div>
            </div>
          )}

          {/* Chart Display Section */}
          <div className="chart-display-section">
            {selectedChartObjects.length === 0 && !isLoading && (
              <div className="no-selection-message">
                <p>Select one or more charts from the list above to view them here.</p>
                {getChartCount() === 0 && (
                  <p>No charts found in Supabase. Ask Nataly to upload some chart data!</p>
                )}
              </div>
            )}

            {/* Single Chart Mode */}
            {selectedChartObjects.length > 0 && displayMode === 'single' && (
              <div className="single-chart-display">
                {selectedChartObjects.length > 1 && (
                  <div className="chart-navigation">
                    <button 
                      onClick={() => navigateChart('prev')}
                      className="nav-button"
                    >
                      ← Previous
                    </button>
                    <span className="chart-counter">
                      {currentChartIndex + 1} of {selectedChartObjects.length}
                    </span>
                    <button 
                      onClick={() => navigateChart('next')}
                      className="nav-button"
                    >
                      Next →
                    </button>
                  </div>
                )}
                
                <PlotlyChartViewer
                  chart={selectedChartObjects[currentChartIndex]}
                  showControls={true}
                  enableFilters={true}
                  className="single-chart-viewer"
                  width="100%"
                  height={500}
                />
              </div>
            )}

            {/* Grid Mode */}
            {selectedChartObjects.length > 0 && displayMode === 'grid' && (
              <div className="charts-grid-display">
                {selectedChartObjects.map((chart, index) => (
                  <div key={chart.item_id} className="grid-chart-item">
                    <PlotlyChartViewer
                      chart={chart}
                      showControls={false}
                      enableFilters={false}
                      className="grid-chart-viewer"
                      width="100%"
                      height={350}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && <Loading />}
    </div>
  );
};

export default SupabasePage;
