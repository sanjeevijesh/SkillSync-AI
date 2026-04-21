const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(prompt, maxTokens = 2048) {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0.3,
  });
  return completion.choices[0]?.message?.content || '';
}

function extractJSON(text) {
  text = text.replace(/```json|```/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found');
  return JSON.parse(text.substring(start, end + 1));
}

async function analyzeResumeQuality(resumeText) {
  try {
    console.log('📊 Starting resume analysis with Groq...');

    const prompt = `You are an expert resume reviewer. Analyze this resume and respond ONLY with valid JSON, no markdown.

RESUME:
${resumeText.substring(0, 2500)}

Return this exact JSON structure:
{
  "overallScore": <0-100>,
  "grade": "<A/B/C/D/F>",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": {
    "immediate": ["fix1", "fix2", "fix3"],
    "shortTerm": ["improvement1", "improvement2"],
    "longTerm": ["strategy1", "strategy2"]
  },
  "sectionAnalysis": {
    "contact": { "present": true, "quality": "good", "feedback": "feedback text" },
    "summary": { "present": true, "quality": "good", "feedback": "feedback text" },
    "experience": { "present": true, "quality": "good", "feedback": "feedback text" },
    "education": { "present": true, "quality": "good", "feedback": "feedback text" },
    "skills": { "present": true, "quality": "good", "feedback": "feedback text" },
    "projects": { "present": true, "quality": "good", "feedback": "feedback text" }
  },
  "atsCompatibility": {
    "score": <0-100>,
    "issues": ["issue1", "issue2"],
    "fixes": ["fix1", "fix2"]
  },
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3"],
  "formattingIssues": ["issue1"],
  "impactMetrics": {
    "hasQuantifiableAchievements": false,
    "examplesOfGoodMetrics": [],
    "suggestedMetrics": ["suggestion1", "suggestion2"]
  }
}`;

    const text = await callGroq(prompt, 2048);
    const analysis = extractJSON(text);
    console.log('✅ Resume analysis completed with Groq');
    return { success: true, analysis };

  } catch (error) {
    console.error('❌ Resume Analysis Error:', error.message);
    return { success: false, analysis: generateBasicAnalysis(resumeText), error: 'AI unavailable' };
  }
}

function generateBasicAnalysis(resumeText) {
  const lower = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).length;
  const hasContact = /email|phone|linkedin|github/.test(lower);
  const hasExperience = /experience|work|intern|job/.test(lower);
  const hasEducation = /education|university|college|degree/.test(lower);
  const hasSkills = /skill|proficien|technolog/.test(lower);
  const hasProjects = /project|built|developed|created/.test(lower);
  let score = 0;
  if (hasContact) score += 20;
  if (hasExperience) score += 20;
  if (hasEducation) score += 20;
  if (hasSkills) score += 20;
  if (hasProjects) score += 20;
  if (wordCount < 100) score -= 20;
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  return {
    overallScore: Math.max(0, Math.min(100, score)), grade,
    strengths: [hasExperience && 'Resume includes work experience', hasSkills && 'Technical skills mentioned', hasProjects && 'Projects demonstrate experience'].filter(Boolean),
    weaknesses: [!hasContact && 'Missing contact info', !hasSkills && 'Skills section missing', wordCount < 100 && 'Resume too brief'].filter(Boolean),
    recommendations: {
      immediate: ['Add complete contact information', 'Use clear section headers', 'Ensure consistent formatting'],
      shortTerm: ['Add quantifiable achievements', 'Use action verbs', 'Tailor to job requirements'],
      longTerm: ['Build more projects', 'Gain relevant experience']
    },
    sectionAnalysis: {
      contact: { present: hasContact, quality: hasContact ? 'good' : 'poor', feedback: hasContact ? 'Contact info found' : 'Add email, phone, LinkedIn' },
      summary: { present: false, quality: 'fair', feedback: 'Add a professional summary' },
      experience: { present: hasExperience, quality: hasExperience ? 'fair' : 'poor', feedback: hasExperience ? 'Experience section present' : 'Add work experience' },
      education: { present: hasEducation, quality: hasEducation ? 'good' : 'poor', feedback: hasEducation ? 'Education found' : 'Add education details' },
      skills: { present: hasSkills, quality: hasSkills ? 'fair' : 'poor', feedback: hasSkills ? 'Skills mentioned' : 'Add dedicated skills section' },
      projects: { present: hasProjects, quality: hasProjects ? 'good' : 'fair', feedback: hasProjects ? 'Projects found' : 'Add relevant projects' }
    },
    atsCompatibility: { score: 60, issues: ['Use standard headers', 'Avoid graphics/tables'], fixes: ['Use keywords from job descriptions', 'Save as PDF'] },
    keywordSuggestions: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Agile', 'Problem-solving'],
    formattingIssues: [wordCount > 1000 ? 'Resume too long (aim for 1 page)' : null].filter(Boolean),
    impactMetrics: {
      hasQuantifiableAchievements: /\d+%|\d+\s*(users|customers|revenue)/.test(resumeText),
      examplesOfGoodMetrics: [],
      suggestedMetrics: ['Add numbers to achievements (e.g., Improved efficiency by 30%)', 'Quantify project impact']
    }
  };
}

async function getSkillGapAnalysis(resumeText, targetRole) {
  try {
    const prompt = `You are a technical recruiter. Analyze this resume for a ${targetRole} role and respond ONLY with valid JSON, no markdown.

RESUME:
${resumeText.substring(0, 2000)}

Return this exact JSON:
{
  "currentSkills": ["skill1", "skill2"],
  "missingSkills": {
    "critical": ["skill1"],
    "important": ["skill2"],
    "optional": ["skill3"]
  },
  "learningPath": [
    { "skill": "skill name", "priority": "critical", "resources": ["resource1", "resource2"], "estimatedTime": "2-3 weeks" }
  ],
  "readinessScore": 65
}`;

    const text = await callGroq(prompt, 1024);
    const parsed = extractJSON(text);
    return {
      currentSkills: parsed.currentSkills || [],
      missingSkills: {
        critical: parsed.missingSkills?.critical || [],
        important: parsed.missingSkills?.important || [],
        optional: parsed.missingSkills?.optional || [],
      },
      learningPath: parsed.learningPath || [],
      readinessScore: parsed.readinessScore || 0,
    };
  } catch (error) {
    console.error('❌ Skill gap error:', error.message);
    return { currentSkills: [], missingSkills: { critical: [], important: [], optional: [] }, learningPath: [], readinessScore: 0 };
  }
}

module.exports = { analyzeResumeQuality, getSkillGapAnalysis };