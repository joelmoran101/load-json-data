// src/pages/JSONExpressPage.js
import React from 'react';
import { DataContainer } from '../DataContainer';
import AuthTest from '../components/AuthTest';

const JSONExpressPage = () => {
  return (
    <div className="json-express-page">
      <div className="page-header">
        <h1>JSON Express API Dashboard</h1>
        <p>Manage data and charts using the JSON Express backend</p>
      </div>
      <AuthTest />
      <DataContainer />
    </div>
  );
};

export default JSONExpressPage;