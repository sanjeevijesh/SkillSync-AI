import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Email verification failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-3 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur group-hover:opacity-30 transition duration-500"></div>
            
            {/* Card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
              {status === 'verifying' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Loader className="w-16 h-16 text-cyan-400 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verifying Your Email</h2>
                  <p className="text-slate-400">Please wait while we verify your email address...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Email Verified! 🎉</h2>
                  <p className="text-slate-300">{message}</p>
                  <p className="text-slate-400 text-sm">Redirecting you to login...</p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                  >
                    Go to Login
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-12 h-12 text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                  <p className="text-slate-300">{message}</p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                      Go to Login
                    </Link>
                    <p className="text-slate-400 text-sm">
                      Need help?{' '}
                      <a href="mailto:support@skillsyncai.com" className="text-cyan-400 hover:text-cyan-300">
                        Contact Support
                      </a>
                    </p>
                  </div>
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

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}