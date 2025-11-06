// API Configuration
// This file centralizes API URL configuration for easy deployment

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Debug logging - will show in browser console
console.log('🔧 API Configuration:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  Using API_URL:', API_URL);
console.log('  If you see localhost, REACT_APP_API_URL is not set!');

export default API_URL;

