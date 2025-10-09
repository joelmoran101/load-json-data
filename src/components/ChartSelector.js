import React from 'react';

const ChartSelector = ({
  allCharts = [],
  selectedChartIds = [],
  onSelectChart,
  onToggleChart,
  onSelectMultiple,
  loading = false,
  allowMultiple = true
}) => {
  if (allCharts.length === 0) {
    return (
      <div className="chart-selector">
        <h3>Available Charts</h3>
        <div className="no-charts">
          {loading ? 'Loading charts...' : 'No charts available'}
        </div>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedChartIds.length === allCharts.length) {
      // Deselect all
      onSelectMultiple([]);
    } else {
      // Select all
      onSelectMultiple(allCharts.map(chart => chart.id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handleHeaderClick = (chartId, event) => {
    // Don't trigger if click originated from checkbox
    if (event.target.type === 'checkbox' || event.target.type === 'radio') {
      return;
    }
    console.log('Header clicked for chart:', chartId);
    if (allowMultiple) {
      onToggleChart(chartId);
    } else {
      onSelectChart(chartId);
    }
  };

  const handleCheckboxChange = (chartId, event) => {
    console.log('Checkbox onChange called for chart:', chartId);
    console.log('Current isSelected:', selectedChartIds.includes(chartId));
    event.stopPropagation(); // Prevent event from bubbling to parent
    onToggleChart(chartId);
  };

  const handleRadioChange = (chartId, event) => {
    console.log('Radio onChange called for chart:', chartId);
    event.stopPropagation(); // Prevent event from bubbling to parent
    onSelectChart(chartId);
  };

  return (
    <div className="chart-selector">
      <div className="chart-selector-header">
        <h3>Available Charts ({allCharts.length})</h3>
        {allowMultiple && allCharts.length > 1 && (
          <div className="chart-selector-controls">
            <button 
              onClick={handleSelectAll}
              className="select-all-button"
              disabled={loading}
            >
              {selectedChartIds.length === allCharts.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selection-count">
              {selectedChartIds.length} of {allCharts.length} selected
            </span>
          </div>
        )}
      </div>

      <div className="chart-list">
        {allCharts.map((chart) => {
          const isSelected = selectedChartIds.includes(chart.id);
          
          return (
            <div 
              key={chart.id}
              className={`chart-item ${isSelected ? 'selected' : ''}`}
            >
              <div className="chart-item-content">
                <div 
                  className="chart-item-header"
                  onClick={(e) => handleHeaderClick(chart.id, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="chart-checkbox">
                    {allowMultiple ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(chart.id, e)}
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()} // Additional protection
                      />
                    ) : (
                      <input
                        type="radio"
                        name="chart-selection"
                        checked={isSelected}
                        onChange={(e) => handleRadioChange(chart.id, e)}
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()} // Additional protection
                      />
                    )}
                  </div>
                  <h4 className="chart-title">{chart.title}</h4>
                </div>
                
                {chart.description && (
                  <p className="chart-description">{chart.description}</p>
                )}
                
                <div className="chart-metadata">
                  <span className="chart-id">ID: {chart.id.slice(-8)}</span>
                  {chart.metadata?.createdAt && (
                    <span className="chart-date">
                      Created: {formatDate(chart.metadata.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedChartIds.length === 0 && (
        <div className="no-selection-message">
          Please select at least one chart to display.
        </div>
      )}
    </div>
  );
};

export default ChartSelector;