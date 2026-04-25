'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useAdminGuard from './../components/admincomponents/AdminGuard';

const API = 'https://web-production-f50dc.up.railway.app/api';
const auth = () => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`, 'Content-Type': 'application/json' });

// ── Helpers ──────────────────────────────────────────────────────────────────
const ini = n => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
const AVATAR_COLORS = ['#07b3f2', '#0284c7', '#7c3aed', '#059669', '#f59e0b', '#ef4444', '#ec4899', '#0891b2'];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  :root {
    --blue: #07b3f2;
    --blue-d: #0284c7;
    --blue-dd: #0369a1;
    --ink: #060b18;
    --ink2: #1a2236;
    --ink3: #374151;
    --muted: #64748b;
    --muted2: #94a3b8;
    --border: #e2e8f4;
    --border2: #f0f4f8;
    --surface: #f6f9fc;
    --surface2: #eef2f7;
    --white: #ffffff;
    --green: #10b981;
    --amber: #f59e0b;
    --red: #ef4444;
    --purple: #7c3aed;
  }

  .nx-root {
    display: flex;
    min-height: 100vh;
    background: var(--surface);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* ── SIDEBAR ── */
  .nx-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--ink);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
    overflow: hidden;
  }
  .nx-sidebar::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(7,179,242,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .nx-sidebar-logo {
    padding: 28px 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: relative; z-index: 1;
  }
  .nx-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
  }
  .nx-logo-text span { color: var(--blue); }
  .nx-logo-badge {
    display: inline-block;
    margin-top: 4px;
    font-size: 9px;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .nx-nav {
    flex: 1;
    padding: 16px 10px;
    overflow-y: auto;
    position: relative; z-index: 1;
  }
  .nx-nav-section {
    font-size: 8px;
    font-weight: 800;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding: 0 10px;
    margin: 14px 0 6px;
  }
  .nx-nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    transition: all 0.15s;
    margin-bottom: 1px;
    position: relative;
  }
  .nx-nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .nx-nav-item.active {
    background: rgba(7,179,242,0.15);
    color: #07b3f2;
    font-weight: 600;
  }
  .nx-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px;
    background: var(--blue);
    border-radius: 0 3px 3px 0;
  }
  .nx-nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
  .nx-nav-badge {
    margin-left: auto;
    background: var(--blue);
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 999px;
    min-width: 18px;
    text-align: center;
  }
  .nx-nav-badge.red { background: var(--red); }
  .nx-sidebar-bottom {
    padding: 14px 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
    position: relative; z-index: 1;
  }
  .nx-admin-pill {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.05);
  }
  .nx-admin-avatar {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--blue), var(--blue-dd));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .nx-admin-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); }
  .nx-admin-role { font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 1px; }

  /* ── MAIN ── */
  .nx-main {
    margin-left: 220px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* ── TOPBAR ── */
  .nx-topbar {
    background: white;
    border-bottom: 1px solid var(--border);
    height: 60px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .nx-topbar-left { display: flex; align-items: center; gap: 16px; }
  .nx-breadcrumb {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
  }
  .nx-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .nx-search-icon {
    position: absolute;
    left: 12px;
    color: var(--muted2);
    pointer-events: none;
  }
  .nx-search-icon svg { width: 14px; height: 14px; }
  .nx-search {
    padding: 8px 14px 8px 36px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    background: var(--surface);
    outline: none;
    width: 280px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .nx-search:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
    background: white;
  }
  .nx-search::placeholder { color: var(--muted2); }
  .nx-topbar-right { display: flex; align-items: center; gap: 10px; }
  .nx-topbar-btn {
    width: 34px; height: 34px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted);
    transition: all 0.15s;
    position: relative;
  }
  .nx-topbar-btn:hover { background: var(--surface); color: var(--ink); }
  .nx-topbar-btn svg { width: 15px; height: 15px; }
  .nx-notif-dot {
    position: absolute;
    top: 6px; right: 6px;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--red);
    border: 1.5px solid white;
  }
  .nx-live-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 999px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.2);
    font-size: 11px; font-weight: 700; color: var(--green);
  }
  .nx-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green);
    animation: nx-pulse 1.8s ease-in-out infinite;
  }

  /* ── CONTENT ── */
  .nx-content { padding: 28px 32px 60px; flex: 1; }

  /* ── SEARCH RESULTS ── */
  .nx-search-results {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
    margin-bottom: 24px;
  }
  .nx-search-results-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── STATS ── */
  .nx-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }
  .nx-stat {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .nx-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .nx-stat-accent {
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    opacity: 0.07;
  }
  .nx-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; margin-bottom: 14px;
  }
  .nx-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--ink); line-height: 1;
    margin-bottom: 4px;
  }
  .nx-stat-label {
    font-size: 11px; font-weight: 600;
    color: var(--muted2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .nx-stat-bar {
    height: 3px; border-radius: 999px;
    margin-top: 14px; overflow: hidden;
  }
  .nx-stat-bar-fill { height: 100%; border-radius: 999px; transition: width 1s; }

  /* ── HERO STAT ── */
  .nx-stat-hero {
    background: linear-gradient(135deg, var(--ink) 0%, var(--ink2) 100%);
    border-color: transparent;
    grid-column: span 2;
  }
  .nx-stat-hero:hover { box-shadow: 0 12px 40px rgba(6,11,24,0.25); }
  .nx-stat-hero .nx-stat-num { color: white; font-size: 48px; }
  .nx-stat-hero .nx-stat-label { color: rgba(255,255,255,0.45); }

  /* ── GRID ── */
  .nx-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
  .nx-grid-full { display: grid; grid-template-columns: 1fr; gap: 20px; }

  /* ── CARD ── */
  .nx-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }
  .nx-card-header {
    padding: 18px 22px;
    border-bottom: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: space-between;
  }
  .nx-card-title { font-size: 13px; font-weight: 700; color: var(--ink); }
  .nx-card-sub { font-size: 11px; color: var(--muted2); margin-top: 2px; }

  /* ── TABLE ── */
  .nx-table { width: 100%; border-collapse: collapse; }
  .nx-th {
    padding: 10px 20px;
    text-align: left;
    font-size: 9px; font-weight: 800;
    color: var(--muted2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: var(--surface);
    white-space: nowrap;
  }
  .nx-td { padding: 12px 20px; font-size: 12.5px; color: var(--ink3); }
  .nx-tr { border-top: 1px solid var(--border2); transition: background 0.12s; }
  .nx-tr:hover { background: var(--surface); }

  /* ── BADGE ── */
  .nx-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px 3px 6px; border-radius: 999px;
    font-size: 10px; font-weight: 700;
  }
  .nx-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* ── AVATAR ── */
  .nx-avatar {
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: white; flex-shrink: 0;
    font-size: 11px;
  }

  /* ── BUTTONS ── */
  .nx-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 18px; border-radius: 10px; border: none;
    font-size: 12px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.15s;
  }
  .nx-btn-primary {
    background: var(--blue); color: white;
    box-shadow: 0 2px 10px rgba(7,179,242,0.25);
  }
  .nx-btn-primary:hover { background: var(--blue-d); transform: translateY(-1px); }
  .nx-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .nx-btn-success {
    background: rgba(16,185,129,0.1); color: var(--green);
    border: 1px solid rgba(16,185,129,0.2);
  }
  .nx-btn-success:hover { background: rgba(16,185,129,0.18); }
  .nx-btn-danger {
    background: rgba(239,68,68,0.08); color: var(--red);
    border: 1px solid rgba(239,68,68,0.2);
  }
  .nx-btn-danger:hover { background: rgba(239,68,68,0.14); }
  .nx-btn-ghost {
    background: white; color: var(--ink3);
    border: 1px solid var(--border);
  }
  .nx-btn-ghost:hover { background: var(--surface); }
  .nx-btn-sm { padding: 6px 12px; font-size: 11px; border-radius: 8px; }

  /* ── FILTER TABS ── */
  .nx-tabs {
    display: flex; gap: 4px;
    background: var(--surface2);
    padding: 3px; border-radius: 10px;
  }
  .nx-tab {
    padding: 6px 14px; border-radius: 8px;
    font-size: 11px; font-weight: 700;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .nx-tab.active { background: white; color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .nx-tab.inactive { background: transparent; color: var(--muted2); }
  .nx-tab.inactive:hover { color: var(--muted); }

  /* ── INPUT ── */
  .nx-input {
    padding: 9px 13px; border-radius: 10px;
    border: 1.5px solid var(--border);
    font-size: 12.5px; font-family: 'DM Sans', sans-serif;
    color: var(--ink); background: var(--surface);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .nx-input:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
    background: white;
  }
  .nx-input::placeholder { color: var(--muted2); }

  /* ── MODAL ── */
  .nx-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(6,11,24,0.6);
    backdrop-filter: blur(10px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: nx-fade 0.2s ease;
  }
  .nx-modal {
    background: white;
    border-radius: 20px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 40px 100px rgba(0,0,0,0.25);
    animation: nx-slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .nx-modal-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--border2);
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .nx-modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700; color: var(--ink);
  }
  .nx-modal-close {
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid var(--border); background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted2); font-size: 13px;
    transition: all 0.15s;
  }
  .nx-modal-close:hover { background: var(--surface); color: var(--ink); }
  .nx-modal-body { padding: 20px 24px 24px; }

  /* ── INFO SECTION ── */
  .nx-info-section {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .nx-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
  .nx-info-label { font-size: 9px; font-weight: 800; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .nx-info-val { font-size: 12.5px; font-weight: 600; color: var(--ink); }

  /* ── SCHEDULE CALL SECTION ── */
  .nx-schedule-section {
    background: linear-gradient(135deg, rgba(7,179,242,0.05), rgba(2,132,199,0.05));
    border: 1px solid rgba(7,179,242,0.15);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }

  /* ── EMPTY ── */
  .nx-empty {
    padding: 56px 20px;
    text-align: center;
  }
  .nx-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .nx-empty-title { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 5px; }
  .nx-empty-sub { font-size: 12px; color: var(--muted2); }

  /* ── SKELETON ── */
  .nx-skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% auto;
    animation: nx-shimmer 1.4s linear infinite;
    border-radius: 10px;
  }

  /* ── TOAST ── */
  .nx-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    background: var(--ink); color: white;
    padding: 12px 18px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    animation: nx-toast 0.3s cubic-bezier(0.22,1,0.36,1);
    display: flex; align-items: center; gap: 8px;
  }

  /* ── ANIMATIONS ── */
  @keyframes nx-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes nx-slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes nx-fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nx-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes nx-toast { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes nx-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes nx-spin { to { transform: rotate(360deg); } }

  .nx-anim { animation: nx-fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .nx-anim-1 { animation-delay: 0.04s; }
  .nx-anim-2 { animation-delay: 0.09s; }
  .nx-anim-3 { animation-delay: 0.14s; }
  .nx-anim-4 { animation-delay: 0.19s; }
  .nx-anim-5 { animation-delay: 0.24s; }

  .nx-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: nx-spin 0.7s linear infinite;
  }

  @media (max-width: 1200px) { .nx-grid { grid-template-columns: 1fr; } .nx-stats { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 768px) { .nx-sidebar { display: none; } .nx-main { margin-left: 0; } .nx-content { padding: 20px 16px; } }
`;

