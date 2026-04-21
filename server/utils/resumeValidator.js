const pdfParse = require('pdf-parse');

/**
 * Validates uploaded resume files
 * Checks for:
 * - File size
 * - File type
 * - Content quality
 * - Suspicious patterns
 */

class ResumeValidator {
  constructor() {
    this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    this.MIN_WORD_COUNT = 50;
    this.MAX_WORD_COUNT = 5000;
    this.SUSPICIOUS_PATTERNS = [
      /(.)\1{20,}/gi, // Repeated characters
      /^[^a-zA-Z0-9\s]{100,}/, // Excessive special characters
      /(lorem ipsum|sample text|placeholder)/gi
    ];
  }

  /**
   * Validate file metadata
   */
  validateMetadata(file) {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file uploaded');
      return { valid: false, errors };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    if (file.size < 1024) {
      errors.push('File is too small to be a valid resume');
    }

    // Check MIME type
    if (file.mimetype !== 'application/pdf') {
      errors.push('Only PDF files are allowed');
    }

    // Check file extension
    if (!file.originalname?.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have .pdf extension');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate PDF content
   */
  async validateContent(buffer) {
    const errors = [];
    const warnings = [];

    try {
      // Parse PDF
      const data = await pdfParse(buffer);
      const text = data.text.trim();

      // Check if PDF is readable
      if (!text || text.length === 0) {
        errors.push('PDF appears to be empty or unreadable');
        return { valid: false, errors, warnings, text: '' };
      }

      // Count words
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

      if (wordCount < this.MIN_WORD_COUNT) {
        errors.push(`Resume is too short (${wordCount} words). Minimum ${this.MIN_WORD_COUNT} words required`);
      }

      if (wordCount > this.MAX_WORD_COUNT) {
        warnings.push(`Resume is very long (${wordCount} words). Consider keeping it concise`);
      }

      // Check for suspicious patterns
      for (const pattern of this.SUSPICIOUS_PATTERNS) {
        if (pattern.test(text)) {
          warnings.push('Resume contains suspicious patterns or placeholder text');
          break;
        }
      }

      // Check for essential resume sections
      const hasSectionIndicators = this.checkEssentialSections(text);
      if (!hasSectionIndicators) {
        warnings.push('Resume may be missing standard sections (Education, Experience, Skills)');
      }

      // Check for contact information
      const hasContactInfo = this.checkContactInfo(text);
      if (!hasContactInfo) {
        warnings.push('Resume may be missing contact information');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        text,
        metadata: {
          wordCount,
          pageCount: data.numpages,
          hasContactInfo,
          hasSections: hasSectionIndicators
        }
      };

    } catch (error) {
      errors.push('Failed to parse PDF: ' + error.message);
      return { valid: false, errors, warnings, text: '' };
    }
  }

  /**
   * Check for essential resume sections
   */
  checkEssentialSections(text) {
    const lowerText = text.toLowerCase();
    const sectionKeywords = [
      ['education', 'academic', 'degree', 'university', 'college'],
      ['experience', 'work', 'employment', 'intern', 'project'],
      ['skill', 'technical', 'proficiency', 'competenc']
    ];

    let sectionsFound = 0;
    for (const keywords of sectionKeywords) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        sectionsFound++;
      }
    }

    return sectionsFound >= 2; // At least 2 out of 3 sections
  }

  /**
   * Check for contact information
   */
  checkContactInfo(text) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    return emailPattern.test(text) || phonePattern.test(text);
  }

  /**
   * Detect duplicate resumes
   */
  async checkDuplicate(text, userId, existingResumes) {
    // Simple hash-based duplicate detection
    const hash = this.simpleHash(text);
    
    const duplicate = existingResumes.find(resume => 
      resume.userId !== userId && resume.hash === hash
    );

    return {
      isDuplicate: !!duplicate,
      duplicateUser: duplicate?.userId
    };
  }

  /**
   * Simple hash function for text
   */
  simpleHash(text) {
    let hash = 0;
    const normalized = text.toLowerCase().replace(/\s+/g, '');
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Analyze resume quality
   */
  analyzeQuality(text, metadata) {
    const score = { total: 0, breakdown: {} };

    // Length score (0-25 points)
    if (metadata.wordCount >= 200 && metadata.wordCount <= 1000) {
      score.breakdown.length = 25;
    } else if (metadata.wordCount >= 100 && metadata.wordCount <= 1500) {
      score.breakdown.length = 15;
    } else {
      score.breakdown.length = 5;
    }

    // Structure score (0-25 points)
    score.breakdown.structure = 0;
    if (metadata.hasSections) score.breakdown.structure += 15;
    if (metadata.hasContactInfo) score.breakdown.structure += 10;

    // Content diversity score (0-25 points)
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const diversity = uniqueWords / metadata.wordCount;
    score.breakdown.diversity = Math.min(25, Math.round(diversity * 50));

    // Formatting score (0-25 points)
    const hasProperCapitalization = /[A-Z][a-z]+/.test(text);
    const hasBulletPoints = /[•\-*]/.test(text);
    score.breakdown.formatting = 0;
    if (hasProperCapitalization) score.breakdown.formatting += 15;
    if (hasBulletPoints) score.breakdown.formatting += 10;

    score.total = Object.values(score.breakdown).reduce((a, b) => a + b, 0);

    return {
      score: score.total,
      breakdown: score.breakdown,
      grade: this.getGrade(score.total)
    };
  }

  /**
   * Get letter grade from score
   */
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

module.exports = new ResumeValidator();