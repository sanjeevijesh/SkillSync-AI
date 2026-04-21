const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { auth, isStudent, isEmployer } = require('../middleware/auth');
const { analyzeMatch, generateCoverLetter } = require('../utils/aiMatcher');
const resumeValidator = require('../utils/resumeValidator');
const { analyzeResumeQuality, getSkillGapAnalysis } = require('../utils/resumeAnalyzer');

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

// Upload resume with enhanced validation and analysis
router.post('/upload-resume', auth, isStudent, upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload started...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file metadata
    const metadataValidation = resumeValidator.validateMetadata(req.file);
    if (!metadataValidation.valid) {
      return res.status(400).json({ 
        error: 'File validation failed',
        details: metadataValidation.errors
      });
    }

    // Validate PDF content
    console.log('📄 Validating PDF content...');
    const contentValidation = await resumeValidator.validateContent(req.file.buffer);
    
    if (!contentValidation.valid) {
      return res.status(400).json({ 
        error: 'Resume content validation failed',
        details: contentValidation.errors
      });
    }

    const resumeText = contentValidation.text;

    // Check for duplicate resumes
    const resumeHash = resumeValidator.simpleHash(resumeText);
    const existingResume = await User.findOne({
      resumeHash,
      _id: { $ne: req.userId }
    });

    if (existingResume) {
      console.warn('⚠️ Potential duplicate resume detected');
    }

    // Analyze resume quality
    const qualityAnalysis = resumeValidator.analyzeQuality(
      resumeText, 
      contentValidation.metadata
    );

    console.log('📊 Resume Quality Score:', qualityAnalysis.score);

    // Get AI-powered recommendations
    console.log('🤖 Getting AI recommendations...');
    const aiRecommendations = await analyzeResumeQuality(resumeText);

    // Update user with resume data
    await User.findByIdAndUpdate(req.userId, {
      resumeText,
      resumeUrl: `resume_${req.userId}.pdf`,
      resumeFileName: req.file.originalname || 'resume.pdf',
      resumeUploadedAt: new Date(),
      resumeHash
    });

    console.log('✅ Resume uploaded and analyzed successfully');

    res.json({
      message: 'Resume uploaded successfully',
      resumePreview: resumeText.substring(0, 500) + '...',
      quality: qualityAnalysis,
      warnings: contentValidation.warnings,
      metadata: contentValidation.metadata,
      recommendations: aiRecommendations.analysis,
      aiAnalysisAvailable: aiRecommendations.success
    });

  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume: ' + error.message });
  }
});

