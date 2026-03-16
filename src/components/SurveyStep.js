// Step 3: User Survey Component (This or That, Mood Sliders, Mystery Box, etc.)

import { STYLE_BATTLES, MYSTERY_BOXES, MAD_LIBS_TEMPLATES } from '../config/constants.js';

export class SurveyStep {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.surveyData = {
      styleBattles: {},
      moodSliders: {
        chaos: 0.5,
        energy: 0.5,
        humor: 0.5,
      },
      hobbies: [],
      favoriteShows: [],
      favoriteMusic: [],
      mysteryBox: null,
      madLibs: [], // Array of locked-in prompts
    };
    this.currentBattleIndex = 0;
    this.currentMadLibTemplateIndex = 0;
    this.currentMadLibSelections = {}; // Temporary selections for current template
  }

  render() {
    return `
      <div class="step-container survey-step">
        <h2>Tell Us About Your Friend</h2>
        <p class="step-description">
          Help us create the perfect deck by answering a few quick questions.
        </p>

        <div class="survey-tabs">
          <button class="tab-btn active" data-tab="battles">Style Battles</button>
          <button class="tab-btn" data-tab="sliders">Mood Sliders</button>
          <button class="tab-btn" data-tab="madlibs">Mad Libs</button>
          <button class="tab-btn" data-tab="details">Details</button>
          <button class="tab-btn" data-tab="mystery">Mystery Box (Full Deck)</button>
        </div>

        <div class="tab-content" id="tab-content">
          ${this.renderStyleBattles()}
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" id="skip-btn">Skip Survey</button>
          <button class="btn btn-primary" id="continue-btn">
            Continue to Style Selection
          </button>
        </div>
      </div>
    `;
  }

  renderStyleBattles() {
    if (this.currentBattleIndex >= STYLE_BATTLES.length) {
      return '<p>All style battles completed! Switch to another tab or continue.</p>';
    }

    const battle = STYLE_BATTLES[this.currentBattleIndex];
    return `
      <div class="style-battle">
        <h3>${this.currentBattleIndex + 1} of ${STYLE_BATTLES.length}</h3>
        <div class="battle-options">
          <button class="battle-option" data-choice="left">
            <div class="option-preview"></div>
            <span>${battle.left}</span>
          </button>
          <div class="battle-vs">VS</div>
          <button class="battle-option" data-choice="right">
            <div class="option-preview"></div>
            <span>${battle.right}</span>
          </button>
        </div>
      </div>
    `;
  }

  renderMoodSliders() {
    return `
      <div class="mood-sliders">
        <div class="slider-group">
          <label>
            <span>Chaos Meter</span>
            <span class="slider-value" id="chaos-value">${Math.round(this.surveyData.moodSliders.chaos * 100)}%</span>
          </label>
          <input type="range" id="chaos-slider" min="0" max="1" step="0.01" 
                 value="${this.surveyData.moodSliders.chaos}">
          <div class="slider-labels">
            <span>Realistic</span>
            <span>Surreal/Trippy</span>
          </div>
        </div>

        <div class="slider-group">
          <label>
            <span>Energy Level</span>
            <span class="slider-value" id="energy-value">${Math.round(this.surveyData.moodSliders.energy * 100)}%</span>
          </label>
          <input type="range" id="energy-slider" min="0" max="1" step="0.01" 
                 value="${this.surveyData.moodSliders.energy}">
          <div class="slider-labels">
            <span>Chill/Static</span>
            <span>Explosive/Action</span>
          </div>
        </div>

        <div class="slider-group">
          <label>
            <span>Humor Level</span>
            <span class="slider-value" id="humor-value">${Math.round(this.surveyData.moodSliders.humor * 100)}%</span>
          </label>
          <input type="range" id="humor-slider" min="0" max="1" step="0.01" 
                 value="${this.surveyData.moodSliders.humor}">
          <div class="slider-labels">
            <span>Serious/Epic</span>
            <span>Silly/Caricature</span>
          </div>
        </div>
      </div>
    `;
  }

  renderMysteryBox() {
    return `
      <div class="mystery-boxes">
        <div class="mystery-box-header">
          <h3>Mystery Box Themes</h3>
          <p class="mystery-box-description">
            Feeling stuck? Choose a preset mystery box theme and leave the imagination to us! 
            These are <strong>complete deck themes</strong> - your entire 52-card deck will be styled around your chosen theme.
          </p>
        </div>
        <div class="mystery-grid">
          ${MYSTERY_BOXES.map(box => `
            <button class="mystery-box-card ${this.surveyData.mysteryBox === box.id ? 'selected' : ''}" data-box="${box.id}">
              <div class="mystery-icon">${box.id === 'random' ? '🎲✨' : '🎲'}</div>
              <h4>${box.label}</h4>
              <p>${box.description}</p>
            </button>
          `).join('')}
        </div>
        ${this.surveyData.mysteryBox ? `
          <div class="selected-mystery">
            <p>Selected: <strong>${MYSTERY_BOXES.find(b => b.id === this.surveyData.mysteryBox)?.label}</strong></p>
            <button class="btn btn-small" id="apply-mystery">Apply to Project</button>
            <button class="btn btn-small btn-secondary" id="clear-mystery">Clear Selection</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderMadLibs() {
    const currentTemplate = MAD_LIBS_TEMPLATES[this.currentMadLibTemplateIndex];
    const lockedInCount = this.surveyData.madLibs.length;
    
    // Build the prompt with current selections
    let promptText = currentTemplate.template;
    currentTemplate.fields.forEach(field => {
      const value = this.currentMadLibSelections[field.id] || '';
      const option = field.options.find(opt => opt.value === value);
      const displayText = option ? option.label : `{${field.label}}`;
      promptText = promptText.replace(`{${field.id}}`, displayText);
    });

    return `
      <div class="mad-libs">
        <div class="mad-libs-header">
          <h3>Create Custom Prompts</h3>
          <p class="mad-libs-description">
            Lock in multiple prompts to customize your deck. Use the shuffle button to see different options.
          </p>
          <div class="mad-libs-stats">
            <span class="locked-count">${lockedInCount} prompt${lockedInCount !== 1 ? 's' : ''} locked in</span>
          </div>
        </div>

        <div class="mad-libs-current">
          <div class="mad-libs-template-controls">
            <button class="btn btn-secondary" id="shuffle-madlib-btn" title="Next Template">
              <span>🔄</span> Shuffle Template
            </button>
            <span class="template-counter">
              Template ${this.currentMadLibTemplateIndex + 1} of ${MAD_LIBS_TEMPLATES.length}
            </span>
          </div>

          <div class="mad-libs-prompt-container">
            <p class="mad-libs-prompt-preview">${promptText}</p>
          </div>

          <div class="mad-libs-fields">
            ${currentTemplate.fields.map(field => `
              <div class="mad-libs-field">
                <label for="madlib-${field.id}">${field.label}</label>
                <select id="madlib-${field.id}" class="mad-libs-select">
                  <option value="">Choose ${field.label.toLowerCase()}...</option>
                  ${field.options.map(opt => `
                    <option value="${opt.value}" ${this.currentMadLibSelections[field.id] === opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>

          <div class="mad-libs-actions">
            <button class="btn btn-primary" id="confirm-madlib-btn" 
                    ${this.isCurrentMadLibComplete() ? '' : 'disabled'}>
              ✓ Lock In This Prompt
            </button>
          </div>
        </div>

        ${lockedInCount > 0 ? `
          <div class="mad-libs-locked">
            <h4>Locked-In Prompts (${lockedInCount})</h4>
            <div class="locked-prompts-list">
              ${this.surveyData.madLibs.map((lockedPrompt, index) => `
                <div class="locked-prompt-item">
                  <div class="locked-prompt-content">
                    <span class="locked-prompt-number">#${index + 1}</span>
                    <span class="locked-prompt-text">${lockedPrompt.displayText}</span>
                  </div>
                  <button class="btn-icon remove-prompt-btn" data-index="${index}" title="Remove">
                    ✕
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  isCurrentMadLibComplete() {
    const currentTemplate = MAD_LIBS_TEMPLATES[this.currentMadLibTemplateIndex];
    return currentTemplate.fields.every(field => {
      return this.currentMadLibSelections[field.id] && this.currentMadLibSelections[field.id].trim() !== '';
    });
  }

  getCurrentMadLibDisplayText() {
    const currentTemplate = MAD_LIBS_TEMPLATES[this.currentMadLibTemplateIndex];
    let displayText = currentTemplate.template;
    
    currentTemplate.fields.forEach(field => {
      const value = this.currentMadLibSelections[field.id] || '';
      const option = field.options.find(opt => opt.value === value);
      const label = option ? option.label : `{${field.id}}`;
      displayText = displayText.replace(`{${field.id}}`, label);
    });
    
    return displayText;
  }

  shuffleMadLibTemplate() {
    // Cycle to next template
    this.currentMadLibTemplateIndex = (this.currentMadLibTemplateIndex + 1) % MAD_LIBS_TEMPLATES.length;
    // Clear current selections when switching templates
    this.currentMadLibSelections = {};
  }

  confirmMadLibSelection() {
    if (!this.isCurrentMadLibComplete()) return;

    const displayText = this.getCurrentMadLibDisplayText();
    const template = MAD_LIBS_TEMPLATES[this.currentMadLibTemplateIndex];
    
    // Store the locked-in prompt with all its data
    this.surveyData.madLibs.push({
      templateId: template.id,
      displayText: displayText,
      selections: { ...this.currentMadLibSelections },
      template: template.template,
    });

    // Clear selections and move to next template
    this.currentMadLibSelections = {};
    this.shuffleMadLibTemplate();
    
    // Re-render to show the new locked prompt
    this.switchTab('madlibs');
  }

  removeLockedPrompt(index) {
    this.surveyData.madLibs.splice(index, 1);
    this.switchTab('madlibs');
  }

  renderDetails() {
    return `
      <div class="survey-details">
        <div class="input-group">
          <label>Hobbies (comma-separated)</label>
          <input type="text" id="hobbies-input" 
                 placeholder="e.g., basketball, music, cooking" 
                 value="${this.surveyData.hobbies.join(', ')}">
        </div>

        <div class="input-group">
          <label>Favorite Shows/Movies</label>
          <input type="text" id="shows-input" 
                 placeholder="e.g., The Office, Star Wars" 
                 value="${this.surveyData.favoriteShows.join(', ')}">
        </div>

        <div class="input-group">
          <label>Favorite Music Genres</label>
          <input type="text" id="music-input" 
                 placeholder="e.g., rock, jazz, hip-hop" 
                 value="${this.surveyData.favoriteMusic.join(', ')}">
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Style battles
    document.querySelectorAll('.battle-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choice = e.target.closest('.battle-option').dataset.choice;
        const battle = STYLE_BATTLES[this.currentBattleIndex];
        this.surveyData.styleBattles[battle.id] = choice;
        this.currentBattleIndex++;
        this.switchTab('battles');
      });
    });

    // Mood sliders
    ['chaos', 'energy', 'humor'].forEach(sliderId => {
      const slider = document.getElementById(`${sliderId}-slider`);
      const valueDisplay = document.getElementById(`${sliderId}-value`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          this.surveyData.moodSliders[sliderId] = value;
          if (valueDisplay) {
            valueDisplay.textContent = `${Math.round(value * 100)}%`;
          }
        });
      }
    });

    // Mystery boxes
    document.querySelectorAll('.mystery-box-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const boxId = e.target.closest('.mystery-box-card').dataset.box;
        // Toggle selection - if clicking the same box, deselect it
        if (this.surveyData.mysteryBox === boxId) {
          this.surveyData.mysteryBox = null;
        } else {
          this.surveyData.mysteryBox = boxId;
        }
        this.switchTab('mystery');
      });
    });

    // Clear mystery box button
    const clearMysteryBtn = document.getElementById('clear-mystery');
    if (clearMysteryBtn) {
      clearMysteryBtn.addEventListener('click', () => {
        this.surveyData.mysteryBox = null;
        this.switchTab('mystery');
      });
    }

    // Mad Libs - Dynamic field listeners
    const currentTemplate = MAD_LIBS_TEMPLATES[this.currentMadLibTemplateIndex];
    if (currentTemplate) {
      currentTemplate.fields.forEach(field => {
        const select = document.getElementById(`madlib-${field.id}`);
        if (select) {
          select.addEventListener('change', (e) => {
            this.currentMadLibSelections[field.id] = e.target.value;
            // Re-render to update preview
            this.switchTab('madlibs');
          });
        }
      });
    }

    // Shuffle/Next button
    const shuffleBtn = document.getElementById('shuffle-madlib-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        this.shuffleMadLibTemplate();
        this.switchTab('madlibs');
      });
    }

    // Confirm selection button
    const confirmBtn = document.getElementById('confirm-madlib-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmMadLibSelection();
      });
    }

    // Remove locked prompt buttons
    document.querySelectorAll('.remove-prompt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.remove-prompt-btn').dataset.index);
        this.removeLockedPrompt(index);
      });
    });

    // Details inputs
    ['hobbies', 'shows', 'music'].forEach(field => {
      const input = document.getElementById(`${field}-input`);
      if (input) {
        input.addEventListener('change', (e) => {
          const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
          this.surveyData[field === 'shows' ? 'favoriteShows' : field === 'music' ? 'favoriteMusic' : 'hobbies'] = values;
        });
      }
    });

    // Continue button
    document.getElementById('continue-btn').addEventListener('click', () => {
      this.onComplete(this.surveyData);
    });

    // Skip button
    document.getElementById('skip-btn').addEventListener('click', () => {
      this.onComplete(this.surveyData);
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    const content = document.getElementById('tab-content');
    switch (tabName) {
      case 'battles':
        content.innerHTML = this.renderStyleBattles();
        this.setupEventListeners();
        break;
      case 'sliders':
        content.innerHTML = this.renderMoodSliders();
        this.setupEventListeners();
        break;
      case 'mystery':
        content.innerHTML = this.renderMysteryBox();
        this.setupEventListeners();
        break;
      case 'madlibs':
        content.innerHTML = this.renderMadLibs();
        this.setupEventListeners();
        break;
      case 'details':
        content.innerHTML = this.renderDetails();
        this.setupEventListeners();
        break;
    }
  }
}
