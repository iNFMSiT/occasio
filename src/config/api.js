// API Configuration
// This file centralizes API configuration and credentials

export const API_CONFIG = {
  // Get API key from environment variable
  apiKey: import.meta.env.VITE_NANOBANANA_API_KEY || '',
  
  // Base URL for API requests (will be proxied by Vite)
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Nanobanana API base URL (for proxy configuration)
  nanobananaURL: import.meta.env.VITE_NANOBANANA_API_URL || 'https://nanobnana.com',
  
  // API endpoints
  endpoints: {
    vision: {
      analyze: '/vision/analyze',
    },
    images: {
      generate: '/images/generate',
      generateBatch: '/images/generate/batch',
      upscale: '/images/upscale',
    },
    quality: {
      check: '/quality/check',
    },
    jobs: {
      create: '/jobs',
      status: (jobId) => `/jobs/${jobId}/status`,
    },
  },
  
  // Authentication method
  // Options: 'header', 'query', 'bearer'
  authMethod: 'header',
  
  // Auth header name (if using header auth)
  authHeaderName: 'Authorization',
};

// Helper to get auth header value
export function getAuthHeader() {
  if (!API_CONFIG.apiKey) {
    console.warn('⚠️ API key not configured. Set VITE_NANOBANANA_API_KEY in .env file');
    return null;
  }
  
  // You can customize this based on nanobanana's auth format
  // Common formats:
  // - Bearer token: `Bearer ${API_CONFIG.apiKey}`
  // - API key: `ApiKey ${API_CONFIG.apiKey}`
  // - Custom: `X-API-Key: ${API_CONFIG.apiKey}`
  
  return `Bearer ${API_CONFIG.apiKey}`;
}

// Helper to check if API is configured
export function isApiConfigured() {
  return !!API_CONFIG.apiKey;
}
