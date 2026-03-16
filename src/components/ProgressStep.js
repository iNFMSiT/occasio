// Step 13: Async Job Management - Progress Tracking

import jobManager from '../services/jobManager.js';

export class ProgressStep {
  constructor(jobId, onComplete) {
    this.jobId = jobId;
    this.onComplete = onComplete;
    this.job = null;
  }

  render() {
    if (!this.job) {
      return '<div class="step-container"><p>Loading job status...</p></div>';
    }

    const progress = (this.job.completedCards / this.job.totalCards) * 100;
    const estimatedTime = this.estimateTimeRemaining();

    return `
      <div class="step-container progress-step">
        <h2>Shuffling Your Deck!</h2>
        <p class="step-description">
          We're generating your 52 custom cards. This may take a few minutes. 
          You can close this window and we'll notify you when it's ready.
        </p>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-stats">
            <span>${this.job.completedCards} / ${this.job.totalCards} cards</span>
            <span class="status-badge ${this.job.status}">${this.job.status}</span>
          </div>
          ${estimatedTime ? `<p class="estimated-time">Estimated time remaining: ${estimatedTime}</p>` : ''}
        </div>

        ${this.job.status === 'completed' ? `
          <div class="completion-message">
            <h3>🎉 Your deck is ready!</h3>
            <button class="btn btn-primary" id="view-deck-btn">View Your Deck</button>
          </div>
        ` : ''}

        ${this.job.status === 'failed' ? `
          <div class="error-message">
            <p>Something went wrong. Please try again.</p>
            <button class="btn btn-secondary" id="retry-btn">Retry</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.setupEventListeners();
    this.startPolling();
  }

  setupEventListeners() {
    const viewDeckBtn = document.getElementById('view-deck-btn');
    const retryBtn = document.getElementById('retry-btn');

    if (viewDeckBtn) {
      viewDeckBtn.addEventListener('click', () => {
        this.onComplete(this.job);
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // TODO: Implement retry logic
        alert('Retry functionality coming soon');
      });
    }
  }

  startPolling() {
    jobManager.pollJobStatus(this.jobId, (updatedJob) => {
      this.job = updatedJob;
      this.updateUI();
      
      if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
        // Stop polling
      }
    });
  }

  updateUI() {
    const container = document.getElementById('app');
    this.mount(container);
  }

  estimateTimeRemaining() {
    if (!this.job || this.job.completedCards === 0) {
      return null;
    }

    const elapsed = (Date.now() - new Date(this.job.createdAt).getTime()) / 1000;
    const rate = this.job.completedCards / elapsed; // cards per second
    const remaining = (this.job.totalCards - this.job.completedCards) / rate;
    
    return this.formatTime(remaining);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
