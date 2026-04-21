const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'employer', 'admin'],
    default: 'student'
  },
  resumeText: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  resumeFileName: {
    type: String,
    default: ''
  },
  resumeUploadedAt: {
    type: Date
  },
  avatar: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  education: {
    type: String,
    default: ''
  },
  companyName: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving - WORKING VERSION
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);