// Get resume recommendations (separate endpoint)
router.get('/resume-recommendations', auth, isStudent, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.resumeText) {
      return res.status(400).json({ error: 'No resume uploaded yet' });
    }

    console.log('📊 Analyzing resume for recommendations...');
    const recommendations = await analyzeResumeQuality(user.resumeText);

    res.json({
      success: true,
      recommendations: recommendations.analysis,
      aiAnalysisAvailable: recommendations.success
    });

  } catch (error) {
    console.error('Resume recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get skill gap analysis for specific role
router.post('/skill-gap-analysis', auth, isStudent, async (req, res) => {
  try {
    const { targetRole } = req.body;
    
    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const user = await User.findById(req.userId);
    
    if (!user || !user.resumeText) {
      return res.status(400).json({ error: 'No resume uploaded yet. Please upload your resume first.' });
    }

    console.log('🎯 Analyzing skill gaps for:', targetRole);
    console.log('📄 Resume text length:', user.resumeText.length);

    let skillGapAnalysis;
    try {
      skillGapAnalysis = await getSkillGapAnalysis(user.resumeText, targetRole);
    } catch (aiError) {
      console.error('❌ getSkillGapAnalysis threw:', aiError.message);
      return res.status(500).json({ error: 'AI call failed: ' + aiError.message });
    }

    console.log('📊 Analysis result:', JSON.stringify(skillGapAnalysis).substring(0, 200));

    if (!skillGapAnalysis || skillGapAnalysis._error) {
      console.error('❌ Skill gap returned error:', skillGapAnalysis?._errorMessage);
      return res.status(500).json({ 
        error: 'AI analysis failed: ' + (skillGapAnalysis?._errorMessage || 'Unknown error'),
      });
    }

    res.json({
      success: true,
      targetRole,
      analysis: skillGapAnalysis
    });

  } catch (error) {
    console.error('❌ Skill gap route error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to analyze skill gaps: ' + error.message });
  }
});

// Generate cover letter for an internship
router.post('/generate-cover-letter/:internshipId', auth, isStudent, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const user = await User.findById(req.userId);
    if (!user.resumeText) {
      return res.status(400).json({ error: 'Please upload your resume first' });
    }

    console.log('✉️ Generating cover letter...');
    const coverLetter = await generateCoverLetter(user.resumeText, internship);

    res.json({
      success: true,
      coverLetter,
      internship: { title: internship.title, company: internship.company }
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

// Live match preview — free-form job description (no internship ID needed)
router.post('/live-preview', auth, isStudent, async (req, res) => {
  try {
    const { jobTitle, company, description, requiredSkills } = req.body;

    if (!description || description.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a job description (at least 50 characters)' });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.resumeText) {
      return res.status(400).json({ error: 'Please upload your resume first' });
    }

    // Build a synthetic internship object matching what analyzeMatch expects
    const syntheticInternship = {
      title: jobTitle || 'Target Role',
      company: company || 'Company',
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) 
        ? requiredSkills 
        : (requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      experienceRequired: 'Fresher',
      location: 'Any'
    };

    console.log('🔍 Live preview match analysis...');
    const { matchScore, aiAnalysis } = await analyzeMatch(user.resumeText, syntheticInternship);

    res.json({
      success: true,
      matchScore,
      aiAnalysis,
      jobTitle: syntheticInternship.title,
      company: syntheticInternship.company
    });

  } catch (error) {
    console.error('Live preview error:', error.message);
    res.status(500).json({ error: 'Failed to analyse match: ' + error.message });
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

// Update application status (Employer) + auto email on shortlist
router.put('/:applicationId/status', auth, isEmployer, async (req, res) => {
  try {
    const { status, rejectionFeedback } = req.body;
    const application = await Application.findById(req.params.applicationId)
      .populate('internship')
      .populate('applicant');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const internship = await Internship.findOne({ _id: application.internship._id, postedBy: req.userId });
    if (!internship) return res.status(403).json({ error: 'Unauthorized' });

    application.status = status;
    application.statusUpdatedAt = new Date();
    if (status === 'rejected' && rejectionFeedback) application.rejectionFeedback = rejectionFeedback;
    await application.save();

    // Feature: Email on shortlist
    if (status === 'shortlisted') {
      try {
        const emailService = require('../utils/emailService');
        await emailService.sendShortlistEmail(
          application.applicant.email,
          application.applicant.name,
          application.internship.title,
          application.internship.company
        );
      } catch (emailErr) {
        console.error('Email send failed (non-blocking):', emailErr.message);
      }
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Feature 1: AI Interview Prep Generator
router.post('/interview-prep/:applicationId', auth, isStudent, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('internship');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const internship = application.internship;
    const prompt = `You are an expert interview coach. Generate exactly 5 interview questions for this internship role.

Role: ${internship?.title || 'Software Intern'}
Company: ${internship?.company || 'Tech Company'}
Required Skills: ${internship?.requiredSkills?.join(', ') || 'Programming'}
Resume context: ${user.resumeText?.substring(0, 600) || 'Student applying for internship'}

Respond with ONLY a raw JSON array. No markdown. No explanation. No code fences. Just the array:
[{"question":"...","type":"Technical","tip":"..."},{"question":"...","type":"Behavioural","tip":"..."},{"question":"...","type":"Technical","tip":"..."},{"question":"...","type":"HR","tip":"..."},{"question":"...","type":"Technical","tip":"..."}]`;

    const completion = await groq.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: 'llama-3.3-70b-versatile', max_tokens: 1024, temperature: 0.3 });
    let text = (completion.choices[0]?.message?.content || '').trim();

    // Strip any markdown code fences
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Extract the JSON array
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) {
      console.error('No JSON array found in:', text.substring(0, 200));
      throw new Error('AI returned invalid format');
    }
    const jsonText = text.substring(start, end + 1);
    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions)) throw new Error('Response is not an array');

    // Ensure each question has required fields
    const cleaned = questions.slice(0, 5).map((q, i) => ({
      question: q.question || `Question ${i + 1}`,
      type: q.type || 'Technical',
      tip: q.tip || 'Think through your answer carefully.',
    }));

    res.json({ questions: cleaned });
  } catch (error) {
    console.error('Interview prep error:', error.message);
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
});

// Feature 2: Resume Improvement Chat
router.post('/resume-chat', auth, isStudent, async (req, res) => {
  try {
    const { message, history } = req.body;
    const user = await User.findById(req.userId);
    if (!user.resumeText) return res.status(400).json({ error: 'Please upload your resume first' });

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build messages array for Groq chat format
    const messages = [
      {
        role: 'system',
        content: `You are an expert resume coach. The student's resume is below. Answer questions with specific, actionable advice based on their actual resume. Be concise, friendly and helpful.\n\nSTUDENT'S RESUME:\n${user.resumeText?.substring(0, 2000)}`
      }
    ];

    // Add conversation history
    (history || []).forEach(h => {
      messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (error) {
    console.error('Resume chat error:', error.message);
    res.status(500).json({ error: 'Failed to get response: ' + error.message });
  }
});

// Feature 3: Employer Response Rate
router.get('/response-rate/:internshipId', async (req, res) => {
  try {
    const applications = await Application.find({
      internship: req.params.internshipId,
      statusUpdatedAt: { $exists: true },
      status: { $in: ['shortlisted', 'rejected'] }
    });
    if (applications.length === 0) return res.json({ badge: null });

    const totalMs = applications.reduce((sum, app) => {
      return sum + (new Date(app.statusUpdatedAt) - new Date(app.createdAt));
    }, 0);
    const avgDays = Math.round(totalMs / applications.length / (1000 * 60 * 60 * 24));

    let badge;
    if (avgDays <= 1) badge = { text: 'Responds within 1 day', color: 'green' };
    else if (avgDays <= 3) badge = { text: `Responds in ~${avgDays} days`, color: 'green' };
    else if (avgDays <= 7) badge = { text: `Responds in ~${avgDays} days`, color: 'yellow' };
    else badge = { text: 'Slow to respond', color: 'gray' };

    res.json({ badge, avgDays, count: applications.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get response rate' });
  }
});

// Feature 4: AI Internship Description Improver
router.post('/improve-description', auth, isEmployer, async (req, res) => {
  try {
    const { description, title, requiredSkills } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an expert job description writer. Rewrite this internship description to be more attractive, clear, and keyword-rich.

Role: ${title || 'Internship'}
Skills: ${requiredSkills || ''}
Original Description:
${description}

Rules:
- Keep it under 200 words
- Use clear sections: About the Role, What You'll Do, What We're Looking For
- Make it exciting and professional
- Add relevant technical keywords naturally
- Return ONLY the improved description text, no extra commentary`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      temperature: 0.7,
    });

    const improved = completion.choices[0]?.message?.content?.trim() || description;
    res.json({ improved });
  } catch (error) {
    console.error('Description improver error:', error.message);
    res.status(500).json({ error: 'Failed to improve description: ' + error.message });
  }
});

module.exports = router;