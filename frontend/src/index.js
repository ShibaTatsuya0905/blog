// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // CSS Global của bạn
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Quan trọng

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Bọc App bằng Router ở đây */}
      <App />
    </Router>
  </React.StrictMode>
);