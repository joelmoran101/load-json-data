// src/pages/JSONExpressPage.js
import React from 'react';
import { DataContainer } from '../DataContainer';

const JSONExpressPage = () => {
  return (
    <div className="json-express-page">
      <div className="page-header">
        <h1>JSON Express API Dashboard</h1>
        <p>Manage data and charts using the JSON Express backend</p>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          marginTop: '0.5rem',
          borderLeft: '4px solid #2196f3'
        }}>
          <strong>ℹ️ Public Access:</strong> This page is available without authentication (demo mode)
        </div>
      </div>
      <DataContainer />
    </div>
  );
};

export default JSONExpressPage;