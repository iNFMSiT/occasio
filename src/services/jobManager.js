// Async Job Management Service
// Handles job creation, status tracking, and progress updates

import { generateJobId } from '../utils/helpers.js';
import api from './api.js';

class JobManager {
  constructor() {
    this.activeJobs = new Map();
    this.statusCallbacks = new Map();
  }

  // Create a new job
  async createJob(jobData) {
    const jobId = generateJobId();
    
    const job = {
      id: jobId,
      status: 'queued',
      progress: 0,
      totalCards: 52,
      completedCards: 0,
      failedCards: 0,
      cards: [],
      createdAt: new Date().toISOString(),
      ...jobData,
    };

    this.activeJobs.set(jobId, job);

    // Start the job on the backend
    try {
      await api.createJob({
        jobId,
        ...jobData,
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      job.status = 'failed';
      throw error;
    }

    return job;
  }

  // Poll job status
  async pollJobStatus(jobId, onUpdate) {
    if (this.statusCallbacks.has(jobId)) {
      // Already polling
      return;
    }

    const poll = async () => {
      try {
        const status = await api.getJobStatus(jobId);
        const job = this.activeJobs.get(jobId);
        
        if (job) {
          job.status = status.status;
          job.progress = status.progress || 0;
          job.completedCards = status.completedCards || 0;
          job.failedCards = status.failedCards || 0;
          job.cards = status.cards || [];
          
          if (onUpdate) {
            onUpdate(job);
          }
        }

        // Continue polling if not complete
        if (status.status === 'processing' || status.status === 'queued') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          this.statusCallbacks.delete(jobId);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        setTimeout(poll, 5000); // Retry after 5 seconds on error
      }
    };

    this.statusCallbacks.set(jobId, poll);
    poll();
  }

  // Get job by ID
  getJob(jobId) {
    return this.activeJobs.get(jobId);
  }

  // Get all active jobs
  getAllJobs() {
    return Array.from(this.activeJobs.values());
  }

  // Cancel a job
  async cancelJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      this.statusCallbacks.delete(jobId);
    }
  }
}

export default new JobManager();
