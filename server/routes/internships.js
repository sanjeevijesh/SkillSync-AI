const express = require('express');
const Internship = require('../models/Internship');
const { auth, isEmployer } = require('../middleware/auth');
const { PaginationHelper } = require('../utils/pagination');

const router = express.Router();

// Get all active internships with pagination and filtering
router.get('/', async (req, res) => {
  try {
    // Parse pagination parameters
    const { page, limit, sort } = PaginationHelper.parsePaginationParams(req);

    // Build filter query
    const filters = { isActive: true };

    // Search by title or company
    if (req.query.search) {
      filters.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { company: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    // Filter by location
    if (req.query.location) {
      filters.location = new RegExp(req.query.location, 'i');
    }

    // Filter by skills (if skills array is provided)
    if (req.query.skills) {
      const skillsArray = Array.isArray(req.query.skills) 
        ? req.query.skills 
        : req.query.skills.split(',').map(s => s.trim());
      
      filters.requiredSkills = { 
        $in: skillsArray.map(skill => new RegExp(skill, 'i'))
      };
    }

    // Filter by experience level
    if (req.query.experience) {
      filters.experienceRequired = req.query.experience;
    }

    // Filter by stipend range
    if (req.query.stipendMin || req.query.stipendMax) {
      // This is basic - you might want to parse stipend strings
      // For now, we'll filter by string matching
      if (req.query.stipendType) {
        filters.stipend = new RegExp(req.query.stipendType, 'i');
      }
    }

    // Create query
    const query = Internship.find(filters).populate('postedBy', 'name companyName');

    // Apply pagination
    const result = await PaginationHelper.offsetPaginate(query, page, limit, {
      sort,
      populate: 'postedBy'
    });

    res.json({
      success: true,
      ...result
    });

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

    // Validation
    if (!title || !description || !requiredSkills || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'description', 'requiredSkills', 'location']
      });
    }

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

// Get internships posted by logged-in employer with pagination
router.get('/my/postings', auth, isEmployer, async (req, res) => {
  try {
    const { page, limit, sort } = PaginationHelper.parsePaginationParams(req);

    const query = Internship.find({ postedBy: req.userId });

    const result = await PaginationHelper.offsetPaginate(query, page, limit, {
      sort
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Fetch my internships error:', error);
    res.status(500).json({ error: 'Failed to fetch your internships' });
  }
});

// Update internship (Employer only)
router.put('/:id', auth, isEmployer, async (req, res) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      postedBy: req.userId
    });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or unauthorized' });
    }

    const allowedUpdates = [
      'title',
      'description',
      'requiredSkills',
      'location',
      'duration',
      'stipend',
      'experienceRequired',
      'isActive'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        internship[key] = req.body[key];
      }
    });

    await internship.save();

    res.json({
      message: 'Internship updated successfully',
      internship
    });

  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({ error: 'Failed to update internship' });
  }
});

// Delete/Deactivate internship (Employer only)
router.delete('/:id', auth, isEmployer, async (req, res) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      postedBy: req.userId
    });

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or unauthorized' });
    }

    // Soft delete - just mark as inactive
    internship.isActive = false;
    await internship.save();

    res.json({
      message: 'Internship deactivated successfully'
    });

  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({ error: 'Failed to delete internship' });
  }
});

// Get trending/popular internships
router.get('/featured/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const internships = await Internship.find({ isActive: true })
      .sort({ applicationCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('postedBy', 'name companyName');

    res.json({
      success: true,
      internships
    });

  } catch (error) {
    console.error('Fetch trending internships error:', error);
    res.status(500).json({ error: 'Failed to fetch trending internships' });
  }
});

