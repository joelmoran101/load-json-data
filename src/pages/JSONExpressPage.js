// src/pages/JSONExpressPage.js
import React from 'react';
import { DataContainer } from '../DataContainer';
import AuthTest from '../components/AuthTest';

const JSONExpressPage = () => {
  return (
    <div className="json-express-page">
      <div className="page-header">
        <h1>Plotly JSON Express Financial Data Dashboard</h1>
        <p>This App Displays Different Plotly JSON Chart Visualizations of the Financial Data of diverse Companies that are stored in different databases and are accessed via corresponding Backend APIs.</p>
      </div>
      <AuthTest />
      <DataContainer />
    </div>
  );
};

export default JSONExpressPage;