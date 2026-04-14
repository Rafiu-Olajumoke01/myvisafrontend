'use client';
import React, { useState, useEffect } from 'react';

const API = 'https://web-production-f50dc.up.railway.app/api';
function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' };
}

const STATUS_MAP = {
  not_started: { label: 'Not Started', dot: '#94a3b8', bg: 'rgba(148,163,184,0.12)', text: '#64748b' },
  started:     { label: 'Started',     dot: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  text: '#2563eb' },
  processing:  { label: 'Processing',  dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#d97706' },
  completed:   { label: 'Completed',   dot: '#10b981', bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .ov-root * { box-sizing: border-box; }

    .ov-root {
      font-family: 'DM Sans', sans-serif;
      --blue: #07b3f2;
      --blue-dark: #0284c7;
      --ink: #0a0f1e;
      --ink2: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --surface: #f8fafc;
      --white: #ffffff;
    }

    @keyframes ov-fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ov-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes ov-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    @keyframes ov-countUp {
      from { opacity: 0; transform: translateY(8px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .ov-fade { animation: ov-fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .ov-fade-1 { animation-delay: 0.04s; }
    .ov-fade-2 { animation-delay: 0.10s; }
    .ov-fade-3 { animation-delay: 0.16s; }
    .ov-fade-4 { animation-delay: 0.22s; }
    .ov-fade-5 { animation-delay: 0.28s; }
    .ov-fade-6 { animation-delay: 0.34s; }
    .ov-fade-7 { animation-delay: 0.40s; }

    .ov-stat-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px 22px 20px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .ov-stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(7,179,242,0.10);
    }
    .ov-stat-card.hero {
      background: linear-gradient(135deg, #07b3f2 0%, #0369a1 100%);
      border-color: transparent;
      grid-column: span 2;
    }
    .ov-stat-card.hero:hover {
      box-shadow: 0 16px 40px rgba(7,179,242,0.35);
    }
    .ov-stat-accent {
      position: absolute;
      top: -20px; right: -20px;
      width: 90px; height: 90px;
      border-radius: 50%;
      opacity: 0.08;
    }
    .ov-stat-num {
      font-family: 'Instrument Serif', serif;
      font-size: 42px;
      line-height: 1;
      letter-spacing: -0.02em;
      animation: ov-countUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    }
    .ov-stat-label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .ov-stat-bar {
      height: 3px;
      border-radius: 999px;
      margin-top: 16px;
      background: var(--border);
      overflow: hidden;
    }
    .ov-stat-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 1s cubic-bezier(0.22,1,0.36,1);
    }

    .ov-table-row {
      transition: background 0.15s;
    }
    .ov-table-row:hover { background: #f8fafc; }

    .ov-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px 3px 7px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .ov-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .ov-header-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 28px;
    }
    .ov-greeting {
      font-family: 'Instrument Serif', serif;
      font-size: 32px;
      color: var(--ink);
      line-height: 1.1;
    }
    .ov-greeting em {
      font-style: italic;
      color: var(--blue);
    }
    .ov-date {
      font-size: 12px;
      color: var(--muted);
      font-weight: 500;
    }
    .ov-live-dot {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #10b981;
      margin-right: 6px;
      animation: ov-pulse 1.8s ease-in-out infinite;
    }

    .ov-section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink2);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ov-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .ov-avatar {
      width: 34px; height: 34px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: white;
      flex-shrink: 0;
    }

    .ov-empty {
      padding: 48px 20px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
    }
    .ov-empty-icon { font-size: 32px; margin-bottom: 10px; }

    .ov-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% auto;
      animation: ov-shimmer 1.4s linear infinite;
      border-radius: 8px;
    }
  `}</style>
);

const avatarColors = ['#07b3f2','#0284c7','#7c3aed','#059669','#f59e0b','#ef4444','#ec4899'];
const initials = name => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [appsRes, usersRes] = await Promise.all([
        fetch(`${API}/applications/admin/all/`, { headers: authHeaders() }),
        fetch(`${API}/auth/admin/users/`, { headers: authHeaders() }),
      ]);
      const appsData = await appsRes.json();
      const usersData = await usersRes.json();
      const apps = appsData.applications || [];
      const users = usersData.users || [];

      setStats({
        total:       apps.length,
        not_started: apps.filter(a => a.status === 'not_started').length,
        started:     apps.filter(a => a.status === 'started').length,
        processing:  apps.filter(a => a.status === 'processing').length,
        completed:   apps.filter(a => a.status === 'completed').length,
        students:    users.length,
      });
      setRecentApps(apps.slice(0, 8));
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="ov-root" style={{ padding: '32px 0' }}>
        <GlobalStyles />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} className="ov-skeleton" style={{ height: 120, borderRadius: 20 }} />
          ))}
        </div>
        <div className="ov-skeleton" style={{ height: 320, borderRadius: 20 }} />
      </div>
    );
  }

  const total = stats.total || 1;
  const statCards = [
    {
      hero: true,
      label: 'Total Applications',
      value: stats.total,
      sub: 'All time submissions',
      accent: '#ffffff',
      textColor: 'white',
      subColor: 'rgba(255,255,255,0.65)',
      barColor: 'rgba(255,255,255,0.4)',
      barFill: 'rgba(255,255,255,0.9)',
      barPct: 100,
      icon: '📋',
    },
    {
      label: 'Not Started',
      value: stats.not_started,
      sub: 'Awaiting action',
      accent: '#94a3b8',
      textColor: '#1e293b',
      subColor: '#94a3b8',
      barColor: '#f1f5f9',
      barFill: '#94a3b8',
      barPct: Math.round((stats.not_started / total) * 100),
      icon: '⏳',
    },
    {
      label: 'Started',
      value: stats.started,
      sub: 'In progress',
      accent: '#3b82f6',
      textColor: '#1e293b',
      subColor: '#94a3b8',
      barColor: '#f1f5f9',
      barFill: '#3b82f6',
      barPct: Math.round((stats.started / total) * 100),
      icon: '✏️',
    },
    {
      label: 'Processing',
      value: stats.processing,
      sub: 'Under review',
      accent: '#f59e0b',
      textColor: '#1e293b',
      subColor: '#94a3b8',
      barColor: '#fef3c7',
      barFill: '#f59e0b',
      barPct: Math.round((stats.processing / total) * 100),
      icon: '⚙️',
    },
    {
      label: 'Completed',
      value: stats.completed,
      sub: 'Successfully done',
      accent: '#10b981',
      textColor: '#1e293b',
      subColor: '#94a3b8',
      barColor: '#f0fdf4',
      barFill: '#10b981',
      barPct: Math.round((stats.completed / total) * 100),
      icon: '✅',
    },
    {
      label: 'Total Students',
      value: stats.students,
      sub: 'Registered users',
      accent: '#7c3aed',
      textColor: '#1e293b',
      subColor: '#94a3b8',
      barColor: '#f5f3ff',
      barFill: '#7c3aed',
      barPct: 100,
      icon: '🎓',
    },
  ];

  return (
    <div className="ov-root">
      <GlobalStyles />

      {/* Header */}
      <div className="ov-header-bar ov-fade">
        <div>
          <div className="ov-greeting">{greeting}, <em>Admin</em> 👋</div>
          <div className="ov-date" style={{ marginTop: 4 }}>
            <span className="ov-live-dot" />
            {dateStr} · {timeStr}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Platform health</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginTop: 2 }}>● All systems go</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {statCards.map((c, i) => (
          <div
            key={c.label}
            className={`ov-stat-card${c.hero ? ' hero' : ''} ov-fade ov-fade-${i + 1}`}
            style={c.hero ? { gridColumn: 'span 2' } : {}}
          >
            <div className="ov-stat-accent" style={{ background: c.accent }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="ov-stat-num" style={{ color: c.textColor, animationDelay: `${0.1 + i * 0.06}s` }}>
                  {c.value}
                </div>
                <div className="ov-stat-label" style={{ color: c.subColor }}>{c.label}</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: c.hero ? 'rgba(255,255,255,0.15)' : `${c.barColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {c.icon}
              </div>
            </div>

            <div className="ov-stat-bar" style={{ background: c.barColor, marginTop: c.hero ? 20 : 16 }}>
              <div className="ov-stat-bar-fill" style={{ width: `${c.barPct}%`, background: c.barFill }} />
            </div>

            {c.hero && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="ov-fade ov-fade-7" style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0f1e' }}>Recent Applications</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Latest {recentApps.length} submissions</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#07b3f2', background: '#e0f7fe', padding: '4px 12px', borderRadius: 999 }}>
            Live
          </div>
        </div>

        {recentApps.length === 0 ? (
          <div className="ov-empty">
            <div className="ov-empty-icon">📭</div>
            No applications yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Student', 'Package', 'Status', 'Submitted'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app, i) => {
                  const s = STATUS_MAP[app.status] || STATUS_MAP.not_started;
                  return (
                    <tr key={app.id} className="ov-table-row" style={{ borderTop: '1px solid #f8fafc' }}>
                      <td style={{ padding: '13px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="ov-avatar"
                            style={{ background: avatarColors[i % avatarColors.length] }}
                          >
                            {initials(app.full_name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{app.full_name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{app.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        {app.package_country || '—'}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span className="ov-badge" style={{ background: s.bg, color: s.text }}>
                          <span className="ov-badge-dot" style={{ background: s.dot }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                        {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}