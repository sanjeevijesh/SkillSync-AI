const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiAnalysis: {
    reasoning: {
      type: String,
      default: ''
    },
    missingSkills: [{
      type: String
    }],
    matchedSkills: [{
      type: String
    }],
    recommendations: {
      type: String,
      default: ''
    }
  },
  coverLetter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  rejectionFeedback: {
    type: String,
    default: ''
  },
  statusUpdatedAt: {
    type: Date
  },
  interviewQuestions: [{
    question: String,
    type: String,
    tip: String
  }]
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);