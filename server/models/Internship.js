const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: ''
  },
  stipend: {
    type: String,
    default: ''
  },
  experienceRequired: {
    type: String,
    default: 'Fresher'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);