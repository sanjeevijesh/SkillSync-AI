import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, applicationAPI } from '../utils/api';
import { Camera, Upload, Trash2, Save, User, Mail, Building, FileText, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const avatarRef = useRef();
  const resumeRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    try {
      const res = await profileAPI.uploadAvatar(file);
      updateUser({ avatar: res.data.avatar });
      showToast('Profile photo updated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to upload photo', 'error');
      setAvatarPreview(user?.avatar || '');
    }
    setAvatarLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update({ name, companyName });
      updateUser({ name: res.data.user.name, companyName: res.data.user.companyName });
      showToast('Profile saved!');
    } catch { showToast('Failed to save profile', 'error'); }
    setSaving(false);
  };

  const handleResumeUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showToast('Please upload a PDF file', 'error'); return; }
    setResumeLoading(true);
    try {
      const res = await applicationAPI.uploadResume(file);
      updateUser({ resumeUrl: 'uploaded', resumeFileName: file.name });
      if (res.data.quality) localStorage.setItem('resumeScore', JSON.stringify(res.data.quality));
      showToast('Resume updated!');
    } catch (err) { showToast(err.response?.data?.error || 'Failed to update resume', 'error'); }
    setResumeLoading(false);
  };

  const handleDeleteResume = async () => {
    setResumeLoading(true);
    try {
      await profileAPI.deleteResume();
      updateUser({ resumeUrl: '', resumeFileName: '' });
      localStorage.removeItem('resumeScore');
      setShowDeleteConfirm(false);
      showToast('Resume deleted');
    } catch { showToast('Failed to delete resume', 'error'); }
    setResumeLoading(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const dashboardPath = user?.role === 'student' ? '/student/dashboard' : '/employer/dashboard';

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <Link to={dashboardPath} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <h1 className="text-base font-semibold text-gray-900">My Profile</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Avatar + Account */}
            <div className="lg:col-span-1 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="relative inline-block mb-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => avatarRef.current.click()}
                    disabled={avatarLoading}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md transition-all disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <p className="font-semibold text-gray-900 text-base">{user?.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${user?.role === 'student' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-violet-50 text-violet-700 border border-violet-100'}`}>
                  {user?.role}
                </span>
                {user?.companyName && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <Building className="w-3 h-3" /> {user.companyName}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">Click camera icon to change photo</p>
              </div>

              {/* Account card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Account</h3>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span>Status</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span>Role</span>
                    <span className="capitalize font-medium text-gray-700">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Member since</span>
                    <span className="font-medium text-gray-700">2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Forms */}
            <div className="lg:col-span-2 space-y-4">

              {/* Personal Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-xs text-gray-400">Update your name and details</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="email" value={user?.email || ''} disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Email cannot be changed
                    </p>
                  </div>
                  {user?.role === 'employer' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Company Name</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleSaveProfile} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                      : <><Save className="w-4 h-4" />Save Changes</>
                    }
                  </button>
                </div>
              </div>

              {/* Resume — students only */}
              {user?.role === 'student' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">Resume</h2>
                      <p className="text-xs text-gray-400">Manage your resume for AI matching</p>
                    </div>
                  </div>
                  {user?.resumeUrl ? (
                    <div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
                        <div className="w-10 h-12 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.resumeFileName || 'resume.pdf'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {user?.resumeUploadedAt
                              ? `Uploaded ${new Date(user.resumeUploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
                              : 'Previously uploaded'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs text-green-600 font-medium">Active for AI matching</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => resumeRef.current.click()} disabled={resumeLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${resumeLoading ? 'animate-spin' : ''}`} />
                          Update Resume
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)} disabled={resumeLoading}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:border-red-300 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />Delete
                        </button>
                      </div>
                      <input ref={resumeRef} type="file" accept=".pdf" onChange={handleResumeUpdate} className="hidden" />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">No resume uploaded yet</p>
                      <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">Upload your resume to start getting AI-powered match scores</p>
                      <button
                        onClick={() => resumeRef.current.click()} disabled={resumeLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <Upload className="w-4 h-4" />{resumeLoading ? 'Uploading...' : 'Upload Resume'}
                      </button>
                      <p className="text-xs text-gray-400 mt-3">PDF format only</p>
                      <input ref={resumeRef} type="file" accept=".pdf" onChange={handleResumeUpdate} className="hidden" />
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal — outside main div so no nesting issues */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete Resume?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              This will permanently remove your resume and reset all AI match scores.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResume} disabled={resumeLoading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all disabled:opacity-50"
              >
                {resumeLoading ? 'Deleting...' : 'Delete Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}