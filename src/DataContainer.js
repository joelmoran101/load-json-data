import React from "react";
import Plot from 'react-plotly.js';
import "./App.css";
import { plotlyData } from "./data";

export const DataContainer = ({ children }) => {
  return (
    <>
      <div className="data-container">
        <h1>Welcome to Financial Data Tracker</h1>
        <Plot
          data={plotlyData.data}
          layout={plotlyData.layout}
          config={{
            displayModeBar: true,
            displaylogo: false,
            responsive: true
          }}
          style={{ width: '100%', height: '600px' }}
        />
        {children}
      </div>
    </>
  );
};
