client/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Watermark.jsx
│   ├── context/
│   ├── pages/
│   │   ├── EmployerDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── StudentDashboard.jsx
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js



Navbar.jsx

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if we're on auth pages (login/register)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Hide navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              SkillSync<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'}
                  className="text-slate-300 hover:text-white font-medium transition-colors duration-200 relative group"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </Link>

                {/* User Badge */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white leading-none">{user.name}</span>
                    <span className="text-xs text-slate-400 capitalize leading-none mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/50 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-red-400 transition-colors">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium transition-colors duration-200 relative group"
                >
                  Sign In
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                  </div>
                </div>

                {/* Dashboard Link */}
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-medium"
                >
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-center hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}


Watermark.jsx

export default function Watermark() {
  return (
    <>
      {/* Elegant Corner Stamp */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none">
        <div className="relative">
          {/* Subtle Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-60 animate-pulse-slow"></div>
          
          {/* Main Badge */}
          <div className="relative backdrop-blur-md bg-gradient-to-br from-slate-800/40 via-slate-900/60 to-black/70 border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex flex-col items-end space-y-1">
              {/* Brand Mark */}
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>
                <span className="text-white/90 text-sm font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                  SanjeeVijesh
                </span>
              </div>
              {/* Tagline */}
              <span className="text-white/50 text-[10px] tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                The Founder
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Grid Watermark Pattern */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}>
          {/* Scattered Brand Marks */}
          <div className="absolute top-[10%] left-[15%] text-white/[0.02] text-xs font-bold transform rotate-12">
            SanjeeVijesh
          </div>
          <div className="absolute top-[25%] right-[20%] text-white/[0.02] text-xs font-bold transform -rotate-12">
            SanjeeVijesh
          </div>
          <div className="absolute top-[45%] left-[25%] text-white/[0.02] text-xs font-bold transform rotate-6">
            SanjeeVijesh
          </div>
          <div className="absolute top-[60%] right-[15%] text-white/[0.02] text-xs font-bold transform -rotate-6">
            SanjeeVijesh
          </div>
          <div className="absolute top-[80%] left-[40%] text-white/[0.02] text-xs font-bold transform rotate-12">
            SanjeeVijesh
          </div>
        </div>
      </div>

      {/* Top Corner Monogram */}
      <div className="fixed top-6 left-6 z-50 pointer-events-none select-none">
        <div className="relative group">
          
          {/* Tooltip on Hover */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <div className="bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-white/90 text-xs font-medium">SanjeeVijesh © 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none select-none">
        <div className="backdrop-blur-md bg-slate-900/40 border border-white/10 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/60 text-[10px] uppercase tracking-wider">Secure</span>
            </div>
            <div className="w-px h-3 bg-white/10"></div>
            <span className="text-white/40 text-[10px] tracking-wider">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}

EmployerDashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { internshipAPI, applicationAPI } from '../utils/api';
import { Plus, Users, Briefcase, Trophy, Mail, X } from 'lucide-react';
import Watermark from '../components/Watermark';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [myInternships, setMyInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    location: '',
    duration: '',
    stipend: '',
    experienceRequired: 'Fresher',
  });

  useEffect(() => {
    loadMyInternships();
  }, []);

  const loadMyInternships = async () => {
    try {
      const response = await internshipAPI.getMyPostings();
      setMyInternships(response.data.internships);
    } catch (error) {
      console.error('Failed to load internships:', error);
    }
  };

  const loadApplications = async (internshipId) => {
    setLoading(true);
    try {
      const response = await applicationAPI.getInternshipApplications(internshipId);
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
    setLoading(false);
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      await internshipAPI.create({
        ...formData,
        requiredSkills: skillsArray,
      });

      alert('Internship posted successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        requiredSkills: '',
        location: '',
        duration: '',
        stipend: '',
        experienceRequired: 'Fresher',
      });
      loadMyInternships();
    } catch (error) {
      alert('Failed to create internship: ' + (error.response?.data?.error || 'Unknown error'));
    }
    setLoading(false);
  };

  const viewApplications = (internship) => {
    setSelectedInternship(internship);
    loadApplications(internship._id);
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await applicationAPI.updateStatus(applicationId, { status });
      loadApplications(selectedInternship._id);
      alert('Application status updated!');
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Watermark */}
      <Watermark />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600 mt-1">{user?.companyName}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Internship</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Postings</p>
                <p className="text-2xl font-bold text-gray-900">{myInternships.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myInternships.reduce((sum, i) => sum + i.applicationCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Match Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myInternships.length > 0 ? '75%' : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Internship Postings</h2>
        <div className="grid gap-6 mb-8">
          {myInternships.length === 0 ? (
            <div className="card text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted yet</h3>
              <p className="text-gray-600 mb-6">Create your first internship posting to start receiving applications</p>
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                Post Your First Internship
              </button>
            </div>
          ) : (
            myInternships.map((internship) => (
              <div key={internship._id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{internship.title}</h3>
                    <p className="text-gray-600 mt-2">{internship.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {internship.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                      <span>📍 {internship.location}</span>
                      <span>⏰ {internship.duration}</span>
                      <span>💰 {internship.stipend}</span>
                      <span className="font-medium text-primary-600">
                        {internship.applicationCount} Applications
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => viewApplications(internship)}
                    className="btn-primary ml-4"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Post New Internship</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Frontend Developer Intern"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input-field"
                  placeholder="React, JavaScript, Node.js, MongoDB"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Remote, Bangalore"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 3 months, 6 months"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stipend</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="input-field"
                    placeholder="e.g., $500/month, Unpaid"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={formData.experienceRequired}
                    onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                    className="input-field"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-2 years">1-2 years</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Internship'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedInternship.title}</h2>
                <p className="text-gray-600">{applications.length} Applications (Ranked by AI Match Score)</p>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div key={app._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getScoreColor(app.matchScore)}`}>
                          {app.matchScore}%
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{app.applicant.name}</h3>
                            {index === 0 && app.matchScore >= 80 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {app.applicant.email}
                          </p>
                          
                          <p className="text-gray-700 mt-3 text-sm">{app.aiAnalysis.reasoning}</p>

                          {app.aiAnalysis.matchedSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {app.aiAnalysis.matchedSkills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => updateApplicationStatus(app._id, 'shortlisted')}
                          disabled={app.status === 'shortlisted'}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app._id, 'rejected')}
                          disabled={app.status === 'rejected'}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Login.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Shield, Zap } from 'lucide-react';
import Watermark from '../components/Watermark';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      navigate(user.role === 'student' ? '/student/dashboard' : '/employer/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Watermark />
      
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative">
          <div className="max-w-xl">
            {/* Logo */}
            <div className="mb-12 animate-fade-in">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">
                  SkillSync<span className="text-cyan-400">AI</span>
                </span>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Welcome back to<br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  intelligent hiring
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Where artificial intelligence meets human potential. Sign in to continue your journey.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 animate-fade-in animation-delay-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-300">Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-300">AI-powered matching in seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  SkillSync<span className="text-cyan-400">AI</span>
                </span>
              </div>
            </div>

            {/* Form Card */}
            <div className="relative group animate-fade-in animation-delay-400">
              {/* Card Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-2xl opacity-20 blur group-hover:opacity-30 transition duration-500"></div>
              
              {/* Card */}
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
                  <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3 animate-shake">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-200 font-medium">Authentication failed</p>
                        <p className="text-xs text-red-300/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                        Password
                      </label>
                      <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-purple-400' : 'text-slate-500'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 transition-all"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-slate-300 cursor-pointer">
                      Keep me signed in
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <p className="text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors inline-flex items-center group"
                    >
                      Create one now
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 mt-8">
              Protected by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}


Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, AlertCircle, ArrowRight, Check, Zap, Briefcase, GraduationCap } from 'lucide-react';
import Watermark from '../components/Watermark';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState(1);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setTimeout(() => setStep(2), 400);
  };

  const handleBack = () => {
    setStep(1);
    setFormData({ ...formData, role: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.role === 'employer' && !formData.companyName) {
      setError('Company name is required for employers');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate(formData.role === 'student' ? '/student/dashboard' : '/employer/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Watermark />
      
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">
                SkillSync<span className="text-cyan-400">AI</span>
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center space-x-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-full px-6 py-3">
              <div className={`flex items-center space-x-2 transition-all duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= 1 ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800 border-slate-600'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4 text-cyan-400" /> : <span className="text-white text-sm font-semibold">1</span>}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">Role</span>
              </div>
              
              <div className={`w-16 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
              
              <div className={`flex items-center space-x-2 transition-all duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= 2 ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800 border-slate-600'
                }`}>
                  <span className="text-white text-sm font-semibold">2</span>
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">Details</span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur group-hover:opacity-30 transition duration-500"></div>
            
            {/* Card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Choose your path</h2>
                    <p className="text-slate-400">Select how you'll be using SkillSync AI</p>
                  </div>

                  <div className="grid gap-4">
                    {/* Student Card */}
                    <button
                      onClick={() => handleRoleSelect('student')}
                      className="group relative p-6 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center space-x-5">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
                            I'm a Student
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            Find internships with AI-powered matching, get instant feedback, and discover opportunities that fit your skills.
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                              Resume Analysis
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                              Smart Matching
                            </span>
                          </div>
                        </div>
                        
                        <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </button>

                    {/* Employer Card */}
                    <button
                      onClick={() => handleRoleSelect('employer')}
                      className="group relative p-6 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-purple-500/50 rounded-xl transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center space-x-5">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors">
                            I'm an Employer
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            Hire top talent with AI-ranked applicants, save 90% screening time, and find candidates that truly fit.
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
                              Ranked Applicants
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
                              Smart Filtering
                            </span>
                          </div>
                        </div>
                        
                        <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Form */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Complete your profile</h2>
                    <p className="text-slate-400 text-sm">Fill in your details to get started</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3 animate-shake">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-200 font-medium">Registration failed</p>
                        <p className="text-xs text-red-300/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'name' ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name (Employer) */}
                  {formData.role === 'employer' && (
                    <div className="space-y-2 animate-slide-down">
                      <label htmlFor="companyName" className="block text-sm font-medium text-slate-300">
                        Company Name
                      </label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                          focusedField === 'company' ? 'text-purple-400' : 'text-slate-500'
                        }`}>
                          <Building className="w-5 h-5" />
                        </div>
                        <input
                          id="companyName"
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField('')}
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                          placeholder="Your Company"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'
                      }`}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                        focusedField === 'password' ? 'text-purple-400' : 'text-slate-500'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        placeholder="Create a strong password"
                        minLength="6"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500">Minimum 6 characters</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-white font-medium rounded-xl border border-slate-700/50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex-1 relative py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </form>
              )}

              {/* Sign In Link */}
              {step === 2 && (
                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                  <p className="text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center group">
                      Sign in
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            By creating an account, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}

StudentDashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { internshipAPI, applicationAPI } from '../utils/api';
import { Upload, Briefcase, TrendingUp, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import Watermark from '../components/Watermark';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [matchPrediction, setMatchPrediction] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    loadInternships();
    loadApplications();
    checkResume();
  }, []);

  const checkResume = () => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    console.log('👤 Current user:', savedUser);
    setHasResume(!!savedUser?.resumeUrl);
  };

  const loadInternships = async () => {
    try {
      console.log('📋 Loading internships...');
      const response = await internshipAPI.getAll();
      console.log('✅ Internships loaded:', response.data.internships);
      setInternships(response.data.internships);
    } catch (error) {
      console.error('❌ Failed to load internships:', error);
    }
  };

  const loadApplications = async () => {
    try {
      console.log('📝 Loading applications...');
      const response = await applicationAPI.getMyApplications();
      console.log('✅ Applications loaded:', response.data.applications);
      setMyApplications(response.data.applications);
    } catch (error) {
      console.error('❌ Failed to load applications:', error);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    console.log('📁 File selected:', file);
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      console.log('❌ Wrong file type:', file.type);
      return;
    }

    console.log('✅ Valid PDF file, uploading...');
    setLoading(true);
    
    try {
      console.log('🚀 Calling API...');
      const response = await applicationAPI.uploadResume(file);
      console.log('✅ API Response:', response.data);
      
      alert('Resume uploaded successfully!');
      setHasResume(true);
      
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.resumeUrl = 'uploaded';
      localStorage.setItem('user', JSON.stringify(savedUser));
      console.log('✅ User updated in localStorage');
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error response:', error.response);
      alert('Failed to upload resume: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const predictMatch = async (internship) => {
    if (!hasResume) {
      alert('Please upload your resume first');
      return;
    }

    console.log('🔮 Predicting match for:', internship.title);
    setLoading(true);
    setSelectedInternship(internship);
    
    try {
      console.log('🤖 Calling AI matcher...');
      const response = await applicationAPI.predictMatch(internship._id);
      console.log('✅ Match prediction:', response.data);
      setMatchPrediction(response.data);
    } catch (error) {
      console.error('❌ Match prediction error:', error);
      alert('Failed to predict match: ' + (error.response?.data?.error || 'Unknown error'));
      setSelectedInternship(null);
    }
    setLoading(false);
  };

  const applyToInternship = async () => {
    if (!selectedInternship || !matchPrediction) return;

    console.log('📤 Applying to:', selectedInternship.title);
    setLoading(true);
    
    try {
      const response = await applicationAPI.apply(selectedInternship._id, {});
      console.log('✅ Application submitted:', response.data);
      alert('Application submitted successfully!');
      setSelectedInternship(null);
      setMatchPrediction(null);
      loadApplications();
      loadInternships();
    } catch (error) {
      console.error('❌ Application error:', error);
      alert('Failed to apply: ' + (error.response?.data?.error || 'Unknown error'));
    }
    setLoading(false);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Watermark */}
      <Watermark />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Find your perfect internship with AI-powered matching</p>
        </div>

        {!hasResume && (
          <div className="card mb-8 bg-primary-50 border-primary-200">
            <div className="flex items-start space-x-4">
              <Upload className="w-12 h-12 text-primary-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h3>
                <p className="text-gray-600 mb-4">
                  Upload your resume to get AI-powered match scores and personalized recommendations
                </p>
                <label className="btn-primary cursor-pointer inline-block">
                  {loading ? 'Uploading...' : 'Upload Resume (PDF)'}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {hasResume && (
          <div className="card mb-8 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-900 font-medium">Resume uploaded successfully!</p>
                <p className="text-green-700 text-sm">You can now check match scores and apply to internships</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'browse'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse Internships
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Applications ({myApplications.length})
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="grid gap-6">
            {internships.length === 0 ? (
              <div className="card text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships available</h3>
                <p className="text-gray-600">Check back later for new opportunities</p>
              </div>
            ) : (
              internships.map((internship) => (
                <div key={internship._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{internship.title}</h3>
                      <p className="text-primary-600 font-medium mt-1">{internship.company}</p>
                      <p className="text-gray-600 mt-2">{internship.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {internship.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                        <span>📍 {internship.location}</span>
                        <span>⏰ {internship.duration}</span>
                        <span>💰 {internship.stipend}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => predictMatch(internship)}
                      disabled={!hasResume || loading}
                      className="btn-primary ml-4 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Check Match</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="grid gap-6">
            {myApplications.length === 0 ? (
              <div className="card text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600">Start applying to internships to see them here</p>
              </div>
            ) : (
              myApplications.map((app) => (
                <div key={app._id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.internship.title}
                      </h3>
                      <p className="text-primary-600 font-medium mt-1">{app.internship.company}</p>
                      
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Match Score:</span>
                          <span className={`text-2xl font-bold ${getMatchColor(app.matchScore)}`}>
                            {app.matchScore}%
                          </span>
                        </div>
                        
                        {app.aiAnalysis.reasoning && (
                          <p className="text-sm text-gray-600 mt-2">
                            {app.aiAnalysis.reasoning}
                          </p>
                        )}
                      </div>

                      {app.status === 'rejected' && app.rejectionFeedback && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Feedback:</strong> {app.rejectionFeedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {matchPrediction && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Match Analysis: {selectedInternship.title}
            </h2>

            <div className={`p-6 rounded-xl border-2 mb-6 ${getMatchBg(matchPrediction.matchScore)}`}>
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getMatchColor(matchPrediction.matchScore)}`}>
                  {matchPrediction.matchScore}%
                </div>
                <p className="text-gray-700 font-medium">Match Score</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-700">{matchPrediction.aiAnalysis.reasoning}</p>
              </div>

              {matchPrediction.aiAnalysis.matchedSkills?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchPrediction.aiAnalysis.matchedSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchPrediction.aiAnalysis.missingSkills?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchPrediction.aiAnalysis.missingSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchPrediction.aiAnalysis.recommendations && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    Recommendations
                  </h3>
                  <p className="text-gray-700">{matchPrediction.aiAnalysis.recommendations}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={applyToInternship}
                disabled={loading}
                className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Applying...' : 'Apply Now'}
              </button>
              <button
                onClick={() => {
                  setSelectedInternship(null);
                  setMatchPrediction(null);
                }}
                className="flex-1 btn-secondary py-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

// Internship APIs
export const internshipAPI = {
  getAll: () => api.get('/internships'),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  getMyPostings: () => api.get('/internships/my/postings'),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
};

// Application APIs
export const applicationAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/applications/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  predictMatch: (internshipId) => api.get(`/applications/predict-match/${internshipId}`),
  generateCoverLetter: (internshipId) => api.post(`/applications/generate-cover-letter/${internshipId}`),
  apply: (internshipId, data) => api.post(`/applications/apply/${internshipId}`, data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getInternshipApplications: (internshipId) => api.get(`/applications/internship/${internshipId}`),
  updateStatus: (applicationId, data) => api.put(`/applications/${applicationId}/status`, data),
};

export default api;

App.css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}


App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import { Briefcase } from 'lucide-react';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'} />;
  }

  return children;
}

// Home Page
function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/employer/dashboard'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Briefcase className="w-20 h-20 text-primary-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">SkillSync AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The Intelligent Bridge Between Talent and Opportunity
          </p>

          <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
            Eliminate the inefficiencies of traditional job portals with AI-powered matching. 
            Get instant compatibility scores, personalized feedback, and connect with opportunities that truly fit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="/register" className="btn-primary text-lg px-8 py-4">
              Get Started
            </a>
            <a href="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI analyzes your resume and provides 0-100% compatibility scores for every job
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gap Analysis</h3>
              <p className="text-gray-600">
                Get personalized feedback on skill gaps and actionable recommendations
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600">
                No more spray-and-pray applications. Know your match before you apply
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRole="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}

main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

index.html

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SkillSync AI - The Intelligent Bridge Between Talent and Opportunity</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

package.json

{
  "name": "skillsync-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}