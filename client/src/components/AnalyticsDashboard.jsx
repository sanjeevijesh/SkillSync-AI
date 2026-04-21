import { useState, useEffect } from 'react';
import { internshipAPI } from '../utils/api';
import {
  BarChart2, TrendingUp, Users, Target,
  Award, AlertCircle, X, RefreshCw
} from 'lucide-react';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`rounded-xl p-5 border ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-white/60">{icon}</div>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-36 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}{suffix}</span>
    </div>
  );
}

export default function AnalyticsDashboard({ show, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) loadAnalytics();
  }, [show]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await internshipAPI.getAnalytics();
      setData(res.data.analytics);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    }
    setLoading(false);
  };

  if (!show) return null;

  const scoreColors = {
    '0-20': 'bg-red-400',
    '21-40': 'bg-orange-400',
    '41-60': 'bg-yellow-400',
    '61-80': 'bg-blue-400',
    '81-100': 'bg-green-500',
  };

  const maxBucket = data ? Math.max(...Object.values(data.scoreBuckets), 1) : 1;
  const maxTrend = data ? Math.max(...data.trend.map(t => t.count), 1) : 1;
  const maxMissing = data?.topMissingSkills?.[0]?.count || 1;
  const maxDemanded = data?.topDemandedSkills?.[0]?.count || 1;
  const maxApps = data?.perInternship?.[0]?.applications || 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-5 rounded-t-2xl z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BarChart2 className="w-7 h-7" />
              Hiring Analytics
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">Real-time insights from your internship postings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAnalytics} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={loadAnalytics} className="mt-4 btn-primary">Try Again</button>
          </div>
        ) : data && (
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">

            {/* Overview stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              <StatCard icon={<BarChart2 className="w-6 h-6 text-blue-600" />} label="Total Postings" value={data.overview.totalInternships} sub={`${data.overview.activeInternships} active`} color="bg-blue-50 border-blue-200" />
              <StatCard icon={<Users className="w-6 h-6 text-green-600" />} label="Total Applications" value={data.overview.totalApplications} color="bg-green-50 border-green-200" />
              <StatCard icon={<Target className="w-6 h-6 text-purple-600" />} label="Avg Match Score" value={`${data.overview.avgMatchScore}%`} color="bg-purple-50 border-purple-200" />
              <StatCard icon={<Award className="w-6 h-6 text-yellow-600" />} label="Shortlist Rate" value={`${data.overview.shortlistRate}%`} sub="of all applicants" color="bg-yellow-50 border-yellow-200" />
              <StatCard icon={<TrendingUp className="w-6 h-6 text-indigo-600" />} label="Pending Review" value={data.statusCount.pending} color="bg-indigo-50 border-indigo-200" />
            </div>

            {/* Application trend + Score distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

              {/* 7-day trend */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Applications This Week
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {data.trend.map((day, idx) => {
                    const heightPct = maxTrend > 0 ? (day.count / maxTrend) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-gray-600">{day.count > 0 ? day.count : ''}</span>
                        <div className="w-full bg-gray-100 rounded-t-md flex items-end" style={{ height: '80px' }}>
                          <div
                            className="w-full bg-indigo-500 rounded-t-md transition-all duration-700 hover:bg-indigo-600"
                            style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score distribution */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Match Score Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(data.scoreBuckets).map(([range, count]) => (
                    <BarRow
                      key={range}
                      label={`${range}%`}
                      value={count}
                      max={maxBucket}
                      color={scoreColors[range]}
                      suffix=" apps"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Applications per internship */}
            {data.perInternship.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  Applications per Posting
                </h3>
                <div className="space-y-4">
                  {data.perInternship.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="text-blue-600 font-semibold">{item.applications} apps</span>
                          <span className="text-green-600 font-semibold">{item.shortlisted} shortlisted</span>
                          <span className="text-purple-600 font-semibold">avg {item.avgScore}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${maxApps > 0 ? (item.applications / maxApps) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

              {/* Most demanded skills */}
              {data.topDemandedSkills.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" />
                    Skills You Demand Most
                  </h3>
                  <div className="space-y-3">
                    {data.topDemandedSkills.map((item, idx) => (
                      <BarRow
                        key={idx}
                        label={item.skill}
                        value={item.count}
                        max={maxDemanded}
                        color="bg-green-500"
                        suffix=" jobs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Top missing skills across applicants */}
              {data.topMissingSkills.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Skill Gaps in Applicants
                    <span className="text-xs text-gray-400 font-normal ml-1">most commonly missing</span>
                  </h3>
                  <div className="space-y-3">
                    {data.topMissingSkills.map((item, idx) => (
                      <BarRow
                        key={idx}
                        label={item.skill}
                        value={item.count}
                        max={maxMissing}
                        color="bg-red-400"
                        suffix=" apps"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Consider running workshops or lowering the bar on these skills to get more qualified applicants.
                  </p>
                </div>
              )}
            </div>

            {/* Status breakdown pills */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Application Status Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800 border-green-200' },
                  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
                  { key: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                ].map(({ key, label, color }) => (
                  <div key={key} className={`rounded-xl border p-4 text-center ${color}`}>
                    <p className="text-3xl font-bold">{data.statusCount[key] || 0}</p>
                    <p className="text-sm font-medium mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}