// Get internship statistics
router.get('/stats/overview', auth, isEmployer, async (req, res) => {
  try {
    const totalInternships = await Internship.countDocuments({ postedBy: req.userId });
    const activeInternships = await Internship.countDocuments({ 
      postedBy: req.userId, 
      isActive: true 
    });

    const internships = await Internship.find({ postedBy: req.userId });
    const totalApplications = internships.reduce(
      (sum, internship) => sum + internship.applicationCount, 
      0
    );

    res.json({
      success: true,
      stats: {
        totalInternships,
        activeInternships,
        inactiveInternships: totalInternships - activeInternships,
        totalApplications,
        averageApplicationsPerInternship: totalInternships > 0 
          ? Math.round(totalApplications / totalInternships) 
          : 0
      }
    });

  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Deep analytics for employer dashboard
router.get('/analytics/deep', auth, isEmployer, async (req, res) => {
  try {
    const Application = require('../models/Application');

    // Get all internships by this employer
    const internships = await Internship.find({ postedBy: req.userId });
    const internshipIds = internships.map(i => i._id);

    // Get all applications for these internships
    const applications = await Application.find({ internship: { $in: internshipIds } })
      .populate('internship', 'title requiredSkills');

    // --- Score distribution ---
    const scoreBuckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    let totalScore = 0;
    applications.forEach(app => {
      const s = app.matchScore || 0;
      totalScore += s;
      if (s <= 20) scoreBuckets['0-20']++;
      else if (s <= 40) scoreBuckets['21-40']++;
      else if (s <= 60) scoreBuckets['41-60']++;
      else if (s <= 80) scoreBuckets['61-80']++;
      else scoreBuckets['81-100']++;
    });
    const avgMatchScore = applications.length > 0
      ? Math.round(totalScore / applications.length) : 0;

    // --- Status breakdown ---
    const statusCount = { pending: 0, shortlisted: 0, rejected: 0, reviewed: 0 };
    applications.forEach(app => { if (statusCount[app.status] !== undefined) statusCount[app.status]++; });

    // --- Top missing skills across all applications ---
    const missingSkillsMap = {};
    applications.forEach(app => {
      (app.aiAnalysis?.missingSkills || []).forEach(skill => {
        const key = skill.toLowerCase().trim();
        missingSkillsMap[key] = (missingSkillsMap[key] || 0) + 1;
      });
    });
    const topMissingSkills = Object.entries(missingSkillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    // --- Most demanded skills (from job postings) ---
    const demandedSkillsMap = {};
    internships.forEach(internship => {
      (internship.requiredSkills || []).forEach(skill => {
        const key = skill.toLowerCase().trim();
        demandedSkillsMap[key] = (demandedSkillsMap[key] || 0) + 1;
      });
    });
    const topDemandedSkills = Object.entries(demandedSkillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    // --- Applications per internship (for bar chart) ---
    const perInternship = internships.map(internship => {
      const apps = applications.filter(a => a.internship?._id?.toString() === internship._id.toString());
      const avgScore = apps.length > 0
        ? Math.round(apps.reduce((s, a) => s + (a.matchScore || 0), 0) / apps.length) : 0;
      return {
        title: internship.title.length > 20 ? internship.title.substring(0, 20) + '…' : internship.title,
        applications: apps.length,
        avgScore,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length
      };
    }).sort((a, b) => b.applications - a.applications).slice(0, 6);

    // --- Application trend (last 7 days) ---
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = applications.filter(a => {
        const d = new Date(a.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length;
      trend.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    res.json({
      success: true,
      analytics: {
        overview: {
          totalInternships: internships.length,
          activeInternships: internships.filter(i => i.isActive).length,
          totalApplications: applications.length,
          avgMatchScore,
          shortlistRate: applications.length > 0
            ? Math.round((statusCount.shortlisted / applications.length) * 100) : 0
        },
        scoreBuckets,
        statusCount,
        topMissingSkills,
        topDemandedSkills,
        perInternship,
        trend
      }
    });

  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get similar internships based on shared skills
router.get('/similar/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Find internships sharing at least 1 required skill, excluding current one
    const similar = await Internship.find({
      _id: { $ne: internship._id },
      isActive: true,
      requiredSkills: {
        $in: internship.requiredSkills.map(s => new RegExp(s, 'i'))
      }
    })
    .populate('postedBy', 'name companyName')
    .limit(10)
    .lean();

    // Score by number of overlapping skills — most overlap first
    const scored = similar.map(s => {
      const overlap = s.requiredSkills.filter(skill =>
        internship.requiredSkills.some(r => r.toLowerCase() === skill.toLowerCase())
      ).length;
      return { ...s, overlapCount: overlap };
    }).sort((a, b) => b.overlapCount - a.overlapCount).slice(0, 3);

    res.json({ success: true, similar: scored });

  } catch (error) {
    console.error('Similar internships error:', error.message);
    res.status(500).json({ error: 'Failed to fetch similar internships' });
  }
});

module.exports = router;