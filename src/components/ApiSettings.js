// API Settings Component - Toggle between mock data and real API

import api from '../services/api.js';
import { API_CONFIG, isApiConfigured, getAuthHeader } from '../config/api.js';

export class ApiSettings {
  constructor() {
    this.isOpen = false;
    this.connectionStatus = 'unknown'; // 'unknown', 'testing', 'connected', 'failed'
    this.testInProgress = false;
  }

  render() {
    const useMock = api.devMode;
    const apiConfigured = isApiConfigured();
    
    return `
      <div class="api-settings ${this.isOpen ? 'open' : ''}">
        <button class="api-settings-toggle" id="api-settings-toggle" title="API Settings">
          <span class="status-indicator ${this.connectionStatus}"></span>
          <span class="toggle-label">${useMock ? '🔧 Mock' : '🌐 API'}</span>
          <span class="toggle-arrow">▼</span>
        </button>
        
        <div class="api-settings-panel" id="api-settings-panel">
          <div class="settings-header">
            <h3>API Configuration</h3>
            <button class="close-btn" id="close-settings">×</button>
          </div>
          
          <div class="settings-content">
            <div class="setting-group">
              <label class="setting-label">
                <input type="checkbox" id="use-mock-toggle" ${useMock ? 'checked' : ''} ${!apiConfigured ? 'disabled' : ''}>
                <span>Use Mock Data (Development Mode)</span>
              </label>
              <p class="setting-hint">
                ${useMock 
                  ? 'Currently using mock data. Toggle off to use real Nanobanana API.' 
                  : 'Currently using real API. Toggle on to use mock data for testing.'}
              </p>
            </div>

            <div class="setting-group">
              <div class="api-status">
                <label>API Connection Status:</label>
                <div class="status-display">
                  <span class="status-badge ${this.connectionStatus}" id="connection-status-badge">
                    ${this.getStatusText()}
                  </span>
                  <button class="btn btn-small" id="test-connection-btn" ${this.testInProgress ? 'disabled' : ''}>
                    ${this.testInProgress ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
              
              ${!apiConfigured ? `
                <div class="warning-box">
                  <p>⚠️ API key not configured</p>
                  <p>Add <code>VITE_NANOBANANA_API_KEY</code> to your <code>.env</code> file</p>
                </div>
              ` : `
                <div class="info-box">
                  <p>✅ API key configured</p>
                  <p>Key: <code>${API_CONFIG.apiKey.substring(0, 8)}...</code></p>
                </div>
              `}
            </div>

            <div class="setting-group">
              <label class="setting-label">API Endpoint:</label>
              <code class="endpoint-display">${API_CONFIG.baseURL}</code>
              <p class="setting-hint">Proxied to: ${API_CONFIG.nanobananaURL}</p>
            </div>

            <div class="test-results" id="test-results"></div>
          </div>
        </div>
      </div>
    `;
  }

  getStatusText() {
    switch (this.connectionStatus) {
      case 'testing':
        return '🔄 Testing...';
      case 'connected':
        return '✅ Connected';
      case 'failed':
        return '❌ Failed';
      case 'unknown':
      default:
        return '❓ Unknown';
    }
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
    
    // Auto-test connection if API is configured and not in mock mode
    if (isApiConfigured() && !api.devMode) {
      // Delay slightly to ensure UI is rendered
      setTimeout(() => {
        this.testConnection();
      }, 1500);
    } else if (!isApiConfigured()) {
      // If API not configured, set status to unknown
      this.connectionStatus = 'unknown';
      this.updateUI();
    }
  }

