// API Configuration
// This file centralizes API URL configuration for easy deployment

// Check if we're in production (Render)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Use environment variable if set, otherwise use production URL if on Render, otherwise localhost
const API_URL = process.env.REACT_APP_API_URL || 
                (isProduction ? 'https://smu-web-application.onrender.com' : 'http://localhost:3001');

// Debug logging - will show in browser console
console.log('🔧 API Configuration:');
console.log('  Hostname:', window.location.hostname);
console.log('  Is Production:', isProduction);
console.log('  REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);
console.log('  Using API_URL:', API_URL);

export default API_URL;

