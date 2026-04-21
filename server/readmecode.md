server/
├── config/
│   ├── cloudinary.js
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Application.js
│   ├── Internship.js
│   └── User.js
├── node_modules/
├── routes/
│   ├── applications.js
│   ├── auth.js
│   └── internships.js
├── utils/
│   └── aiMatcher.js
├── .env
├── package-lock.json
├── package.json
├── server.js
└── README.md


cloudinary.js


db.js


auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Middleware to check if user is employer
const isEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ error: 'Access denied. Employer role required.' });
  }
  next();
};

// Middleware to check if user is student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student role required.' });
  }
  next();
};

module.exports = { auth, isEmployer, isStudent };

Application.js
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
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

Internship.js
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

User.js
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

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

applications.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { auth, isStudent, isEmployer } = require('../middleware/auth');
const { analyzeMatch, generateCoverLetter } = require('../utils/aiMatcher');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload resume
router.post('/upload-resume', auth, isStudent, upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload started...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📄 Parsing PDF...');
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    console.log('📄 Extracted text length:', resumeText.length);

    await User.findByIdAndUpdate(req.userId, {
      resumeText,
      resumeUrl: `resume_${req.userId}.pdf`
    });

    console.log('✅ Resume uploaded successfully');

    res.json({
      message: 'Resume uploaded successfully',
      resumeText: resumeText.substring(0, 500) + '...'
    });

  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume: ' + error.message });
  }
});

// Apply to internship
router.post('/apply/:internshipId', auth, isStudent, async (req, res) => {
  try {
    const internshipId = req.params.internshipId;
    const { coverLetter } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const existingApplication = await Application.findOne({
      internship: internshipId,
      applicant: req.userId
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this internship' });
    }

    const user = await User.findById(req.userId);
    if (!user.resumeText) {
      return res.status(400).json({ error: 'Please upload your resume first' });
    }

    console.log('🤖 Analyzing match with AI...');
    const { matchScore, aiAnalysis } = await analyzeMatch(user.resumeText, internship);

    const application = new Application({
      internship: internshipId,
      applicant: req.userId,
      matchScore,
      aiAnalysis,
      coverLetter: coverLetter || ''
    });

    await application.save();

    internship.applicationCount += 1;
    await internship.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        matchScore,
        aiAnalysis
      }
    });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Predict match score
router.get('/predict-match/:internshipId', auth, isStudent, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const user = await User.findById(req.userId);
    if (!user.resumeText) {
      return res.status(400).json({ error: 'Please upload your resume first' });
    }

    const { matchScore, aiAnalysis } = await analyzeMatch(user.resumeText, internship);

    res.json({
      matchScore,
      aiAnalysis,
      internship: {
        title: internship.title,
        company: internship.company
      }
    });

  } catch (error) {
    console.error('Match prediction error:', error);
    res.status(500).json({ error: 'Failed to predict match' });
  }
});

// Get student's applications
router.get('/my-applications', auth, isStudent, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.userId })
      .populate('internship')
      .sort({ createdAt: -1 });
    
    res.json({ applications });
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications for internship (Employer)
router.get('/internship/:internshipId', auth, isEmployer, async (req, res) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.internshipId,
      postedBy: req.userId
    });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or unauthorized' });
    }

    const applications = await Application.find({ internship: req.params.internshipId })
      .populate('applicant', 'name email resumeUrl')
      .sort({ matchScore: -1 });

    res.json({ applications });

  } catch (error) {
    console.error('Fetch internship applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (Employer)
router.put('/:applicationId/status', auth, isEmployer, async (req, res) => {
  try {
    const { status, rejectionFeedback } = req.body;
    
    const application = await Application.findById(req.params.applicationId)
      .populate('internship');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const internship = await Internship.findOne({
      _id: application.internship._id,
      postedBy: req.userId
    });

    if (!internship) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    application.status = status;
    if (status === 'rejected' && rejectionFeedback) {
      application.rejectionFeedback = rejectionFeedback;
    }

    await application.save();

    res.json({
      message: 'Application status updated',
      application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;

auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      companyName: role === 'employer' ? companyName : undefined
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        resumeUrl: user.resumeUrl
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;

internships.js
const express = require('express');
const Internship = require('../models/Internship');
const { auth, isEmployer } = require('../middleware/auth');

const router = express.Router();

// Get all active internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true })
      .populate('postedBy', 'name companyName')
      .sort({ createdAt: -1 });
    
    res.json({ internships });
  } catch (error) {
    console.error('Fetch internships error:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

// Get single internship by ID
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('postedBy', 'name companyName email');
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    res.json({ internship });
  } catch (error) {
    console.error('Fetch internship error:', error);
    res.status(500).json({ error: 'Failed to fetch internship' });
  }
});

// Create new internship (Employer only)
router.post('/', auth, isEmployer, async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      location,
      duration,
      stipend,
      experienceRequired
    } = req.body;

    const internship = new Internship({
      title,
      company: req.user.companyName,
      description,
      requiredSkills,
      location,
      duration,
      stipend,
      experienceRequired,
      postedBy: req.userId
    });

    await internship.save();

    res.status(201).json({
      message: 'Internship posted successfully',
      internship
    });

  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ error: 'Failed to create internship' });
  }
});

