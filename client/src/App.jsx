import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import { useEffect, useRef, useState } from 'react';
import { Zap, Target, BarChart3, ArrowRight, CheckCircle, Users, Briefcase, TrendingUp, FileText, Sparkles, Star } from 'lucide-react';
import Profile from './pages/Profile';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'} />;
  }
  return children;
}

// Scroll animation hook
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/10 rounded-3xl blur-2xl" />
      <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-md px-3 py-1 text-xs text-gray-400">
            skillsync.sanjeevijesh.website/student/dashboard
          </div>
        </div>
        <div className="p-4 bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-3 w-40 bg-white/80 rounded-full mb-1.5" />
              <div className="h-2 w-28 bg-white/30 rounded-full" />
            </div>
            <div className="w-28 h-8 bg-blue-600 rounded-lg flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">AI Match</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="h-2.5 w-36 bg-white/70 rounded-full mb-1" />
                <div className="h-2 w-20 bg-blue-400/70 rounded-full" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-green-400">87%</span>
                <span className="text-xs text-gray-400">Match Score</span>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: '87%' }} />
            </div>
            <div className="flex gap-2 mt-3">
              {['React', 'Node.js', 'MongoDB'].map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-full">{skill}</span>
              ))}
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-full">Docker</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { title: 'Frontend Developer', score: 92, color: 'text-green-400' },
              { title: 'Full Stack Intern', score: 74, color: 'text-yellow-400' },
            ].map(({ title, score, color }) => (
              <div key={title} className="bg-white/10 rounded-xl border border-white/10 p-3">
                <div className="h-2 w-20 bg-white/60 rounded-full mb-1" />
                <div className="h-1.5 w-14 bg-blue-400/50 rounded-full mb-2" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {['React', 'JS'].map(s => (
                      <span key={s} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{s}</span>
                    ))}
                  </div>
                  <span className={`text-sm font-bold ${color}`}>{score}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Applied', val: '4', bg: 'bg-blue-500/20', text: 'text-blue-400' },
              { label: 'Shortlisted', val: '2', bg: 'bg-green-500/20', text: 'text-green-400' },
              { label: 'AI Score', val: '85%', bg: 'bg-violet-500/20', text: 'text-violet-400' },
            ].map(({ label, val, bg, text }) => (
              <div key={label} className={`${bg} rounded-lg p-2 text-center border border-white/5`}>
                <p className={`text-sm font-bold ${text}`}>{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating badges */}
      <div className="absolute -left-4 top-16 bg-gray-900 border border-white/10 rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 backdrop-blur-sm">
        <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Resume Analysed</p>
          <p className="text-xs text-gray-400">Grade A — 91/100</p>
        </div>
      </div>
      <div className="absolute -right-4 bottom-20 bg-gray-900 border border-white/10 rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 backdrop-blur-sm">
        <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Cover Letter</p>
          <p className="text-xs text-gray-400">Generated by AI</p>
        </div>
      </div>
      <div className="absolute -right-2 top-10 bg-gray-900 border border-white/10 rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 backdrop-blur-sm">
        <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">87% Match</p>
          <p className="text-xs text-gray-400">Top applicant</p>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'} />;
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO — dark background ── */}
      <section className="relative overflow-hidden bg-gray-950">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        {/* Blue glow top-left */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        {/* Violet glow bottom-right */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-24 pb-14 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-400 tracking-wide uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                AI-Powered Internship Matching
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
                Find internships that
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-400"> actually fit you</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-500/20 -z-10 skew-x-1" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                SkillSync AI matches your resume to internships with precision giving you an exact compatibility score, skill gap analysis, and a personalised cover letter in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="/register" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-sm text-sm">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 text-sm">
                  Sign In
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />Students and employers
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />Powered by Gemini AI
                </div>
              </div>

              {/* Built by Sanjeev */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">S</div>
                <p className="text-xs text-gray-500">Designed & built by <span className="text-gray-300 font-medium">Sanjeev</span></p>
              </div>
            </div>

            {/* Right — Mockup */}
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="lg:hidden mt-12 px-2">
            <DashboardMockup />
          </div>
        </div>

        {/* Bottom fade into white */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── STATS ── */}
      <RevealSection>
        <section className="border-b border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: '0–100%', label: 'Match Score Accuracy' },
                { value: 'AI', label: 'Resume Analysis Engine' },
                { value: '< 5s', label: 'Match Prediction Time' },
                { value: 'Free', label: 'To Get Started' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <RevealSection className="text-center mb-12">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">What We Do</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Everything you need to land the right internship
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Stop guessing whether you are a good fit. Let AI do the heavy lifting.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: <Target className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', title: 'Smart Match Scoring', desc: 'Upload your resume once. Get an instant 0–100% compatibility score for every internship, powered by Gemini AI.', tags: ['AI Matching', 'Resume Analysis'], delay: 0 },
            { icon: <BarChart3 className="w-6 h-6 text-violet-600" />, bg: 'bg-violet-50', title: 'Skill Gap Analysis', desc: 'Know exactly which skills you have and which you are missing before you apply. Get actionable recommendations.', tags: ['Gap Analysis', 'Career Growth'], delay: 100 },
            { icon: <Zap className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50', title: 'AI Cover Letter', desc: 'Generate a personalised, role-specific cover letter in one click. Edit it, copy it, and submit with confidence.', tags: ['Cover Letter', 'Personalised'], delay: 200 },
          ].map(({ icon, bg, title, desc, tags, delay }) => (
            <RevealSection key={title} delay={delay}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5`}>{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <RevealSection className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Three steps to your next internship
            </h2>
          </RevealSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 left-1/3 right-1/3 h-px bg-gray-200" />
            {[
              { step: '01', title: 'Upload Your Resume', desc: 'Create your account and upload your resume as a PDF. Our AI parses it instantly.', delay: 0 },
              { step: '02', title: 'Browse Internships', desc: 'Browse all available internships and click Check Match to get your score in seconds.', delay: 150 },
              { step: '03', title: 'Apply with Confidence', desc: 'Generate a cover letter, review your analysis, and submit your application directly.', delay: 300 },
            ].map(({ step, title, desc, delay }) => (
              <RevealSection key={step} delay={delay} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <span className="text-lg font-bold text-gray-900">{step}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDENTS vs EMPLOYERS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <RevealSection className="text-center mb-12">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">Who It's For</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Built for both sides of hiring
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {[
            {
              icon: <Briefcase className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50',
              title: 'For Students', sub: 'Land internships that match your actual skills.',
              items: ['AI match score for every listing', 'Resume quality analysis and grade', 'Personalised cover letter generator', 'Skill gap roadmap', 'Application tracker with timeline'],
              delay: 0,
            },
            {
              icon: <Users className="w-6 h-6 text-violet-600" />, bg: 'bg-violet-50',
              title: 'For Employers', sub: 'Find best-fit candidates, automatically ranked by AI.',
              items: ['Post internship listings in minutes', 'AI ranks applicants by match score', 'Blind screening mode available', 'Shortlist or reject with one click', 'Analytics dashboard with insights'],
              delay: 150,
            },
          ].map(({ icon, bg, title, sub, items, delay }) => (
            <RevealSection key={title} delay={delay}>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-6`}>{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-6">{sub}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <a href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all w-fit">
                  Get Started <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── CTA DARK BANNER ── */}
      <RevealSection>
        <section className="bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to find your perfect internship?
            </h2>
            <p className="text-gray-400 mb-8 text-sm sm:text-base max-w-xl mx-auto">
              Join students and employers using SkillSync AI to make smarter decisions, faster.
            </p>
            <a href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all text-sm sm:text-base shadow-sm">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </RevealSection>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">SkillSync AI</span>
            </div>
            <p className="text-xs text-gray-400">
              © 2026 SkillSync AI — Designed & built by{' '}
              <span className="text-gray-600 font-medium">Sanjeev Vijesh</span>
            </p>
            <div className="flex gap-5 text-xs text-gray-400">
              <a href="/login" className="hover:text-gray-600 transition-colors">Sign In</a>
              <a href="/register" className="hover:text-gray-600 transition-colors">Register</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/employer/dashboard" element={<ProtectedRoute allowedRole="employer"><EmployerDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
