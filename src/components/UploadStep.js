// Step 1: Image Upload Component

import { createImagePreview, validateImageFile } from '../utils/helpers.js';

export class UploadStep {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.uploadedImages = [];
  }

  render() {
    return `
      <div class="step-container upload-step">
        <h2>Upload Your Friend's Photos</h2>
        <p class="step-description">
          Upload 1-2 full body photos (preferably green screened/cropped) of the person you want to feature in the deck.
        </p>
        
        <div class="upload-area" id="upload-area">
          <div class="upload-dropzone" id="dropzone">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>Drag and drop images here</p>
            <p class="upload-hint">or click to browse</p>
            <input type="file" id="file-input" accept="image/*" multiple style="display: none;">
          </div>
        </div>

        <div class="uploaded-images" id="uploaded-images"></div>

        <div class="step-actions">
          <button class="btn btn-primary" id="continue-btn" disabled>
            Continue to Survey
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
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const continueBtn = document.getElementById('continue-btn');
    const uploadedImagesContainer = document.getElementById('uploaded-images');

    // Click to upload
    dropzone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      this.handleFiles(files);
    });

    // Continue button
    continueBtn.addEventListener('click', () => {
      if (this.uploadedImages.length > 0) {
        this.onComplete({
          images: this.uploadedImages,
        });
      }
    });
  }

  async handleFiles(files) {
    for (const file of files.slice(0, 2)) { // Max 2 images
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const preview = await createImagePreview(file);
        this.uploadedImages.push({
          file,
          preview,
          name: file.name,
        });

        this.renderUploadedImages();
        this.updateContinueButton();
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing image. Please try again.');
      }
    }
  }

  renderUploadedImages() {
    const container = document.getElementById('uploaded-images');
    if (this.uploadedImages.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <h3>Uploaded Images (${this.uploadedImages.length}/2)</h3>
      <div class="image-grid">
        ${this.uploadedImages.map((img, index) => `
          <div class="uploaded-image-card">
            <img src="${img.preview}" alt="${img.name}">
            <button class="remove-image" data-index="${index}">×</button>
          </div>
        `).join('')}
      </div>
    `;

    // Remove button handlers
    container.querySelectorAll('.remove-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.uploadedImages.splice(index, 1);
        this.renderUploadedImages();
        this.updateContinueButton();
      });
    });
  }

  updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.disabled = this.uploadedImages.length === 0;
  }
}
