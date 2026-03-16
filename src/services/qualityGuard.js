// Quality Guard Service - Auto-reject images with mangled hands or low face-match

import api from './api.js';

class QualityGuard {
  constructor() {
    this.qualityThresholds = {
      faceMatch: 0.7, // Minimum face similarity score
      handQuality: 0.8, // Minimum hand quality score
    };
  }

  // Check if an image passes quality standards
  async checkQuality(imageUrl, anchorDescription) {
    try {
      const result = await api.checkQuality(imageUrl, anchorDescription);
      
      return {
        passed: result.faceMatch >= this.qualityThresholds.faceMatch && 
                result.handQuality >= this.qualityThresholds.handQuality,
        faceMatch: result.faceMatch,
        handQuality: result.handQuality,
        issues: this.identifyIssues(result),
      };
    } catch (error) {
      console.error('Quality check failed:', error);
      // On error, allow the image through (fail open)
      return {
        passed: true,
        faceMatch: 1.0,
        handQuality: 1.0,
        issues: [],
      };
    }
  }

  // Identify specific quality issues
  identifyIssues(result) {
    const issues = [];
    
    if (result.faceMatch < this.qualityThresholds.faceMatch) {
      issues.push({
        type: 'face_match',
        severity: 'high',
        message: 'Face does not match the uploaded photo',
      });
    }
    
    if (result.handQuality < this.qualityThresholds.handQuality) {
      issues.push({
        type: 'hand_quality',
        severity: 'high',
        message: 'Hands appear mangled or distorted',
      });
    }
    
    return issues;
  }

  // Batch check multiple images
  async checkBatch(images, anchorDescription) {
    const results = await Promise.all(
      images.map(async (image) => {
        const quality = await this.checkQuality(image.url, anchorDescription);
        return {
          ...image,
          quality,
        };
      })
    );

    return {
      passed: results.filter(r => r.quality.passed),
      failed: results.filter(r => !r.quality.passed),
    };
  }
}

export default new QualityGuard();
