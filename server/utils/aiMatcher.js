const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(prompt, maxTokens = 1024) {
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

async function analyzeMatch(resumeText, internship) {
  try {
    console.log('AI Analysis: Starting match prediction with Groq...');

    const prompt = `You are an expert AI recruiter. Analyze this candidate's resume against the job requirements.

RESUME:
${resumeText.substring(0, 2000)}

JOB POSTING:
Title: ${internship.title}
Company: ${internship.company}
Description: ${internship.description}
Required Skills: ${internship.requiredSkills?.join(', ')}
Location: ${internship.location}

Respond ONLY with valid JSON, no markdown:
{
  "matchScore": <0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "reasoning": "2-3 sentence explanation",
  "recommendations": "Specific advice to improve fit"
}`;

    const text = await callGroq(prompt);
    const analysis = extractJSON(text);

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

    // Fallback: keyword matching
    const resumeLower = resumeText.toLowerCase();
    const requiredSkills = internship.requiredSkills?.map(s => s.toLowerCase()) || [];
    const matchedSkills = requiredSkills.filter(skill => resumeLower.includes(skill));
    const matchScore = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;
    const missingSkills = requiredSkills.filter(skill => !resumeLower.includes(skill));

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
    const prompt = `Write a professional, concise cover letter (150-200 words) for this application.

CANDIDATE'S RESUME:
${resumeText.substring(0, 1500)}

JOB:
Title: ${internship.title}
Company: ${internship.company}
Description: ${internship.description}

Rules:
- Professional tone
- Highlight relevant skills from the resume
- Show genuine interest
- Keep it concise
- Write in first person, no placeholders

Write ONLY the cover letter text:`;

    return await callGroq(prompt, 512);

  } catch (error) {
    console.error('Cover Letter Error:', error.message);
    return `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${internship.title} position at ${internship.company}. Based on my background and skills, I believe I would be a great fit for this role.\n\nI am excited about the opportunity to contribute to your team and grow my skills in this area.\n\nThank you for considering my application.\n\nBest regards`;
  }
}

module.exports = { analyzeMatch, generateCoverLetter };