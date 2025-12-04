// API Configuration
// This file centralizes API URL configuration for easy deployment

// Check if we're in production
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// In production (when frontend is served by backend), always use relative URLs
// In development, use localhost:3001 or env var if set
const API_URL = isProduction 
  ? '' // Always use relative URLs when served together
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');

// Debug logging - will show in browser console
console.log('🔧 API Configuration:');
console.log('  Hostname:', window.location.hostname);
console.log('  Is Production:', isProduction);
console.log('  REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);
console.log('  Using API_URL:', API_URL || '(relative - same origin)');

export default API_URL;

