const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

const userFields = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName,
  resumeUrl: user.resumeUrl,
  resumeFileName: user.resumeFileName,
  resumeUploadedAt: user.resumeUploadedAt,
  avatar: user.avatar || ''
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });
    const user = new User({ name, email, password, role: role || 'student', companyName: role === 'employer' ? companyName : undefined });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered successfully', token, user: userFields(user) });
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: userFields(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const u = req.user;
    res.json({ user: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.companyName || '',
      resumeUrl: u.resumeUrl || '',
      resumeFileName: u.resumeFileName || '',
      resumeUploadedAt: u.resumeUploadedAt || null,
      avatar: u.avatar || '',
    }});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, companyName } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (companyName !== undefined) updates.companyName = companyName;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user: userFields(user) });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: base64 }, { new: true }).select('-password');
    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Delete resume
router.delete('/resume', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl: '', resumeText: '', resumeFileName: '', resumeUploadedAt: null, skills: []
    });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Feature: Analyse GitHub profile + boost skills
router.post('/github-analyse', auth, async (req, res) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) return res.status(400).json({ error: 'GitHub URL required' });
    const username = githubUrl.replace(/\/$/, '').split('/').pop();

    // Fetch repos from GitHub public API
    const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`);
    if (!reposRes.ok) return res.status(400).json({ error: 'GitHub user not found' });
    const repos = await reposRes.json();

    const repoSummary = repos.slice(0, 8).map(r =>
      `${r.name}: ${r.description || 'No description'} (Language: ${r.language || 'Unknown'}, Stars: ${r.stargazers_count})`
    ).join('\n');

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Analyze these GitHub repositories and extract technical skills. Return ONLY a valid JSON array of skill strings, no markdown, no explanation.

Repositories:
${repoSummary}

Example output: ["React", "Node.js", "Python", "MongoDB", "Docker"]`;

    const completion = await groq.chat.completions.create({ messages: [{ role: 'user', content: prompt }], model: 'llama-3.3-70b-versatile', max_tokens: 512, temperature: 0.3 });
    let text = (completion.choices[0]?.message?.content || '').trim().replace(/```json|```/g, '').trim();
    const detectedSkills = JSON.parse(text);

    // Save github URL and merge skills to user profile
    const currentUser = await User.findById(req.user._id);
    const mergedSkills = [...new Set([...(currentUser.skills || []), ...detectedSkills])];
    await User.findByIdAndUpdate(req.user._id, { githubUrl, skills: mergedSkills });

    res.json({ skills: detectedSkills, repos: repos.slice(0, 8).map(r => ({ name: r.name, language: r.language, stars: r.stargazers_count, url: r.html_url })) });
  } catch (error) {
    console.error('GitHub analyse error:', error);
    res.status(500).json({ error: 'Failed to analyse GitHub profile' });
  }
});

module.exports = router;