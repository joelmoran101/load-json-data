// src/pages/JSONExpressPage.js
import React from 'react';
import { DataContainer } from '../DataContainer';
// import AuthTest from '../components/AuthTest'; // Temporarily hidden

const JSONExpressPage = () => {
  return (
    <div className="json-express-page">
      <div className="page-header">
        <h1>Plotly JSON Express Financial Data Dashboard</h1>
        <p>This Demo App Displays Different Plotly JSON Chart Visualizations of the Financial Data of diverse Companies that are stored in different databases and are accessed via corresponding Backend APIs. <strong><em>No Login or Authentication is required.</em></strong> The dynamics of highly liquid assets or Current Cash Position(CCP) and some Long-Term Debts and Liabilities (LTD) for several companies over a number of years. You can quickly identify trends and assess the financial stability of the companies. </p>
      </div>
      {/* <AuthTest /> */} {/* Temporarily hidden */}
      <DataContainer />
    </div>
  );
};

export default JSONExpressPage;