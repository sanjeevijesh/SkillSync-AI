import { useState } from 'react';
import { applicationAPI } from '../utils/api';
import {
  Zap, CheckCircle, XCircle, TrendingUp,
  AlertCircle, RotateCcw, ClipboardPaste
} from 'lucide-react';

const SAMPLE_JD = `We are looking for a Frontend Developer Intern to join our team.

Responsibilities:
- Build responsive UI components using React.js
- Collaborate with designers to implement pixel-perfect designs
- Write clean, maintainable JavaScript/TypeScript code
- Work with REST APIs and integrate backend services

Requirements:
- Proficiency in React.js, HTML, CSS, JavaScript
- Familiarity with Git and version control
- Knowledge of Tailwind CSS or similar frameworks
- Basic understanding of Node.js is a plus`;

export default function LiveMatchPreview() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleDescChange = (e) => {
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
    setError('');
  };

  const handlePasteSample = () => {
    setDescription(SAMPLE_JD);
    setCharCount(SAMPLE_JD.length);
    setJobTitle('Frontend Developer Intern');
    setCompany('Sample Company');
    setRequiredSkills('React, JavaScript, HTML, CSS, Git');
    setError('');
  };

  const handleAnalyze = async () => {
    if (description.trim().length < 50) {
      setError('Please paste a job description (minimum 50 characters)');
      return;
    }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const response = await applicationAPI.livePreview({
        jobTitle: jobTitle || 'Target Role',
        company: company || 'Company',
        description,
        requiredSkills
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setDescription('');
    setJobTitle('');
    setCompany('');
    setRequiredSkills('');
    setCharCount(0);
    setError('');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-50 to-emerald-50 border-green-200';
    if (score >= 60) return 'from-yellow-50 to-amber-50 border-yellow-200';
    return 'from-red-50 to-rose-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Strong Match', icon: '🎯' };
    if (score >= 60) return { text: 'Moderate Match', icon: '⚡' };
    if (score >= 40) return { text: 'Partial Match', icon: '🔧' };
    return { text: 'Low Match', icon: '📚' };
  };

  const getBarWidth = (score) => `${score}%`;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Zap className="w-7 h-7" />
              Live Match Preview
            </h2>
            <p className="text-violet-200 mt-1 text-sm">
              Paste any job description and instantly see how well your resume matches — before applying anywhere.
            </p>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another
            </button>
          )}
        </div>
      </div>

      {!result ? (
        /* ── Input Form ── */
        <div className="card space-y-4 sm:space-y-5">
          {/* Optional fields row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Startup Inc."
                className="input-field"
              />
            </div>
          </div>

          {/* Skills field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Skills Required <span className="text-gray-400 font-normal">(comma separated, optional)</span>
            </label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, SQL"
              className="input-field"
            />
          </div>

          {/* JD textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Job Description <span className="text-red-500">*</span>
              </label>
              <button
                onClick={handlePasteSample}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste sample JD
              </button>
            </div>
            <textarea
              value={description}
              onChange={handleDescChange}
              rows={10}
              placeholder={`Paste the full job description here...\n\nInclude responsibilities, requirements, and any skills mentioned. The more detail you provide, the more accurate your match score will be.`}
              className="input-field resize-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${charCount < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                {charCount} characters {charCount < 50 ? `(need ${50 - charCount} more)` : '✓'}
              </span>
              {description && (
                <button onClick={() => { setDescription(''); setCharCount(0); }} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || description.trim().length < 50}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Analysing your match...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Analyse My Match</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your resume is analysed against this JD using the same AI that powers match scoring
          </p>
        </div>
      ) : (
        /* ── Results ── */
        <div className="space-y-5">
          {/* Score card */}
          <div className={`card bg-gradient-to-br ${getScoreBg(result.matchScore)} border-2`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Match Score</p>
                <p className="text-gray-700 font-medium mt-0.5">
                  {result.jobTitle} {result.company !== 'Company' ? `at ${result.company}` : ''}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl sm:text-6xl font-bold ${getScoreColor(result.matchScore)}`}>
                  {result.matchScore}%
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full bg-white/60 rounded-full h-3 mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  result.matchScore >= 80 ? 'bg-green-500' :
                  result.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: getBarWidth(result.matchScore) }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">{getScoreLabel(result.matchScore).icon}</span>
              <span className={`font-semibold text-base sm:text-lg ${getScoreColor(result.matchScore)}`}>
                {getScoreLabel(result.matchScore).text}
              </span>
            </div>
          </div>

          {/* AI Reasoning */}
          {result.aiAnalysis?.reasoning && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                AI Verdict
              </h3>
              <p className="text-gray-700 leading-relaxed">{result.aiAnalysis.reasoning}</p>
            </div>
          )}

          {/* Matched + Missing skills side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {result.aiAnalysis?.matchedSkills?.length > 0 && (
              <div className="card bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  You Have ({result.aiAnalysis.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.aiAnalysis.matchedSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.aiAnalysis?.missingSkills?.length > 0 && (
              <div className="card bg-red-50 border-red-200">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  You're Missing ({result.aiAnalysis.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.aiAnalysis.missingSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.aiAnalysis?.recommendations && (
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                How to Improve Your Score
              </h3>
              <p className="text-blue-800 leading-relaxed">{result.aiAnalysis.recommendations}</p>
            </div>
          )}

          {/* Score interpretation guide */}
          <div className="card bg-gray-50 border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Score Guide</h3>
            <div className="space-y-2">
              {[
                { range: '80–100%', label: 'Strong match — apply with confidence', color: 'text-green-600', bg: 'bg-green-100' },
                { range: '60–79%', label: 'Good match — highlight your strengths', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { range: '40–59%', label: 'Partial match — address skill gaps first', color: 'text-orange-600', bg: 'bg-orange-100' },
                { range: '0–39%', label: 'Low match — build missing skills before applying', color: 'text-red-600', bg: 'bg-red-100' },
              ].map((item) => (
                <div key={item.range} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.bg} ${item.color} min-w-[70px] text-center`}>
                    {item.range}
                  </span>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 border-2 border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Another Job Description
          </button>
        </div>
      )}
    </div>
  );
}