import React from 'react';
import './ErrorDisplay.css';

const ErrorDisplay = ({ error, onRetry, showFallback = true }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Data Loading Error</h3>
      <p className="error-message">{error || 'Unable to load chart data'}</p>
      <div className="error-actions">
        {onRetry && (
          <button 
            className="retry-button"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
        {showFallback && (
          <p className="fallback-message">
            Displaying cached data below
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;