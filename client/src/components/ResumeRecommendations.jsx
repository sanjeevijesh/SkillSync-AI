import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Award,
  BookOpen,
  Target,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import api from '../utils/api';

export default function ResumeRecommendations({ show, onClose }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (show) {
      loadRecommendations();
    }
  }, [show]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/resume-recommendations');
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                Resume Analysis & Recommendations
              </h2>
              <p className="text-blue-100 mt-1">AI-Powered Career Insights</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your resume...</p>
          </div>
        ) : recommendations ? (
          <div className="p-4 sm:p-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {recommendations.overallScore}
                </div>
                <p className="text-gray-700 font-medium">Overall Score</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                <div className={`inline-block px-6 py-3 rounded-full text-3xl font-bold ${getGradeColor(recommendations.grade)}`}>
                  {recommendations.grade}
                </div>
                <p className="text-gray-700 font-medium mt-2">Resume Grade</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {recommendations.atsCompatibility?.score || 'N/A'}
                </div>
                <p className="text-gray-700 font-medium">ATS Score</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6 overflow-x-auto">
              <div className="flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
                {['overview', 'sections', 'recommendations', 'keywords'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Strengths */}
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.strengths?.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-green-900">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.weaknesses?.map((weakness, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-600 mr-2">!</span>
                        <span className="text-red-900">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Metrics */}
                {recommendations.impactMetrics && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2" />
                      Impact Metrics
                    </h3>
                    {recommendations.impactMetrics.hasQuantifiableAchievements ? (
                      <div className="space-y-3">
                        <p className="text-green-700 font-medium">✓ Great! Your resume includes quantifiable achievements.</p>
                        {recommendations.impactMetrics.examplesOfGoodMetrics?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-2">Examples:</p>
                            <ul className="space-y-1">
                              {recommendations.impactMetrics.examplesOfGoodMetrics.map((example, idx) => (
                                <li key={idx} className="text-sm text-blue-800">• {example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-orange-700 font-medium">⚠ Add numbers to make your achievements more impactful.</p>
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-2">Suggestions:</p>
                          <ul className="space-y-1">
                            {recommendations.impactMetrics.suggestedMetrics?.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-blue-800">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && recommendations.sectionAnalysis && (
              <div className="space-y-4">
                {Object.entries(recommendations.sectionAnalysis).map(([section, data]) => (
                  <div key={section} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {section}
                      </h3>
                      <div className="flex items-center space-x-3">
                        {data.present ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${getQualityColor(data.quality)}`}></div>
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {data.quality}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{data.feedback}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && recommendations.recommendations && (
              <div className="space-y-6">
                {/* Immediate Actions */}
                <div className="border-l-4 border-red-500 bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                    <Zap className="w-6 h-6 mr-2" />
                    Immediate Actions (Do Today)
                  </h3>
                  <ul className="space-y-3">
                    {recommendations.recommendations.immediate?.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-red-600 text-white rounded-full text-center font-bold mr-3 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-red-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Short-term */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-2" />
                    Short-term Goals (This Week)
                  </h3>
                  <ul className="space-y-3">
                    {recommendations.recommendations.shortTerm?.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-yellow-600 text-white rounded-full text-center font-bold mr-3 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-yellow-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long-term */}
                <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    Long-term Strategy (Career Growth)
                  </h3>
                  <ul className="space-y-3">
                    {recommendations.recommendations.longTerm?.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-center font-bold mr-3 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-blue-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === 'keywords' && (
              <div className="space-y-6">
                {/* Keyword Suggestions */}
                {recommendations.keywordSuggestions && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                      <BookOpen className="w-6 h-6 mr-2" />
                      Recommended Keywords to Add
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.keywordSuggestions.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 cursor-pointer transition-colors"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="text-purple-800 text-sm mt-4">
                      💡 Tip: Incorporate these keywords naturally into your resume to improve ATS compatibility
                    </p>
                  </div>
                )}

                {/* ATS Compatibility */}
                {recommendations.atsCompatibility && (
                  <div className="bg-gray-50 border-l-4 border-gray-500 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Award className="w-6 h-6 mr-2" />
                      ATS Compatibility
                    </h3>
                    
                    {recommendations.atsCompatibility.issues?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium text-gray-900 mb-2">Issues Found:</p>
                        <ul className="space-y-1">
                          {recommendations.atsCompatibility.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-red-500 mr-2">✗</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {recommendations.atsCompatibility.fixes?.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">How to Fix:</p>
                        <ul className="space-y-1">
                          {recommendations.atsCompatibility.fixes.map((fix, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Formatting Issues */}
                {recommendations.formattingIssues?.length > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-orange-900 mb-4">
                      Formatting Issues
                    </h3>
                    <ul className="space-y-2">
                      {recommendations.formattingIssues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-orange-900 flex items-start">
                          <span className="text-orange-600 mr-2">⚠</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recommendations available</p>
          </div>
        )}
      </div>
    </div>
  );
}