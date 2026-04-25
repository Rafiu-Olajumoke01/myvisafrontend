'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .notif-page {
      min-height: 100vh;
      background: #f0f4f8;
      font-family: 'DM Sans', sans-serif;
      padding: 0 0 60px;
    }

    .notif-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0284c7 100%);
      padding: 40px 24px 60px;
      position: relative;
      overflow: hidden;
    }

    .notif-hero::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: rgba(7,179,242,0.08);
      pointer-events: none;
    }

    .notif-hero::after {
      content: '';
      position: absolute;
      bottom: -40px; left: 30%;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      pointer-events: none;
    }

    .notif-hero-inner {
      max-width: 780px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .notif-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 20px;
      transition: color 0.2s;
      background: none;
      border: none;
      padding: 0;
    }
    .notif-back:hover { color: white; }

    .notif-hero-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .notif-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: white;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .notif-hero-sub {
      font-size: 13px;
      color: rgba(255,255,255,0.55);
      font-weight: 400;
    }

    .notif-badge {
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      animation: pulse 2s ease-in-out infinite;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .notif-mark-all {
      padding: 10px 18px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .notif-mark-all:hover { background: rgba(255,255,255,0.15); }

    .notif-filters-wrap {
      max-width: 780px;
      margin: -20px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 2;
    }

    .notif-filters {
      display: flex;
      gap: 8px;
      background: white;
      padding: 6px;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .notif-filter-btn {
      flex: 1;
      padding: 9px 12px;
      border-radius: 10px;
      border: none;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
      color: #94a3b8;
      background: transparent;
    }
    .notif-filter-btn.active {
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white;
      box-shadow: 0 2px 8px rgba(7,179,242,0.3);
    }

    .notif-body {
      max-width: 780px;
      margin: 24px auto 0;
      padding: 0 24px;
    }

    .notif-section-label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      padding-left: 2px;
    }

    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }

    .notif-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: 14px;
      background: white;
      border: 1px solid #e8edf2;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      animation: fadeUp 0.3s ease both;
      position: relative;
      overflow: hidden;
    }
    .notif-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.07);
      transform: translateY(-1px);
    }
    .notif-card.unread {
      background: #f0f9ff;
      border-color: #bae6fd;
    }
    .notif-card.unread::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, #07b3f2, #0284c7);
      border-radius: 3px 0 0 3px;
    }

    .notif-icon-wrap {
      width: 42px; height: 42px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .notif-card-content { flex: 1; min-width: 0; }

    .notif-card-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 3px;
      line-height: 1.4;
    }

    .notif-card-msg {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notif-card-time {
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .notif-unread-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #07b3f2;
      flex-shrink: 0;
      margin-top: 4px;
      box-shadow: 0 0 0 3px rgba(7,179,242,0.15);
    }

    .notif-empty {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      border: 1px solid #e8edf2;
    }

    .notif-empty-icon {
      width: 64px; height: 64px;
      background: #f0f9ff;
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      margin: 0 auto 16px;
    }

    .notif-loading {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
      background: #f0f4f8;
    }

    .notif-spinner {
      width: 36px; height: 36px;
      border: 3px solid #e5e7eb;
      border-top-color: #07b3f2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 600px) {
      .notif-hero { padding: 32px 16px 52px; }
      .notif-hero-title { font-size: 24px; }
      .notif-filters-wrap { padding: 0 16px; }
      .notif-body { padding: 0 16px; }
      .notif-hero-top { flex-wrap: wrap; }
    }
  `}</style>
);

const ICONS = {
  sp_application_received: { emoji: '📥', bg: '#eff6ff', color: '#3b82f6' },
  sp_call_scheduled:       { emoji: '📅', bg: '#f0fdf4', color: '#22c55e' },
  sp_approved:             { emoji: '✅', bg: '#f0fdf4', color: '#16a34a' },
  sp_rejected:             { emoji: '❌', bg: '#fef2f2', color: '#ef4444' },
  call_request:            { emoji: '📞', bg: '#faf5ff', color: '#9333ea' },
  call_accepted:           { emoji: '📲', bg: '#f0fdf4', color: '#22c55e' },
  call_declined:           { emoji: '🚫', bg: '#fef2f2', color: '#ef4444' },
  call_completed:          { emoji: '✔️', bg: '#f0fdf4', color: '#16a34a' },
  package_application:     { emoji: '📦', bg: '#fff7ed', color: '#ea580c' },
  application_status_update: { emoji: '🔔', bg: '#e0f7fe', color: '#07b3f2' },
};

const DEFAULT_ICON = { emoji: '🔔', bg: '#e0f7fe', color: '#07b3f2' };

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function groupByDate(notifications) {
  const groups = {};
  notifications.forEach(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`https://web-production-f50dc.up.railway.app/api/notifications/${id}/read/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('https://web-production-f50dc.up.railway.app/api/notifications/read-all/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.data?.application_id) { router.push(`/application/${n.data.application_id}`); return; }
    if (n.data?.session_id) { router.push(`/calls/${n.data.session_id}`); return; }
    if (['sp_application_received', 'sp_call_scheduled', 'sp_approved', 'sp_rejected'].includes(n.type)) {
      router.push('/dashboard'); return;
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.is_read);

  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="notif-loading">
          <div className="notif-spinner" />
          <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>Loading notifications...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="notif-page">

        {/* ── HERO ── */}
        <div className="notif-hero">
          <div className="notif-hero-inner">
            <button className="notif-back" onClick={() => router.back()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="notif-hero-top">
              <div>
                <h1 className="notif-hero-title">Notifications</h1>
                <p className="notif-hero-sub">Stay updated with your visa journey</p>
                {unreadCount > 0 && (
                  <div className="notif-badge" style={{ marginTop: 10 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
                    {unreadCount} unread
                  </div>
                )}
              </div>
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="notif-filters-wrap">
          <div className="notif-filters">
            {[
              { key: 'all', label: `All  ${notifications.length > 0 ? `(${notifications.length})` : ''}` },
              { key: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
              { key: 'read', label: 'Read' },
            ].map(f => (
              <button
                key={f.key}
                className={`notif-filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── NOTIFICATIONS LIST ── */}
        <div className="notif-body">
          {filtered.length === 0 ? (
            <div className="notif-empty" style={{ marginTop: 24 }}>
              <div className="notif-empty-icon">🎉</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6, fontFamily: 'Playfair Display, serif' }}>
                {filter === 'unread' ? 'All caught up!' : 'No notifications'}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                {filter === 'unread' ? 'No unread notifications right now.' : 'Nothing here yet — check back soon.'}
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([label, items]) => (
              <div key={label}>
                <div className="notif-section-label" style={{ marginTop: 20 }}>{label}</div>
                <div className="notif-list">
                  {items.map((n, i) => {
                    const iconConfig = ICONS[n.type] || DEFAULT_ICON;
                    return (
                      <div
                        key={n.id}
                        className={`notif-card${!n.is_read ? ' unread' : ''}`}
                        style={{ animationDelay: `${i * 40}ms` }}
                        onClick={() => handleClick(n)}
                      >
                        <div
                          className="notif-icon-wrap"
                          style={{ background: iconConfig.bg }}
                        >
                          {iconConfig.emoji}
                        </div>
                        <div className="notif-card-content">
                          <div className="notif-card-title">{n.title}</div>
                          <div className="notif-card-msg">{n.message}</div>
                          <div className="notif-card-time">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {timeAgo(n.created_at)}
                          </div>
                        </div>
                        {!n.is_read && <div className="notif-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}