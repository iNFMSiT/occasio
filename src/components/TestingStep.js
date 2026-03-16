// Step 6: Testing Phase - Generate 1 card to preview

import api from '../services/api.js';
import promptEngine from '../services/promptEngine.js';

export class TestingStep {
  constructor(data, onComplete) {
    this.onComplete = onComplete;
    this.data = data; // Contains anchor, survey, styles, themes
    this.testCard = null;
    this.isGenerating = false;
  }

  render() {
    return `
      <div class="step-container testing-step">
        <h2>Test Your Settings</h2>
        <p class="step-description">
          Let's generate one test card to make sure everything looks good before creating all 52 cards.
        </p>

        <div class="test-preview" id="test-preview">
          ${this.testCard ? `
            <div class="test-card-result">
              <img src="${this.testCard.imageUrl}" alt="Test card">
              <div class="test-card-info">
                <p><strong>Style:</strong> ${this.testCard.style}</p>
                <p><strong>Theme:</strong> ${this.testCard.theme}</p>
                <p><strong>Prompt:</strong> ${this.testCard.prompt}</p>
              </div>
            </div>
          ` : `
            <div class="test-placeholder">
              <p>Click "Generate Test Card" to see a preview</p>
            </div>
          `}
        </div>

        <div class="test-actions">
          <button class="btn btn-secondary" id="generate-test-btn" ${this.isGenerating ? 'disabled' : ''}>
            ${this.isGenerating ? 'Generating...' : 'Generate Test Card'}
          </button>
          ${this.testCard ? `
            <button class="btn btn-secondary" id="regenerate-test-btn">
              Regenerate
            </button>
            <button class="btn btn-primary" id="continue-btn">
              Looks Good! Continue to Full Generation
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const generateBtn = document.getElementById('generate-test-btn');
    const regenerateBtn = document.getElementById('regenerate-test-btn');
    const continueBtn = document.getElementById('continue-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateTestCard());
    }

    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => this.generateTestCard());
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.onComplete();
      });
    }
  }

  async generateTestCard() {
    this.isGenerating = true;
    this.updateUI();

    try {
      // Generate a test prompt
      const testPrompt = promptEngine.generateCardPrompt(
        0, // cardIndex
        this.data.anchorDescription,
        this.data.surveyData,
        this.data.selectedStyles,
        this.data.selectedThemes,
        this.data.surveyData.moodSliders || { chaos: 0.5, energy: 0.5, humor: 0.5 }
      );

      // Generate the image
      const result = await api.generateImage(
        testPrompt.prompt,
        testPrompt.style,
        { test: true }
      );

      this.testCard = {
        ...testPrompt,
        imageUrl: result.imageUrl,
      };

      this.isGenerating = false;
      this.updateUI();
    } catch (error) {
      console.error('Error generating test card:', error);
      alert('Failed to generate test card. Please try again.');
      this.isGenerating = false;
      this.updateUI();
    }
  }

  updateUI() {
    const container = document.getElementById('app');
    this.mount(container);
  }
}
