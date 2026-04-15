'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f2f5; font-family: 'DM Sans', sans-serif; }
    .agent-shell { display: flex; min-height: 100vh; background: #f0f2f5; }
    .agent-sidebar { width: 240px; flex-shrink: 0; background: #ffffff; border-right: 1px solid #e8eaed; display: flex; flex-direction: column; padding: 24px 0 20px; position: sticky; top: 0; height: 100vh; }
    .agent-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #e8eaed; }
    .agent-sidebar-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .agent-sidebar-logo-text { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #0f172a; }
    .agent-sidebar-logo-sub { font-size: 10px; color: #94a3b8; font-weight: 500; letter-spacing: 0.04em; }
    .agent-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
    .agent-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; cursor: pointer; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #64748b; transition: all 0.15s; text-align: left; width: 100%; }
    .agent-nav-item:hover { background: #f4f6f8; color: #374151; }
    .agent-nav-item.active { background: #e0f7fe; color: #07b3f2; }
    .agent-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
    .agent-nav-badge { margin-left: auto; background: #07b3f2; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; min-width: 20px; text-align: center; }
    .agent-nav-badge.red { background: #ff3b5c; }
    .agent-sidebar-profile { padding: 12px 16px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #e8eaed; }
    .agent-sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
    .agent-sidebar-name { font-size: 12px; font-weight: 600; color: #0f172a; }
    .agent-sidebar-role { font-size: 10px; color: #94a3b8; }
    .agent-main { flex: 1; min-width: 0; padding: 24px 24px 48px; }
    .agent-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .agent-topbar-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0f172a; }
    .agent-topbar-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .status-toggle-wrap { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e8eaed; border-radius: 12px; padding: 8px 14px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; transition: background 0.3s; }
    .status-dot.available { background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
    .status-dot.busy { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }
    .status-dot.offline { background: #94a3b8; }
    .status-label { font-size: 12px; font-weight: 600; color: #0f172a; }
    .status-select { border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #64748b; cursor: pointer; outline: none; }
    .agent-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    @media (max-width: 1100px) { .agent-stats-row { grid-template-columns: repeat(2, 1fr); } }
    .agent-stat-card { background: white; border-radius: 14px; border: 1px solid #e8eaed; padding: 16px 18px; }
    .agent-stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; font-weight: 600; }
    .agent-stat-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1; }
    .agent-stat-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .agent-stat-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-size: 14px; }
    .agent-content-row { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }
    @media (max-width: 1200px) { .agent-content-row { grid-template-columns: 1fr; } }
    .incoming-call-card { background: white; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; }
    .incoming-call-header { padding: 16px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .incoming-call-title { font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'DM Sans', sans-serif; }
    .incoming-call-count { background: #ff3b5c; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
    .call-request-item { padding: 16px 18px; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 14px; transition: background 0.15s; }
    .call-request-item:hover { background: #fafbfc; }
    .call-request-item:last-child { border-bottom: none; }
    .call-request-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #e0f7fe, #bae6fd); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #07b3f2; flex-shrink: 0; font-family: 'Playfair Display', serif; }
    .call-request-info { flex: 1; min-width: 0; }
    .call-request-name { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
    .call-request-meta { font-size: 11px; color: #94a3b8; }
    .call-request-pkg { display: inline-flex; align-items: center; gap: 4px; background: #e0f7fe; color: #0284c7; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; margin-top: 5px; }
    .call-request-actions { display: flex; gap: 7px; flex-shrink: 0; }
    .call-btn-accept { padding: 7px 14px; border-radius: 8px; border: none; background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; font-size: 11px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 2px 8px rgba(7,179,242,0.25); transition: opacity 0.2s, transform 0.15s; }
    .call-btn-accept:hover { opacity: 0.9; transform: translateY(-1px); }
    .call-btn-accept:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .call-btn-decline { padding: 7px 14px; border-radius: 8px; border: 1px solid #e8eaed; background: white; color: #64748b; font-size: 11px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
    .call-btn-decline:hover { border-color: #ff3b5c; color: #ff3b5c; }
    @keyframes pulse-border { 0%, 100% { box-shadow: 0 0 0 0 rgba(7,179,242,0.4); } 50% { box-shadow: 0 0 0 6px rgba(7,179,242,0); } }
    .call-request-item.new { animation: pulse-border 1.5s ease-in-out infinite; border-radius: 12px; }
    .call-empty { padding: 48px 20px; text-align: center; }
    .call-empty-icon { font-size: 36px; margin-bottom: 12px; }
    .call-empty-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .call-empty-sub { font-size: 12px; color: #94a3b8; }
    .agent-right-panel { display: flex; flex-direction: column; gap: 14px; }

    /* ── Active call card ── */
    .active-call-card { background: linear-gradient(135deg, #07b3f2, #0284c7); border-radius: 14px; padding: 18px; color: white; margin-bottom: 0; }
    .active-call-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.75; margin-bottom: 12px; }
    .active-call-user { font-size: 16px; font-weight: 700; font-family: 'Playfair Display', serif; margin-bottom: 4px; }
    .active-call-pkg { font-size: 11px; opacity: 0.8; margin-bottom: 14px; }
    .active-call-timer { font-size: 28px; font-weight: 700; font-family: 'Playfair Display', serif; letter-spacing: 0.05em; margin-bottom: 14px; }
    .active-call-actions { display: flex; gap: 8px; }
    .active-call-btn { flex: 1; padding: 9px; border-radius: 9px; font-size: 11px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: opacity 0.2s; }
    .active-call-btn:hover { opacity: 0.85; }
    .active-call-btn.join { background: white; color: #07b3f2; }
    .active-call-btn.end { background: rgba(255,255,255,0.18); color: white; border: 1px solid rgba(255,255,255,0.3); }

    /* ── Multi-call stack ── */
    .active-calls-stack { display: flex; flex-direction: column; gap: 10px; }
    .active-calls-header { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
    .active-calls-badge { background: #ff3b5c; color: white; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px; }

    .history-card { background: white; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; }
    .history-header { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #0f172a; }
    .history-item { padding: 12px 16px; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 12px; }
    .history-item:last-child { border-bottom: none; }
    .history-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .history-name { font-size: 12px; font-weight: 600; color: #0f172a; }
    .history-time { font-size: 10px; color: #94a3b8; margin-top: 1px; }
    .history-badge { margin-left: auto; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }

    /* ── Unlock Message button ── */
    .unlock-msg-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 7px; border: 1.5px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700; color: #0284c7; cursor: pointer; transition: all 0.18s; white-space: nowrap; flex-shrink: 0; }
    .unlock-msg-btn:hover { background: #e0f7fe; border-color: #07b3f2; color: #07b3f2; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(7,179,242,0.18); }
    .unlock-msg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .unlock-msg-btn.unlocked { background: #dcfce7; border-color: #22c55e; color: #16a34a; cursor: default; }
    .unlock-msg-btn.unlocked:hover { transform: none; box-shadow: none; background: #dcfce7; border-color: #22c55e; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
    .modal-box { background: white; border-radius: 18px; padding: 24px; max-width: 360px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.18); }
    .modal-title { font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'DM Sans', sans-serif; margin-bottom: 5px; }
    .modal-sub { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
    .modal-reasons { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
    .modal-reason-btn { padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; text-align: left; transition: all 0.15s; }
    .modal-reason-btn:hover { border-color: #07b3f2; color: #07b3f2; background: #f0f9ff; }
    .modal-reason-btn.selected { border-color: #07b3f2; color: #07b3f2; background: #e0f7fe; }
    .modal-actions { display: flex; gap: 8px; }
    .modal-cancel { flex: 1; padding: 10px; border-radius: 9px; border: 1px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
    .modal-confirm { flex: 1; padding: 10px; border-radius: 9px; border: none; background: linear-gradient(135deg, #ff3b5c, #e11d48); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; color: white; cursor: pointer; }
    @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: white; padding: 12px 18px; border-radius: 12px; font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.25); z-index: 200; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 8px; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.3s ease both; }
    @media (max-width: 768px) { .agent-sidebar { display: none; } .agent-main { padding: 16px; } .agent-stats-row { grid-template-columns: repeat(2, 1fr); } .agent-content-row { grid-template-columns: 1fr; } }
    @keyframes evalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes evalSlideUp { from { opacity: 0; transform: translateY(32px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes successPop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    @keyframes scoreCount { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .eval-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; animation: evalFadeIn 0.3s ease; }
    .eval-modal { background: #ffffff; border-radius: 24px; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.22); animation: evalSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1); font-family: 'DM Sans', sans-serif; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
    .eval-modal::-webkit-scrollbar { width: 5px; }
    .eval-modal::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }
    .eval-header { background: linear-gradient(135deg, #07b3f2 0%, #0284c7 100%); padding: 24px 28px 20px; border-radius: 24px 24px 0 0; position: relative; overflow: hidden; }
    .eval-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.08); }
    .eval-header::after { content: ''; position: absolute; bottom: -20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.06); }
    .eval-header-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
    .eval-header-icon { width: 46px; height: 46px; border-radius: 14px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .eval-close-btn { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .eval-close-btn:hover { background: rgba(255,255,255,0.25); }
    .eval-header h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: white; margin-bottom: 5px; position: relative; z-index: 1; }
    .eval-header p { font-size: 12.5px; color: rgba(255,255,255,0.8); position: relative; z-index: 1; line-height: 1.5; }
    .eval-applicant { display: flex; align-items: center; gap: 10px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; padding: 14px 28px; }
    .eval-applicant-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
    .eval-applicant-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .eval-applicant-meta { font-size: 11px; color: #94a3b8; margin-top: 1px; }
    .eval-applicant-badge { margin-left: auto; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .eval-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }
    .eval-section-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .eval-section-label::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
    .eval-question { margin-bottom: 14px; }
    .eval-question:last-child { margin-bottom: 0; }
    .eval-question-text { font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; line-height: 1.5; }
    .eval-yn-row { display: flex; gap: 8px; }
    .eval-yn-btn { flex: 1; padding: 10px 0; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.18s; font-family: 'DM Sans', sans-serif; color: #64748b; }
    .eval-yn-btn:hover { border-color: #07b3f2; color: #07b3f2; background: #f0fbff; }
    .eval-yn-btn.yes-active { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
    .eval-yn-btn.no-active { border-color: #dc2626; background: #fff1f2; color: #dc2626; }
    .eval-stars { display: flex; gap: 6px; }
    .eval-star { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: all 0.15s; }
    .eval-star:hover { border-color: #f59e0b; background: #fffbeb; transform: scale(1.08); }
    .eval-star.active { border-color: #f59e0b; background: #fffbeb; }
    .eval-star-label { font-size: 10px; color: #94a3b8; margin-top: 5px; display: flex; justify-content: space-between; padding: 0 2px; }
    .eval-rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .eval-rec-btn { padding: 12px 6px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; cursor: pointer; text-align: center; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
    .eval-rec-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.07); }
    .eval-rec-icon { font-size: 20px; margin-bottom: 5px; }
    .eval-rec-label { font-size: 11px; font-weight: 600; }
    .eval-rec-btn.approve-active { border-color: #16a34a; background: #f0fdf4; }
    .eval-rec-btn.approve-active .eval-rec-label { color: #16a34a; }
    .eval-rec-btn.reject-active { border-color: #dc2626; background: #fff1f2; }
    .eval-rec-btn.reject-active .eval-rec-label { color: #dc2626; }
    .eval-rec-btn.more-active { border-color: #d97706; background: #fffbeb; }
    .eval-rec-btn.more-active .eval-rec-label { color: #d97706; }
    .eval-score-preview { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
    .eval-score-ring { position: relative; width: 70px; height: 70px; flex-shrink: 0; }
    .eval-score-ring svg { transform: rotate(-90deg); }
    .eval-score-val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .eval-score-num { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; line-height: 1; animation: scoreCount 0.4s ease; }
    .eval-score-pct { font-size: 9px; color: #0284c7; font-weight: 600; }
    .eval-score-info h4 { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .eval-score-info p { font-size: 11px; color: #64748b; line-height: 1.5; }
    .eval-score-bar-wrap { height: 5px; background: #bae6fd; border-radius: 999px; margin-top: 7px; overflow: hidden; }
    .eval-score-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #07b3f2, #0284c7); transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1); }
    .eval-footer { padding: 16px 28px 24px; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 10px; }
    .eval-footer-row { display: flex; gap: 10px; }
    .eval-cancel-btn { flex: 1; padding: 13px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: transparent; color: #64748b; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
    .eval-cancel-btn:hover { background: #f8fafc; }
    .eval-submit-btn { flex: 2; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 14px rgba(7,179,242,0.3); }
    .eval-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .eval-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .eval-success { padding: 48px 28px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; animation: evalSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
    .eval-success-icon { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px; animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 12px 32px rgba(7,179,242,0.3); }
    .eval-success h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .eval-success p { font-size: 13px; color: #64748b; line-height: 1.6; max-width: 320px; }
    .eval-success-score-wrap { margin: 24px 0; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 20px; padding: 20px 32px; width: 100%; }
    .eval-success-score-num { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; line-height: 1; }
    .eval-success-score-label { font-size: 12px; color: #0284c7; font-weight: 600; margin-top: 4px; }
    .eval-done-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 14px rgba(7,179,242,0.3); transition: opacity 0.2s; }
    .eval-done-btn:hover { opacity: 0.9; }
    @media (max-width: 480px) { .eval-modal { border-radius: 20px; } .eval-header { padding: 20px 20px 16px; } .eval-body { padding: 20px; } .eval-footer { padding: 14px 20px 20px; } }
  `}</style>
);

// ─── Score helpers ────────────────────────────────────────────────────────────
function calculateScore(answers) {
  let total = 0, max = 0;
  max += 20; if (answers.hasDocuments === 'yes') total += 20;
  max += 25; if (answers.meetsEligibility === 'yes') total += 25;
  max += 25; if (answers.communicationScore > 0) total += (answers.communicationScore / 5) * 25;
  max += 15; if (answers.understandsProcess === 'yes') total += 15;
  max += 15; if (answers.answeredSatisfactorily === 'yes') total += 15;
  return max > 0 ? Math.round((total / max) * 100) : 0;
}
function getScoreColor(s) { return s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626'; }
function getScoreLabel(s) { return s >= 80 ? 'Highly Ready' : s >= 60 ? 'Moderately Ready' : s >= 40 ? 'Needs Preparation' : 'Not Ready'; }

// ─── Per-call elapsed timer (computed from startedAt, no shared interval) ────
function useElapsed(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

function formatTimer(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─── Active call card (self-contained timer per call) ─────────────────────────
function ActiveCallCard({ call, onJoin, onEnd }) {
  const elapsed = useElapsed(call.startedAt);
  return (
    <div className="active-call-card fade-up">
      <div className="active-call-label">🔴 LIVE CALL</div>
      <div className="active-call-user">{call.name}</div>
      <div className="active-call-pkg">{call.package || 'Discovery Call'}</div>
      <div className="active-call-timer">{formatTimer(elapsed)}</div>
      <div className="active-call-actions">
        <button className="active-call-btn join" onClick={() => onJoin(call)}>Join Meet</button>
        <button className="active-call-btn end"  onClick={() => onEnd(call, elapsed)}>End Call</button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreRing({ score, size = 70 }) {
  const r = (size / 2) - 6, circ = 2 * Math.PI * r, dash = (score / 100) * circ, color = getScoreColor(score);
  return (
    <div className="eval-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0f2fe" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="eval-score-val">
        <span className="eval-score-num" style={{ color }}>{score}</span>
        <span className="eval-score-pct">/ 100</span>
      </div>
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="eval-yn-row">
      <button className={`eval-yn-btn${value === 'yes' ? ' yes-active' : ''}`} onClick={() => onChange('yes')}>✓ Yes</button>
      <button className={`eval-yn-btn${value === 'no'  ? ' no-active'  : ''}`} onClick={() => onChange('no')}>✗ No</button>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return (
    <div>
      <div className="eval-stars">
        {[1,2,3,4,5].map(n => (
          <button key={n} className={`eval-star${(hover || value) >= n ? ' active' : ''}`}
            onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>⭐</button>
        ))}
      </div>
      <div className="eval-star-label">
        <span>Poor</span>
        {value > 0 && <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>{labels[hover || value]}</span>}
        <span>Excellent</span>
      </div>
    </div>
  );
}

// ─── Evaluation form ──────────────────────────────────────────────────────────
function CallEvaluationForm({ isOpen, onClose, callData, getToken, getWsRef }) {
  const [answers, setAnswers] = useState({
    hasDocuments: null, meetsEligibility: null, communicationScore: 0,
    understandsProcess: null, answeredSatisfactorily: null, recommendation: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const score = calculateScore(answers);
  const answeredCount = [
    answers.hasDocuments, answers.meetsEligibility, answers.communicationScore > 0,
    answers.understandsProcess, answers.answeredSatisfactorily, answers.recommendation,
  ].filter(Boolean).length;
  const isComplete = answeredCount === 6;

  const sendOnboardingComplete = () => {
    const ws = getWsRef();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'onboarding_complete', session_id: callData.sessionId,
        readiness_score: score, recommendation: answers.recommendation,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/calls/evaluate/${callData.sessionId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          has_right_documents:     answers.hasDocuments === 'yes',
          meets_eligibility:       answers.meetsEligibility === 'yes',
          communication_score:     answers.communicationScore,
          understands_process:     answers.understandsProcess === 'yes',
          answered_satisfactorily: answers.answeredSatisfactorily === 'yes',
          recommendation:          answers.recommendation,
          readiness_score:         score,
        }),
      });
      if (!res.ok) throw new Error();
      sendOnboardingComplete();
      setSubmitted(true);
    } catch {
      sendOnboardingComplete();
      setSubmitted(true);
    } finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="eval-overlay">
      <div className="eval-modal" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="eval-success">
            <div className="eval-success-icon">✅</div>
            <h3>Evaluation Saved!</h3>
            <p>The applicant's assessment has been recorded and the readiness score has been calculated.</p>
            <div className="eval-success-score-wrap">
              <div className="eval-success-score-num" style={{ color: getScoreColor(score) }}>{score}%</div>
              <div className="eval-success-score-label">{getScoreLabel(score)} — {callData.applicantName}</div>
              <div className="eval-score-bar-wrap" style={{ marginTop: 12 }}>
                <div className="eval-score-bar" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${getScoreColor(score)}, ${getScoreColor(score)}aa)` }} />
              </div>
            </div>
            <button className="eval-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="eval-header">
              <div className="eval-header-top">
                <div className="eval-header-icon">📋</div>
                <button className="eval-close-btn" onClick={onClose}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <h2>Post-Call Evaluation</h2>
              <p>Rate the applicant based on the call you just completed.</p>
            </div>
            <div className="eval-applicant">
              <div className="eval-applicant-avatar">{callData.applicantInitials}</div>
              <div>
                <div className="eval-applicant-name">{callData.applicantName}</div>
                <div className="eval-applicant-meta">Discovery Call · {callData.callDuration}</div>
              </div>
              <div className="eval-applicant-badge">Call Ended ✓</div>
            </div>
            <div className="eval-body">
              <div>
                <div className="eval-section-label">📁 Section 1 — Documents</div>
                <div className="eval-question">
                  <div className="eval-question-text">Does the applicant have the right documents?</div>
                  <YesNo value={answers.hasDocuments} onChange={v => setAnswers(p => ({ ...p, hasDocuments: v }))} />
                </div>
              </div>
              <div>
                <div className="eval-section-label">🛂 Section 2 — Eligibility & Assessment</div>
                <div className="eval-question">
                  <div className="eval-question-text">Does the applicant meet the eligibility requirements?</div>
                  <YesNo value={answers.meetsEligibility} onChange={v => setAnswers(p => ({ ...p, meetsEligibility: v }))} />
                </div>
                <div className="eval-question">
                  <div className="eval-question-text">How well is the applicant communicating?</div>
                  <StarRating value={answers.communicationScore} onChange={v => setAnswers(p => ({ ...p, communicationScore: v }))} />
                </div>
                <div className="eval-question">
                  <div className="eval-question-text">Does the applicant understand the visa process?</div>
                  <YesNo value={answers.understandsProcess} onChange={v => setAnswers(p => ({ ...p, understandsProcess: v }))} />
                </div>
                <div className="eval-question">
                  <div className="eval-question-text">Is the applicant answering questions satisfactorily?</div>
                  <YesNo value={answers.answeredSatisfactorily} onChange={v => setAnswers(p => ({ ...p, answeredSatisfactorily: v }))} />
                </div>
              </div>
              <div>
                <div className="eval-section-label">✅ Section 3 — Recommendation</div>
                <div className="eval-rec-grid">
                  {[
                    { key: 'approve',        icon: '✅', label: 'Approve',   cls: 'approve-active' },
                    { key: 'reject',         icon: '❌', label: 'Reject',    cls: 'reject-active'  },
                    { key: 'more_documents', icon: '📎', label: 'Need Docs', cls: 'more-active'    },
                  ].map(opt => (
                    <button key={opt.key}
                      className={`eval-rec-btn${answers.recommendation === opt.key ? ' ' + opt.cls : ''}`}
                      onClick={() => setAnswers(p => ({ ...p, recommendation: opt.key }))}>
                      <div className="eval-rec-icon">{opt.icon}</div>
                      <div className="eval-rec-label" style={{
                        color: answers.recommendation === opt.key
                          ? opt.key === 'approve' ? '#16a34a' : opt.key === 'reject' ? '#dc2626' : '#d97706'
                          : '#64748b'
                      }}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {answeredCount >= 2 && (
                <div className="eval-score-preview">
                  <ScoreRing score={score} />
                  <div className="eval-score-info">
                    <h4>Readiness Score</h4>
                    <p style={{ color: getScoreColor(score), fontWeight: 600 }}>{getScoreLabel(score)}</p>
                    <div className="eval-score-bar-wrap">
                      <div className="eval-score-bar" style={{ width: `${score}%` }} />
                    </div>
                    <p style={{ marginTop: 5 }}>Based on {answeredCount}/6 answers so far</p>
                  </div>
                </div>
              )}
            </div>
            <div className="eval-footer">
              <div className="eval-footer-row">
                <button className="eval-cancel-btn" onClick={onClose}>Cancel</button>
                <button className="eval-submit-btn" onClick={handleSubmit} disabled={!isComplete || submitting}>
                  {submitting
                    ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : <>Save Evaluation <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DECLINE_REASONS = ['On another call', 'Stepped away briefly', 'Not my specialization', 'Technical issues'];

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const router = useRouter();

  const [agentStatus, setAgentStatus]       = useState('available');
  const [activeNav, setActiveNav]           = useState('dashboard');
  const [requests, setRequests]             = useState([]);

  // ✅ FIX: Array instead of single object — supports multiple concurrent calls
  const [activeCalls, setActiveCalls]       = useState([]);

  const [declineModal, setDeclineModal]     = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [toast, setToast]                   = useState(null);
  const [agentProfile, setAgentProfile]     = useState(null);
  const [history, setHistory]               = useState([]);
  const [stats, setStats]                   = useState({ total: 0, completed: 0, missed: 0 });
  const [loadingAccept, setLoadingAccept]   = useState(null);
  const [showEvalForm, setShowEvalForm]     = useState(false);
  const [evalCallData, setEvalCallData]     = useState(null);
  const [unlockedChats, setUnlockedChats]   = useState({});
  const [unlockingId, setUnlockingId]       = useState(null);

  const wsRef = useRef(null);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const getWsRef = () => wsRef.current;

  // ── Profile ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { setAgentProfile(JSON.parse(savedUser)); } catch (e) { console.log('Could not parse saved user:', e); }
      }
    }
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/profile/`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setAgentProfile(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (err) { console.log('Profile fetch error:', err.message); }
    };
    fetchProfile();
  }, []);

  // ── History ────────────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/calls/history/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.sessions || []);
        setStats({ total: data.total || 0, completed: data.completed || 0, missed: data.missed || 0 });
      }
    } catch (err) { console.log('History error:', err.message); }
  };

  useEffect(() => { fetchHistory(); }, []);

  // ── Status change (manual only) ────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setAgentStatus(newStatus);
    try {
      await fetch(`${API_BASE}/calls/agent/status/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    const ws = new WebSocket(`wss://web-production-f50dc.up.railway.app/ws/calls/?token=${token}`);
    wsRef.current = ws;
    ws.onopen    = () => console.log('WebSocket connected');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'call_request') {
        setRequests(prev => [{
          id: data.session_id, name: data.user_name,
          initials: data.user_name?.split(' ').map(n => n[0]).join('').toUpperCase(),
          package: data.package || 'Discovery Call', time: 'Just now', isNew: true,
        }, ...prev]);
        showToast('📞 New call request incoming!');
      }
      if (data.type === 'call_declined') showToast('⚡ Incoming call rerouted to you');
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);
    return () => ws.close();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // ── Accept call ────────────────────────────────────────────────────────────
  // ✅ FIX: No longer sets agent status to busy.
  // ✅ FIX: Pushes into activeCalls array instead of overwriting a single activeCall.
  const handleAccept = async (request) => {
    setLoadingAccept(request.id);
    try {
      const res = await fetch(`${API_BASE}/calls/accept/${request.id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        // Remove from pending requests
        setRequests(prev => prev.filter(r => r.id !== request.id));
        // Add to active calls array with a startedAt timestamp for per-call timer
        setActiveCalls(prev => [...prev, {
          ...request,
          meet_link: data.meet_link,
          startedAt: Date.now(),      // used by useElapsed hook
        }]);
        // ✅ Do NOT call handleStatusChange('busy') here — agent stays available
        showToast('✅ Call accepted — Meet link sent to user');
      } else {
        showToast('❌ Failed to accept call. Try again.');
      }
    } catch {
      showToast('❌ Network error. Try again.');
    } finally {
      setLoadingAccept(null);
    }
  };

  // ── Decline call ───────────────────────────────────────────────────────────
  const handleDeclineConfirm = async () => {
    if (!selectedReason) return;
    const request = declineModal;
    setDeclineModal(null);
    try {
      await fetch(`${API_BASE}/calls/decline/${request.id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: selectedReason }),
      });
      setRequests(prev => prev.filter(r => r.id !== request.id));
      showToast('↩️ Call declined — routing to next agent');
    } catch {
      showToast('❌ Failed to decline. Try again.');
    }
  };

  // ── End a specific call ────────────────────────────────────────────────────
  // ✅ FIX: Takes a specific call object and elapsed seconds, works with multi-call array.
  // ✅ FIX: Does NOT reset agent status — agent stays available throughout.
  const handleEndCall = async (call, elapsed) => {
    const duration = formatTimer(elapsed);
    try {
      await fetch(`${API_BASE}/calls/end/${call.id}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error('End call failed:', err);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call_completed', session_id: call.id }));
    }

    // Remove this specific call from the active calls array
    setActiveCalls(prev => prev.filter(c => c.id !== call.id));

    fetchHistory();

    // Open evaluation form for this specific ended call
    setEvalCallData({
      sessionId: call.id,
      applicantName: call.name,
      applicantInitials: call.initials,
      callDuration: duration,
    });
    setShowEvalForm(true);
  };

  // ── Unlock chat ────────────────────────────────────────────────────────────
  const handleUnlockChat = async (sessionId, userName) => {
    setUnlockingId(sessionId);
    try {
      await fetch(`${API_BASE}/calls/unlock-chat/${sessionId}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      });

      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'unlock_chat',
          session_id: sessionId,
          user_name: userName,
          unlocked_by: agentProfile?.username || 'agent',
          timestamp: new Date().toISOString(),
        }));
      }

      setUnlockedChats(prev => ({ ...prev, [sessionId]: true }));
      showToast(`💬 Chat unlocked for ${userName}`);
    } catch (err) {
      console.error('Unlock chat error:', err);
      showToast('❌ Could not unlock chat. Try again.');
    } finally {
      setUnlockingId(null);
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const agentInitials = agentProfile
    ? (`${agentProfile.first_name?.[0] || ''}${agentProfile.last_name?.[0] || ''}`.toUpperCase() || '?')
    : '?';

  const agentFullName = agentProfile
    ? (`${agentProfile.first_name || ''} ${agentProfile.last_name || ''}`.trim() || agentProfile.username || 'Agent')
    : 'Loading...';

  const navItems = [
    {
      key: 'dashboard', label: 'Dashboard', route: '/agents/dashboard',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
    },
    {
      key: 'clients', label: 'Clients', route: '/agents/dashboard/clients',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
    },
    {
      key: 'settings', label: 'Settings', route: '/agents/settings',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.878 3.31.905 2.432 2.432a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.878 1.527-.905 3.31-2.432 2.432a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.878-3.31-.905-2.432-2.432a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.878-1.527.905-3.31 2.432-2.432.996.574 2.296.07 2.573-1.066z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <GlobalStyles />
      <div className="agent-shell">

        {/* ── Sidebar ── */}
        <aside className="agent-sidebar">
          <div className="agent-sidebar-logo">
            <div className="agent-sidebar-logo-icon">✈️</div>
            <div>
              <div className="agent-sidebar-logo-text">MyVisa</div>
              <div className="agent-sidebar-logo-sub">AGENT PORTAL</div>
            </div>
          </div>
          <nav className="agent-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`agent-nav-item${activeNav === item.key ? ' active' : ''}`}
                onClick={() => { setActiveNav(item.key); router.push(item.route); }}
              >
                {item.icon}
                {item.label}
                {item.key === 'calls' && requests.length > 0 && (
                  <span className="agent-nav-badge red">{requests.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="agent-sidebar-profile">
            <div className="agent-sidebar-avatar">{agentInitials}</div>
            <div>
              <div className="agent-sidebar-name">{agentFullName}</div>
              <div className="agent-sidebar-role">Visa Consultant</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="agent-main">

          {/* Topbar */}
          <div className="agent-topbar">
            <div>
              <div className="agent-topbar-title">Agent Dashboard</div>
              <div className="agent-topbar-sub">{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{agentFullName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Visa Consultant</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {agentInitials}
              </div>
              <div className="status-toggle-wrap">
                <div className={`status-dot ${agentStatus}`} />
                <span className="status-label">{{ available: 'Available', busy: 'Busy', offline: 'Offline' }[agentStatus]}</span>
                <select className="status-select" value={agentStatus} onChange={e => handleStatusChange(e.target.value)}>
                  <option value="available">Set Available</option>
                  <option value="busy">Set Busy</option>
                  <option value="offline">Go Offline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="agent-stats-row">
            {[
              { icon: '📞', iconBg: '#e0f7fe', label: 'Total Calls Today',  value: stats.total,                                                                   sub: 'All sessions today'     },
              { icon: '✅', iconBg: '#dcfce7', label: 'Completed',           value: stats.completed,                                                               sub: 'Successfully handled'   },
              { icon: '📭', iconBg: '#fef3c7', label: 'Missed',              value: stats.missed,                                                                  sub: 'No agent was available' },
              { icon: '🔴', iconBg: '#ffe4e6', label: 'Active Calls',        value: activeCalls.length,                                                            sub: 'Calls in progress'      },
            ].map((stat, i) => (
              <div key={i} className="agent-stat-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="agent-stat-icon" style={{ background: stat.iconBg }}>{stat.icon}</div>
                <div className="agent-stat-label">{stat.label}</div>
                <div className="agent-stat-value">{stat.value}</div>
                <div className="agent-stat-sub">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Content grid */}
          <div className="agent-content-row">

            {/* Incoming requests */}
            <div className="incoming-call-card fade-up">
              <div className="incoming-call-header">
                <div className="incoming-call-title">Incoming Call Requests</div>
                {requests.length > 0 && <span className="incoming-call-count">{requests.length} waiting</span>}
              </div>
              {requests.length === 0 ? (
                <div className="call-empty">
                  <div className="call-empty-icon">📭</div>
                  <div className="call-empty-title">No pending requests</div>
                  <div className="call-empty-sub">
                    {agentStatus === 'available'
                      ? "You're online — new requests will appear here instantly"
                      : 'Set your status to Available to receive calls'}
                  </div>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request.id} className={`call-request-item${request.isNew ? ' new' : ''}`}>
                    <div className="call-request-avatar">{request.initials}</div>
                    <div className="call-request-info">
                      <div className="call-request-name">{request.name}</div>
                      <div className="call-request-meta">{request.time}</div>
                      <div className="call-request-pkg">{request.package}</div>
                    </div>
                    <div className="call-request-actions">
                      <button
                        className="call-btn-accept"
                        onClick={() => handleAccept(request)}
                        disabled={loadingAccept === request.id}
                      >
                        {loadingAccept === request.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        className="call-btn-decline"
                        onClick={() => { setDeclineModal(request); setSelectedReason(''); }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right panel */}
            <div className="agent-right-panel">

              {/* ✅ FIX: Render a card per active call — no more single activeCall */}
              {activeCalls.length > 0 ? (
                <div className="active-calls-stack">
                  <div className="active-calls-header">
                    🔴 Active Calls
                    <span className="active-calls-badge">{activeCalls.length}</span>
                  </div>
                  {activeCalls.map(call => (
                    <ActiveCallCard
                      key={call.id}
                      call={call}
                      onJoin={(c) => window.open(c.meet_link, '_blank')}
                      onEnd={handleEndCall}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8eaed', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📵</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>No Active Calls</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Accept a request to start a session</div>
                </div>
              )}

              {/* Recent sessions */}
              <div className="history-card fade-up">
                <div className="history-header">Recent Sessions</div>
                {history.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>No sessions yet</div>
                ) : (
                  history.slice(0, 5).map(item => {
                    const isUnlocked    = unlockedChats[item.id] || item.chat_unlocked;
                    const isLoadingThis = unlockingId === item.id;
                    const isCompleted   = item.status === 'completed';
                    return (
                      <div key={item.id} className="history-item" style={{ flexWrap: 'wrap', gap: 8 }}>
                        <div className="history-status-dot" style={{
                          background: item.status === 'completed' ? '#22c55e' : item.status === 'declined' ? '#ef4444' : '#f59e0b'
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="history-name">{item.user_name || 'Unknown User'}</div>
                          <div className="history-time">{new Date(item.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {isCompleted && (
                          <button
                            className={`unlock-msg-btn${isUnlocked ? ' unlocked' : ''}`}
                            onClick={() => !isUnlocked && handleUnlockChat(item.id, item.user_name)}
                            disabled={isLoadingThis || isUnlocked}
                            title={isUnlocked ? 'Chat already unlocked' : 'Unlock chat for this applicant'}
                          >
                            {isLoadingThis ? (
                              <div style={{ width: 10, height: 10, border: '1.5px solid #bae6fd', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            ) : isUnlocked ? (
                              <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"/></svg>Chat Unlocked</>
                            ) : (
                              <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Unlock Message</>
                            )}
                          </button>
                        )}
                        <span className="history-badge" style={{
                          background: item.status === 'completed' ? '#dcfce7' : item.status === 'declined' ? '#fee2e2' : '#fef3c7',
                          color:      item.status === 'completed' ? '#16a34a' : item.status === 'declined' ? '#dc2626' : '#d97706',
                        }}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Decline modal */}
      {declineModal && (
        <div className="modal-overlay" onClick={() => setDeclineModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>↩️</div>
            <div className="modal-title">Decline this call?</div>
            <div className="modal-sub">Please select a reason. {declineModal.name} will be automatically routed to the next available agent.</div>
            <div className="modal-reasons">
              {DECLINE_REASONS.map(reason => (
                <button key={reason} className={`modal-reason-btn${selectedReason === reason ? ' selected' : ''}`} onClick={() => setSelectedReason(reason)}>
                  {selectedReason === reason ? '✓ ' : ''}{reason}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setDeclineModal(null)}>Cancel</button>
              <button className="modal-confirm" onClick={handleDeclineConfirm} disabled={!selectedReason} style={{ opacity: selectedReason ? 1 : 0.5 }}>Decline Call</button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation form */}
      {showEvalForm && evalCallData && (
        <CallEvaluationForm
          isOpen={showEvalForm}
          onClose={() => { setShowEvalForm(false); setEvalCallData(null); }}
          callData={evalCallData}
          getToken={getToken}
          getWsRef={getWsRef}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}