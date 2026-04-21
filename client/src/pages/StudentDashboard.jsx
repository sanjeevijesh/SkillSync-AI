import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { internshipAPI, applicationAPI, featureAPI } from '../utils/api';
import { Upload, Briefcase, TrendingUp, CheckCircle, XCircle, Sparkles, FileText, Copy, RefreshCw, Zap, Shield, ChevronDown, ChevronUp, Link2, Search, SlidersHorizontal, Bookmark, BookmarkCheck, X, User, MessageSquare, Send, Star, Trophy, Clock, Github } from 'lucide-react';
import Watermark from '../components/Watermark';
import ResumeRecommendations from '../components/ResumeRecommendations';
import LiveMatchPreview from '../components/LiveMatchPreview';

function DraggableChat({ chatOpen, setChatOpen, chatMessages, chatLoading, chatInput, setChatInput, handleChatSend, chatEndRef }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 180, y: window.innerHeight - 100 });
  const [dragging, setDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragRef = useRef(null);
  const startRef = useRef(null);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const onPointerDown = (e) => {
    // Only allow drag when chat is CLOSED (button state)
    if (chatOpen) return;
    if (e.target.closest('input, textarea')) return;
    e.preventDefault();
    setDragging(true);
    setHasDragged(false);
    startRef.current = { px: e.clientX - pos.x, py: e.clientY - pos.y };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!startRef.current) return;
    setHasDragged(true);
    const el = dragRef.current;
    const w = el?.offsetWidth || 160;
    const h = el?.offsetHeight || 52;
    setPos({
      x: clamp(e.clientX - startRef.current.px, 0, window.innerWidth - w),
      y: clamp(e.clientY - startRef.current.py, 0, window.innerHeight - h),
    });
  };

  const onPointerUp = () => {
    setDragging(false);
    startRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  const handleButtonClick = () => {
    if (!hasDragged) setChatOpen(v => !v);
  };

  return (
    <div
      ref={dragRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 50, touchAction: 'none', userSelect: 'none' }}
      onPointerDown={onPointerDown}
    >
      {chatOpen ? (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ width: Math.min(360, window.innerWidth - 24), maxHeight: '70vh' }}
        >
          {/* Drag handle header */}
          <div className="drag-handle flex items-center justify-between px-4 py-3 bg-gray-900 text-white cursor-grab active:cursor-grabbing select-none">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Resume Coach</p>
                <p className="text-xs text-gray-400">Powered by Groq AI · Drag to move</p>
              </div>
            </div>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 180, maxHeight: 320 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              onPointerDown={e => e.stopPropagation()}
              placeholder="Ask about your resume..."
              className="flex-1 text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              disabled={chatLoading}
            />
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={handleChatSend}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 bg-gray-900 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-colors font-medium text-sm cursor-grab active:cursor-grabbing select-none"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Resume Coach</span>
          <span className="sm:hidden">AI Coach</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [matchPrediction, setMatchPrediction] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bookmarks') || '[]'); } catch { return []; }
  });
  const [similarMap, setSimilarMap] = useState({});
  const [loadingSimilar, setLoadingSimilar] = useState({});
  const [expandedSimilar, setExpandedSimilar] = useState({});
  const [resumeScore, setResumeScore] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resumeScore')) || null; } catch { return null; }
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  // New feature states
  const [interviewQuestions, setInterviewQuestions] = useState({});
  const [interviewLoading, setInterviewLoading] = useState({});
  const [showInterview, setShowInterview] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'assistant', content: "Hi! I'm your resume coach. Ask me anything about improving your resume or preparing for specific roles." }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [responseBadges, setResponseBadges] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadInternships();
    loadApplications();
    checkResume();
  }, []);

  const checkResume = () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setHasResume(!!savedUser?.resumeUrl);
  };

  const loadInternships = async () => {
    try {
      const response = await internshipAPI.getAll();
      const list = response.data?.items || response.data?.internships || response.data || [];
      setInternships(Array.isArray(list) ? list : []);
    } catch { setInternships([]); }
  };

  const loadApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      const list = response.data?.applications || response.data || [];
      setMyApplications(Array.isArray(list) ? list : []);
    } catch { setMyApplications([]); }
  };

  // Feature: Interview Prep
  const handleInterviewPrep = async (appId) => {
    setInterviewLoading(p => ({ ...p, [appId]: true }));
    try {
      const res = await featureAPI.getInterviewPrep(appId);
      setInterviewQuestions(p => ({ ...p, [appId]: res.data.questions }));
      setShowInterview(p => ({ ...p, [appId]: true }));
    } catch (err) { const msg = err.response?.data?.error || ''; if (msg.includes('429') || msg.includes('quota')) { alert('AI is rate limited right now. Please wait 1 minute and try again.'); } else { alert('Failed to generate questions. Try again.'); } }
    setInterviewLoading(p => ({ ...p, [appId]: false }));
  };

  // Feature: Resume Chat
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(p => [...p, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const history = chatMessages.slice(-6);
      const res = await featureAPI.resumeChat(msg, history);
      setChatMessages(p => [...p, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setChatMessages(p => [...p, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Feature: Load response badge for internships
  const loadResponseBadge = async (internshipId) => {
    if (responseBadges[internshipId]) return;
    try {
      const res = await featureAPI.getResponseRate(internshipId);
      if (res.data.badge) setResponseBadges(p => ({ ...p, [internshipId]: res.data.badge }));
    } catch { /* silent */ }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Please upload a PDF file'); return; }
    setLoading(true);
    try {
      const response = await applicationAPI.uploadResume(file);
      alert('Resume uploaded successfully!');
      setHasResume(true);
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.resumeUrl = 'uploaded';
      localStorage.setItem('user', JSON.stringify(savedUser));
      if (response.data.recommendations) setTimeout(() => setShowRecommendations(true), 1000);
      if (response.data.quality) {
        setResumeScore(response.data.quality);
        localStorage.setItem('resumeScore', JSON.stringify(response.data.quality));
      }
    } catch (error) {
      alert('Failed to upload resume: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const fetchSimilar = async (internshipId) => {
    if (similarMap[internshipId]) {
      setExpandedSimilar(prev => ({ ...prev, [internshipId]: !prev[internshipId] }));
      return;
    }
    setLoadingSimilar(prev => ({ ...prev, [internshipId]: true }));
    setExpandedSimilar(prev => ({ ...prev, [internshipId]: true }));
    try {
      const response = await internshipAPI.getSimilar(internshipId);
      setSimilarMap(prev => ({ ...prev, [internshipId]: response.data.similar || [] }));
    } catch {
      setSimilarMap(prev => ({ ...prev, [internshipId]: [] }));
    }
    setLoadingSimilar(prev => ({ ...prev, [internshipId]: false }));
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem('bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const filteredInternships = internships.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    const matchesLocation = !filterLocation || i.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesSkill = !filterSkill || i.requiredSkills?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
    return matchesSearch && matchesLocation && matchesSkill;
  });

  const profileCompletion = (() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const checks = [
      { label: 'Name', done: !!savedUser.name },
      { label: 'Email', done: !!savedUser.email },
      { label: 'Resume', done: !!savedUser.resumeUrl },
      { label: 'Resume Score', done: !!resumeScore },
      { label: 'First Application', done: myApplications.length > 0 },
    ];
    const done = checks.filter(c => c.done).length;
    return { pct: Math.round((done / checks.length) * 100), checks };
  })();

  const predictMatch = async (internship) => {
    if (!hasResume) { alert('Please upload your resume first'); return; }
    setLoading(true);
    setSelectedInternship(internship);
    setCoverLetter('');
    setShowCoverLetter(false);
    try {
      const response = await applicationAPI.predictMatch(internship._id);
      setMatchPrediction(response.data);
    } catch (error) {
      alert('Failed to predict match: ' + (error.response?.data?.error || 'Unknown error'));
      setSelectedInternship(null);
    }
    setLoading(false);
  };

  const generateCoverLetter = async () => {
    if (!selectedInternship) return;
    setCoverLetterLoading(true);
    setShowCoverLetter(true);
    try {
      const response = await applicationAPI.generateCoverLetter(selectedInternship._id);
      setCoverLetter(response.data.coverLetter);
    } catch (error) {
      alert('Failed to generate cover letter: ' + (error.response?.data?.error || 'Unknown error'));
      setShowCoverLetter(false);
    }
    setCoverLetterLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyToInternship = async () => {
    if (!selectedInternship || !matchPrediction) return;
    setLoading(true);
    try {
      await applicationAPI.apply(selectedInternship._id, { coverLetter });
      alert('Application submitted successfully!');
      setSelectedInternship(null);
      setMatchPrediction(null);
      setCoverLetter('');
      setShowCoverLetter(false);
      loadApplications();
      loadInternships();
    } catch (error) {
      alert('Failed to apply: ' + (error.response?.data?.error || 'Unknown error'));
    }
    setLoading(false);
  };

  const closeModal = () => {
    setSelectedInternship(null);
    setMatchPrediction(null);
    setCoverLetter('');
    setShowCoverLetter(false);
  };

  const getMatchColor = (score) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getMatchBg = (score) => score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Watermark />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">

        <div className="mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find your perfect internship with AI-powered matching</p>
        </div>

        {!hasResume && (
          <div className="card mb-5 bg-primary-50 border-primary-200">
            <div className="flex items-start gap-3">
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Upload Your Resume</h3>
                <p className="text-sm text-gray-600 mb-3">Upload your resume to get AI-powered match scores and personalised recommendations</p>
                <label className="btn-primary cursor-pointer inline-block text-sm">
                  {loading ? 'Uploading...' : 'Upload Resume (PDF)'}
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={loading} />
                </label>
              </div>
            </div>
          </div>
        )}

        {hasResume && (
          <div className="card mb-5 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-green-900 font-medium text-sm sm:text-base">Resume uploaded successfully!</p>
                  <p className="text-green-700 text-xs sm:text-sm">You can now check match scores and apply to internships</p>
                </div>
                {resumeScore && (() => {
                  const grade = resumeScore.grade || 'C';
                  const score = resumeScore.score || 0;
                  const gradeConfig = {
                    A: { bg: 'bg-green-500', ring: 'ring-green-400', text: 'Excellent', tip: 'Well-optimised!' },
                    B: { bg: 'bg-blue-500', ring: 'ring-blue-400', text: 'Good', tip: 'A few tweaks could make it great.' },
                    C: { bg: 'bg-yellow-500', ring: 'ring-yellow-400', text: 'Average', tip: 'Room for improvement.' },
                    D: { bg: 'bg-orange-500', ring: 'ring-orange-400', text: 'Needs Work', tip: 'Check AI Recommendations.' },
                    F: { bg: 'bg-red-500', ring: 'ring-red-400', text: 'Poor', tip: 'Major improvements needed.' },
                  };
                  const cfg = gradeConfig[grade] || gradeConfig['C'];
                  return (
                    <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-green-200">
                      <div className={`w-10 h-10 rounded-full ${cfg.bg} ring-2 ${cfg.ring} flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <span className="text-white font-bold">{grade}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{cfg.text}</p>
                        <p className="text-xs text-gray-500">{score}/100</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button onClick={() => setShowRecommendations(true)} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium w-full sm:w-auto flex-shrink-0">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendations</span>
              </button>
            </div>
          </div>
        )}

        {hasResume && resumeScore && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
            {[
              { label: 'Length', key: 'length', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Structure', key: 'structure', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
              { label: 'Diversity', key: 'diversity', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
              { label: 'Formatting', key: 'formatting', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
            ].map(({ label, key, color, bg }) => (
              <div key={key} className={`rounded-xl border p-2 sm:p-3 text-center ${bg}`}>
                <p className={`text-lg sm:text-xl font-bold ${color}`}>{resumeScore.breakdown?.[key] ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                  <div className={`h-1 rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${((resumeScore.breakdown?.[key] || 0) / 25) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {profileCompletion.pct < 100 && (
          <div className="card mb-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Profile Completion</span>
              <span className={`text-sm font-bold ml-auto ${profileCompletion.pct >= 80 ? 'text-green-600' : profileCompletion.pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                {profileCompletion.pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className={`h-2 rounded-full transition-all duration-700 ${profileCompletion.pct >= 80 ? 'bg-green-500' : profileCompletion.pct >= 60 ? 'bg-yellow-500' : 'bg-primary-500'}`} style={{ width: `${profileCompletion.pct}%` }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profileCompletion.checks.map(({ label, done }) => (
                <span key={label} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {done ? '✓' : '○'} {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex mb-5 border-b border-gray-200 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
          {[
            { id: 'browse', label: 'Browse', icon: null },
            { id: 'applications', label: `Applications (${myApplications.length})`, icon: null },
            { id: 'saved', label: `Saved (${bookmarks.length})`, icon: <Bookmark className="w-3.5 h-3.5" /> },
            { id: 'preview', label: 'Live Preview', icon: <Zap className="w-3.5 h-3.5" /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 pb-3 px-2 sm:px-3 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === id
                  ? id === 'preview' ? 'text-violet-600 border-b-2 border-violet-600'
                  : id === 'saved' ? 'text-yellow-600 border-b-2 border-yellow-500'
                  : 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search internships..."
                  className="input-field pl-9 text-sm h-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 h-10 rounded-lg border font-medium text-sm flex-shrink-0 transition-colors ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {(filterLocation || filterSkill) && <span className="w-2 h-2 bg-red-500 rounded-full" />}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                  <input type="text" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} placeholder="e.g. Remote, Chennai..." className="input-field text-sm h-9" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Skill</label>
                  <input type="text" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} placeholder="e.g. React, Python..." className="input-field text-sm h-9" />
                </div>
                {(filterLocation || filterSkill) && (
                  <button onClick={() => { setFilterLocation(''); setFilterSkill(''); }} className="text-xs text-red-500 col-span-full">✕ Clear filters</button>
                )}
              </div>
            )}

            {(searchQuery || filterLocation || filterSkill) && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{filteredInternships.length} result{filteredInternships.length !== 1 ? 's' : ''} found</p>
            )}

            <div className="grid gap-3 sm:gap-4">
              {filteredInternships.length === 0 ? (
                <div className="card text-center py-10 dark:bg-gray-800">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">{internships.length === 0 ? 'No internships available' : 'No results found'}</h3>
                  <p className="text-sm text-gray-500">{internships.length === 0 ? 'Check back later' : 'Try different search terms'}</p>
                </div>
              ) : filteredInternships.map((internship) => {
                const badge = responseBadges[internship._id];
                if (!badge) loadResponseBadge(internship._id);
                return (
                <div key={internship._id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">{internship.title}</h3>
                      <p className="text-primary-600 font-medium text-sm mt-0.5">{internship.company}</p>
                    </div>
                    <button
                      onClick={() => toggleBookmark(internship._id)}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium flex-shrink-0 transition-colors ${bookmarks.includes(internship._id) ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white dark:bg-gray-700 border-gray-200 text-gray-500 hover:border-yellow-400'}`}
                    >
                      {bookmarks.includes(internship._id) ? <><BookmarkCheck className="w-3.5 h-3.5" /><span className="hidden sm:inline">Saved</span></> : <><Bookmark className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save</span></>}
                    </button>
                  </div>
                  {badge && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${badge.color === 'green' ? 'text-green-600' : badge.color === 'yellow' ? 'text-yellow-600' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3" />{badge.text}
                    </div>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3">{internship.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {internship.requiredSkills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 mb-3">
                    <span>📍 {internship.location}</span>
                    <span>⏰ {internship.duration}</span>
                    <span>💰 {internship.stipend}</span>
                  </div>
                  <button
                    onClick={() => predictMatch(internship)}
                    disabled={!hasResume || loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading && selectedInternship?._id === internship._id ? 'Checking...' : 'Check Match'}
                  </button>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => fetchSimilar(internship._id)} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      <Link2 className="w-3.5 h-3.5" />
                      Similar Roles
                      {expandedSimilar[internship._id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedSimilar[internship._id] && (
                      <div className="mt-2">
                        {loadingSimilar[internship._id] ? (
                          <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
                            <div className="animate-spin w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            Finding similar roles...
                          </div>
                        ) : similarMap[internship._id]?.length > 0 ? (
                          <div className="grid gap-2 mt-1">
                            {similarMap[internship._id].map((sim) => (
                              <div key={sim._id} className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-xs truncate">{sim.title}</p>
                                  <p className="text-indigo-600 text-xs">{sim.company}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs text-gray-500">📍 {sim.location}</span>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{sim.overlapCount} shared</span>
                                  </div>
                                </div>
                                <button onClick={() => predictMatch(sim)} disabled={!hasResume || loading} className="ml-2 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex-shrink-0 disabled:opacity-50">
                                  Check
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1 py-1">No similar roles found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {myApplications.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Applied', count: myApplications.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { label: 'Pending', count: myApplications.filter(a => a.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                  { label: 'Shortlisted', count: myApplications.filter(a => a.status === 'shortlisted').length, color: 'bg-green-50 border-green-200 text-green-700' },
                  { label: 'Rejected', count: myApplications.filter(a => a.status === 'rejected').length, color: 'bg-red-50 border-red-200 text-red-700' },
                ].map(({ label, count, color }) => (
                  <div key={label} className={`rounded-xl border p-2 sm:p-3 text-center ${color}`}>
                    <p className="text-xl sm:text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            {myApplications.length === 0 ? (
              <div className="card text-center py-10">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">No applications yet</h3>
                <p className="text-sm text-gray-600">Browse internships and click Check Match to apply</p>
              </div>
            ) : myApplications.map((app) => {
              const appliedDate = new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
              const isShortlisted = app.status === 'shortlisted';
              const isRejected = app.status === 'rejected';
              const isPending = app.status === 'pending';
              const steps = [
                { id: 'applied', label: 'Applied', date: appliedDate, done: true, active: false },
                { id: 'review', label: 'Under Review', date: isPending ? 'In progress...' : appliedDate, done: !isPending, active: isPending },
                { id: 'decision', label: isShortlisted ? 'Shortlisted 🎉' : isRejected ? 'Not Selected' : 'Pending', date: isShortlisted || isRejected ? 'Completed' : 'Waiting...', done: isShortlisted || isRejected, active: false, success: isShortlisted, failed: isRejected },
              ];
              return (
                <div key={app._id} className={`card p-4 sm:p-6 border-l-4 ${isShortlisted ? 'border-l-green-500' : isRejected ? 'border-l-red-400' : 'border-l-blue-500'}`}>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{app.internship?.title || 'Internship'}</h3>
                      <p className="text-primary-600 font-medium text-sm">{app.internship?.company || 'Company'}</p>
                      <p className="text-xs text-gray-500 mt-1">📅 {appliedDate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPending ? 'bg-yellow-100 text-yellow-800' : isShortlisted ? 'bg-green-100 text-green-800' : isRejected ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <span className={`text-lg sm:text-xl font-bold ${getMatchColor(app.matchScore)}`}>{app.matchScore}%</span>
                    </div>
                  </div>
                  <div className="relative flex items-start justify-between mb-4 px-1">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="flex flex-col items-center flex-1 relative">
                        {idx < steps.length - 1 && (
                          <div className={`absolute top-3.5 left-1/2 w-full h-0.5 z-0 ${steps[idx + 1].done || steps[idx + 1].active ? 'bg-blue-400' : 'bg-gray-200'}`} />
                        )}
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 text-xs font-bold ${step.success ? 'bg-green-500 border-green-500 text-white' : step.failed ? 'bg-red-400 border-red-400 text-white' : step.active ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : step.done ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                          {step.success ? '✓' : step.failed ? '✗' : step.done ? '✓' : step.active ? '●' : idx + 1}
                        </div>
                        <p className={`text-xs font-semibold mt-1 text-center leading-tight ${step.success ? 'text-green-600' : step.failed ? 'text-red-500' : step.active ? 'text-blue-600' : step.done ? 'text-blue-600' : 'text-gray-400'}`}>{step.label}</p>
                        <p className="text-xs text-gray-400 text-center hidden sm:block">{step.date}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>AI Match Score</span>
                      <span className={`font-semibold ${getMatchColor(app.matchScore)}`}>{app.matchScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${app.matchScore >= 80 ? 'bg-green-500' : app.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${app.matchScore}%` }} />
                    </div>
                  </div>
                  {app.aiAnalysis?.reasoning && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 mb-2">💡 {app.aiAnalysis.reasoning}</p>}
                  {isRejected && app.rejectionFeedback && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-1">💬 Employer Feedback</p>
                      <p className="text-xs text-red-600">{app.rejectionFeedback}</p>
                    </div>
                  )}
                  {/* Feature: Top Match Banner */}
                  {app.matchScore >= 85 && (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                      <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-amber-700">You're a top match for this role!</p>
                    </div>
                  )}
                  {isShortlisted && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                      <p className="text-xs font-semibold text-green-700">🎉 Congratulations! You've been shortlisted.</p>
                    </div>
                  )}
                  {/* Feature: Interview Prep Button — show when shortlisted */}
                  {isShortlisted && (
                    <div>
                      <button
                        onClick={() => handleInterviewPrep(app._id)}
                        disabled={interviewLoading[app._id]}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 mb-2"
                      >
                        {interviewLoading[app._id] ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating questions...</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" />Prepare for Interview — AI Questions</>
                        )}
                      </button>
                      {showInterview[app._id] && interviewQuestions[app._id] && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-blue-800">AI Interview Questions</p>
                            <button onClick={() => setShowInterview(p => ({ ...p, [app._id]: false }))} className="text-blue-400 hover:text-blue-600"><X className="w-3.5 h-3.5" /></button>
                          </div>
                          {interviewQuestions[app._id].map((q, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-blue-100">
                              <div className="flex items-start gap-2 mb-1">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                <p className="text-xs font-semibold text-gray-900 leading-relaxed">{q.question}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 pl-7">
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${q.type === 'Technical' ? 'bg-purple-100 text-purple-700' : q.type === 'Behavioural' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{q.type}</span>
                                <p className="text-xs text-gray-500 italic">{q.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid gap-3 sm:gap-4">
            {bookmarks.length === 0 ? (
              <div className="card text-center py-10 dark:bg-gray-800">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No saved internships</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click Save on any internship to bookmark it here</p>
              </div>
            ) : internships.filter(i => bookmarks.includes(i._id)).map((internship) => (
              <div key={internship._id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BookmarkCheck className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{internship.title}</h3>
                    </div>
                    <p className="text-primary-600 font-medium text-sm">{internship.company}</p>
                  </div>
                  <button onClick={() => toggleBookmark(internship._id)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {internship.requiredSkills?.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">{skill}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span>📍 {internship.location}</span>
                  <span>💰 {internship.stipend}</span>
                </div>
                <button onClick={() => predictMatch(internship)} disabled={!hasResume || loading} className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50">
                  <Sparkles className="w-4 h-4" /> Check Match
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'preview' && <LiveMatchPreview />}

      </div>

      {matchPrediction && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 rounded-t-2xl sm:rounded-t-xl flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate flex-1 mr-3">Match: {selectedInternship.title}</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex-shrink-0">✕</button>
            </div>
            <div className="p-4 sm:p-6">
              <div className={`p-4 sm:p-6 rounded-xl border-2 mb-4 ${getMatchBg(matchPrediction.matchScore)}`}>
                <div className="text-center">
                  <div className={`text-4xl sm:text-5xl font-bold mb-1 ${getMatchColor(matchPrediction.matchScore)}`}>{matchPrediction.matchScore}%</div>
                  <p className="text-gray-700 font-medium text-sm">Match Score</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">AI Analysis</h3>
                  <p className="text-gray-700 text-sm">{matchPrediction.aiAnalysis?.reasoning}</p>
                </div>
                {matchPrediction.aiAnalysis?.matchedSkills?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-600" />Matched Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {matchPrediction.aiAnalysis.matchedSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {matchPrediction.aiAnalysis?.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1.5"><XCircle className="w-4 h-4 text-red-600" />Missing Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {matchPrediction.aiAnalysis.missingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {matchPrediction.aiAnalysis?.recommendations && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-600" />Recommendations</h3>
                    <p className="text-gray-700 text-sm">{matchPrediction.aiAnalysis.recommendations}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-600" />AI Cover Letter</h3>
                    {!showCoverLetter ? (
                      <button onClick={generateCoverLetter} disabled={coverLetterLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                        <Sparkles className="w-3.5 h-3.5" />Generate
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={generateCoverLetter} disabled={coverLetterLoading} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs disabled:opacity-50">
                          <RefreshCw className={`w-3.5 h-3.5 ${coverLetterLoading ? 'animate-spin' : ''}`} />Regenerate
                        </button>
                        <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs">
                          <Copy className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                  {showCoverLetter && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      {coverLetterLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                          <span className="text-purple-700 text-xs">Generating cover letter...</span>
                        </div>
                      ) : (
                        <>
                          <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={8} className="w-full bg-transparent text-gray-800 text-xs sm:text-sm leading-relaxed resize-none focus:outline-none" />
                          <p className="text-xs text-purple-500 mt-2">✏️ Edit before applying. Included with your application.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                <button onClick={applyToInternship} disabled={loading} className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">{loading ? 'Applying...' : 'Apply Now'}</button>
                <button onClick={closeModal} className="flex-1 btn-secondary py-3 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResumeRecommendations show={showRecommendations} onClose={() => setShowRecommendations(false)} />

      {/* Feature: Resume Improvement Chat — draggable floating widget */}
      {hasResume && (
        <DraggableChat
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          chatMessages={chatMessages}
          chatLoading={chatLoading}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSend={handleChatSend}
          chatEndRef={chatEndRef}
        />
      )}
    </div>
  );
}