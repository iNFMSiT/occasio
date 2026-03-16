// Step 4 & 5: Art Style and Theme Selection

import { ART_STYLES, THEMES } from '../config/constants.js';

export class StyleThemeStep {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.selectedStyles = [];
    this.selectedThemes = [];
  }

  render() {
    return `
      <div class="step-container style-theme-step">
        <h2>Choose Art Styles & Themes</h2>
        <p class="step-description">
          Select 1-4 art styles and 1-4 themes. These will be used to create your 52 unique cards.
        </p>

        <div class="selection-section">
          <h3>Art Styles (Select 1-4)</h3>
          <div class="selection-grid" id="styles-grid">
            ${ART_STYLES.map(style => `
              <div class="selection-card ${this.selectedStyles.includes(style.id) ? 'selected' : ''}" 
                   data-type="style" data-id="${style.id}">
                <div class="card-preview"></div>
                <h4>${style.label}</h4>
                <p>${style.description}</p>
              </div>
            `).join('')}
          </div>
          <p class="selection-count">Selected: <span id="styles-count">${this.selectedStyles.length}</span>/4</p>
        </div>

        <div class="selection-section">
          <h3>Themes (Select 1-4)</h3>
          <div class="selection-grid" id="themes-grid">
            ${THEMES.map(theme => `
              <div class="selection-card ${this.selectedThemes.includes(theme.id) ? 'selected' : ''}" 
                   data-type="theme" data-id="${theme.id}">
                <div class="card-preview"></div>
                <h4>${theme.label}</h4>
                <p>${theme.description}</p>
              </div>
            `).join('')}
          </div>
          <p class="selection-count">Selected: <span id="themes-count">${this.selectedThemes.length}</span>/4</p>
        </div>

        <div class="step-actions">
          <button class="btn btn-primary" id="continue-btn" disabled>
            Continue to Testing
          </button>
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Style selection
    document.querySelectorAll('[data-type="style"]').forEach(card => {
      card.addEventListener('click', () => {
        const styleId = card.dataset.id;
        const index = this.selectedStyles.indexOf(styleId);
        
        if (index > -1) {
          this.selectedStyles.splice(index, 1);
        } else {
          if (this.selectedStyles.length < 4) {
            this.selectedStyles.push(styleId);
          } else {
            alert('Maximum 4 styles allowed');
            return;
          }
        }
        
        this.updateSelection();
      });
    });

    // Theme selection
    document.querySelectorAll('[data-type="theme"]').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.dataset.id;
        const index = this.selectedThemes.indexOf(themeId);
        
        if (index > -1) {
          this.selectedThemes.splice(index, 1);
        } else {
          if (this.selectedThemes.length < 4) {
            this.selectedThemes.push(themeId);
          } else {
            alert('Maximum 4 themes allowed');
            return;
          }
        }
        
        this.updateSelection();
      });
    });

    // Continue button
    document.getElementById('continue-btn').addEventListener('click', () => {
      if (this.selectedStyles.length > 0 && this.selectedThemes.length > 0) {
        this.onComplete({
          styles: this.selectedStyles,
          themes: this.selectedThemes,
        });
      }
    });
  }

  updateSelection() {
    // Update style cards
    document.querySelectorAll('[data-type="style"]').forEach(card => {
      const styleId = card.dataset.id;
      card.classList.toggle('selected', this.selectedStyles.includes(styleId));
    });

    // Update theme cards
    document.querySelectorAll('[data-type="theme"]').forEach(card => {
      const themeId = card.dataset.id;
      card.classList.toggle('selected', this.selectedThemes.includes(themeId));
    });

    // Update counts
    document.getElementById('styles-count').textContent = this.selectedStyles.length;
    document.getElementById('themes-count').textContent = this.selectedThemes.length;

    // Update continue button
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.disabled = this.selectedStyles.length === 0 || this.selectedThemes.length === 0;
  }
}
