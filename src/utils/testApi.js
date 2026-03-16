// Utility to test API configuration
// Run this in the browser console to verify API setup

import { API_CONFIG, getAuthHeader, isApiConfigured } from '../config/api.js';

export function testApiConfig() {
  console.log('🔍 Testing API Configuration...\n');
  
  console.log('API Key configured:', isApiConfigured() ? '✅ Yes' : '❌ No');
  console.log('API Key value:', API_CONFIG.apiKey ? `${API_CONFIG.apiKey.substring(0, 10)}...` : 'Not set');
  console.log('Base URL:', API_CONFIG.baseURL);
  console.log('Nanobanana URL:', API_CONFIG.nanobananaURL);
  console.log('Auth Header:', getAuthHeader() ? '✅ Set' : '❌ Not set');
  
  if (getAuthHeader()) {
    console.log('Auth Header Preview:', getAuthHeader().substring(0, 20) + '...');
  }
  
  return {
    configured: isApiConfigured(),
    apiKey: API_CONFIG.apiKey ? 'Set (hidden)' : 'Not set',
    baseURL: API_CONFIG.baseURL,
    authHeader: getAuthHeader() ? 'Set' : 'Not set',
  };
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  window.testApiConfig = testApiConfig;
}
