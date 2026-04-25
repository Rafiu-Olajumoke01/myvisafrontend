'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = {
  not_started: { label: 'Not Started', dot: '#94a3b8', bg: '#f1f5f9', color: '#64748b', progress: 0 },
  started:     { label: 'In Progress', dot: '#f59e0b', bg: '#fef9c3', color: '#b45309', progress: 40 },
  processing:  { label: 'Processing',  dot: '#07b3f2', bg: '#dbeafe', color: '#0284c7', progress: 75 },
  completed:   { label: 'Completed',   dot: '#10b981', bg: '#dcfce7', color: '#059669', progress: 100 },
  rejected:    { label: 'Rejected',    dot: '#ef4444', bg: '#fee2e2', color: '#dc2626', progress: 100 },
};

const FLAGS = {
  'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'Germany': '🇩🇪',
  'United States': '🇺🇸', 'Australia': '🇦🇺', 'France': '🇫🇷',
  'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪', 'Nigeria': '🇳🇬',
  'Ghana': '🇬🇭', 'Japan': '🇯🇵', 'China': '🇨🇳', 'India': '🇮🇳',
  'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'South Korea': '🇰🇷',
  'Brazil': '🇧🇷', 'Portugal': '🇵🇹', 'Switzerland': '🇨🇭',
  'Singapore': '🇸🇬', 'Malaysia': '🇲🇾', 'South Africa': '🇿🇦',
};

const getFlag = (country) => FLAGS[country] || '🌍';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
};

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mv-root {
    display: flex;
    min-height: calc(100vh - 60px);
    background: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── LEFT PANEL ── */
  .mv-left {
    width: 30%;
    flex-shrink: 0;
    position: sticky;
    top: 60px;
    height: calc(100vh - 60px);
    overflow: hidden;
  }
  .mv-left-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .mv-left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7,14,35,0.25) 0%,
      rgba(7,14,35,0.15) 30%,
      rgba(7,14,35,0.65) 70%,
      rgba(7,14,35,0.92) 100%
    );
  }
  .mv-left-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 32px 28px;
  }
  .mv-left-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(7,179,242,0.18);
    border: 1px solid rgba(7,179,242,0.35);
    border-radius: 999px;
    padding: 5px 13px;
    font-size: 11px;
    font-weight: 600;
    color: #38bdf8;
    margin-bottom: 16px;
    width: fit-content;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .mv-left-title {
    font-family: 'Fraunces', serif;
    font-size: 28px;
    font-weight: 900;
    color: white;
    line-height: 1.2;
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }
  .mv-left-title em {
    font-style: italic;
    color: #38bdf8;
  }
  .mv-left-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    line-height: 1.65;
    margin-bottom: 24px;
    max-width: 240px;
  }
  .mv-left-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .mv-left-stat {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 14px;
    backdrop-filter: blur(8px);
  }
  .mv-left-stat-num {
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-weight: 900;
    color: #07b3f2;
    line-height: 1;
    margin-bottom: 3px;
  }
  .mv-left-stat-label {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  /* ── RIGHT PANEL ── */
  .mv-right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  /* ── TOP BAR ── */
  .mv-topbar {
    background: #ffffff;
    border-bottom: 1px solid #e8eaed;
    padding: 22px 32px 20px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .mv-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #07b3f2;
    margin-bottom: 4px;
  }
  .mv-page-title {
    font-family: 'Fraunces', serif;
    font-size: 24px;
    font-weight: 900;
    color: #0d1117;
    letter-spacing: -0.4px;
    line-height: 1;
  }
  .mv-new-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border-radius: 12px;
    border: none;
    background: #0d1117;
    color: white;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .mv-new-btn:hover { background: #07b3f2; transform: translateY(-1px); }

  /* ── SUMMARY ROW ── */
  .mv-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: #ffffff;
    border-bottom: 1px solid #e8eaed;
  }
  .mv-sum-item {
    padding: 16px 24px;
    border-right: 1px solid #e8eaed;
  }
  .mv-sum-item:last-child { border-right: none; }
  .mv-sum-num {
    font-family: 'Fraunces', serif;
    font-size: 26px;
    font-weight: 900;
    color: #0d1117;
    line-height: 1;
    margin-bottom: 4px;
  }
  .mv-sum-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .mv-sum-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── CONTENT ── */
  .mv-content {
    padding: 28px 32px 48px;
    flex: 1;
  }
  .mv-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
    margin-bottom: 12px;
    padding-left: 2px;
  }
  .mv-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 28px;
  }

  /* ── APP CARD ── */
  .mv-card {
    background: #ffffff;
    border: 1px solid #e8eaed;
    border-radius: 16px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: box-shadow 0.18s, transform 0.15s, border-color 0.15s;
  }
  .mv-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }
  .mv-card-bar {
    width: 3px;
    height: 44px;
    border-radius: 0;
    flex-shrink: 0;
  }
  .mv-card-flag {
    font-size: 24px;
    flex-shrink: 0;
    line-height: 1;
  }
  .mv-card-body {
    flex: 1;
    min-width: 0;
  }
  .mv-card-title {
    font-size: 13px;
    font-weight: 600;
    color: #0d1117;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mv-card-meta {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 9px;
  }
  .mv-prog-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mv-prog-bar {
    flex: 1;
    height: 3px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
  }
  .mv-prog-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease;
  }
  .mv-prog-pct {
    font-size: 10px;
    color: #94a3b8;
    white-space: nowrap;
    min-width: 28px;
    text-align: right;
  }
  .mv-card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
    flex-shrink: 0;
  }
  .mv-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }
  .mv-badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mv-card-date {
    font-size: 10px;
    color: #94a3b8;
  }
  .mv-docs-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: #94a3b8;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #f1f5f9;
  }

  /* ── START BUTTON ── */
  .mv-start-btn {
    padding: 6px 14px;
    border-radius: 9px;
    border: none;
    background: #07b3f2;
    color: white;
    font-size: 11px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.15s, transform 0.1s;
  }
  .mv-start-btn:hover:not(:disabled) { background: #0284c7; transform: translateY(-1px); }
  .mv-start-btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

  /* ── FULL PAGE STATES ── */
  .mv-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    padding: 80px 24px;
    flex: 1;
  }
  .mv-state-icon {
    width: 60px; height: 60px;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    margin-bottom: 4px;
  }

  @keyframes mv-spin { to { transform: rotate(360deg); } }
  .mv-spinner {
    width: 32px; height: 32px;
    border: 3px solid #dbeafe;
    border-top-color: #07b3f2;
    border-radius: 50%;
    animation: mv-spin 0.8s linear infinite;
  }

  @keyframes mv-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mv-appear { animation: mv-up 0.35s ease both; }

  /* ── EMPTY SECTION ── */
  .mv-empty-col {
    padding: 24px 16px;
    text-align: center;
    border: 1px dashed #e2e8f0;
    border-radius: 14px;
    margin-bottom: 28px;
  }
  .mv-empty-col p { font-size: 12px; color: #94a3b8; margin-top: 6px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .mv-left { display: none; }
    .mv-content { padding: 20px 18px 40px; }
    .mv-topbar { padding: 18px 18px 16px; }
    .mv-summary { grid-template-columns: repeat(2, 1fr); }
    .mv-sum-item:nth-child(2) { border-right: none; }
  }
  @media (max-width: 500px) {
    .mv-card { gap: 10px; }
    .mv-card-bar { display: none; }
  }
