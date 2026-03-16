// Main Application - Orchestrates the entire custom cards pipeline

import './style.css';
import { UploadStep } from './components/UploadStep.js';
import { SurveyStep } from './components/SurveyStep.js';
import { StyleThemeStep } from './components/StyleThemeStep.js';
import { TestingStep } from './components/TestingStep.js';
import { ProgressStep } from './components/ProgressStep.js';
import { CardGallery } from './components/CardGallery.js';

import api from './services/api.js';
import promptEngine from './services/promptEngine.js';
import jobManager from './services/jobManager.js';
import qualityGuard from './services/qualityGuard.js';
import upscaleService from './services/upscaleService.js';
import { testApiConfig } from './utils/testApi.js';
import { ApiSettings } from './components/ApiSettings.js';

// Store API settings instance globally for error recovery
let apiSettingsInstance = null;

class CustomCardsApp {
  constructor() {
    this.currentStep = 'upload';
    this.appData = {
      images: [],
      anchorDescription: null,
      surveyData: {},
      selectedStyles: [],
      selectedThemes: [],
      blueprint: null,
      jobId: null,
      cards: [],
    };
  }

  init() {
    this.render();
    this.showStep('upload');
  }

  render() {
    const app = document.getElementById('app');
    const isDevMode = api.devMode || window.location.search.includes('dev=true');
    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>🎴 Custom Cards</h1>
          <p>Create a personalized deck of cards with your friend's images</p>
        </header>
        <main class="app-main" id="app-main"></main>
        <div class="step-indicator" id="step-indicator"></div>
      </div>
    `;
    
    // Mount API settings component
    const settingsContainer = document.createElement('div');
    document.body.appendChild(settingsContainer);
    apiSettingsInstance = new ApiSettings();
    apiSettingsInstance.mount(settingsContainer);
  }

  showStep(stepName) {
    this.currentStep = stepName;
    const main = document.getElementById('app-main');
    
    switch (stepName) {
      case 'upload':
        this.showUploadStep();
        break;
      case 'survey':
        this.showSurveyStep();
        break;
      case 'style-theme':
        this.showStyleThemeStep();
        break;
      case 'testing':
        this.showTestingStep();
        break;
      case 'progress':
        this.showProgressStep();
        break;
      case 'gallery':
        this.showGallery();
        break;
    }
    
    this.updateStepIndicator();
  }

  showUploadStep() {
    const step = new UploadStep((data) => {
      this.appData.images = data.images;
      this.processVisionAnalysis();
    });
    step.mount(document.getElementById('app-main'));
  }

  async processVisionAnalysis() {
    // Step 2: Extract "The Anchor" via Vision Analysis
    try {
      const main = document.getElementById('app-main');
      main.innerHTML = `
        <div class="step-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Analyzing images and extracting person description...</p>
            ${api.devMode ? '<p class="dev-notice">🔧 Development Mode: Using mock data</p>' : ''}
          </div>
        </div>
      `;
      
      const imageFile = this.appData.images[0].file;
      const result = await api.analyzeImage(imageFile);
      
      this.appData.anchorDescription = result.description;
      console.log('Anchor description:', this.appData.anchorDescription);
      
      if (result.devMode) {
        console.log('✅ Using mock anchor description in dev mode');
      }
      
      // Move to survey step
      this.showStep('survey');
    } catch (error) {
      console.error('Vision analysis failed:', error);
      
      // Show a more helpful error message
      const main = document.getElementById('app-main');
      const is404 = error.message.includes('404') || error.message.includes('not found');
      const isAuthError = error.message.includes('Authentication') || error.message.includes('401') || error.message.includes('403');
      
      main.innerHTML = `
        <div class="step-container">
          <div class="error-state">
            <h3>⚠️ Vision Analysis Failed</h3>
            <p>${error.message}</p>
            ${is404 ? `
              <div class="error-help">
                <p><strong>Backend API endpoint not available</strong></p>
                <p>The vision analysis endpoint is not configured on your backend. Options:</p>
                <ul>
                  <li>Set up the backend API at <code>/api/vision/analyze</code></li>
                  <li>Use the API Settings toggle (top-right) to switch to Mock Data for testing</li>
                </ul>
                <button class="btn btn-primary" id="use-mock-btn">Switch to Mock Data</button>
              </div>
            ` : isAuthError ? `
              <div class="error-help">
                <p><strong>Authentication Error</strong></p>
                <p>Your API key may be incorrect or expired. Please check:</p>
                <ul>
                  <li>Verify your API key in the <code>.env</code> file</li>
                  <li>Make sure the key starts with <code>VITE_NANOBANANA_API_KEY=</code></li>
                  <li>Restart the dev server after changing <code>.env</code></li>
                </ul>
                <button class="btn btn-secondary" id="use-mock-btn">Use Mock Data Instead</button>
              </div>
            ` : ''}
            <div class="error-actions">
              <button class="btn btn-secondary" id="retry-btn">Retry</button>
              <button class="btn btn-secondary" id="back-btn">Go Back</button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners for error recovery
      const useMockBtn = document.getElementById('use-mock-btn');
      const retryBtn = document.getElementById('retry-btn');
      const backBtn = document.getElementById('back-btn');
      
      if (useMockBtn) {
        useMockBtn.addEventListener('click', () => {
          // Enable dev mode and retry
          api.setDevMode(true);
          // Refresh the API settings component
          if (apiSettingsInstance) {
            apiSettingsInstance.updateUI();
          }
          this.processVisionAnalysis();
        });
      }
      
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.processVisionAnalysis();
        });
      }
      
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.showStep('upload');
        });
      }
    }
  }

  showSurveyStep() {
    const step = new SurveyStep((surveyData) => {
      this.appData.surveyData = surveyData;
      this.showStep('style-theme');
    });
    step.mount(document.getElementById('app-main'));
  }

  showStyleThemeStep() {
    const step = new StyleThemeStep((data) => {
      this.appData.selectedStyles = data.styles;
      this.appData.selectedThemes = data.themes;
      this.showStep('testing');
    });
    step.mount(document.getElementById('app-main'));
  }

  showTestingStep() {
    const testData = {
      anchorDescription: this.appData.anchorDescription,
      surveyData: this.appData.surveyData,
      selectedStyles: this.appData.selectedStyles,
      selectedThemes: this.appData.selectedThemes,
    };
    
    const step = new TestingStep(testData, () => {
      this.startFullGeneration();
    });
    step.mount(document.getElementById('app-main'));
  }

  async startFullGeneration() {
    // Step 7: Create the blueprint
    const blueprint = promptEngine.createBlueprint(
      this.appData.anchorDescription,
      this.appData.surveyData,
      this.appData.selectedStyles,
      this.appData.selectedThemes,
      this.appData.surveyData.moodSliders || { chaos: 0.5, energy: 0.5, humor: 0.5 }
    );
    
    this.appData.blueprint = blueprint;
    
    // Step 8: Create job and start generation
    try {
      const job = await jobManager.createJob({
        blueprint,
        anchorDescription: this.appData.anchorDescription,
        surveyData: this.appData.surveyData,
        styles: this.appData.selectedStyles,
        themes: this.appData.selectedThemes,
      });
      
      this.appData.jobId = job.id;
      this.showStep('progress');
      
      // Start the actual generation process
      this.processGeneration(job.id, blueprint);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to start generation. Please try again.');
    }
  }

  async processGeneration(jobId, blueprint) {
    // Step 8: Batch image generation with quality guard
    const batchSize = 5; // Generate 5 at a time
    
    for (let i = 0; i < blueprint.length; i += batchSize) {
      const batch = blueprint.slice(i, i + batchSize);
      
      try {
        // Generate batch
        const results = await api.generateBatch(
          batch.map(card => ({
            prompt: card.prompt,
            style: card.style,
            cardIndex: card.cardIndex,
          })),
          jobId
        );
        
        // Quality check each result
        for (const result of results) {
          const quality = await qualityGuard.checkQuality(
            result.imageUrl,
            this.appData.anchorDescription
          );
          
          if (!quality.passed) {
            // Auto-regenerate failed cards
            console.log(`Regenerating card ${result.cardIndex} due to quality issues`);
            // TODO: Add to regeneration queue
          } else {
            this.appData.cards.push({
              ...result,
              quality,
            });
          }
        }
        
        // Update job status
        const job = jobManager.getJob(jobId);
        if (job) {
          job.completedCards = this.appData.cards.length;
          job.progress = (this.appData.cards.length / blueprint.length) * 100;
        }
      } catch (error) {
        console.error('Batch generation failed:', error);
      }
    }
    
    // Mark job as complete
    const job = jobManager.getJob(jobId);
    if (job) {
      job.status = 'completed';
      job.cards = this.appData.cards;
    }
  }

  showProgressStep() {
    const step = new ProgressStep(this.appData.jobId, (job) => {
      this.appData.cards = job.cards;
      this.showStep('gallery');
    });
    step.mount(document.getElementById('app-main'));
  }

  showGallery() {
    const step = new CardGallery(
      this.appData.cards,
      (index) => this.regenerateCard(index),
      (cards, isAll) => this.downloadCards(cards, isAll),
      (cards) => this.orderCards(cards)
    );
    step.mount(document.getElementById('app-main'));
  }

  async regenerateCard(index) {
    // Step 9: Regeneration phase
    const card = this.appData.cards[index];
    const blueprintCard = this.appData.blueprint[index];
    
    try {
      const result = await api.generateImage(blueprintCard.prompt, blueprintCard.style);
      const quality = await qualityGuard.checkQuality(result.imageUrl, this.appData.anchorDescription);
      
      if (quality.passed) {
        this.appData.cards[index] = {
          ...card,
          ...result,
          quality,
        };
        this.showGallery();
      } else {
        alert('Regenerated image still has quality issues. Please try again.');
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      alert('Failed to regenerate card. Please try again.');
    }
  }

  async downloadCards(cards, isAll) {
    // Step 11: Download functionality
    if (isAll) {
      // Download all as ZIP
      // TODO: Implement ZIP creation and download
      alert('Download all as ZIP - Coming soon!');
    } else {
      // Download selected cards
      for (const card of cards) {
        const link = document.createElement('a');
        link.href = card.imageUrl;
        link.download = `card-${card.cardIndex + 1}.png`;
        link.click();
      }
    }
  }

  async orderCards(cards) {
    // Step 12: Order physical deck via Prodigi/Shopify
    // TODO: Integrate with Prodigi API
    alert('Ordering functionality - Coming soon! This will integrate with Prodigi/Shopify.');
  }

  updateStepIndicator() {
    const steps = ['upload', 'survey', 'style-theme', 'testing', 'progress', 'gallery'];
    const currentIndex = steps.indexOf(this.currentStep);
    
    const indicator = document.getElementById('step-indicator');
    indicator.innerHTML = steps.map((step, index) => `
      <div class="step-dot ${index <= currentIndex ? 'active' : ''} ${index === currentIndex ? 'current' : ''}">
        <span>${index + 1}</span>
      </div>
    `).join('');
  }
}

// Initialize the app
const app = new CustomCardsApp();
app.init();

// Log API configuration status on startup
if (import.meta.env.DEV) {
  console.log('🔧 Development Mode');
  const apiStatus = testApiConfig();
  if (apiStatus.configured) {
    console.log('✅ API key is configured and ready to use');
  } else {
    console.warn('⚠️ API key not configured - using mock data');
    console.log('💡 Add VITE_NANOBANANA_API_KEY to your .env file to use real API');
  }
}
