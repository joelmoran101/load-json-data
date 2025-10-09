// src/components/fastapi/ChartList.js
import React, { useState } from 'react';
import ErrorDisplay from '../ErrorDisplay';
import Loading from '../Loading';

const ChartList = ({ 
  charts = [], 
  onChartSelect, 
  onChartDelete, 
  onChartEdit,
  onRefresh,
  selectedChartIds = [],
  isLoading = false,
  error = null,
  allowMultiSelect = false
}) => {
  const [selectedIds, setSelectedIds] = useState(selectedChartIds);

  const handleChartToggle = (chartId) => {
    if (allowMultiSelect) {
      const newSelectedIds = selectedIds.includes(chartId)
        ? selectedIds.filter(id => id !== chartId)
        : [...selectedIds, chartId];
      
      setSelectedIds(newSelectedIds);
      onChartSelect?.(newSelectedIds);
    } else {
      const newSelectedIds = selectedIds.includes(chartId) ? [] : [chartId];
      setSelectedIds(newSelectedIds);
      onChartSelect?.(newSelectedIds);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === charts.length) {
      setSelectedIds([]);
      onChartSelect?.([]);
    } else {
      const allIds = charts.map(chart => chart.item_id);
      setSelectedIds(allIds);
      onChartSelect?.(allIds);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="chart-list-container">
        <ErrorDisplay 
          error={error} 
          onRetry={onRefresh}
        />
      </div>
    );
  }

  return (
    <div className="chart-list-container">
      <div className="chart-list-header">
        <div className="list-info">
          <h3>Available Charts ({charts.length})</h3>
          {selectedIds.length > 0 && (
            <span className="selection-count">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        
        <div className="list-controls">
          {allowMultiSelect && charts.length > 0 && (
            <button
              onClick={handleSelectAll}
              disabled={isLoading}
              className="select-all-button"
            >
              {selectedIds.length === charts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="refresh-button"
              title="Refresh chart list"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {isLoading && <Loading />}

      {!isLoading && charts.length === 0 && (
        <div className="no-charts">
          <p>No charts found. Create your first chart to get started!</p>
        </div>
      )}

      {!isLoading && charts.length > 0 && (
        <div className="chart-list">
          {charts.map((chart) => {
            const isSelected = selectedIds.includes(chart.item_id);
            
            return (
              <div
                key={chart.item_id}
                className={`chart-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleChartToggle(chart.item_id)}
              >
                <div className="chart-item-content">
                  <div className="chart-item-header">
                    <div className="chart-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleChartToggle(chart.item_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="chart-main-info">
                      <h4 className="chart-title">{chart.title}</h4>
                      {chart.description && (
                        <p className="chart-description">{chart.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="chart-metadata">
                    <span className="chart-id">ID: {chart.item_id}</span>
                    <span className="chart-date">
                      Created: {formatDate(chart.created_at)}
                    </span>
                    {chart.updated_at && chart.updated_at !== chart.created_at && (
                      <span className="chart-date">
                        Updated: {formatDate(chart.updated_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="chart-item-actions">
                    {onChartEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChartEdit(chart);
                        }}
                        className="action-button edit-action"
                        title="Edit chart"
                      >
                        Edit
                      </button>
                    )}
                    
                    {onChartDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${chart.title}"?`)) {
                            onChartDelete(chart.item_id);
                          }
                        }}
                        className="action-button delete-action"
                        title="Delete chart"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChartList;