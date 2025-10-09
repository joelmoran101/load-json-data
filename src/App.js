// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import JSONExpressPage from './pages/JSONExpressPage';
import FastAPIPage from './pages/FastAPIPage';
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
