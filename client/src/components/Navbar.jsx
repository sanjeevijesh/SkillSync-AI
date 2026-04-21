import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Moon, Sun, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const dropdownRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isHomePage = location.pathname === '/';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  if (isAuthPage) return null;

  const dashboardPath = user?.role === 'student' ? '/student/dashboard' : '/employer/dashboard';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img src="/logo.png" alt="SkillSync AI Logo" className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300" />
            <span className="text-lg font-bold text-white tracking-tight">
              SkillSync<span className="text-cyan-400">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashboardPath} className="text-slate-300 hover:text-white font-medium transition-colors text-sm relative group">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300" />
                </Link>

                {!isHomePage && (
                  <button onClick={toggle} className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white transition-colors" title={dark ? 'Light mode' : 'Dark mode'}>
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-full transition-all"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-white leading-none">{user.name}</span>
                      <span className="text-xs text-slate-400 capitalize leading-none mt-0.5">{user.role}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ animation: 'dropIn 0.2s ease-out' }}>
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-slate-700/50 bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                              {initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/15 text-cyan-400 text-xs rounded-full capitalize">{user.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all text-sm"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          View Profile
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all text-sm"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Edit Profile
                        </button>
                        <div className="h-px bg-slate-700/50 my-1.5" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {!isHomePage && (
                  <button onClick={toggle} className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white transition-colors">
                    {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-2">
            {!isHomePage && user && (
              <button onClick={toggle} className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white transition-colors">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all text-sm font-medium">Dashboard</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all text-sm font-medium">My Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/50 rounded-xl transition-all text-sm">
                  <LogOut className="w-4 h-4" /><span className="font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all text-sm font-medium">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-center text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
}