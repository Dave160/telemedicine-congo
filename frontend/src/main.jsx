import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', maxWidth: '380px' },
        success: { iconTheme: { primary: '#34a853', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ea4335', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);
