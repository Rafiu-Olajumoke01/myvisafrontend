'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: '#94a3b8', bg: '#f1f5f9', progress: 10 },
  started: { label: 'In Progress', color: '#07b3f2', bg: '#e0f7fe', progress: 40 },
  processing: { label: 'Processing', color: '#f59e0b', bg: '#fef3c7', progress: 75 },
  completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5', progress: 100 },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', progress: 0 },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  .db-root {
    display: flex;
    min-height: 100vh;
    background: #f6f8fc;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── SIDEBAR ── */
  .db-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #ffffff;
    border-right: 1px solid #eef0f6;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 40;
    padding: 0 0 24px;
  }
  .db-sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid #eef0f6;
    margin-bottom: 16px;
  }
  .db-sidebar-logo-text {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 700;
    color: #0a0e1a;
    letter-spacing: -0.5px;
  }
  .db-sidebar-logo-text span { color: #07b3f2; }
  .db-sidebar-logo-sub {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .db-nav { padding: 0 12px; flex: 1; }
  .db-nav-section {
    font-size: 9px;
    font-weight: 700;
    color: #c1c9d2;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0 12px;
    margin: 16px 0 6px;
  }
  .db-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }
  .db-nav-item:hover { background: #f6f8fc; color: #0a0e1a; }
  .db-nav-item.active { background: #e0f7fe; color: #07b3f2; font-weight: 600; }
  .db-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .db-nav-badge {
    margin-left: auto;
    background: #07b3f2;
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
  }

  .db-sidebar-user {
    margin: 0 12px;
    padding: 14px;
    background: #f6f8fc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .db-sidebar-user:hover { background: #eef0f6; }
  .db-sidebar-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .db-sidebar-user-name {
    font-size: 12px; font-weight: 600; color: #0a0e1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .db-sidebar-user-role {
    font-size: 10px; color: #94a3b8; margin-top: 1px;
  }

  /* ── MAIN ── */
  .db-main {
    margin-left: 240px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* ── TOPBAR ── */
  .db-topbar {
    background: #ffffff;
    border-bottom: 1px solid #eef0f6;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 30;
  }
  .db-topbar-title {
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-weight: 600;
    color: #0a0e1a;
    letter-spacing: -0.3px;
  }
  .db-topbar-right {
    display: flex; align-items: center; gap: 12px;
  }
  .db-topbar-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    border: 1px solid #eef0f6;
    background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b;
    transition: all 0.15s;
    position: relative;
  }
  .db-topbar-btn:hover { background: #f6f8fc; color: #0a0e1a; }
  .db-topbar-btn svg { width: 16px; height: 16px; }
  .db-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #ef4444; border: 1.5px solid white;
  }
  .db-topbar-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: white;
    cursor: pointer;
  }

  /* ── CONTENT ── */
  .db-content {
    padding: 28px 32px 48px;
    flex: 1;
  }

  /* ── WELCOME STRIP ── */
  .db-welcome {
    background: linear-gradient(135deg, #0a0e1a 0%, #0f172a 60%, #07b3f2 200%);
    border-radius: 20px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .db-welcome::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(7,179,242,0.12);
  }
  .db-welcome::after {
    content: '';
    position: absolute;
    bottom: -60px; right: 80px;
    width: 150px; height: 150px;
    border-radius: 50%;
    background: rgba(7,179,242,0.07);
  }
  .db-welcome-left { position: relative; z-index: 1; }
  .db-welcome-eyebrow {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
  }
  .db-welcome-name {
    font-family: 'Fraunces', serif;
    font-size: 26px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .db-welcome-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
  }
  .db-welcome-right {
    position: relative; z-index: 1;
    display: flex; gap: 10px; flex-shrink: 0;
  }
  .db-welcome-btn {
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .db-welcome-btn-primary {
    background: #07b3f2;
    color: white;
  }
  .db-welcome-btn-primary:hover { background: #0291c8; transform: translateY(-1px); }
  .db-welcome-btn-ghost {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.12) !important;
  }
  .db-welcome-btn-ghost:hover { background: rgba(255,255,255,0.14); }

  /* ── SP BANNER ── */
  .db-sp-banner {
    background: white;
    border: 1.5px solid #e0f7fe;
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
  }
  .db-sp-banner-left {
    display: flex; align-items: center; gap: 16px;
  }
  .db-sp-icon {
    width: 46px; height: 46px;
    border-radius: 12px;
    background: linear-gradient(135deg, #e0f7fe, #bae6fd);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .db-sp-icon svg { width: 22px; height: 22px; color: #07b3f2; }
  .db-sp-title {
    font-size: 14px; font-weight: 700; color: #0a0e1a; margin-bottom: 3px;
  }
  .db-sp-sub {
    font-size: 12px; color: #94a3b8; line-height: 1.5;
  }
  .db-sp-btn {
    padding: 10px 22px;
    background: #07b3f2;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .db-sp-btn:hover { background: #0291c8; transform: translateY(-1px); }

  /* ── STATS ROW ── */
  .db-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .db-stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #eef0f6;
    transition: box-shadow 0.2s;
  }
  .db-stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .db-stat-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .db-stat-label {
    font-size: 11px; font-weight: 600; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .db-stat-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .db-stat-icon svg { width: 15px; height: 15px; }
  .db-stat-num {
    font-family: 'Fraunces', serif;
    font-size: 30px; font-weight: 700;
    color: #0a0e1a; line-height: 1;
    margin-bottom: 4px;
  }
  .db-stat-change {
    font-size: 11px; color: #94a3b8;
  }

  /* ── GRID ── */
  .db-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
  }

  /* ── APPLICATIONS ── */
  .db-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #eef0f6;
    overflow: hidden;
  }
  .db-card-header {
    padding: 20px 24px 0;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .db-card-title {
    font-size: 14px; font-weight: 700; color: #0a0e1a;
  }
  .db-card-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .db-card-action {
    font-size: 12px; color: #07b3f2; font-weight: 600;
    cursor: pointer; background: none; border: none;
    font-family: 'DM Sans', sans-serif;
  }
  .db-card-action:hover { text-decoration: underline; }

  /* filter tabs */
  .db-filter-tabs {
    display: flex; gap: 6px; padding: 0 24px;
    margin-bottom: 16px; overflow-x: auto;
  }
  .db-filter-tab {
    padding: 6px 14px; border-radius: 999px;
    font-size: 11px; font-weight: 600;
    cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
    transition: all 0.15s; white-space: nowrap;
  }
  .db-filter-tab.active { background: #07b3f2; color: white; }
  .db-filter-tab:not(.active) { background: #f6f8fc; color: #64748b; }
  .db-filter-tab:not(.active):hover { background: #eef0f6; }

  /* app item */
  .db-app-list { padding: 0 16px 16px; }
  .db-app-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 8px;
    border-bottom: 1px solid #f6f8fc;
    cursor: pointer;
    border-radius: 10px;
    transition: background 0.15s;
    margin-bottom: 2px;
  }
  .db-app-item:last-child { border-bottom: none; }
  .db-app-item:hover { background: #f6f8fc; }
  .db-app-emoji {
    width: 42px; height: 42px; border-radius: 12px;
    background: #f6f8fc;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .db-app-info { flex: 1; min-width: 0; }
  .db-app-title {
    font-size: 13px; font-weight: 600; color: #0a0e1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .db-app-bar-wrap {
    height: 3px; background: #f1f5f9; border-radius: 999px;
    margin-bottom: 4px; overflow: hidden;
  }
  .db-app-bar { height: 100%; border-radius: 999px; transition: width 0.7s; }
  .db-app-meta {
    display: flex; align-items: center; justify-content: space-between;
  }
  .db-app-date { font-size: 10px; color: #94a3b8; }
  .db-app-status {
    font-size: 10px; font-weight: 700;
    padding: 3px 8px; border-radius: 999px;
  }

  /* empty */
  .db-empty {
    padding: 48px 24px;
    text-align: center;
  }
  .db-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: #e0f7fe;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin: 0 auto 16px;
  }
  .db-empty-title { font-size: 15px; font-weight: 700; color: #0a0e1a; margin-bottom: 6px; }
  .db-empty-sub { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
  .db-empty-btn {
    padding: 10px 24px; background: #07b3f2; color: white;
    border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .db-empty-btn:hover { background: #0291c8; }

  /* ── RIGHT PANEL ── */
  .db-right { display: flex; flex-direction: column; gap: 16px; }

  /* profile card */
  .db-profile-card {
    background: white; border-radius: 16px;
    border: 1px solid #eef0f6; padding: 24px; text-align: center;
  }
  .db-profile-avatar {
    width: 64px; height: 64px; border-radius: 18px;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif;
    font-size: 22px; font-weight: 700; color: white;
    margin: 0 auto 14px;
  }
  .db-profile-name {
    font-family: 'Fraunces', serif;
    font-size: 17px; font-weight: 700; color: #0a0e1a;
    margin-bottom: 3px;
  }
  .db-profile-email { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
  .db-profile-divider { height: 1px; background: #eef0f6; margin: 16px 0; }
  .db-profile-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 0;
  }
  .db-profile-row-label { font-size: 11px; color: #94a3b8; }
  .db-profile-row-val { font-size: 11px; font-weight: 600; color: #0a0e1a; }
  .db-edit-btn {
    width: 100%; margin-top: 16px;
    padding: 10px; border-radius: 10px;
    border: 1.5px solid #eef0f6; background: white;
    font-size: 12px; font-weight: 600; color: #64748b;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.15s;
  }
  .db-edit-btn:hover { border-color: #07b3f2; color: #07b3f2; }

  /* quick links */
  .db-quick-card {
    background: white; border-radius: 16px;
    border: 1px solid #eef0f6; padding: 20px;
  }
  .db-quick-title {
    font-size: 11px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;
  }
  .db-quick-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: 10px;
    cursor: pointer; transition: background 0.15s;
    margin-bottom: 2px; border: none; background: none;
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .db-quick-item:hover { background: #f6f8fc; }
  .db-quick-item-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 14px;
  }
  .db-quick-item-label { font-size: 12px; font-weight: 500; color: #374151; }
  .db-quick-item-arrow { margin-left: auto; color: #c1c9d2; font-size: 12px; }

  /* ── SP MODAL ── */
  .sp-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(10,14,26,0.6);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .sp-modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.2);
    animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .sp-modal-header {
    padding: 24px 28px 0;
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px;
  }
  .sp-modal-title {
    font-family: 'Fraunces', serif;
    font-size: 20px; font-weight: 700; color: #0a0e1a;
    letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .sp-modal-sub { font-size: 12px; color: #94a3b8; line-height: 1.5; }
  .sp-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #eef0f6; background: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #94a3b8; flex-shrink: 0;
    transition: all 0.15s; font-size: 16px;
  }
  .sp-modal-close:hover { background: #f6f8fc; color: #0a0e1a; }
  .sp-modal-body { padding: 0 28px 28px; }
  .sp-modal-form { display: flex; flex-direction: column; gap: 14px; }
  .sp-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sp-field { display: flex; flex-direction: column; gap: 5px; }
  .sp-label { font-size: 11px; font-weight: 600; color: #374151; letter-spacing: 0.02em; }
  .sp-input, .sp-select, .sp-textarea {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e8eaed; border-radius: 10px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #0a0e1a; background: #fafafa;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
  }
  .sp-input:focus, .sp-select:focus, .sp-textarea:focus {
    border-color: #07b3f2; background: white;
    box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
  }
  .sp-input::placeholder, .sp-textarea::placeholder { color: #c1c9d2; }
  .sp-textarea { resize: vertical; min-height: 80px; }
  .sp-select { appearance: none; cursor: pointer; }
  .sp-file-label {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border: 1.5px dashed #e8eaed;
    border-radius: 10px; cursor: pointer; background: #fafafa;
    transition: border-color 0.2s, background 0.2s;
    font-size: 12px; color: #94a3b8;
  }
  .sp-file-label:hover { border-color: #07b3f2; background: #f0f9ff; color: #07b3f2; }
  .sp-file-label.has-file { border-color: #10b981; background: #f0fdf4; color: #10b981; }
  .sp-file-input { display: none; }
  .sp-divider { height: 1px; background: #eef0f6; margin: 4px 0; }
  .sp-submit {
    width: 100%; padding: 13px;
    background: #07b3f2; color: white;
    border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 4px;
  }
  .sp-submit:hover:not(:disabled) { background: #0291c8; transform: translateY(-1px); }
  .sp-submit:disabled { background: #b0d9f0; cursor: not-allowed; }
  .sp-error {
    padding: 10px 13px; background: #fef2f2;
    border: 1px solid #fecaca; border-radius: 10px;
    font-size: 12px; color: #dc2626;
  }
  .sp-success {
    padding: 10px 13px; background: #f0fdf4;
    border: 1px solid #bbf7d0; border-radius: 10px;
    font-size: 12px; color: #16a34a; text-align: center;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .db-animate { animation: fadeUp 0.4s ease both; }
  .db-animate-1 { animation-delay: 0.05s; }
  .db-animate-2 { animation-delay: 0.1s; }
  .db-animate-3 { animation-delay: 0.15s; }
  .db-animate-4 { animation-delay: 0.2s; }
  .db-animate-5 { animation-delay: 0.25s; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .db-spinner {
    width: 36px; height: 36px;
    border: 3px solid #eef0f6;
    border-top-color: #07b3f2;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @media (max-width: 1100px) {
    .db-grid { grid-template-columns: 1fr; }
    .db-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .db-sidebar { display: none; }
    .db-main { margin-left: 0; }
    .db-content { padding: 20px 16px 80px; }
    .db-topbar { padding: 0 16px; }
    .db-welcome { flex-direction: column; align-items: flex-start; gap: 16px; }
    .db-sp-banner { flex-direction: column; align-items: flex-start; }
    .db-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

const NAV_ITEMS = [
  {
    key: 'dashboard', label: 'Dashboard', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    key: 'applications', label: 'Applications', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: 'packages', label: 'Browse Packages', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    )
  },
  {
    key: 'bookmarks', label: 'Saved', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    )
  },
  {
    key: 'notification', label: 'Notification', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ), badge: true
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showSPModal, setShowSPModal] = useState(false);
  const [spStatus, setSpStatus] = useState(null);
  const [spForm, setSpForm] = useState({
    business_name: '', business_type: '', country: '', phone: '', bio: '',
  });
  const [spIdDoc, setSpIdDoc] = useState(null);
  const [spProfilePic, setSpProfilePic] = useState(null);
  const [spLoading, setSpLoading] = useState(false);
  const [spError, setSpError] = useState('');
  const [spSuccess, setSpSuccess] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      const [profileRes, appRes, spRes] = await Promise.all([
        fetch('https://web-production-f50dc.up.railway.app/api/auth/profile/', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('https://web-production-f50dc.up.railway.app/api/applications/', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('https://web-production-f50dc.up.railway.app/api/providers/status/', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (profileRes.status === 401) { router.push('/login'); return; }
      if (profileRes.ok) setUserData(await profileRes.json());
      if (appRes.ok) { const d = await appRes.json(); setApplications(d.applications || []); }
      if (spRes.ok) { const d = await spRes.json(); setSpStatus(d); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getInitials = () => {
    if (!userData) return 'U';
    const name = userData.fullname || userData.username || '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const formatJoined = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  const totalApps = applications.length;
  const completedApps = applications.filter(a => a.status === 'completed').length;
  const activeApps = applications.filter(a => ['started', 'processing'].includes(a.status)).length;
  const totalDocs = applications.reduce((sum, a) => sum + (a.documents_count || 0), 0);

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'started', label: 'In Progress' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredApps = activeFilter === 'all' ? applications : applications.filter(a => a.status === activeFilter);

  const STATUS_EMOJI = { not_started: '🕐', started: '⚡', processing: '🔄', completed: '✅', cancelled: '❌' };

  const handleNav = (key) => {
    setActiveNav(key);
    if (key === 'packages') router.push('/package');
    if (key === 'bookmarks') router.push('/bookmarks');
    if (key === 'notification') router.push('/notification');
  };

  const handleSPSubmit = async (e) => {
    e.preventDefault();
    setSpLoading(true);
    setSpError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('business_name', spForm.business_name);
      formData.append('business_type', spForm.business_type);
      formData.append('country', spForm.country);
      formData.append('phone', spForm.phone);
      formData.append('bio', spForm.bio);
      if (spIdDoc) formData.append('id_document', spIdDoc);
      if (spProfilePic) formData.append('profile_picture', spProfilePic);
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/providers/register/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSpSuccess(true);
        await fetchDashboard();
        setTimeout(() => { setShowSPModal(false); setSpSuccess(false); }, 3000);
      } else {
        setSpError(data.detail || data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSpError('Network error. Please check your connection.');
    } finally {
      setSpLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
          <div className="db-spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* ── SIDEBAR ── */}
        <aside className="db-sidebar">
          <div className="db-sidebar-logo">
            <div className="db-sidebar-logo-text">Ingress<span>.</span></div>
            <div className="db-sidebar-logo-sub">Travel Platform</div>
          </div>
          <nav className="db-nav">
            <div className="db-nav-section">Main Menu</div>
            {NAV_ITEMS.map(item => (
              <button key={item.key} className={`db-nav-item${activeNav === item.key ? ' active' : ''}`} onClick={() => handleNav(item.key)}>
                {item.icon}
                {item.label}
                {item.badge && <span className="db-nav-badge">3</span>}
              </button>
            ))}
            <div className="db-nav-section" style={{ marginTop: 24 }}>Account</div>
            <button className="db-nav-item" onClick={() => router.push('/profile/edit')}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Settings
            </button>
            <button className="db-nav-item" onClick={() => { localStorage.clear(); router.push('/login'); }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </nav>
          <div className="db-sidebar-user" onClick={() => router.push('/profile/edit')}>
            <div className="db-sidebar-avatar">{getInitials()}</div>
            <div>
              <div className="db-sidebar-user-name">{userData?.fullname || userData?.username}</div>
              <div className="db-sidebar-user-role">Customer</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="db-main">

          {/* TOPBAR */}
          <header className="db-topbar">
            <div className="db-topbar-title">My Dashboard</div>
            <div className="db-topbar-right">
              <button className="db-topbar-btn" onClick={() => router.push('/notification')}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="db-notif-dot" />
              </button>
              <div className="db-topbar-avatar" onClick={() => router.push('/profile/edit')}>{getInitials()}</div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="db-content">

            {/* Welcome */}
            <div className="db-welcome db-animate db-animate-1">
              <div className="db-welcome-left">
                <div className="db-welcome-eyebrow">Welcome back</div>
                <div className="db-welcome-name">
                  {userData?.fullname?.split(' ')[0] || userData?.username} 👋
                </div>
                <div className="db-welcome-sub">
                  {totalApps > 0
                    ? `You have ${totalApps} visa application${totalApps > 1 ? 's' : ''} — ${activeApps} active`
                    : 'Ready to start your visa journey?'}
                </div>
              </div>
              <div className="db-welcome-right">
                <button className="db-welcome-btn db-welcome-btn-ghost" onClick={() => router.push('/package')}>
                  Browse Packages
                </button>
                <button className="db-welcome-btn db-welcome-btn-primary" onClick={() => router.push('/package')}>
                  + New Application
                </button>
              </div>
            </div>

            {/* SP Banner */}
            {(!spStatus || !spStatus.has_application) && (
              <div className="db-sp-banner db-animate db-animate-2">
                <div className="db-sp-banner-left">
                  <div className="db-sp-icon">
                    <svg fill="none" stroke="#07b3f2" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="db-sp-title">Become a Service Provider</div>
                    <div className="db-sp-sub">List your travel services, reach thousands of clients and grow your business on Ingress.</div>
                  </div>
                </div>
                <button className="db-sp-btn" onClick={() => setShowSPModal(true)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started
                </button>
              </div>
            )}

            {spStatus?.has_application && spStatus?.status === 'pending' && (
              <div className="db-sp-banner db-animate db-animate-2" style={{ borderColor: '#fef3c7', background: '#fffbeb' }}>
                <div className="db-sp-banner-left">
                  <div className="db-sp-icon" style={{ background: '#fef3c7' }}>
                    <svg fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="db-sp-title" style={{ color: '#92400e' }}>Application Pending</div>
                    <div className="db-sp-sub">Your Service Provider application is being reviewed. We'll notify you once it's processed.</div>
                  </div>
                </div>
                <span style={{ background: '#fef3c7', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 999 }}>
                  ⏳ Under Review
                </span>
              </div>
            )}

            {spStatus?.has_application && spStatus?.status === 'pending' && spStatus?.verification_call_scheduled && (
              <div className="db-sp-banner db-animate db-animate-2" style={{ borderColor: '#e0f7fe', background: '#f0f9ff' }}>
                <div className="db-sp-banner-left">
                  <div className="db-sp-icon" style={{ background: '#e0f7fe' }}>
                    <svg fill="none" stroke="#07b3f2" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="db-sp-title" style={{ color: '#0369a1' }}>Verification Call Scheduled</div>
                    <div className="db-sp-sub">Please be available for your verification video call. Check your notifications for details.</div>
                  </div>
                </div>
                <span style={{ background: '#e0f7fe', color: '#07b3f2', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 999 }}>
                  📅 Call Scheduled
                </span>
              </div>
            )}

            {spStatus?.has_application && spStatus?.status === 'approved' && (
              <div className="db-sp-banner db-animate db-animate-2" style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}>
                <div className="db-sp-banner-left">
                  <div className="db-sp-icon" style={{ background: '#d1fae5' }}>
                    <svg fill="none" stroke="#10b981" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="db-sp-title" style={{ color: '#065f46' }}>You're an Approved Service Provider! 🎉</div>
                    <div className="db-sp-sub">Your account is active. Start creating packages and accepting client calls.</div>
                  </div>
                </div>
                <button className="db-sp-btn" style={{ background: '#10b981' }} onClick={() => router.push('/agents/dashboard')}>
                  Go to SP Dashboard →
                </button>
              </div>
            )}

            {spStatus?.has_application && spStatus?.status === 'rejected' && (
              <div className="db-sp-banner db-animate db-animate-2" style={{ borderColor: '#fee2e2', background: '#fef2f2' }}>
                <div className="db-sp-banner-left">
                  <div className="db-sp-icon" style={{ background: '#fee2e2' }}>
                    <svg fill="none" stroke="#ef4444" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="db-sp-title" style={{ color: '#991b1b' }}>Application Rejected</div>
                    <div className="db-sp-sub">{spStatus?.rejection_reason || 'Your application did not meet our requirements.'}</div>
                  </div>
                </div>
                <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 999 }}>
                  ❌ Rejected
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="db-stats db-animate db-animate-3">
              {[
                { label: 'Total Applications', num: totalApps, icon: '📄', iconBg: '#e0f7fe', iconColor: '#07b3f2', change: 'All time' },
                { label: 'Completed', num: completedApps, icon: '✅', iconBg: '#d1fae5', iconColor: '#10b981', change: 'Approved visas' },
                { label: 'In Progress', num: activeApps, icon: '⚡', iconBg: '#fef3c7', iconColor: '#f59e0b', change: 'Active now' },
                { label: 'Docs Uploaded', num: totalDocs, icon: '📁', iconBg: '#ede9fe', iconColor: '#7c3aed', change: 'Total files' },
              ].map((s, i) => (
                <div key={s.label} className="db-stat-card">
                  <div className="db-stat-top">
                    <div className="db-stat-label">{s.label}</div>
                    <div className="db-stat-icon" style={{ background: s.iconBg }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                    </div>
                  </div>
                  <div className="db-stat-num">{String(s.num).padStart(2, '0')}</div>
                  <div className="db-stat-change">{s.change}</div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="db-grid db-animate db-animate-4">

              {/* Applications */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-title">My Applications</div>
                    <div className="db-card-sub">{totalApps} total applications</div>
                  </div>
                  <button className="db-card-action" onClick={() => router.push('/package')}>+ New</button>
                </div>

                {totalApps > 0 && (
                  <div className="db-filter-tabs">
                    {FILTERS.map(f => (
                      <button key={f.key} className={`db-filter-tab${activeFilter === f.key ? ' active' : ''}`} onClick={() => setActiveFilter(f.key)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {filteredApps.length === 0 && totalApps === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">🌍</div>
                    <div className="db-empty-title">No applications yet</div>
                    <div className="db-empty-sub">Browse our visa packages and start your first application today.</div>
                    <button className="db-empty-btn" onClick={() => router.push('/package')}>Browse Packages →</button>
                  </div>
                ) : filteredApps.length === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-title" style={{ fontSize: 13, color: '#94a3b8' }}>No {activeFilter} applications</div>
                  </div>
                ) : (
                  <div className="db-app-list">
                    {filteredApps.map(app => {
                      const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.not_started;
                      const emoji = STATUS_EMOJI[app.status] || '📄';
                      return (
                        <div key={app.id} className="db-app-item" onClick={() => router.push(`/application/${app.id}`)}>
                          <div className="db-app-emoji">{emoji}</div>
                          <div className="db-app-info">
                            <div className="db-app-title">{app.package_country} — {app.package_title}</div>
                            <div className="db-app-bar-wrap">
                              <div className="db-app-bar" style={{ width: `${status.progress}%`, background: status.color }} />
                            </div>
                            <div className="db-app-meta">
                              <div className="db-app-date">{app.submitted_at ? `Applied ${formatDate(app.submitted_at)}` : 'Draft'}</div>
                              <div className="db-app-status" style={{ background: status.bg, color: status.color }}>{status.label}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Panel */}
              <div className="db-right db-animate db-animate-5">

                {/* Profile Card */}
                <div className="db-profile-card">
                  <div className="db-profile-avatar">{getInitials()}</div>
                  <div className="db-profile-name">{userData?.fullname || userData?.username}</div>
                  <div className="db-profile-email">{userData?.email}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <span style={{ background: '#e0f7fe', color: '#07b3f2', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>✓ Verified</span>
                    <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>Customer</span>
                  </div>
                  <div className="db-profile-divider" />
                  {userData?.country && (
                    <div className="db-profile-row">
                      <span className="db-profile-row-label">Country</span>
                      <span className="db-profile-row-val">{userData.country}</span>
                    </div>
                  )}
                  {userData?.phone && (
                    <div className="db-profile-row">
                      <span className="db-profile-row-label">Phone</span>
                      <span className="db-profile-row-val">{userData.phone}</span>
                    </div>
                  )}
                  {userData?.date_joined && (
                    <div className="db-profile-row">
                      <span className="db-profile-row-label">Joined</span>
                      <span className="db-profile-row-val">{formatJoined(userData.date_joined)}</span>
                    </div>
                  )}
                  <button className="db-edit-btn" onClick={() => router.push('/profile/edit')}>Edit Profile</button>
                </div>

                {/* Quick Links */}
                <div className="db-quick-card">
                  <div className="db-quick-title">Quick Links</div>
                  {[
                    { icon: '📦', label: 'Browse Packages', route: '/package', bg: '#e0f7fe' },
                    { icon: '🔖', label: 'Saved Packages', route: '/bookmarks', bg: '#ede9fe' },
                    { icon: '📞', label: 'Book a Call', route: '/calls', bg: '#d1fae5' },
                    { icon: '⚙️', label: 'Settings', route: '/settings', bg: '#fef3c7' },
                  ].map(item => (
                    <button key={item.label} className="db-quick-item" onClick={() => router.push(item.route)}>
                      <div className="db-quick-item-icon" style={{ background: item.bg }}>{item.icon}</div>
                      <span className="db-quick-item-label">{item.label}</span>
                      <span className="db-quick-item-arrow">›</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── SP MODAL ── */}
      {showSPModal && (
        <div className="sp-modal-overlay" onClick={() => !spLoading && setShowSPModal(false)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <div>
                <div className="sp-modal-title">Become a Service Provider</div>
                <div className="sp-modal-sub">Fill in your business details to apply. Our team will review and get back to you.</div>
              </div>
              <button className="sp-modal-close" onClick={() => !spLoading && setShowSPModal(false)}>✕</button>
            </div>
            <div className="sp-modal-body">
              {spSuccess ? (
                <div className="sp-success">
                  🎉 Application submitted! We'll review it and reach out to schedule a verification call.
                </div>
              ) : (
                <form className="sp-modal-form" onSubmit={handleSPSubmit}>
                  {spError && <div className="sp-error">⚠️ {spError}</div>}

                  <div className="sp-modal-row">
                    <div className="sp-field">
                      <label className="sp-label">Business Name *</label>
                      <input className="sp-input" placeholder="e.g. Apex Travel Agency" required
                        value={spForm.business_name}
                        onChange={e => setSpForm({ ...spForm, business_name: e.target.value })}
                        disabled={spLoading} />
                    </div>
                    <div className="sp-field">
                      <label className="sp-label">Business Type *</label>
                      <select className="sp-select" required
                        value={spForm.business_type}
                        onChange={e => setSpForm({ ...spForm, business_type: e.target.value })}
                        disabled={spLoading}>
                        <option value="">Select type...</option>
                        <option value="travel_consultant">Travel Consultant</option>
                        <option value="visa_agency">Visa Agency</option>
                        <option value="tour_operator">Tour Operator</option>
                        <option value="immigration_consultant">Immigration Consultant</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="sp-modal-row">
                    <div className="sp-field">
                      <label className="sp-label">Country *</label>
                      <input className="sp-input" placeholder="e.g. Nigeria" required
                        value={spForm.country}
                        onChange={e => setSpForm({ ...spForm, country: e.target.value })}
                        disabled={spLoading} />
                    </div>
                    <div className="sp-field">
                      <label className="sp-label">Business Phone *</label>
                      <input className="sp-input" placeholder="+234 801 234 5678" required
                        value={spForm.phone}
                        onChange={e => setSpForm({ ...spForm, phone: e.target.value })}
                        disabled={spLoading} />
                    </div>
                  </div>

                  <div className="sp-field">
                    <label className="sp-label">Business Bio</label>
                    <textarea className="sp-textarea" placeholder="Tell us about your business, experience and services..."
                      value={spForm.bio}
                      onChange={e => setSpForm({ ...spForm, bio: e.target.value })}
                      disabled={spLoading} />
                  </div>

                  <div className="sp-divider" />

                  <div className="sp-modal-row">
                    <div className="sp-field">
                      <label className="sp-label">Government ID *</label>
                      <label className={`sp-file-label${spIdDoc ? ' has-file' : ''}`}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {spIdDoc ? `✓ ${spIdDoc.name.slice(0, 18)}...` : 'Upload ID document'}
                        <input className="sp-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => setSpIdDoc(e.target.files[0])}
                          disabled={spLoading} />
                      </label>
                    </div>
                    <div className="sp-field">
                      <label className="sp-label">Profile Picture</label>
                      <label className={`sp-file-label${spProfilePic ? ' has-file' : ''}`}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {spProfilePic ? `✓ ${spProfilePic.name.slice(0, 18)}...` : 'Upload photo'}
                        <input className="sp-file-input" type="file" accept=".jpg,.jpeg,.png"
                          onChange={e => setSpProfilePic(e.target.files[0])}
                          disabled={spLoading} />
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="sp-submit" disabled={spLoading}>
                    {spLoading ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Submitting...</>
                    ) : (
                      <> Submit Application →</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}