'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vp-root {
    min-height: 100vh;
    background: #f4f5f7;
    font-family: 'DM Sans', sans-serif;
    padding: 32px 24px 64px;
  }

  /* ── Header ── */
  .vp-header {
    max-width: 1040px;
    margin: 0 auto 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }
  .vp-eyebrow {
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #07b3f2; margin-bottom: 6px;
  }
  .vp-title {
    font-family: 'Fraunces', serif;
    font-size: 30px; font-weight: 900;
    color: #0d1117; letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .vp-subtitle {
    font-size: 13px; color: #6b7280;
    margin-top: 5px; font-weight: 400;
  }
  .vp-new-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 12px; border: none;
    background: #0d1117;
    color: white; font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .vp-new-btn:hover { background: #07b3f2; transform: translateY(-1px); }

  /* ── Board ── */
  .vp-board {
    max-width: 1040px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    align-items: start;
  }
  @media (max-width: 1000px) { .vp-board { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 660px)  { .vp-board { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 420px)  { .vp-board { grid-template-columns: 1fr; } }

  /* ── Column ── */
  .vp-col {
    background: #fff;
    border-radius: 18px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .vp-col-head {
    padding: 14px 16px 12px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #f3f4f6;
  }
  .vp-col-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: #374151;
  }
  .vp-col-pip {
    width: 7px; height: 7px;
    border-radius: 50%; flex-shrink: 0;
  }
  .vp-col-count {
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
    font-family: 'DM Sans', sans-serif;
  }
  .vp-col-body {
    padding: 10px;
    display: flex; flex-direction: column; gap: 8px;
    min-height: 80px;
  }

  /* ── App card ── */
  .vp-card {
    position: relative;
    background: #fafafa;
    border: 1px solid #e9ebee;
    border-radius: 13px;
    padding: 13px 13px 12px 16px;
    overflow: hidden;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.18s, transform 0.15s, border-color 0.15s;
  }
  .vp-card:hover {
    background: #fff;
    border-color: #d1d5db;
    box-shadow: 0 6px 20px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }
  .vp-card-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 13px 0 0 13px;
  }
  .vp-card-title {
    font-size: 12px; font-weight: 600;
    color: #111827; line-height: 1.4;
    margin-bottom: 3px;
  }
  .vp-card-country {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; color: #6b7280;
    margin-bottom: 4px;
  }
  .vp-card-id {
    font-size: 10px; color: #9ca3af;
    margin-bottom: 10px;
  }
  .vp-card-footer {
    display: flex; align-items: center;
    justify-content: space-between;
  }
  .vp-card-date {
    display: flex; align-items: center; gap: 3px;
    font-size: 10px; color: #9ca3af;
  }
  .vp-card-arrow {
    width: 22px; height: 22px;
    border-radius: 7px; background: #f3f4f6;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .vp-card:hover .vp-card-arrow { background: #dbeafe; }
  .vp-card-docs {
    display: flex; align-items: center; gap: 4px;
    font-size: 10px; color: #9ca3af;
    margin-top: 8px; padding-top: 8px;
    border-top: 1px solid #f3f4f6;
  }

  /* ── Start button ── */
  .vp-start {
    width: 100%; margin-top: 10px;
    padding: 8px 0; border-radius: 9px; border: none;
    background: #07b3f2;
    color: white; font-size: 11px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    letter-spacing: 0.03em;
    transition: background 0.15s, transform 0.15s, opacity 0.15s;
  }
  .vp-start:hover:not(:disabled) { background: #0284c7; transform: translateY(-1px); }
  .vp-start:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; transform: none; }

  /* ── Empty col ── */
  .vp-empty {
    padding: 28px 12px; text-align: center;
  }
  .vp-empty-ring {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px dashed #e5e7eb;
    margin: 0 auto 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .vp-empty p { font-size: 11px; color: #d1d5db; }

  /* ── Full-page states ── */
  .vp-state {
    max-width: 1040px; margin: 100px auto 0;
    display: flex; flex-direction: column;
    align-items: center; gap: 14px; text-align: center;
  }
  .vp-state-circle {
    width: 64px; height: 64px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }

  @keyframes vp-spin { to { transform: rotate(360deg); } }
  .vp-spinner {
    width: 36px; height: 36px;
    border: 3px solid #dbeafe; border-top-color: #07b3f2;
    border-radius: 50%; animation: vp-spin 0.8s linear infinite;
  }
  .vp-mini-spin {
    width: 11px; height: 11px;
    border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
    border-radius: 50%; animation: vp-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes vp-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vp-appear { animation: vp-up 0.3s ease both; }

  .vp-link-btn {
    font-size: 12px; color: #07b3f2;
    background: none; border: none; cursor: pointer;
    text-decoration: underline; font-family: 'DM Sans', sans-serif;
  }
`;

const COLS = [
  {
    key: 'not_started', label: 'Not Started',
    color: '#94a3b8', headBg: '#f8fafc',
    badgeBg: '#f1f5f9', badgeColor: '#64748b',
  },
  {
    key: 'started', label: 'Started',
    color: '#f59e0b', headBg: '#fffbeb',
    badgeBg: '#fef9c3', badgeColor: '#b45309',
  },
  {
    key: 'processing', label: 'Processing',
    color: '#07b3f2', headBg: '#f0f9ff',
    badgeBg: '#dbeafe', badgeColor: '#0284c7',
  },
  {
    key: 'completed', label: 'Completed',
    color: '#10b981', headBg: '#f0fdf4',
    badgeBg: '#dcfce7', badgeColor: '#059669',
  },
  {
    key: 'rejected', label: 'Rejected',
    color: '#ef4444', headBg: '#fff1f2',
    badgeBg: '#fee2e2', badgeColor: '#dc2626',
  },
];

function Card({ app, color, onOpen, onStart, isStarting }) {
  const isNotStarted = app.status === 'not_started';
  const title   = app.package_title   || 'Visa Application';
  const country = app.package_country || '';
  const date    = app.submitted_at
    ? new Date(app.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
    : '—';

  return (
    <div className="vp-card vp-appear">
      <div className="vp-card-accent" style={{ background: color }} />

      <div className="vp-card-title">{title}</div>
      {country && (
        <div className="vp-card-country">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {country}
        </div>
      )}
      <div className="vp-card-id">#{app.id} · {app.full_name}</div>

      <div className="vp-card-footer" onClick={() => onOpen(app.id)} style={{ cursor: 'pointer' }}>
        <span className="vp-card-date">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {date}
        </span>
        <div className="vp-card-arrow">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {app.documents_count > 0 && (
        <div className="vp-card-docs">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {app.documents_count} doc{app.documents_count !== 1 ? 's' : ''} uploaded
        </div>
      )}

      {isNotStarted && (
        <button
          className="vp-start"
          disabled={isStarting}
          onClick={e => { e.stopPropagation(); onStart(app.id); }}
        >
          {isStarting
            ? <><div className="vp-mini-spin" /> Starting…</>
            : <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
                Start Application
              </>
          }
        </button>
      )}
    </div>
  );
}

export default function MyVisaPage() {
  const router = useRouter();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [starting, setStarting] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('user')) { router.push('/login'); return; }
    load();
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('http://127.0.0.1:8000/api/applications/', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setApps(data.applications || []);
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setError('Could not load your applications.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleStart = async (appId) => {
    setStarting(prev => ({ ...prev, [appId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/applications/${appId}/start/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'started' } : a));
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to start application.');
      }
    } catch { alert('Network error. Please try again.'); }
    finally { setStarting(prev => ({ ...prev, [appId]: false })); }
  };

  const col = (key) => apps.filter(a => a.status === key);

  return (
    <>
      <style>{S}</style>
      <div className="vp-root">

        {/* Header */}
        <div className="vp-header vp-appear">
          <div>
            <p className="vp-eyebrow">Visa Journey</p>
            <h1 className="vp-title">My Applications</h1>
            <p className="vp-subtitle">
              {apps.length > 0
                ? `${apps.length} application${apps.length !== 1 ? 's' : ''} tracked`
                : 'All your visa applications in one place'}
            </p>
          </div>
          <button className="vp-new-btn" onClick={() => router.push('/package')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
            New Application
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="vp-state">
            <div className="vp-spinner" />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Fetching your applications…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="vp-state">
            <div className="vp-state-circle" style={{ background: '#fee2e2' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Something went wrong</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>{error}</p>
            <button className="vp-link-btn" onClick={load}>Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && apps.length === 0 && (
          <div className="vp-state">
            <div className="vp-state-circle" style={{ background: '#f3f4f6' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>No applications yet</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Start your journey by browsing available packages</p>
            <button className="vp-new-btn" style={{ marginTop: 4 }} onClick={() => router.push('/package')}>
              Browse Packages
            </button>
          </div>
        )}

        {/* Board */}
        {!loading && !error && apps.length > 0 && (
          <div className="vp-board">
            {COLS.map((c, ci) => {
              const items = col(c.key);
              return (
                <div key={c.key} className="vp-col vp-appear" style={{ animationDelay: `${ci * 60}ms` }}>
                  <div className="vp-col-head" style={{ background: c.headBg }}>
                    <div className="vp-col-label">
                      <div className="vp-col-pip" style={{ background: c.color }} />
                      {c.label}
                    </div>
                    <span className="vp-col-count" style={{ background: c.badgeBg, color: c.badgeColor }}>
                      {items.length}
                    </span>
                  </div>
                  <div className="vp-col-body">
                    {items.length === 0 ? (
                      <div className="vp-empty">
                        <div className="vp-empty-ring">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </div>
                        <p>Empty</p>
                      </div>
                    ) : (
                      items.map((app, i) => (
                        <div key={app.id} style={{ animationDelay: `${ci * 60 + i * 40}ms` }}>
                          <Card
                            app={app}
                            color={c.color}
                            onOpen={id => router.push(`/application/${id}`)}
                            onStart={handleStart}
                            isStarting={!!starting[app.id]}
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