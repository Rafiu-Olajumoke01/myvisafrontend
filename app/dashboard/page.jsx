'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', bg: 'bg-gray-100',    text: 'text-gray-500',  dot: 'bg-gray-400',              progress: 10  },
  started:     { label: 'In Progress', bg: 'bg-blue-50',     text: 'text-[#07b3f2]', dot: 'bg-[#07b3f2] animate-pulse', progress: 40  },
  processing:  { label: 'Processing',  bg: 'bg-amber-50',    text: 'text-amber-600', dot: 'bg-amber-400 animate-pulse', progress: 75  },
  completed:   { label: 'Completed',   bg: 'bg-green-50',    text: 'text-green-600', dot: 'bg-green-500',              progress: 100 },
  cancelled:   { label: 'Cancelled',   bg: 'bg-red-50',      text: 'text-red-500',   dot: 'bg-red-400',               progress: 0   },
};

const STATUS_EMOJI = {
  not_started: '🕐',
  started:     '⚡',
  processing:  '🔄',
  completed:   '✅',
  cancelled:   '❌',
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData]       = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      const [profileRes, appRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/auth/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://127.0.0.1:8000/api/applications/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.status === 401) { router.push('/login'); return; }
      if (profileRes.ok) setUserData(await profileRes.json());
      if (appRes.ok) {
        const data = await appRes.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!userData) return 'U';
    const name = userData.fullname || userData.username || '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatJoined = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Stats
  const totalApps      = applications.length;
  const completedApps  = applications.filter(a => a.status === 'completed').length;
  const activeApps     = applications.filter(a => ['started', 'processing'].includes(a.status)).length;
  const totalDocs      = applications.reduce((sum, a) => sum + (a.documents_count || 0), 0);

  // Filter
  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'started',   label: 'In Progress' },
    { key: 'processing',label: 'Processing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredApps = activeFilter === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f7f9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#07b3f2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7f9] pb-24 md:pb-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Navbar (desktop only — mobile uses bottom nav) ── */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-[#07b3f2]">MyVisa</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 hidden md:block">
            {userData?.fullname || userData?.username}
          </span>
          <div className="w-9 h-9 rounded-full bg-[#07b3f2] flex items-center justify-center text-white font-bold text-sm">
            {getInitials()}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto mt-6 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: Profile ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#e8f6fd] rounded-3xl mx-auto flex items-center justify-center text-2xl font-black text-[#07b3f2] mb-3">
                  {getInitials()}
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  {userData?.fullname || userData?.username}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{userData?.email}</p>
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="mt-4 w-full py-2 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                {userData?.country && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span>📍</span> {userData.country}
                  </div>
                )}
                {userData?.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span>📞</span> {userData.phone}
                  </div>
                )}
                {userData?.date_joined && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span>🗓️</span> Joined {formatJoined(userData.date_joined)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#07b3f2] rounded-2xl p-4 text-white shadow-lg shadow-[#07b3f2]/20">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Total</p>
                <p className="text-3xl font-black mt-1">{String(totalApps).padStart(2, '0')}</p>
                <p className="text-white/60 text-[10px] mt-1">Applications</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Done</p>
                <p className="text-3xl font-black mt-1 text-green-500">{String(completedApps).padStart(2, '0')}</p>
                <p className="text-[10px] text-gray-400 mt-1">Completed</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Active</p>
                <p className="text-3xl font-black mt-1 text-amber-500">{String(activeApps).padStart(2, '0')}</p>
                <p className="text-[10px] text-gray-400 mt-1">In Progress</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Docs</p>
                <p className="text-3xl font-black mt-1 text-gray-900">{String(totalDocs).padStart(2, '0')}</p>
                <p className="text-[10px] text-gray-400 mt-1">Uploaded</p>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Account Info</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Username</span>
                  <span className="text-xs font-bold text-gray-800">{userData?.username}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{userData?.email}</span>
                </div>
                {userData?.phone && (
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-gray-500">Phone</span>
                    <span className="text-xs font-bold text-gray-800">{userData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Applications History ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Welcome Banner */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Welcome Back</p>
                <h3 className="text-2xl font-black text-gray-900">
                  {userData?.fullname?.split(' ')[0] || userData?.username} 👋
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {totalApps > 0
                    ? `You have ${totalApps} visa application${totalApps > 1 ? 's' : ''}`
                    : 'Ready to start your visa journey?'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1.5 rounded-full bg-[#07b3f2]/10 text-[#07b3f2] text-xs font-bold">
                  ✓ Verified
                </span>
                <button
                  onClick={() => router.push('/package')}
                  className="px-4 py-1.5 rounded-full bg-[#07b3f2] text-white text-xs font-bold hover:bg-[#0596cf] transition-all"
                >
                  + New Application
                </button>
              </div>
            </div>

            {/* Applications History */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">My Visa Applications</p>
                <span className="text-xs font-bold text-gray-400">{totalApps} total</span>
              </div>

              {/* Filter Tabs */}
              {totalApps > 0 && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                        ${activeFilter === f.key
                          ? 'bg-[#07b3f2] text-white shadow-md shadow-[#07b3f2]/25'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Applications List */}
              {filteredApps.length === 0 && totalApps === 0 ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-16 h-16 rounded-3xl bg-[#e8f6fd] flex items-center justify-center text-3xl mb-4">🌍</div>
                  <p className="text-base font-black text-gray-800">No applications yet</p>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs leading-relaxed">
                    Browse our visa packages and start your application to study or travel abroad.
                  </p>
                  <button
                    onClick={() => router.push('/package')}
                    className="mt-5 px-8 py-3 bg-[#07b3f2] text-white text-sm font-bold rounded-2xl hover:bg-[#0596cf] transition-all shadow-lg shadow-[#07b3f2]/25 active:scale-95"
                  >
                    Browse Packages →
                  </button>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-gray-400">No {activeFilter} applications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map((app, idx) => {
                    const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.not_started;
                    const emoji  = STATUS_EMOJI[app.status] || '📄';
                    return (
                      <div
                        key={app.id}
                        onClick={() => router.push(`/application/${app.id}`)}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[#07b3f2]/30 hover:bg-[#f8fbff] transition-all cursor-pointer group"
                      >
                        {/* Emoji icon */}
                        <div className="w-11 h-11 rounded-2xl bg-[#f3f7f9] flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-[#e8f6fd] transition-all">
                          {emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-black text-gray-900 truncate">
                              {app.package_country} — {app.package_title}
                            </p>
                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="bg-gray-100 rounded-full h-1.5 mb-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all duration-700"
                              style={{
                                width: `${status.progress}%`,
                                background: app.status === 'completed' ? '#22c55e'
                                  : app.status === 'cancelled' ? '#ef4444'
                                  : '#07b3f2'
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-gray-400">
                              {app.submitted_at ? `Applied ${formatDate(app.submitted_at)}` : 'Draft'}
                            </p>
                            <p className="text-[10px] font-bold text-[#07b3f2] group-hover:underline">
                              View →
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}