// ── Status configs ────────────────────────────────────────────────────────────
const APP_STATUS = {
  not_started: { label: 'Not Started', dot: '#94a3b8', bg: 'rgba(148,163,184,0.1)', text: '#64748b' },
  started: { label: 'In Progress', dot: '#3b82f6', bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
  processing: { label: 'Processing', dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
  completed: { label: 'Completed', dot: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  cancelled: { label: 'Cancelled', dot: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
};
const SP_STATUS = {
  pending: { label: 'Pending', dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
  approved: { label: 'Approved', dot: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  rejected: { label: 'Rejected', dot: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
};

const Badge = ({ status, map }) => {
  const s = map[status] || map.pending || map.not_started;
  return (
    <span className="nx-badge" style={{ background: s.bg, color: s.text }}>
      <span className="nx-badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    key: 'overview', label: 'Overview',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
  },
  {
    key: 'sp_applications', label: 'SP Applications',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    badge: true,
  },
  {
    key: 'applications', label: 'Applications',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },

  {
    key: 'pending_posts', label: 'Pending Posts',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    badgePosts: true,
  },
  {
    key: 'packages', label: 'Packages',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
  },
  {
    key: 'users', label: 'Users',
    icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
  },
];

// ── OVERVIEW SECTION ──────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [recentSPs, setRecentSPs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [appsRes, usersRes, spRes] = await Promise.all([
          fetch(`${API}/applications/admin/all/`, { headers: auth() }),
          fetch(`${API}/auth/admin/users/`, { headers: auth() }),
          fetch(`${API}/providers/admin/list/`, { headers: auth() }),
        ]);
        const apps = (await appsRes.json()).applications || [];
        const users = (await usersRes.json()).users || [];
        const sps = (await spRes.json()).providers || [];
        setStats({
          total: apps.length,
          completed: apps.filter(a => a.status === 'completed').length,
          processing: apps.filter(a => a.status === 'processing').length,
          users: users.length,
          sp_pending: sps.filter(s => s.status === 'pending').length,
          sp_approved: sps.filter(s => s.status === 'approved').length,
        });
        setRecentApps(apps.slice(0, 6));
        setRecentSPs(sps.slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="nx-skeleton" style={{ height: 110 }} />)}
      </div>
      <div className="nx-skeleton" style={{ height: 300 }} />
    </div>
  );

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div className="nx-anim nx-anim-1" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
          {greeting}, <span style={{ color: 'var(--blue)' }}>Admin</span> 👋
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="nx-stats nx-anim nx-anim-2">
        <div className="nx-stat nx-stat-hero" style={{ gridColumn: 'span 2' }}>
          <div className="nx-stat-accent" style={{ background: 'var(--blue)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div className="nx-stat-num">{stats.total}</div>
              <div className="nx-stat-label">Total Applications</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          </div>
          <div className="nx-stat-bar" style={{ background: 'rgba(255,255,255,0.1)', marginTop: 16 }}>
            <div className="nx-stat-bar-fill" style={{ width: '100%', background: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
        {[
          { label: 'Completed', value: stats.completed, icon: '✅', accent: '#10b981', barBg: '#f0fdf4', barFill: '#10b981' },
          { label: 'Processing', value: stats.processing, icon: '⚙️', accent: '#f59e0b', barBg: '#fef3c7', barFill: '#f59e0b' },
          { label: 'Total Users', value: stats.users, icon: '👥', accent: '#7c3aed', barBg: '#f5f3ff', barFill: '#7c3aed' },
          { label: 'SP Pending', value: stats.sp_pending, icon: '⏳', accent: '#f59e0b', barBg: '#fef3c7', barFill: '#f59e0b' },
          { label: 'SP Approved', value: stats.sp_approved, icon: '🏢', accent: '#10b981', barBg: '#f0fdf4', barFill: '#10b981' },
        ].map((s, i) => (
          <div key={s.label} className="nx-stat">
            <div className="nx-stat-accent" style={{ background: s.accent }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="nx-stat-num" style={{ fontSize: 28 }}>{s.value}</div>
                <div className="nx-stat-label">{s.label}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.barBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
            </div>
            <div className="nx-stat-bar" style={{ background: s.barBg }}>
              <div className="nx-stat-bar-fill" style={{ width: `${stats.total ? Math.round((s.value / stats.total) * 100) : 0}%`, background: s.barFill }} />
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="nx-grid nx-anim nx-anim-3">
        {/* Recent Applications */}
        <div className="nx-card">
          <div className="nx-card-header">
            <div>
              <div className="nx-card-title">Recent Applications</div>
              <div className="nx-card-sub">Latest {recentApps.length} submissions</div>
            </div>
            <div className="nx-live-badge"><span className="nx-live-dot" />Live</div>
          </div>
          {recentApps.length === 0 ? (
            <div className="nx-empty"><div className="nx-empty-icon">📭</div><div className="nx-empty-title">No applications yet</div></div>
          ) : (
            <table className="nx-table">
              <thead><tr><th className="nx-th">Student</th><th className="nx-th">Package</th><th className="nx-th">Status</th><th className="nx-th">Date</th></tr></thead>
              <tbody>
                {recentApps.map((app, i) => (
                  <tr key={app.id} className="nx-tr">
                    <td className="nx-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="nx-avatar" style={{ width: 28, height: 28, background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 10 }}>{ini(app.full_name)}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{app.full_name || '—'}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{app.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="nx-td" style={{ fontSize: 12 }}>{app.package_country || '—'}</td>
                    <td className="nx-td"><Badge status={app.status} map={APP_STATUS} /></td>
                    <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{fmtDate(app.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent SP Applications */}
        <div className="nx-card">
          <div className="nx-card-header">
            <div>
              <div className="nx-card-title">SP Applications</div>
              <div className="nx-card-sub">Awaiting review</div>
            </div>
            {stats.sp_pending > 0 && (
              <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
                {stats.sp_pending} pending
              </span>
            )}
          </div>
          {recentSPs.length === 0 ? (
            <div className="nx-empty"><div className="nx-empty-icon">🏢</div><div className="nx-empty-title">No SP applications</div></div>
          ) : (
            <div style={{ padding: '0 0 8px' }}>
              {recentSPs.map((sp, i) => (
                <div key={sp.id} style={{ padding: '12px 18px', borderBottom: i < recentSPs.length - 1 ? '1px solid var(--border2)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="nx-avatar" style={{ width: 34, height: 34, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{ini(sp.business_name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sp.business_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 1 }}>{sp.business_type?.replace('_', ' ')}</div>
                  </div>
                  <Badge status={sp.status} map={SP_STATUS} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SP APPLICATIONS SECTION ───────────────────────────────────────────────────
function SPApplicationsSection({ showToast }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [callDate, setCallDate] = useState('');
  const [callTime, setCallTime] = useState('');
  const [callLink, setCallLink] = useState('');
  const [schedulingCall, setSchedulingCall] = useState(false);

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/providers/admin/list/`, { headers: auth() });
      const data = await res.json();
      setProviders((data.providers || []).map((p, i) => ({ ...p, color: AVATAR_COLORS[i % AVATAR_COLORS.length] })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/providers/admin/${id}/${action}/`, { method: 'POST', headers: auth() });
      if (res.ok) {
        setProviders(prev => prev.map(p => p.id === id ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status: action === 'approve' ? 'approved' : 'rejected' }));
        showToast(action === 'approve' ? '✅ Service provider approved!' : '❌ Application rejected');
        if (action === 'approve') fetchProviders();
      } else {
        const err = await res.json();
        console.error('Action failed:', err);
        showToast('❌ Error: ' + (err.error || err.detail || 'Something went wrong'));
      }
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleScheduleCall = async () => {
    if (!callDate || !callTime) return;
    setSchedulingCall(true);
    try {
      const res = await fetch(`${API}/providers/admin/${selected.id}/schedule-call/`, {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify({ scheduled_date: callDate, scheduled_time: callTime, meet_link: callLink }),
      });
      if (res.ok) {
        showToast('📅 Verification call scheduled!');
        setCallDate(''); setCallTime(''); setCallLink('');
      }
    } catch (e) { console.error(e); }
    finally { setSchedulingCall(false); }
  };

  const filtered = providers.filter(p => {
    const matchSearch = !search || p.business_name?.toLowerCase().includes(search.toLowerCase()) || p.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = { pending: providers.filter(p => p.status === 'pending').length, approved: providers.filter(p => p.status === 'approved').length, rejected: providers.filter(p => p.status === 'rejected').length };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(5)].map((_, i) => <div key={i} className="nx-skeleton" style={{ height: 60 }} />)}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="nx-anim nx-anim-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Service Provider Applications</div>
          <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{providers.length} total · {counts.pending} awaiting review</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['pending', counts.pending, SP_STATUS.pending], ['approved', counts.approved, SP_STATUS.approved], ['rejected', counts.rejected, SP_STATUS.rejected]].map(([key, count, s]) => (
            <span key={key} className="nx-badge" style={{ background: s.bg, color: s.text, padding: '5px 12px' }}>
              <span className="nx-badge-dot" style={{ background: s.dot }} />{count} {key}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="nx-anim nx-anim-2" style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="nx-input" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search by business name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="nx-tabs">
          {['pending', 'approved', 'rejected', 'all'].map(t => (
            <button key={t} className={`nx-tab ${filter === t ? 'active' : 'inactive'}`} onClick={() => setFilter(t)} style={{ textTransform: 'capitalize' }}>
              {t}{t === 'pending' && counts.pending > 0 && <span style={{ marginLeft: 5, background: 'var(--blue)', color: 'white', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 999 }}>{counts.pending}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="nx-card nx-anim nx-anim-3">
        <div style={{ overflowX: 'auto' }}>
          <table className="nx-table">
            <thead>
              <tr>
                {['Business', 'Type', 'Contact', 'Country', 'Applied', 'Status', ''].map(h => (
                  <th key={h} className="nx-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="nx-td"><div className="nx-empty"><div className="nx-empty-icon">🏢</div><div className="nx-empty-title">No {filter === 'all' ? '' : filter} applications</div><div className="nx-empty-sub">New SP applications will appear here</div></div></td></tr>
              ) : filtered.map((sp, i) => (
                <tr key={sp.id} className="nx-tr">
                  <td className="nx-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="nx-avatar" style={{ width: 34, height: 34, background: sp.color }}>{ini(sp.business_name)}</div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{sp.business_name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{sp.user_email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{sp.business_type?.replace(/_/g, ' ') || '—'}</td>
                  <td className="nx-td" style={{ fontSize: 11 }}>{sp.phone || '—'}</td>
                  <td className="nx-td" style={{ fontSize: 11 }}>{sp.country || '—'}</td>
                  <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)', whiteSpace: 'nowrap' }}>{fmtDate(sp.created_at)}</td>
                  <td className="nx-td"><Badge status={sp.status} map={SP_STATUS} /></td>
                  <td className="nx-td">
                    <button className="nx-btn nx-btn-ghost nx-btn-sm" onClick={() => setSelected(sp)}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="nx-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="nx-modal">
            <div className="nx-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="nx-avatar" style={{ width: 44, height: 44, background: selected.color, borderRadius: 12, fontSize: 14 }}>{ini(selected.business_name)}</div>
                <div>
                  <div className="nx-modal-title">{selected.business_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{selected.user_email}</div>
                </div>
              </div>
              <button className="nx-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="nx-modal-body">
              <div style={{ marginBottom: 14 }}><Badge status={selected.status} map={SP_STATUS} /></div>

              {/* Business Info */}
              <div className="nx-info-section">
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>🏢 Business Details</div>
                <div className="nx-info-grid">
                  {[['Business Name', selected.business_name], ['Business Type', selected.business_type?.replace(/_/g, ' ')], ['Country', selected.country], ['Phone', selected.phone], ['Applied', fmtDate(selected.created_at)]].map(([l, v]) => (
                    <div key={l}><div className="nx-info-label">{l}</div><div className="nx-info-val" style={{ textTransform: 'capitalize' }}>{v || '—'}</div></div>
                  ))}
                </div>
                {selected.bio && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border2)' }}>
                    <div className="nx-info-label">Bio</div>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.6, marginTop: 4 }}>{selected.bio}</div>
                  </div>
                )}
              </div>

              {/* Documents */}
              {(selected.id_document || selected.profile_picture) && (
                <div className="nx-info-section" style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>📎 Documents</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {selected.id_document && (
                      <a href={selected.id_document} target="_blank" rel="noreferrer" className="nx-btn nx-btn-ghost nx-btn-sm">📄 View ID Document</a>
                    )}
                    {selected.profile_picture && (
                      <a href={selected.profile_picture} target="_blank" rel="noreferrer" className="nx-btn nx-btn-ghost nx-btn-sm">🖼 View Profile Photo</a>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule Verification Call */}
              {selected.status === 'pending' && (
                <div className="nx-schedule-section" style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>📅 Schedule Verification Call</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input className="nx-input" type="date" value={callDate} onChange={e => setCallDate(e.target.value)} style={{ fontSize: 12 }} />
                    <input className="nx-input" type="time" value={callTime} onChange={e => setCallTime(e.target.value)} style={{ fontSize: 12 }} />
                  </div>
                  <input className="nx-input" style={{ width: '100%', marginBottom: 8, fontSize: 12 }} placeholder="Google Meet link (optional)" value={callLink} onChange={e => setCallLink(e.target.value)} />
                  <button className="nx-btn nx-btn-primary" style={{ width: '100%', fontSize: 12 }} onClick={handleScheduleCall} disabled={schedulingCall || !callDate || !callTime}>
                    {schedulingCall ? <><div className="nx-spinner" />Scheduling...</> : '📅 Send Verification Call Invite'}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="nx-btn nx-btn-danger" style={{ flex: 1 }} onClick={() => handleAction(selected.id, 'reject')} disabled={actionLoading}>✕ Reject</button>
                  <button className="nx-btn nx-btn-primary" style={{ flex: 2 }} onClick={() => handleAction(selected.id, 'approve')} disabled={actionLoading}>
                    {actionLoading ? <><div className="nx-spinner" />Processing...</> : '✓ Approve SP'}
                  </button>
                </div>
              )}
              {selected.status === 'approved' && (
                <div>
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span>✅</span><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>SP has full platform access</span>
                  </div>
                  <button className="nx-btn nx-btn-danger" style={{ width: '100%' }} onClick={() => handleAction(selected.id, 'reject')} disabled={actionLoading}>Revoke Access</button>
                </div>
              )}
              {selected.status === 'rejected' && (
                <div>
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span>❌</span><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>Application rejected</span>
                  </div>
                  <button className="nx-btn nx-btn-primary" style={{ width: '100%' }} onClick={() => handleAction(selected.id, 'approve')} disabled={actionLoading}>
                    {actionLoading ? <><div className="nx-spinner" />Processing...</> : '↩ Re-approve SP'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── APPLICATIONS SECTION ──────────────────────────────────────────────────────
function ApplicationsSection() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/applications/admin/all/`, { headers: auth() });
        const data = await res.json();
        setApps(data.applications || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const filtered = apps.filter(a => {
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()) || a.package_country?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="nx-skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div className="nx-anim nx-anim-1" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>All Applications</div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{apps.length} total submissions</div>
      </div>
      <div className="nx-anim nx-anim-2" style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <input className="nx-input" style={{ flex: 1 }} placeholder="🔍 Search by name, email or country..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="nx-tabs">
          {['all', 'not_started', 'started', 'processing', 'completed', 'cancelled'].map(t => (
            <button key={t} className={`nx-tab ${filter === t ? 'active' : 'inactive'}`} onClick={() => setFilter(t)} style={{ textTransform: 'capitalize', fontSize: 10 }}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="nx-card nx-anim nx-anim-3">
        <table className="nx-table">
          <thead><tr>{['Student', 'Package', 'Status', 'Submitted', 'Updated'].map(h => <th key={h} className="nx-th">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}><div className="nx-empty"><div className="nx-empty-icon">📭</div><div className="nx-empty-title">No applications found</div></div></td></tr>
            ) : filtered.map((app, i) => (
              <tr key={app.id} className="nx-tr">
                <td className="nx-td">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div className="nx-avatar" style={{ width: 32, height: 32, background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 10 }}>{ini(app.full_name)}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{app.full_name || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{app.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="nx-td" style={{ fontSize: 12 }}>{app.package_country || '—'}</td>
                <td className="nx-td"><Badge status={app.status} map={APP_STATUS} /></td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{fmtDate(app.submitted_at)}</td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{fmtDate(app.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PACKAGES SECTION ──────────────────────────────────────────────────────────
function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/packages/`, { headers: auth() });
        const data = await res.json();
        setPackages(data.packages || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const filtered = packages.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.country?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.service_id).includes(search)
  );

  if (loading) return <div className="nx-skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div className="nx-anim nx-anim-1" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Packages</div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{packages.length} packages on platform</div>
      </div>
      <div className="nx-anim nx-anim-2" style={{ marginBottom: 18 }}>
        <input className="nx-input" style={{ width: '100%' }} placeholder="🔍 Search by title, country or service ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="nx-card nx-anim nx-anim-3">
        <table className="nx-table">
          <thead><tr>{['Service ID', 'Package', 'Category', 'Country', 'Created By', 'Created'].map(h => <th key={h} className="nx-th">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="nx-empty"><div className="nx-empty-icon">📦</div><div className="nx-empty-title">No packages found</div></div></td></tr>
            ) : filtered.map((pkg, i) => (
              <tr key={pkg.id} className="nx-tr">
                <td className="nx-td"><span style={{ fontFamily: 'monospace', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{pkg.service_id || `#${pkg.id}`}</span></td>
                <td className="nx-td">
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{pkg.title || pkg.name || '—'}</div>
                </td>
                <td className="nx-td"><span style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--muted)' }}>{pkg.category || '—'}</span></td>
                <td className="nx-td" style={{ fontSize: 12 }}>{pkg.country || '—'}</td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{pkg.created_by_name || 'Admin'}</td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{fmtDate(pkg.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── USERS SECTION ─────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/auth/admin/users/`, { headers: auth() });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const filtered = users.filter(u =>
    !search || u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="nx-skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div className="nx-anim nx-anim-1" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>All Users</div>
        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{users.length} registered users</div>
      </div>
      <div className="nx-anim nx-anim-2" style={{ marginBottom: 18 }}>
        <input className="nx-input" style={{ width: '100%' }} placeholder="🔍 Search by name, email or username..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="nx-card nx-anim nx-anim-3">
        <table className="nx-table">
          <thead><tr>{['User', 'Username', 'Country', 'Phone', 'Joined', 'Role'].map(h => <th key={h} className="nx-th">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="nx-empty"><div className="nx-empty-icon">👥</div><div className="nx-empty-title">No users found</div></div></td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id} className="nx-tr">
                <td className="nx-td">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div className="nx-avatar" style={{ width: 32, height: 32, background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 10 }}>{ini(u.fullname || u.username)}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{u.fullname || u.username || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="nx-td" style={{ fontSize: 12 }}>{u.username || '—'}</td>
                <td className="nx-td" style={{ fontSize: 12 }}>{u.country || '—'}</td>
                <td className="nx-td" style={{ fontSize: 12 }}>{u.phone || '—'}</td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{fmtDate(u.date_joined)}</td>
                <td className="nx-td">
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: u.is_staff ? 'rgba(7,179,242,0.1)' : 'rgba(148,163,184,0.1)', color: u.is_staff ? 'var(--blue)' : 'var(--muted)' }}>
                    {u.is_staff ? 'Admin' : 'User'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SEARCH RESULTS ────────────────────────────────────────────────────────────
function GlobalSearchResults({ query, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/packages/`, { headers: auth() });
        const data = await res.json();
        const pkgs = data.packages || [];
        const filtered = pkgs.filter(p =>
          String(p.service_id).includes(query) ||
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.country?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    search();
  }, [query]);

  return (
    <div className="nx-search-results">
      <div className="nx-search-results-header">
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Search Results for "{query}"</div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}</div>
        </div>
        <button className="nx-btn nx-btn-ghost nx-btn-sm" onClick={onClose}>✕ Clear</button>
      </div>
      {loading ? (
        <div style={{ padding: 20 }}><div className="nx-skeleton" style={{ height: 60 }} /></div>
      ) : results.length === 0 ? (
        <div className="nx-empty"><div className="nx-empty-icon">🔍</div><div className="nx-empty-title">No results found</div><div className="nx-empty-sub">Try searching by service ID, package name or country</div></div>
      ) : (
        <table className="nx-table">
          <thead><tr>{['Service ID', 'Package', 'Category', 'Country', 'Posted By'].map(h => <th key={h} className="nx-th">{h}</th>)}</tr></thead>
          <tbody>
            {results.map(pkg => (
              <tr key={pkg.id} className="nx-tr">
                <td className="nx-td"><span style={{ fontFamily: 'monospace', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{pkg.service_id || `#${pkg.id}`}</span></td>
                <td className="nx-td" style={{ fontSize: 12.5, fontWeight: 600 }}>{pkg.title || pkg.name || '—'}</td>
                <td className="nx-td" style={{ fontSize: 11, textTransform: 'capitalize' }}>{pkg.category || '—'}</td>
                <td className="nx-td" style={{ fontSize: 12 }}>{pkg.country || '—'}</td>
                <td className="nx-td" style={{ fontSize: 11, color: 'var(--muted2)' }}>{pkg.created_by_name || 'Admin'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── MAIN NEXUS ────────────────────────────────────────────────────────────────
export default function Nexus() {
  const ready = useAdminGuard();
  const [active, setActive] = useState('overview');
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [spPendingCount, setSpPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${API}/providers/admin/list/`, { headers: auth() });
        const data = await res.json();
        setSpPendingCount((data.providers || []).filter(p => p.status === 'pending').length);
      } catch { }
    };
    fetchPending();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchActive(val.length > 0);
  };

  const SECTION_TITLES = {
    overview: 'Overview',
    sp_applications: 'SP Applications',
    applications: 'Applications',
    packages: 'Packages',
    users: 'Users',
  };

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{styles}</style>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(7,179,242,0.2)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'nx-spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="nx-root">

        {/* SIDEBAR */}
        <aside className="nx-sidebar">
          <div className="nx-sidebar-logo">
            <div className="nx-logo-text">Ingress<span>.</span></div>
            <div className="nx-logo-badge">Admin Console</div>
          </div>
          <nav className="nx-nav">
            <div className="nx-nav-section">Platform</div>
            {NAV.map(item => (
              <button key={item.key} className={`nx-nav-item${active === item.key ? ' active' : ''}`} onClick={() => setActive(item.key)}>
                {item.icon}
                {item.label}
                {item.badge && spPendingCount > 0 && <span className="nx-nav-badge red">{spPendingCount}</span>}
              </button>
            ))}
            <div className="nx-nav-section" style={{ marginTop: 20 }}>System</div>
            <button className="nx-nav-item" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </nav>
          <div className="nx-sidebar-bottom">
            <div className="nx-admin-pill">
              <div className="nx-admin-avatar">AD</div>
              <div>
                <div className="nx-admin-name">Administrator</div>
                <div className="nx-admin-role">Super Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="nx-main">

          {/* TOPBAR */}
          <header className="nx-topbar">
            <div className="nx-topbar-left">
              <div className="nx-breadcrumb">{SECTION_TITLES[active]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="nx-search-wrap">
                <span className="nx-search-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg></span>
                <input className="nx-search" placeholder="Search by service ID, name, country..." value={searchQuery} onChange={handleSearch} />
              </div>
              <div className="nx-live-badge"><span className="nx-live-dot" />Live</div>
              <button className="nx-topbar-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                {spPendingCount > 0 && <span className="nx-notif-dot" />}
              </button>
            </div>
          </header>

          {/* CONTENT */}
          <main className="nx-content">
            {searchActive && (
              <GlobalSearchResults query={searchQuery} onClose={() => { setSearchQuery(''); setSearchActive(false); }} />
            )}
            {active === 'overview' && <OverviewSection />}
            {active === 'sp_applications' && <SPApplicationsSection showToast={showToast} />}
            {active === 'applications' && <ApplicationsSection />}
            {active === 'packages' && <PackagesSection />}
            {active === 'users' && <UsersSection />}
          </main>
        </div>
      </div>

      {toast && <div className="nx-toast">{toast}</div>}
    </>
  );
}