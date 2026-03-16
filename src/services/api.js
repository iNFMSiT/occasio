// API service for communicating with nanobanana backend

import { API_CONFIG, getAuthHeader, isApiConfigured } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    // Check localStorage for manual override, otherwise use defaults
    const storedMode = localStorage.getItem('api_dev_mode');
    if (storedMode !== null) {
      this.devMode = storedMode === 'true';
    } else {
      this.devMode = import.meta.env.DEV || window.location.search.includes('dev=true') || !isApiConfigured();
    }
  }

  // Method to toggle dev mode and persist to localStorage
  setDevMode(enabled) {
    this.devMode = enabled;
    localStorage.setItem('api_dev_mode', enabled.toString());
    console.log(`API Mode: ${enabled ? '🔧 Mock Data' : '🌐 Real API'}`);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth header if API is configured
    const authHeader = getAuthHeader();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { [API_CONFIG.authHeaderName]: authHeader }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Vision Analysis - Extract "The Anchor" (person description)
  async analyzeImage(imageFile) {
    // Development mode: Return mock data if API not configured
    if (this.devMode) {
      console.warn('🔧 DEV MODE: Using mock vision analysis');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock description based on file name or use default
      const mockDescriptions = [
        'Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses, casual clothing',
        'Female, early 30s, long dark hair, friendly smile, wearing a t-shirt',
        'Male, mid 20s, athletic build, short hair, wearing sports attire',
        'Female, late 20s, curly hair, glasses, wearing a hoodie',
      ];
      
      return {
        description: mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)],
        confidence: 0.95,
        devMode: true,
      };
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    // Get auth header
    const authHeader = getAuthHeader();
    const headers = {};
    if (authHeader) {
      headers[API_CONFIG.authHeaderName] = authHeader;
    }

    try {
      const response = await fetch(`${this.baseURL}/vision/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          // If we're not in dev mode and get 404, suggest using mock data
          if (!this.devMode) {
            throw new Error('API endpoint not found. The /api/vision/analyze endpoint may not be implemented yet. Try enabling "Use Mock Data" in API Settings for testing.');
          } else {
            throw new Error('API endpoint not found. Please ensure the backend server is running and the /api/vision/analyze endpoint is configured.');
          }
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please check your API key in the .env file.');
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). The API server may be experiencing issues.`);
        }
        throw new Error(`Vision analysis failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Don't automatically fall back to mock mode - let the error handler deal with it
      // Only throw the error so the UI can show appropriate message
      throw error;
    }
  }

  // Image Generation
  async generateImage(prompt, style, options = {}) {
    // Development mode: Return mock data
    if (this.devMode) {
      console.warn('🔧 DEV MODE: Using mock image generation');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a placeholder image using a data URL
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MOCK IMAGE', 256, 200);
      ctx.font = '16px sans-serif';
      ctx.fillText(style, 256, 250);
      ctx.fillText('(Dev Mode)', 256, 300);
      
      return {
        imageUrl: canvas.toDataURL('image/png'),
        prompt,
        style,
        devMode: true,
      };
    }

    return this.request('/images/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        style,
        ...options,
      }),
    });
  }

  // Batch Image Generation
  async generateBatch(prompts, jobId) {
    // Development mode: Return mock data
    if (this.devMode) {
      console.warn('🔧 DEV MODE: Using mock batch generation');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return prompts.map((promptData, index) => ({
        cardIndex: promptData.cardIndex,
        imageUrl: this.generateMockImageUrl(promptData.style),
        prompt: promptData.prompt,
        style: promptData.style,
        devMode: true,
      }));
    }

    return this.request('/images/generate/batch', {
      method: 'POST',
      body: JSON.stringify({
        prompts,
        jobId,
      }),
    });
  }

  // Helper to generate mock image URLs
  generateMockImageUrl(style) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const colors = [
      ['#6366f1', '#8b5cf6'],
      ['#10b981', '#059669'],
      ['#f59e0b', '#d97706'],
      ['#ef4444', '#dc2626'],
      ['#06b6d4', '#0891b2'],
    ];
    
    const colorPair = colors[Math.floor(Math.random() * colors.length)];
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, colorPair[0]);
    gradient.addColorStop(1, colorPair[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(style, 256, 256);
    
    return canvas.toDataURL('image/png');
  }

  // Quality Check
  async checkQuality(imageUrl, anchorDescription) {
    // Development mode: Return mock data (always pass)
    if (this.devMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        faceMatch: 0.95,
        handQuality: 0.92,
        passed: true,
        devMode: true,
      };
    }

    return this.request('/quality/check', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        anchorDescription,
      }),
    });
  }

  // Upscale Image
  async upscaleImage(imageUrl, targetDPI = 300) {
    return this.request('/images/upscale', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        targetDPI,
      }),
    });
  }

  // Job Status
  async getJobStatus(jobId) {
    // Development mode: Return mock data
    if (this.devMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // In dev mode, we'll simulate job progress
      return {
        status: 'processing',
        progress: 50,
        completedCards: 26,
        failedCards: 0,
        cards: [],
        devMode: true,
      };
    }

    return this.request(`/jobs/${jobId}/status`);
  }

  // Create Job
  async createJob(jobData) {
    // Development mode: Return mock data
    if (this.devMode) {
      console.warn('🔧 DEV MODE: Using mock job creation');
      return {
        jobId: `dev_job_${Date.now()}`,
        status: 'queued',
        ...jobData,
        devMode: true,
      };
    }

    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }
}

export default new ApiService();
