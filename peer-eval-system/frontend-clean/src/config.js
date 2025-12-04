// API Configuration
// This file centralizes API URL configuration for easy deployment

// Check if we're in production
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Use environment variable if set, otherwise:
// - In production: use same origin (frontend and backend are served together)
// - In development: use localhost:3001
const API_URL = process.env.REACT_APP_API_URL || 
                (isProduction ? '' : 'http://localhost:3001');

// Debug logging - will show in browser console
console.log('🔧 API Configuration:');
console.log('  Hostname:', window.location.hostname);
console.log('  Is Production:', isProduction);
console.log('  REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);
console.log('  Using API_URL:', API_URL || '(relative - same origin)');

export default API_URL;

