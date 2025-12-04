// API Configuration
// This file centralizes API URL configuration for easy deployment

// Check if we're in production
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.includes('localhost');

// IMPORTANT: When frontend and backend are served together (Railway single-service deployment),
// we MUST use relative URLs (empty string). Do NOT set REACT_APP_API_URL in production.
let API_URL;
if (isProduction) {
  // Production: Always use relative URLs when served by backend
  // Force empty string - ignore any env var that might be set incorrectly
  API_URL = '';
} else {
  // Development: Use env var or default to localhost
  API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
}

// Debug logging - will show in browser console
console.log('🔧 API Configuration:');
console.log('  Hostname:', window.location.hostname);
console.log('  Is Production:', isProduction);
console.log('  REACT_APP_API_URL env:', process.env.REACT_APP_API_URL);
console.log('  Using API_URL:', API_URL || '(relative - same origin)');
console.log('  Final API URL will be:', API_URL ? `${API_URL}/api/...` : 'relative /api/...');

export default API_URL;

