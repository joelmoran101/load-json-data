// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import JSONExpressPage from './pages/JSONExpressPage';
import FastAPIPage from './pages/FastAPIPage';
import SupabasePage from './pages/SupabasePage';
import { initializeEnvironment } from './utils/envValidation';
import { initializeCSRFToken } from './utils/csrfToken';
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
          <Link 
            to="/supabase-charts" 
            className={`nav-link ${location.pathname === '/supabase-charts' ? 'active' : ''}`}
          >
            Supabase Charts
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  // Initialize and validate environment variables on app start
  useEffect(() => {
    const initialize = async () => {
      try {
        initializeEnvironment();
        // Initialize CSRF token from backend
        await initializeCSRFToken();
      } catch (error) {
        console.error('Failed to initialize application:', error);
        // You could show an error boundary or fallback UI here
      }
    };
    
    initialize();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<JSONExpressPage />} />
            <Route path="/fastapi-charts" element={<FastAPIPage />} />
            <Route path="/supabase-charts" element={<SupabasePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
