import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import './i18n/index.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#1B2B4B',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: { primary: '#C9A84C', secondary: '#fff' },
        },
        error: {
          style: { background: '#dc2626', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#dc2626' },
        },
      }}
    />
  </React.StrictMode>
);
