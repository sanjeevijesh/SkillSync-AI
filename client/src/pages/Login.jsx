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
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
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
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
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
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
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
                    className="group relative w-full py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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