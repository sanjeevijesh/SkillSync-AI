import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowRight, CheckCircle, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                SkillSync<span className="text-cyan-400">AI</span>
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur group-hover:opacity-30 transition duration-500"></div>
            
            {/* Card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {!success ? (
                <>
                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-slate-400 text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm animate-shake">
                        {error}
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link
                      to="/login"
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center group"
                    >
                      <ArrowRight className="mr-1 w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Back to Login
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Check Your Email 📧</h2>
                  <p className="text-slate-300 leading-relaxed">
                    If an account exists with <strong className="text-white">{email}</strong>, you will receive a password reset link shortly.
                  </p>
                  <p className="text-slate-400 text-sm">
                    Don't see the email? Check your spam folder.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                  >
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}