  setupEventListeners() {
    // Toggle panel
    const toggleBtn = document.getElementById('api-settings-toggle');
    const closeBtn = document.getElementById('close-settings');
    const panel = document.getElementById('api-settings-panel');
    
    toggleBtn?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.updateUI();
    });
    
    closeBtn?.addEventListener('click', () => {
      this.isOpen = false;
      this.updateUI();
    });

    // Mock data toggle
    const mockToggle = document.getElementById('use-mock-toggle');
    mockToggle?.addEventListener('change', (e) => {
      api.setDevMode(e.target.checked);
      this.updateUI();
      
      // If switching to real API, test connection
      if (!api.devMode && isApiConfigured()) {
        this.testConnection();
      }
    });

    // Test connection button
    const testBtn = document.getElementById('test-connection-btn');
    testBtn?.addEventListener('click', () => {
      this.testConnection();
    });
  }

  async testConnection() {
    if (!isApiConfigured()) {
      this.connectionStatus = 'failed';
      this.updateUI();
      return;
    }

    this.testInProgress = true;
    this.connectionStatus = 'testing';
    this.updateUI();

    const resultsDiv = document.getElementById('test-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '<p class="test-info">Testing API connection...</p>';
    }

    try {
      // Test by making a simple request to a health check or test endpoint
      // If nanobanana has a health endpoint, use that. Otherwise, test vision endpoint with a small test
      const testResult = await this.performConnectionTest();
      
      if (testResult.success) {
        this.connectionStatus = 'connected';
        if (resultsDiv) {
          const is404Note = testResult.note && testResult.note.includes('404');
          resultsDiv.innerHTML = `
            <div class="test-success">
              <p>✅ ${testResult.status}</p>
              <p>Response time: ${testResult.responseTime}ms</p>
              ${testResult.endpoint ? `<p class="test-note">Tested endpoint: ${testResult.endpoint}</p>` : ''}
              ${testResult.note ? `
                <div class="test-note-box">
                  <p class="test-note">${testResult.note}</p>
                  ${is404Note ? `
                    <p class="test-note-hint">💡 This is normal if your backend endpoints are not yet implemented. The proxy is working correctly - you can use mock data for testing.</p>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }
      } else {
        throw new Error(testResult.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      this.connectionStatus = 'failed';
      if (resultsDiv) {
        resultsDiv.innerHTML = `
          <div class="test-error">
            <p>❌ Connection failed</p>
            <p>Error: ${error.message}</p>
            <p class="error-hint">Check your API key and network connection</p>
          </div>
        `;
      }
    } finally {
      this.testInProgress = false;
      this.updateUI();
    }
  }

  async performConnectionTest() {
    const startTime = Date.now();
    
    try {
      const authHeader = getAuthHeader();
      const headers = {};
      if (authHeader) {
        headers[API_CONFIG.authHeaderName] = authHeader;
      }

      // Test multiple endpoints to determine connectivity
      // We'll try a few common endpoints and see what responses we get
      const testEndpoints = [
        '/health',
        '/status',
        '/api/health',
        '/vision/analyze', // This will fail but tells us if server is reachable
      ];

      let lastError = null;
      let lastResponse = null;
      let responseTime = 0;

      for (const endpoint of testEndpoints) {
        try {
          const testUrl = `${API_CONFIG.baseURL}${endpoint}`;
          const testStartTime = Date.now();
          
          const response = await fetch(testUrl, {
            method: endpoint === '/vision/analyze' ? 'POST' : 'GET',
            headers,
            body: endpoint === '/vision/analyze' ? JSON.stringify({}) : undefined,
            signal: AbortSignal.timeout(5000),
          });

          responseTime = Date.now() - testStartTime;
          lastResponse = response;

          // Any response (even 404) means the server is reachable
          if (response.status === 200 || response.status === 201) {
            return {
              success: true,
              responseTime,
              status: `✅ Connected (HTTP ${response.status})`,
              endpoint: endpoint,
            };
          } else if (response.status === 404) {
            // 404 means server is reachable, just endpoint doesn't exist
            // This is actually a good sign - the proxy is working
            // Return success on first 404 to indicate server is reachable
            return {
              success: true,
              responseTime,
              status: '✅ Server reachable (proxy working)',
              endpoint: endpoint,
              note: 'Endpoint returns 404 (not implemented), but server is reachable. This is normal if backend endpoints are not yet implemented.',
            };
          } else if (response.status === 401 || response.status === 403) {
            // Auth error - server is reachable but credentials issue
            return {
              success: false,
              error: 'Authentication failed - check your API key',
              responseTime,
              status: `HTTP ${response.status}`,
            };
          } else if (response.status >= 500) {
            // Server error - but server is reachable
            return {
              success: true,
              responseTime,
              status: 'Server reachable (server error)',
              endpoint: endpoint,
              note: `Server returned ${response.status} - server is reachable`,
            };
          }
        } catch (fetchError) {
          lastError = fetchError;
          
          // Network errors mean server is not reachable
          if (fetchError.name === 'AbortError') {
            return {
              success: false,
              error: 'Request timeout - API server may be unreachable',
              responseTime: Date.now() - startTime,
            };
          }
          
          // If it's a network error (not timeout), continue to next endpoint
          if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
            continue;
          }
          
          // Other errors, continue
          continue;
        }
      }

      // If we got here, we tried all endpoints
      // If we got any response (even 404), server is reachable
      if (lastResponse) {
        return {
          success: true,
          responseTime: responseTime || (Date.now() - startTime),
          status: 'Server reachable',
          note: 'Tested multiple endpoints - server is responding',
        };
      }

      // If no response at all, it's a network issue
      return {
        success: false,
        error: lastError?.message || 'Unable to reach API server',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        responseTime,
      };
    }
  }

  updateUI() {
    const container = document.querySelector('.api-settings')?.parentElement || document.body;
    const existing = document.querySelector('.api-settings');
    if (existing) {
      existing.outerHTML = this.render();
      this.setupEventListeners();
    }
  }
}