// Get internships posted by logged-in employer
router.get('/my/postings', auth, isEmployer, async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({ internships });
  } catch (error) {
    console.error('Fetch my internships error:', error);
    res.status(500).json({ error: 'Failed to fetch your internships' });
  }
});

module.exports = router;

aiMatcher.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMatch(resumeText, internship) {
  try {
    console.log('AI Analysis: Starting match prediction...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert AI recruiter analyzing candidate-job fit.

RESUME:
${resumeText}

JOB POSTING:
Title: ${internship.title}
Company: ${internship.company}
Description: ${internship.description}
Required Skills: ${internship.requiredSkills.join(', ')}
Experience Required: ${internship.experienceRequired}
Location: ${internship.location}

TASK: Analyze this candidate's resume against the job requirements and provide a JSON response with:

1. matchScore (0-100): Overall compatibility percentage
2. matchedSkills: Array of skills the candidate has that match requirements
3. missingSkills: Array of required skills the candidate lacks
4. reasoning: 2-3 sentence explanation of the match score
5. recommendations: Specific advice for the candidate to improve their fit

IMPORTANT: 
- Be strict but fair in scoring
- Consider related skills (e.g., React.js experience is relevant for Frontend roles)
- Account for education and projects, not just work experience
- Focus on technical alignment

Respond ONLY with valid JSON, no markdown or extra text:`;

    console.log('AI Analysis: Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('AI Analysis: Received response from Gemini');

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(jsonText);
    console.log('AI Analysis: Successfully parsed response');

    return {
      matchScore: analysis.matchScore || 0,
      aiAnalysis: {
        reasoning: analysis.reasoning || '',
        missingSkills: analysis.missingSkills || [],
        matchedSkills: analysis.matchedSkills || [],
        recommendations: analysis.recommendations || ''
      }
    };

  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    
    const resumeLower = resumeText.toLowerCase();
    const requiredSkills = internship.requiredSkills.map(s => s.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => 
      resumeLower.includes(skill)
    );
    
    const matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    const missingSkills = requiredSkills.filter(skill => !resumeLower.includes(skill));

    console.log('AI Analysis: Using fallback keyword matching');

    return {
      matchScore,
      aiAnalysis: {
        reasoning: `Basic keyword match: ${matchedSkills.length} out of ${requiredSkills.length} required skills found.`,
        missingSkills,
        matchedSkills,
        recommendations: 'Add projects demonstrating missing skills to improve your match.'
      }
    };
  }
}

async function generateCoverLetter(resumeText, internship) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Write a professional, concise cover letter (150-200 words) for this application.

CANDIDATE'S RESUME:
${resumeText}

JOB POSTING:
Title: ${internship.title}
Company: ${internship.company}
Description: ${internship.description}

Requirements:
- Professional tone
- Highlight relevant skills and experiences from the resume
- Show genuine interest in the role
- Keep it concise and impactful
- Do NOT use placeholder text like [Your Name] - write in first person

Write the cover letter:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Cover Letter Generation Error:', error);
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${internship.title} position at ${internship.company}. Based on my background and skills, I believe I would be a great fit for this role.

I am excited about the opportunity to contribute to your team and grow my skills in this area.

Thank you for considering my application.

Best regards`;
  }
}

module.exports = { analyzeMatch, generateCoverLetter };

.env
MONGODB_URI=mongodb+srv://admin:admin123@cluster0.iklmfzo.mongodb.net/?appName=Cluster0
JWT_SECRET=my_super_secret_jwt_key_12345
GEMINI_API_KEY=AIzaSyA_baktnfk3vk9Ff0WdgLZrXFlUn4MwL6Y
PORT=5000

package.json
{
  "name": "skillsync-server",
  "version": "1.0.0",
  "description": "SkillSync AI Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^3.1.11"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.1.5",
    "multer": "^2.0.2",
    "pdf-parse": "^1.1.1"
  }
}


server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/applications', require('./routes/applications'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SkillSync AI API is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

  ___________________________________________________________________________________________