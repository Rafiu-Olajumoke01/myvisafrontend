'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ─── FETCH NOTIFICATIONS ───
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await fetch(
        'https://web-production-f50dc.up.railway.app/api/notifications/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── MARK ONE AS READ ───
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');

      await fetch(
        `https://web-production-f50dc.up.railway.app/api/notifications/${id}/read/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── MARK ALL AS READ ───
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');

      await fetch(
        'https://web-production-f50dc.up.railway.app/api/notifications/read-all/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // ─── CLICK HANDLER (SMART ROUTING) ───
  const handleClick = (n) => {
  if (n.data?.application_id) router.push(`/application/${n.data.application_id}`);
  if (n.data?.session_id) router.push(`/calls/${n.data.session_id}`);
  
  // ✅ Add these
  if (n.type === 'sp_application_received' || 
      n.type === 'sp_call_scheduled' || 
      n.type === 'sp_approved' || 
      n.type === 'sp_rejected') {
    router.push('/dashboard');
  }

  if (!n.is_read) markAsRead(n.id);
};

  // ─── FILTERING ───
  const filtered =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.is_read);

  // ─── ICONS (based on your backend types) ───
  const ICONS = {
    sp_application_received: "📥",
    sp_call_scheduled: "📅",
    sp_approved: "✅",
    sp_rejected: "❌",

    call_request: "📞",
    call_accepted: "📲",
    call_declined: "🚫",
    call_completed: "✔️",

    package_application: "📦",
    application_status_update: "🔔",
  };

  // ─── LOADING ───
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Notifications 🔔
              {unreadCount > 0 && (
                <span style={styles.badge}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={styles.sub}>
              Stay updated with your visa journey
            </p>
          </div>

          <button onClick={markAllRead} style={styles.markAll}>
            Mark all read
          </button>
        </div>

        {/* FILTERS */}
        <div style={styles.filters}>
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? '#07b3f2' : '#f1f5f9',
                color: filter === f ? 'white' : '#64748b',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <h3>No notifications</h3>
            <p>You are all caught up 🎉</p>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  ...styles.card,
                  background: n.is_read ? '#fff' : '#f0f9ff',
                  borderLeft: n.is_read
                    ? '4px solid #e5e7eb'
                    : '4px solid #07b3f2',
                }}
              >
                <div style={styles.icon}>
                  {ICONS[n.type] || '🔔'}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={styles.cardTitle}>{n.title}</h4>
                  <p style={styles.cardMsg}>{n.message}</p>

                  <span style={styles.time}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                {!n.is_read && <div style={styles.dot}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLES ───
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f6f8fc',
    padding: '30px',
    fontFamily: 'DM Sans, sans-serif',
  },
  container: {
    maxWidth: '850px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
  },
  sub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  badge: {
    marginLeft: 10,
    background: '#ef4444',
    color: 'white',
    fontSize: 12,
    padding: '3px 8px',
    borderRadius: 999,
  },
  markAll: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: 'white',
    fontSize: '12px',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  filterBtn: {
    padding: '8px 14px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid #eef0f6',
    cursor: 'pointer',
    transition: '0.2s',
  },
  icon: {
    fontSize: '18px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f6f8fc',
    borderRadius: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  cardMsg: {
    fontSize: '12px',
    color: '#64748b',
  },
  time: {
    fontSize: '10px',
    color: '#94a3b8',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#07b3f2',
    marginTop: '10px',
  },
  empty: {
    textAlign: 'center',
    marginTop: '80px',
    color: '#94a3b8',
  },
  loading: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#07b3f2',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};