`;

function Badge({ status }) {
  const s = STATUSES[status] || STATUSES.not_started;
  return (
    <span className="mv-badge" style={{ background: s.bg, color: s.color }}>
      <span className="mv-badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const s = STATUSES[status] || STATUSES.not_started;
  if (status === 'not_started') return null;
  return (
    <div className="mv-prog-row">
      <div className="mv-prog-bar">
        <div className="mv-prog-fill" style={{ width: `${s.progress}%`, background: s.dot }} />
      </div>
      <span className="mv-prog-pct">{s.progress}%</span>
    </div>
  );
}

function AppCard({ app, onOpen, onStart, isStarting }) {
  const s = STATUSES[app.status] || STATUSES.not_started;
  const isNotStarted = app.status === 'not_started';
  const title = app.package_title
    || (app.package_country ? `${app.package_country} — Visa Application` : 'Visa Application');

  return (
    <div className="mv-card mv-appear" onClick={() => !isNotStarted && onOpen(app.id)}>
      <div className="mv-card-bar" style={{ background: s.dot }} />
      <div className="mv-card-flag">{getFlag(app.package_country || '')}</div>
      <div className="mv-card-body">
        <div className="mv-card-title">{title}</div>
        <div className="mv-card-meta">
          #{app.id} · {app.full_name || '—'}
          {app.package_country ? ` · ${app.package_country}` : ''}
        </div>
        <ProgressBar status={app.status} />
        {app.documents_count > 0 && (
          <div className="mv-docs-row">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {app.documents_count} doc{app.documents_count !== 1 ? 's' : ''} uploaded
          </div>
        )}
      </div>
      <div className="mv-card-right">
        <Badge status={app.status} />
        {isNotStarted ? (
          <button
            className="mv-start-btn"
            disabled={isStarting}
            onClick={e => { e.stopPropagation(); onStart(app.id); }}
          >
            {isStarting ? (
              <div style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'mv-spin 0.7s linear infinite' }} />
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
            {isStarting ? 'Starting…' : 'Start now'}
          </button>
        ) : (
          <span className="mv-card-date">{fmtDate(app.submitted_at)}</span>
        )}
      </div>
    </div>
  );
}

const GROUPS = [
  { label: 'Active',      keys: ['started', 'processing'] },
  { label: 'Not started', keys: ['not_started'] },
  { label: 'Completed',   keys: ['completed', 'rejected'] },
];

export default function MyVisaPage() {
  const router = useRouter();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [starting, setStarting] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('user')) {
      router.push('/login');
      return;
    }
    load();
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/applications/', {
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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (appId) => {
    setStarting(prev => ({ ...prev, [appId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `https://web-production-f50dc.up.railway.app/api/applications/${appId}/start/`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'started' } : a));
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to start application.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setStarting(prev => ({ ...prev, [appId]: false }));
    }
  };

  const count = (keys) => apps.filter(a => keys.includes(a.status)).length;

  return (
    <>
      <style>{S}</style>
      <div className="mv-root">

        {/* ── LEFT PANEL ── */}
        <div className="mv-left">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80"
            alt="Airplane above clouds"
            className="mv-left-img"
          />
          <div className="mv-left-overlay" />
          <div className="mv-left-content">
            <div className="mv-left-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Visa tracker
            </div>
            <h2 className="mv-left-title">
              Your journey,<br /><em>fully tracked.</em>
            </h2>
            <p className="mv-left-sub">
              Every application, every document, every update — all in one place.
            </p>
            <div className="mv-left-stats">
              {[
                { num: '50+', label: 'Countries' },
                { num: '98%', label: 'Approval rate' },
                { num: '2k+', label: 'Applicants' },
                { num: '24h', label: 'Support' },
              ].map(s => (
                <div key={s.label} className="mv-left-stat">
                  <div className="mv-left-stat-num">{s.num}</div>
                  <div className="mv-left-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="mv-right">

          {/* Top bar */}
          <div className="mv-topbar mv-appear">
            <div>
              <p className="mv-eyebrow">Visa journey</p>
              <h1 className="mv-page-title">My Applications</h1>
            </div>
            <button className="mv-new-btn" onClick={() => router.push('/package')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              New Application
            </button>
          </div>

          {/* Summary row */}
          {!loading && !error && (
            <div className="mv-summary mv-appear">
              {[
                { num: apps.length,                              label: 'Total',       dot: '#0d1117' },
                { num: count(['started', 'processing']),         label: 'Active',      dot: '#f59e0b' },
                { num: count(['completed']),                     label: 'Completed',   dot: '#10b981' },
                { num: count(['not_started']),                   label: 'Not Started', dot: '#94a3b8' },
              ].map(s => (
                <div key={s.label} className="mv-sum-item">
                  <div className="mv-sum-num" style={{ color: s.dot }}>{s.num}</div>
                  <div className="mv-sum-label">
                    <span className="mv-sum-dot" style={{ background: s.dot }} />
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mv-state">
              <div className="mv-spinner" />
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Fetching your applications…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mv-state">
              <div className="mv-state-icon" style={{ background: '#fee2e2' }}>⚠️</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0d1117' }}>Something went wrong</p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>{error}</p>
              <button
                onClick={load}
                style={{ fontSize: 12, color: '#07b3f2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && apps.length === 0 && (
            <div className="mv-state">
              <div className="mv-state-icon" style={{ background: '#f3f4f6' }}>✈️</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0d1117' }}>No applications yet</p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Start your journey by browsing available packages</p>
              <button className="mv-new-btn" style={{ marginTop: 4 }} onClick={() => router.push('/package')}>
                Browse Packages
              </button>
            </div>
          )}

          {/* Applications grouped */}
          {!loading && !error && apps.length > 0 && (
            <div className="mv-content">
              {GROUPS.map(g => {
                const items = apps.filter(a => g.keys.includes(a.status));
                if (items.length === 0) return null;
                return (
                  <div key={g.label}>
                    <p className="mv-section-label">{g.label}</p>
                    <div className="mv-list">
                      {items.map(app => (
                        <AppCard
                          key={app.id}
                          app={app}
                          onOpen={id => router.push(`/application/${id}`)}
                          onStart={handleStart}
                          isStarting={!!starting[app.id]}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}