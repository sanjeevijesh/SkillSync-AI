import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { internshipAPI, applicationAPI, featureAPI } from '../utils/api';
import { Plus, Briefcase, Users, TrendingUp, Eye, Trash2, EyeOff, Trophy, Medal, BarChart2, Sparkles, X } from 'lucide-react';
import Watermark from '../components/Watermark';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [myInternships, setMyInternships] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [selectedInternshipTitle, setSelectedInternshipTitle] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [improvingDesc, setImprovingDesc] = useState(false);
  const [improvedDesc, setImprovedDesc] = useState('');
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', duration: '',
    stipend: '', description: '', requiredSkills: '', experienceLevel: 'beginner'
  });

  useEffect(() => { loadMyInternships(); }, []);

  const loadMyInternships = async () => {
    try {
      const r = await internshipAPI.getMyPostings();
      const list = r.data?.items || r.data?.internships || r.data || [];
      setMyInternships(Array.isArray(list) ? list : []);
    } catch { setMyInternships([]); }
  };

  const loadApplications = async (id, title) => {
    try {
      const r = await applicationAPI.getInternshipApplications(id);
      const list = r.data?.applications || r.data || [];
      setApplications([...(Array.isArray(list) ? list : [])].sort((a, b) => b.matchScore - a.matchScore));
      setSelectedInternship(id);
      setSelectedInternshipTitle(title);
    } catch { setApplications([]); }
  };

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImproveDescription = async () => {
    if (!formData.description) return;
    setImprovingDesc(true);
    try {
      const res = await featureAPI.improveDescription({ description: formData.description, title: formData.title, requiredSkills: formData.requiredSkills });
      setImprovedDesc(res.data.improved);
    } catch { alert('Failed to improve description. Try again.'); }
    setImprovingDesc(false);
  };

  const applyImprovedDesc = () => {
    setFormData(p => ({ ...p, description: improvedDesc }));
    setImprovedDesc('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await internshipAPI.create({ ...formData, requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) });
      alert('Internship posted!');
      setFormData({ title: '', company: '', location: '', duration: '', stipend: '', description: '', requiredSkills: '', experienceLevel: 'beginner' });
      setShowCreateForm(false);
      loadMyInternships();
    } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try { await internshipAPI.delete(id); loadMyInternships(); }
    catch (err) { alert('Failed: ' + (err.response?.data?.error || 'Unknown error')); }
  };

  const updateStatus = async (appId, status, feedback = '') => {
    try { await applicationAPI.updateStatus(appId, status, feedback); loadApplications(selectedInternship, selectedInternshipTitle); }
    catch (err) { alert('Failed: ' + (err.response?.data?.error || 'Unknown error')); }
  };

  const closeModal = () => { setSelectedInternship(null); setSelectedInternshipTitle(''); setApplications([]); setBlindMode(false); };

  const statusCls = (s) => s === 'pending' ? 'bg-yellow-100 text-yellow-800' : s === 'shortlisted' ? 'bg-green-100 text-green-800' : s === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  const matchCls = (n) => n >= 80 ? 'text-green-600' : n >= 60 ? 'text-yellow-600' : 'text-red-600';
  const barCls = (n) => n >= 80 ? 'bg-green-500' : n >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  const rankBadge = (i) => {
    if (i === 0) return { icon: <Trophy className="w-4 h-4" />, cls: 'bg-yellow-100 text-yellow-700 border-yellow-300', lbl: '#1' };
    if (i === 1) return { icon: <Medal className="w-4 h-4" />, cls: 'bg-gray-100 text-gray-600 border-gray-300', lbl: '#2' };
    if (i === 2) return { icon: <Medal className="w-4 h-4" />, cls: 'bg-orange-100 text-orange-600 border-orange-300', lbl: '#3' };
    return { icon: null, cls: 'bg-white text-gray-500 border-gray-200', lbl: `#${i + 1}` };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Watermark />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Employer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => setShowAnalytics(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
              <BarChart2 className="w-5 h-5" /><span>View Analytics</span>
            </button>
            <button onClick={() => setShowCreateForm(v => !v)} className="btn-primary flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /><span>Post New Internship</span>
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="card mb-8 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Post New Internship</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['title','Job Title','e.g., Frontend Developer Intern'],['company','Company Name','e.g., Tech Corp'],['location','Location','e.g., Remote'],['duration','Duration','e.g., 3 months'],['stipend','Stipend','e.g., Rs.10,000/month']].map(([name,label,ph]) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} *</label>
                    <input type="text" name={name} value={formData[name]} onChange={handleInputChange} required className="input-field" placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level *</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} className="input-field">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills * (comma separated)</label>
                <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleInputChange} required className="input-field" placeholder="e.g., React, Node.js" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="input-field" placeholder="Describe the role..." />
                <button type="button" onClick={handleImproveDescription} disabled={improvingDesc || !formData.description} className="mt-1.5 flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-40 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />{improvingDesc ? 'Improving...' : 'AI: Improve this description'}
                </button>
                {improvedDesc && (
                  <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-xs font-semibold text-purple-700 mb-2">AI Improved Version:</p>
                    <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mb-3">{improvedDesc}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={applyImprovedDesc} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all">Use this</button>
                      <button type="button" onClick={() => setImprovedDesc('')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all">Discard</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">{loading ? 'Posting...' : 'Post Internship'}</button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Total Internships</p><p className="text-3xl font-bold text-blue-600">{myInternships.length}</p></div>
              <Briefcase className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p><p className="text-3xl font-bold text-green-600">{myInternships.reduce((s, i) => s + (i.applicationCount || 0), 0)}</p></div>
              <Users className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600 dark:text-gray-400">Active Postings</p><p className="text-3xl font-bold text-purple-600">{myInternships.filter(i => i.isActive).length}</p></div>
              <TrendingUp className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">My Internship Postings</h2>
          {myInternships.length === 0 ? (
            <div className="card text-center py-12 dark:bg-gray-800 dark:border-gray-700">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No internships posted yet</h3>
              <button onClick={() => setShowCreateForm(true)} className="btn-primary mt-2">Post Internship</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {myInternships.map((internship) => (
                <div key={internship._id} className="card hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">{internship.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${internship.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{internship.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p className="text-primary-600 font-medium">{internship.company}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{internship.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {internship.requiredSkills?.map((s, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s}</span>)}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>📍 {internship.location}</span>
                        <span>⏰ {internship.duration}</span>
                        <span>💰 {internship.stipend}</span>
                        <span>📊 {internship.applicationCount || 0} applications</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => loadApplications(internship._id, internship.title)} className="btn-primary text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" /><span>View Applications</span>
                      </button>
                      <button onClick={() => handleDelete(internship._id)} className="btn-secondary text-sm flex items-center gap-2 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /><span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 sm:px-8 py-5 rounded-t-xl z-10">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedInternshipTitle}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">{applications.length} applicant{applications.length !== 1 ? 's' : ''} — ranked by AI match score</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => setBlindMode(v => !v)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${blindMode ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 text-gray-600 hover:border-purple-400'}`}>
                    {blindMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="hidden sm:inline">{blindMode ? 'Blind ON' : 'Blind Mode'}</span>
                  </button>
                  <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-bold">✕</button>
                </div>
              </div>
              {blindMode && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 rounded-lg flex items-start gap-2">
                  <EyeOff className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-800 dark:text-purple-200"><strong>Blind Screening ON</strong> — Names hidden. Decisions based on AI scores only.</p>
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app, idx) => {
                    const rank = rankBadge(idx);
                    return (
                      <div key={app._id} className={`border-2 rounded-xl p-5 ${idx === 0 ? 'border-yellow-200 bg-yellow-50/30' : idx === 1 ? 'border-gray-200' : idx === 2 ? 'border-orange-200' : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-bold flex-shrink-0 ${rank.cls}`}>
                              {rank.icon}<span>{rank.lbl}</span>
                            </div>
                            {blindMode ? (
                              <div>
                                <div className="w-28 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1.5" />
                                <div className="w-36 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{app.applicant?.name || 'Applicant'}</h3>
                                <p className="text-gray-500 text-sm">{app.applicant?.email || 'No email'}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-3xl font-bold ${matchCls(app.matchScore)}`}>{app.matchScore}%</div>
                            {app.matchScore >= 85 && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                                <Trophy className="w-3 h-3" /> Top Match
                              </span>
                            )}
                            <p className="text-xs text-gray-500">AI Match Score</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
                          <div className={`${barCls(app.matchScore)} h-2 rounded-full`} style={{ width: `${app.matchScore}%` }} />
                        </div>
                        {app.aiAnalysis?.reasoning && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{app.aiAnalysis.reasoning}</p>
                          </div>
                        )}
                        {(app.aiAnalysis?.matchedSkills?.length > 0 || app.aiAnalysis?.missingSkills?.length > 0) && (
                          <div className="flex flex-wrap gap-4 mb-4">
                            {app.aiAnalysis?.matchedSkills?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-green-700 mb-1">Has</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.aiAnalysis.matchedSkills.slice(0, 5).map((s, i) => <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{s}</span>)}
                                </div>
                              </div>
                            )}
                            {app.aiAnalysis?.missingSkills?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-red-600 mb-1">Missing</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.aiAnalysis.missingSkills.slice(0, 4).map((s, i) => <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{s}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusCls(app.status)}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                          <span className="text-sm text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => updateStatus(app._id, 'shortlisted')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium">Shortlist</button>
                            <button onClick={() => { const f = prompt('Rejection feedback (optional):'); updateStatus(app._id, 'rejected', f || ''); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium">Reject</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AnalyticsDashboard show={showAnalytics} onClose={() => setShowAnalytics(false)} />
    </div>
  );
}