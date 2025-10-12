// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import JSONExpressPage from './pages/JSONExpressPage';
import FastAPIPage from './pages/FastAPIPage';
import { initializeEnvironment } from './utils/envValidation';
import './App.css';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="app-navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Multi-Backend Dashboard</h2>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            JSON Express API
          </Link>
          <Link 
            to="/fastapi-charts" 
            className={`nav-link ${location.pathname === '/fastapi-charts' ? 'active' : ''}`}
          >
            FastAPI Plotly Charts
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  // Initialize and validate environment variables on app start
  useEffect(() => {
    try {
      initializeEnvironment();
    } catch (error) {
      console.error('Failed to initialize environment:', error);
      // You could show an error boundary or fallback UI here
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<JSONExpressPage />} />
            <Route path="/fastapi-charts" element={<FastAPIPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
