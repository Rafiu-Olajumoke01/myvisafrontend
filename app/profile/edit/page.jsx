'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vh-root {
    min-height: 100vh;
    background: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    padding: 28px 20px 60px;
  }

  /* ── Header ── */
  .vh-header {
    max-width: 900px;
    margin: 0 auto 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .vh-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700;
    color: #0f172a; letter-spacing: -0.3px;
    margin-bottom: 3px;
  }
  .vh-subtitle { font-size: 12px; color: #94a3b8; }
  .vh-new-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    color: white; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(7,179,242,0.28);
    transition: opacity 0.2s, transform 0.15s;
  }
  .vh-new-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  /* ── Columns layout ── */
  .vh-columns {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .vh-columns { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .vh-columns { grid-template-columns: 1fr; }
  }

  /* ── Column ── */
  .vh-col {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8eaed;
    overflow: hidden;
  }
  .vh-col-header {
    padding: 14px 14px 12px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center;
    justify-content: space-between;
  }
  .vh-col-label {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 600; color: #0f172a;
  }
  .vh-col-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
  }
  .vh-col-count {
    font-size: 11px; font-weight: 700;
    padding: 2px 7px; border-radius: 999px;
  }
  .vh-col-body {
    padding: 10px;
    display: flex; flex-direction: column; gap: 8px;
    min-height: 80px;
  }

  /* ── App card inside column ── */
  .vh-app-card {
    background: #f8fafc;
    border: 1px solid #e8eaed;
    border-radius: 10px;
    padding: 11px 12px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
  }
  .vh-app-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 10px 0 0 10px;
  }
  .vh-app-card:hover {
    background: #fff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    transform: translateY(-1px);
    border-color: transparent;
  }
  .vh-app-card-name {
    font-size: 12px; font-weight: 600;
    color: #0f172a; line-height: 1.35;
    margin-bottom: 4px;
    padding-left: 6px;
  }
  .vh-app-card-ref {
    font-size: 10px; color: #94a3b8;
    padding-left: 6px; margin-bottom: 8px;
  }
  .vh-app-card-footer {
    display: flex; align-items: center;
    justify-content: space-between;
    padding-left: 6px;
  }
  .vh-app-card-date {
    font-size: 10px; color: #94a3b8;
    display: flex; align-items: center; gap: 3px;
  }
  .vh-app-card-arrow {
    width: 20px; height: 20px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: #f1f5f9; transition: background 0.15s;
  }
  .vh-app-card:hover .vh-app-card-arrow { background: #e0f7fe; }

  /* ── Empty col ── */
  .vh-col-empty {
    padding: 20px 10px;
    text-align: center;
  }
  .vh-col-empty p {
    font-size: 11px; color: #c4c9d4;
    font-style: italic;
  }

  /* ── Loading / Error / Empty full ── */
  .vh-center {
    max-width: 900px; margin: 60px auto 0;
    display: flex; flex-direction: column;
    align-items: center; gap: 12px;
    text-align: center;
  }
  @keyframes vh-spin { to { transform: rotate(360deg); } }
  .vh-spinner {
    width: 32px; height: 32px;
    border: 3px solid #e0f7fe;
    border-top-color: #07b3f2;
    border-radius: 50%;
    animation: vh-spin 0.8s linear infinite;
  }
  @keyframes vh-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .vh-appear { animation: vh-up 0.3s ease both; }
`;

const COLUMNS = [
  { key: 'started',     label: 'Started',    color: '#f59e0b', bg: '#fffbeb', countBg: '#fef3c7', countColor: '#d97706' },
  { key: 'processing',  label: 'Processing', color: '#07b3f2', bg: '#f0faff', countBg: '#e0f7fe', countColor: '#0284c7' },
  { key: 'completed',   label: 'Completed',  color: '#10b981', bg: '#f0fdf4', countBg: '#dcfce7', countColor: '#16a34a' },
  { key: 'rejected',    label: 'Rejected',   color: '#ef4444', bg: '#fff1f2', countBg: '#fee2e2', countColor: '#dc2626' },
];

function AppCard({ app, color, onClick }) {
  const createdDate = new Date(app.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });

  return (
    <div className="vh-app-card vh-appear" onClick={() => onClick(app.id)}
      style={{ '--card-color': color }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: color, borderRadius: '10px 0 0 10px',
      }} />
      <div className="vh-app-card-name">
        {app.package?.name || app.package?.country || 'Visa Application'}
      </div>
      <div className="vh-app-card-ref">#{app.id}</div>
      <div className="vh-app-card-footer">
        <span className="vh-app-card-date">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {createdDate}
        </span>
        <div className="vh-app-card-arrow">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
      {app.consultant_name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7, paddingLeft: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{app.consultant_name}</span>
        </div>
      )}
    </div>
  );
}

export default function VisaHistoryPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/applications/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load applications.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCol = (key) => applications.filter(a => a.status === key);
  const total = applications.length;

  return (
    <>
      <style>{S}</style>
      <div className="vh-root">

        {/* Header */}
        <div className="vh-header vh-appear">
          <div>
            <h1 className="vh-title">My Applications</h1>
            <p className="vh-subtitle">
              {total > 0 ? `${total} application${total !== 1 ? 's' : ''} total` : 'Track your visa journey'}
            </p>
          </div>
          <button className="vh-new-btn" onClick={() => router.push('/package')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
            New Application
          </button>
        </div>

        {loading ? (
          <div className="vh-center">
            <div className="vh-spinner" />
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Loading your applications…</p>
          </div>
        ) : error ? (
          <div className="vh-center">
            <p style={{ fontSize: 14, color: '#ef4444', fontWeight: 600 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{error}</p>
            <button onClick={fetchApplications} style={{ marginTop: 8, fontSize: 12, color: '#07b3f2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Try again
            </button>
          </div>
        ) : total === 0 ? (
          <div className="vh-center">
            <div style={{ width: 60, height: 60, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4c9d4" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>No applications yet</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Start your visa journey by browsing packages</p>
            <button className="vh-new-btn" style={{ marginTop: 8 }} onClick={() => router.push('/package')}>
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="vh-columns">
            {COLUMNS.map((col, ci) => {
              const apps = getCol(col.key);
              return (
                <div key={col.key} className="vh-col vh-appear" style={{ animationDelay: `${ci * 60}ms` }}>
                  <div className="vh-col-header" style={{ background: col.bg }}>
                    <div className="vh-col-label">
                      <div className="vh-col-dot" style={{ background: col.color }} />
                      {col.label}
                    </div>
                    <span className="vh-col-count" style={{ background: col.countBg, color: col.countColor }}>
                      {apps.length}
                    </span>
                  </div>
                  <div className="vh-col-body">
                    {apps.length === 0 ? (
                      <div className="vh-col-empty"><p>Nothing here yet</p></div>
                    ) : (
                      apps.map((app, i) => (
                        <div key={app.id} style={{ animationDelay: `${ci * 60 + i * 40}ms` }}>
                          <AppCard
                            app={app}
                            color={col.color}
                            onClick={id => router.push(`/applications/${id}`)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}