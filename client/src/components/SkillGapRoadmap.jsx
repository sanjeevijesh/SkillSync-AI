import { useState } from 'react';
import { applicationAPI } from '../utils/api';
import {
  Target, BookOpen, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Zap, X, Search
} from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: {
    label: 'Must Have',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    icon: <AlertCircle className="w-4 h-4 text-red-500" />,
    barColor: 'bg-red-400',
  },
  important: {
    label: 'Nice to Have',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
    icon: <Target className="w-4 h-4 text-yellow-500" />,
    barColor: 'bg-yellow-400',
  },
  optional: {
    label: 'Bonus Skill',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    icon: <BookOpen className="w-4 h-4 text-blue-500" />,
    barColor: 'bg-blue-400',
  },
};

// Map resource text to a URL heuristic
function getResourceUrl(resource) {
  const r = resource.toLowerCase();
  if (r.includes('youtube')) return `https://www.youtube.com/results?search_query=${encodeURIComponent(resource)}`;
  if (r.includes('udemy')) return 'https://www.udemy.com';
  if (r.includes('coursera')) return 'https://www.coursera.org';
  if (r.includes('freeCodeCamp') || r.includes('freecodecamp')) return 'https://www.freecodecamp.org';
  if (r.includes('mdn')) return 'https://developer.mozilla.org';
  if (r.includes('docs') || r.includes('official')) return '#';
  return `https://www.google.com/search?q=${encodeURIComponent(resource)}`;
}

function SkillCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.optional;

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:brightness-95 transition-all"
      >
        <div className="flex items-center space-x-3">
          {/* Step number */}
          <div className={`w-8 h-8 rounded-full ${cfg.dot} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
            {index + 1}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{item.skill}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{item.estimatedTime}</span>
            </div>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3 mt-3">Recommended resources to learn this skill:</p>
          <div className="space-y-2">
            {item.resources?.map((resource, idx) => (
              <a
                key={idx}
                href={getResourceUrl(resource)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{resource}</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillGapRoadmap({ show, onClose }) {
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const QUICK_ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
    'Android Developer', 'iOS Developer', 'UI/UX Designer',
  ];

  const analyze = async (role) => {
    const roleToUse = role || targetRole;
    if (!roleToUse.trim()) { setError('Please enter a target role'); return; }
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const response = await applicationAPI.getSkillGapAnalysis(roleToUse);
      const data = response.data.analysis;
      if (!data || (!data.currentSkills?.length && !data.learningPath?.length)) {
        setError('No analysis returned. Your resume may not have enough content, or the AI timed out. Please try again.');
        setLoading(false);
        return;
      }
      setAnalysis(data);
      setTargetRole(roleToUse);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze. Please check your resume is uploaded and try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setAnalysis(null);
    setTargetRole('');
    setError('');
  };

  if (!show) return null;

  // Sort learning path: critical first, then important, then optional
  const sortedPath = analysis?.learningPath?.slice().sort((a, b) => {
    const order = { critical: 0, important: 1, optional: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  }) || [];

  const readiness = analysis?.readinessScore ?? 0;
  const readinessColor =
    readiness >= 70 ? 'text-green-600' :
    readiness >= 40 ? 'text-yellow-600' : 'text-red-600';
  const readinessBarColor =
    readiness >= 70 ? 'bg-green-500' :
    readiness >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Target className="w-7 h-7 mr-3" />
                Skill Gap Roadmap
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">
                Discover exactly what to learn to land your dream role
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Input */}
          {!analysis && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What role are you targeting?
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => { setTargetRole(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && analyze()}
                      placeholder="e.g. Full Stack Developer, Data Scientist..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => analyze()}
                    disabled={loading || !targetRole.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              {/* Quick role pills */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Quick select</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => { setTargetRole(role); analyze(role); }}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-16 text-center">
              <div className="animate-spin w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analysing your resume against {targetRole}...</p>
              <p className="text-gray-400 text-sm mt-1">This takes about 10 seconds</p>
            </div>
          )}

          {/* Results */}
          {analysis && !loading && (
            <div className="space-y-6">
              {/* Role header + change button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Roadmap for: <span className="text-indigo-600">{targetRole}</span></h3>
                </div>
                <button onClick={reset} className="text-sm text-indigo-600 hover:text-indigo-700 underline">
                  Change role
                </button>
              </div>

              {/* Readiness score */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700">Your Readiness Score</span>
                  <span className={`text-3xl font-bold ${readinessColor}`}>{readiness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${readinessBarColor} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${readiness}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {readiness >= 70 ? "You're well-prepared! A few additions will make you stand out." :
                   readiness >= 40 ? "Good foundation. Focus on the critical skills below to boost your chances." :
                   "Don't worry — the roadmap below shows exactly what to build first."}
                </p>
              </div>

              {/* Current skills */}
              {analysis.currentSkills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Skills You Already Have ({analysis.currentSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.currentSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills summary */}
              {(analysis.missingSkills?.critical?.length > 0 || analysis.missingSkills?.important?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'critical', label: 'Must Have', color: 'red' },
                    { key: 'important', label: 'Important', color: 'yellow' },
                    { key: 'optional', label: 'Bonus', color: 'blue' },
                  ].map(({ key, label, color }) => (
                    analysis.missingSkills?.[key]?.length > 0 && (
                      <div key={key} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
                        <p className={`text-xs font-semibold text-${color}-600 uppercase tracking-wide mb-2`}>{label}</p>
                        <div className="space-y-1">
                          {analysis.missingSkills[key].map((skill, idx) => (
                            <p key={idx} className="text-sm text-gray-700">• {skill}</p>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Learning Path */}
              {sortedPath.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 text-indigo-500 mr-2" />
                    Your Learning Roadmap ({sortedPath.length} skills)
                  </h4>
                  <div className="space-y-3">
                    {sortedPath.map((item, idx) => (
                      <SkillCard key={idx} item={item} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Motivational footer */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <p className="text-indigo-800 font-medium text-sm">
                  💡 Focus on <strong>critical skills first</strong> — even one small project demonstrating a missing skill can significantly boost your AI match score.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}