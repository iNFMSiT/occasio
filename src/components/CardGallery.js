// Card Gallery Component - View and manage generated cards

export class CardGallery {
  constructor(cards, onRegenerate, onDownload, onOrder) {
    this.cards = cards;
    this.onRegenerate = onRegenerate;
    this.onDownload = onDownload;
    this.onOrder = onOrder;
    this.selectedCards = new Set();
  }

  render() {
    return `
      <div class="step-container card-gallery">
        <div class="gallery-header">
          <h2>Your Custom Deck</h2>
          <div class="gallery-actions">
            <button class="btn btn-secondary" id="select-all-btn">Select All</button>
            <button class="btn btn-secondary" id="download-selected-btn" ${this.selectedCards.size === 0 ? 'disabled' : ''}>
              Download Selected (${this.selectedCards.size})
            </button>
            <button class="btn btn-primary" id="download-all-btn">Download All as ZIP</button>
            <button class="btn btn-primary" id="order-btn">Order Physical Deck</button>
          </div>
        </div>

        <div class="cards-grid" id="cards-grid">
          ${this.cards.map((card, index) => `
            <div class="card-item ${this.selectedCards.has(index) ? 'selected' : ''}" data-index="${index}">
              <div class="card-checkbox">
                <input type="checkbox" ${this.selectedCards.has(index) ? 'checked' : ''} 
                       data-index="${index}">
              </div>
              <div class="card-image">
                <img src="${card.imageUrl}" alt="Card ${index + 1}" loading="lazy">
                <div class="card-overlay">
                  <button class="btn-icon regenerate-btn" data-index="${index}" title="Regenerate">
                    🔄
                  </button>
                </div>
              </div>
              <div class="card-info">
                <p class="card-number">Card ${index + 1}</p>
                <p class="card-style">${card.style}</p>
                <p class="card-theme">${card.theme}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Card selection
    document.querySelectorAll('.card-item input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.checked) {
          this.selectedCards.add(index);
        } else {
          this.selectedCards.delete(index);
        }
        this.updateSelectionUI();
      });
    });

    // Select all
    document.getElementById('select-all-btn').addEventListener('click', () => {
      if (this.selectedCards.size === this.cards.length) {
        this.selectedCards.clear();
      } else {
        this.cards.forEach((_, index) => this.selectedCards.add(index));
      }
      this.updateSelectionUI();
    });

    // Regenerate buttons
    document.querySelectorAll('.regenerate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.regenerate-btn').dataset.index);
        if (this.onRegenerate) {
          this.onRegenerate(index);
        }
      });
    });

    // Download selected
    document.getElementById('download-selected-btn').addEventListener('click', () => {
      const selected = Array.from(this.selectedCards).map(i => this.cards[i]);
      if (this.onDownload) {
        this.onDownload(selected, false);
      }
    });

    // Download all
    document.getElementById('download-all-btn').addEventListener('click', () => {
      if (this.onDownload) {
        this.onDownload(this.cards, true);
      }
    });

    // Order
    document.getElementById('order-btn').addEventListener('click', () => {
      if (this.onOrder) {
        this.onOrder(this.cards);
      }
    });
  }

  updateSelectionUI() {
    // Update checkboxes
    document.querySelectorAll('.card-item input[type="checkbox"]').forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index);
      checkbox.checked = this.selectedCards.has(index);
    });

    // Update card items
    document.querySelectorAll('.card-item').forEach(item => {
      const index = parseInt(item.dataset.index);
      item.classList.toggle('selected', this.selectedCards.has(index));
    });

    // Update download button
    const downloadBtn = document.getElementById('download-selected-btn');
    downloadBtn.disabled = this.selectedCards.size === 0;
    downloadBtn.textContent = `Download Selected (${this.selectedCards.size})`;

    // Update select all button
    const selectAllBtn = document.getElementById('select-all-btn');
    selectAllBtn.textContent = this.selectedCards.size === this.cards.length 
      ? 'Deselect All' 
      : 'Select All';
  }
}
