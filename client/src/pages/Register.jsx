import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, AlertCircle, ArrowRight, Check, Briefcase, GraduationCap } from 'lucide-react';
import Watermark from '../components/Watermark';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [step, setStep] = useState(1);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };
  const handleRoleSelect = (role) => { setFormData({ ...formData, role }); setTimeout(() => setStep(2), 300); };
  const handleBack = () => { setStep(1); setFormData({ ...formData, role: '' }); };

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
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <Watermark />

      {/* Same background as homepage hero */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="SkillSync AI"
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-bold text-white tracking-tight">
                SkillSync<span className="text-cyan-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${
                  step >= 1 ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/20 text-gray-500'
                }`}>
                  {step > 1 ? <Check className="w-3.5 h-3.5 text-blue-400" /> : '1'}
                </div>
                <span className={`text-sm font-medium hidden sm:block transition-colors ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>Role</span>
              </div>
              <div className={`w-12 h-px transition-all duration-500 ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${
                  step >= 2 ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/20 text-gray-500'
                }`}>2</div>
                <span className={`text-sm font-medium hidden sm:block transition-colors ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>Details</span>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose your path</h2>
                  <p className="text-gray-400 text-sm">Select how you'll be using SkillSync AI</p>
                </div>

                {/* Student */}
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="group w-full p-5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-1">I'm a Student</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Find internships with AI-powered matching, get instant feedback, and discover opportunities that fit your skills.</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs rounded-full">Resume Analysis</span>
                        <span className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs rounded-full">Smart Matching</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>

                {/* Employer */}
                <button
                  onClick={() => handleRoleSelect('employer')}
                  className="group w-full p-5 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/40 rounded-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                      <Briefcase className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-1">I'm an Employer</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Hire top talent with AI-ranked applicants, save 90% screening time, and find candidates that truly fit.</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-0.5 bg-violet-500/15 border border-violet-500/20 text-violet-400 text-xs rounded-full">Ranked Applicants</span>
                        <span className="px-2 py-0.5 bg-violet-500/15 border border-violet-500/20 text-violet-400 text-xs rounded-full">Smart Filtering</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>

                <p className="text-center text-sm text-gray-500 pt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
                </p>
              </div>
            )}

            {/* Step 2: Details Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.role === 'student' ? 'bg-blue-500/20' : 'bg-violet-500/20'}`}>
                      {formData.role === 'student'
                        ? <GraduationCap className="w-4 h-4 text-blue-400" />
                        : <Briefcase className="w-4 h-4 text-violet-400" />}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${formData.role === 'student' ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-500/15 text-violet-400'}`}>
                      {formData.role === 'student' ? 'Student Account' : 'Employer Account'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Complete your profile</h2>
                  <p className="text-gray-400 text-sm">Fill in your details to get started</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Registration failed</p>
                      <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'name' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm"
                      placeholder="Your full name" required
                    />
                  </div>
                </div>

                {/* Company Name — employers only */}
                {formData.role === 'employer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'company' ? 'text-violet-400' : 'text-gray-500'}`} />
                      <input
                        type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                        onFocus={() => setFocusedField('company')} onBlur={() => setFocusedField('')}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all text-sm"
                        placeholder="Your company name" required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm"
                      placeholder="you@example.com" required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <input
                      type="password" name="password" value={formData.password} onChange={handleChange}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm"
                      placeholder="Minimum 6 characters" minLength="6" required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={handleBack}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="group flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Built by */}
          <p className="text-center text-xs text-gray-600 mt-6">
            Built by <span className="text-gray-500 font-medium">Sanjeev Vijesh</span> · By registering you agree to our Terms and Privacy Policy
          </p>

        </div>
      </div>
    </div>
  );
}