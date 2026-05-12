'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .inf-root {
    min-height: 100vh;
    background: #f6f8fc;
    font-family: 'DM Sans', sans-serif;
  }

  .inf-topbar {
    background: white;
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
  .inf-topbar-left { display: flex; align-items: center; gap: 16px; }
  .inf-back-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    border: 1px solid #eef0f6; background: white;
    font-size: 12px; font-weight: 600; color: #64748b;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .inf-back-btn:hover { background: #f6f8fc; color: #0a0e1a; }
  .inf-topbar-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #0a0e1a; }
  .inf-topbar-right { display: flex; align-items: center; gap: 10px; }

  .inf-content { padding: 28px 32px 48px; max-width: 1100px; margin: 0 auto; }

  .inf-hero {
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
  .inf-hero::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(7,179,242,0.12);
  }
  .inf-hero-left { position: relative; z-index: 1; }
  .inf-hero-eyebrow { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .inf-hero-name { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: white; letter-spacing: -0.5px; margin-bottom: 6px; }
  .inf-hero-sub { font-size: 13px; color: rgba(255,255,255,0.5); }
  .inf-hero-right { position: relative; z-index: 1; }

  .inf-promo-box {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px;
    padding: 16px 20px;
    text-align: center;
    min-width: 200px;
  }
  .inf-promo-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .inf-promo-code { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; color: #07b3f2; letter-spacing: 2px; margin-bottom: 10px; }
  .inf-copy-btn {
    padding: 7px 18px; border-radius: 8px;
    background: #07b3f2; color: white;
    border: none; font-size: 11px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .inf-copy-btn:hover { background: #0291c8; }
  .inf-copy-btn.copied { background: #10b981; }

  .inf-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .inf-stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #eef0f6;
    transition: box-shadow 0.2s;
  }
  .inf-stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .inf-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .inf-stat-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
  .inf-stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .inf-stat-num { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 700; color: #0a0e1a; line-height: 1; margin-bottom: 4px; }
  .inf-stat-sub { font-size: 11px; color: #94a3b8; }

  .inf-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #eef0f6;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .inf-card-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .inf-card-title { font-size: 14px; font-weight: 700; color: #0a0e1a; }
  .inf-card-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  .inf-table { width: 100%; border-collapse: collapse; }
  .inf-th { padding: 10px 20px; text-align: left; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; background: #f8fafc; white-space: nowrap; }
  .inf-td { padding: 14px 20px; font-size: 12.5px; color: #374151; }
  .inf-tr { border-top: 1px solid #f1f5f9; transition: background 0.12s; }
  .inf-tr:hover { background: #f8fafc; }

  .inf-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; }

  .inf-empty { padding: 56px 20px; text-align: center; }
  .inf-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .inf-empty-title { font-size: 14px; font-weight: 700; color: #0a0e1a; margin-bottom: 5px; }
  .inf-empty-sub { font-size: 12px; color: #94a3b8; }

  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .inf-animate { animation: fadeUp 0.4s ease both; }
  .inf-animate-1 { animation-delay: 0.05s; }
  .inf-animate-2 { animation-delay: 0.1s; }
  .inf-animate-3 { animation-delay: 0.15s; }
  .inf-animate-4 { animation-delay: 0.2s; }
  .inf-animate-5 { animation-delay: 0.25s; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .inf-spinner { width: 36px; height: 36px; border: 3px solid #eef0f6; border-top-color: #07b3f2; border-radius: 50%; animation: spin 0.8s linear infinite; }

  .inf-progress-track { height: 6px; border-radius: 999px; background: #f1f5f9; overflow: hidden; margin-top: 8px; }
  .inf-progress-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }

  .inf-earnings-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .inf-earn-half { padding: 24px 28px; }
  .inf-earn-half:first-child { border-right: 1px solid #f1f5f9; }
  .inf-earn-half-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .inf-earn-half-amount { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .inf-earn-half-sub { font-size: 11px; color: #94a3b8; margin-bottom: 16px; }
  .inf-earn-half-breakdown { display: flex; flex-direction: column; gap: 10px; }
  .inf-earn-row { display: flex; align-items: center; justify-content: space-between; }
  .inf-earn-row-left { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: #374151; }
  .inf-earn-row-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .inf-earn-row-val { font-size: 12px; font-weight: 700; color: #0a0e1a; }

  .inf-divider { height: 1px; background: #f1f5f9; margin: 0; }

  .inf-per-booking-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    align-items: center;
    padding: 14px 24px;
    border-top: 1px solid #f1f5f9;
    transition: background 0.12s;
  }
  .inf-per-booking-row:hover { background: #f8fafc; }
  .inf-per-booking-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 10px 24px;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
  }
  .inf-pbh-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }

  @media (max-width: 768px) {
    .inf-content { padding: 20px 16px 48px; }
    .inf-topbar { padding: 0 16px; }
    .inf-hero { flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px 20px; }
    .inf-hero-right { width: 100%; }
    .inf-promo-box { width: 100%; }
    .inf-stats { grid-template-columns: repeat(2, 1fr); }
    .inf-table-wrap { overflow-x: auto; }
    .inf-earnings-summary { grid-template-columns: 1fr; }
    .inf-earn-half:first-child { border-right: none; border-bottom: 1px solid #f1f5f9; }
    .inf-per-booking-row, .inf-per-booking-header { grid-template-columns: 2fr 1fr 1fr; }
    .inf-pb-val-col { display: none; }
  }
`;

const TYPE_CONFIG = {
  student:  { emoji: '🎓', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', dot: '#7c3aed' },
  tourist:  { emoji: '✈️', color: '#0284c7', bg: 'rgba(2,132,199,0.1)', dot: '#0284c7' },
  business: { emoji: '🏢', color: '#d97706', bg: 'rgba(217,119,6,0.1)', dot: '#d97706' },
  medical:  { emoji: '🏥', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', dot: '#dc2626' },
};

export default function InfluencerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      const [profileRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE}/auth/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/influencers/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.status === 401) { router.push('/login'); return; }
      if (profileRes.ok) setUserData(await profileRes.json());

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setStats(data.stats);
        setBookings(data.bookings.map(b => ({
          id: b.id,
          client_name: b.client_name,
          package: b.package_name,
          package_type: b.package_type,
          booking_date: b.booking_date,
          amount: b.booking_amount,
          commission: b.commission,
          status: b.status,
        })));
      } else if (dashboardRes.status === 403) {
        router.push('/dashboard');
      }

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stats?.promo_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMoney = (amount) => `₦${Number(amount).toLocaleString()}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filteredBookings = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const totalConfirmedEarnings = confirmedBookings.reduce((sum, b) => sum + b.commission, 0);
  const totalPendingEarnings = pendingBookings.reduce((sum, b) => sum + b.commission, 0);
  const totalPossibleEarnings = totalConfirmedEarnings + totalPendingEarnings;
  const confirmedPct = totalPossibleEarnings > 0 ? Math.round((totalConfirmedEarnings / totalPossibleEarnings) * 100) : 0;
  const pendingPct = 100 - confirmedPct;

  const packageBreakdown = Object.entries(
    bookings.reduce((acc, b) => {
      if (!acc[b.package_type]) acc[b.package_type] = { confirmed: 0, pending: 0, count: 0 };
      if (b.status === 'confirmed') acc[b.package_type].confirmed += b.commission;
      else acc[b.package_type].pending += b.commission;
      acc[b.package_type].count += 1;
      return acc;
    }, {})
  ).map(([type, vals]) => ({
    type, ...vals,
    possible: vals.confirmed + vals.pending,
    pct: Math.round((vals.confirmed / (vals.confirmed + vals.pending)) * 100),
  }));

  const getInitials = () => {
    if (!userData) return 'U';
    const name = userData.fullname || userData.username || '';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f8fc' }}>
          <div className="inf-spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="inf-root">

        <header className="inf-topbar">
          <div className="inf-topbar-left">
            <button className="inf-back-btn" onClick={() => router.push('/dashboard')}>← Back</button>
            <div className="inf-topbar-title">Influencer Dashboard</div>
          </div>
          <div className="inf-topbar-right">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}
              onClick={() => router.push('/dashboard')}>
              {getInitials()}
            </div>
          </div>
        </header>

        <main className="inf-content">

          {/* HERO */}
          <div className="inf-hero inf-animate inf-animate-1">
            <div className="inf-hero-left">
              <div className="inf-hero-eyebrow">🌟 Influencer Program</div>
              <div className="inf-hero-name">
                {userData?.fullname?.split(' ')[0] || userData?.username}'s Dashboard
              </div>
              <div className="inf-hero-sub">Share your code · Earn on every booking · Track your performance</div>
            </div>
            <div className="inf-hero-right">
              <div className="inf-promo-box">
                <div className="inf-promo-label">Your Promo Code</div>
                <div className="inf-promo-code">{stats?.promo_code || '——'}</div>
                <button className={`inf-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="inf-stats inf-animate inf-animate-2">
            {[
              { label: 'Confirmed Earnings', num: formatMoney(totalConfirmedEarnings), icon: '💰', iconBg: '#d1fae5', sub: `${confirmedBookings.length} confirmed bookings` },
              { label: 'Pending Earnings', num: formatMoney(totalPendingEarnings), icon: '⏳', iconBg: '#fef3c7', sub: `${pendingBookings.length} awaiting confirmation` },
              { label: 'Total Bookings', num: bookings.length, icon: '📦', iconBg: '#e0f7fe', sub: 'Using your promo code' },
              { label: 'Conversion Rate', num: `${stats?.conversion_rate || 0}%`, icon: '📈', iconBg: '#ede9fe', sub: 'Clicks that converted' },
            ].map((s) => (
              <div key={s.label} className="inf-stat-card">
                <div className="inf-stat-top">
                  <div className="inf-stat-label">{s.label}</div>
                  <div className="inf-stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                </div>
                <div className="inf-stat-num">{s.num}</div>
                <div className="inf-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* EARNINGS PERFORMANCE ANALYSIS */}
          <div className="inf-card inf-animate inf-animate-3">
            <div className="inf-card-header">
              <div>
                <div className="inf-card-title">📊 Earnings Performance Analysis</div>
                <div className="inf-card-sub">Summary of confirmed vs possible earnings across all bookings</div>
              </div>
            </div>

            <div className="inf-earnings-summary">
              <div className="inf-earn-half">
                <div className="inf-earn-half-label">Total Possible Earnings</div>
                <div className="inf-earn-half-amount" style={{ color: '#07b3f2' }}>{formatMoney(totalPossibleEarnings)}</div>
                <div className="inf-earn-half-sub">If every pending booking confirms</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Confirmed portion</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>{confirmedPct}%</span>
                  </div>
                  <div className="inf-progress-track">
                    <div className="inf-progress-fill" style={{ width: `${confirmedPct}%`, background: 'linear-gradient(90deg, #10b981, #07b3f2)' }} />
                  </div>
                </div>
                <div className="inf-earn-half-breakdown">
                  {packageBreakdown.map(({ type, possible }) => {
                    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.tourist;
                    return (
                      <div key={type} className="inf-earn-row">
                        <div className="inf-earn-row-left">
                          <div className="inf-earn-row-dot" style={{ background: cfg.dot }} />
                          {cfg.emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div className="inf-earn-row-val">{formatMoney(possible)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="inf-earn-half">
                <div className="inf-earn-half-label">Confirmed Earnings</div>
                <div className="inf-earn-half-amount" style={{ color: '#10b981' }}>{formatMoney(totalConfirmedEarnings)}</div>
                <div className="inf-earn-half-sub">{pendingPct}% still pending confirmation</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{ flex: confirmedPct || 1, background: 'rgba(16,185,129,0.12)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{formatMoney(totalConfirmedEarnings)}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Confirmed</div>
                  </div>
                  <div style={{ flex: pendingPct || 1, background: 'rgba(245,158,11,0.1)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>{formatMoney(totalPendingEarnings)}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Pending</div>
                  </div>
                </div>
                <div className="inf-earn-half-breakdown">
                  {packageBreakdown.map(({ type, confirmed, pending }) => {
                    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.tourist;
                    return (
                      <div key={type} className="inf-earn-row">
                        <div className="inf-earn-row-left">
                          <div className="inf-earn-row-dot" style={{ background: cfg.dot }} />
                          {cfg.emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{formatMoney(confirmed)}</span>
                          {pending > 0 && <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>+{formatMoney(pending)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="inf-divider" />

            <div style={{ padding: '16px 24px 8px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a', marginBottom: 2 }}>Per Booking Breakdown</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Confirmed and possible earnings for each individual booking</div>
            </div>

            <div className="inf-per-booking-header">
              <div className="inf-pbh-label">Client / Package</div>
              <div className="inf-pbh-label inf-pb-val-col">Booking Value</div>
              <div className="inf-pbh-label">Your Commission</div>
              <div className="inf-pbh-label">Status</div>
            </div>

            {bookings.length === 0 ? (
              <div className="inf-empty">
                <div className="inf-empty-icon">📭</div>
                <div className="inf-empty-title">No bookings yet</div>
                <div className="inf-empty-sub">Share your promo code and bookings will appear here</div>
              </div>
            ) : bookings.map((booking) => {
              const type = TYPE_CONFIG[booking.package_type] || TYPE_CONFIG.tourist;
              return (
                <div key={booking.id} className="inf-per-booking-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0a0e1a' }}>{booking.client_name}</span>
                    <span className="inf-badge" style={{ background: type.bg, color: type.color, width: 'fit-content' }}>
                      {type.emoji} {booking.package}
                    </span>
                  </div>
                  <div className="inf-pb-val-col" style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {formatMoney(booking.amount)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>
                      {formatMoney(booking.commission)}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                      {booking.status === 'confirmed' ? 'Earned ✓' : 'Possible — pending'}
                    </div>
                  </div>
                  <div>
                    <span className="inf-badge" style={{
                      background: booking.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: booking.status === 'confirmed' ? '#059669' : '#d97706',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}

            {bookings.length > 0 && (
              <div style={{ padding: '16px 24px', borderTop: '2px solid #f1f5f9', background: '#f8fafc', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a' }}>Total ({bookings.length} bookings)</div>
                <div className="inf-pb-val-col" style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a' }}>
                  {formatMoney(bookings.reduce((s, b) => s + b.amount, 0))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{formatMoney(totalConfirmedEarnings)} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>confirmed</span></div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>+{formatMoney(totalPendingEarnings)} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>pending</span></div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#07b3f2' }}>{formatMoney(totalPossibleEarnings)} possible</div>
              </div>
            )}
          </div>

          {/* BOOKINGS TABLE */}
          <div className="inf-card inf-animate inf-animate-4">
            <div className="inf-card-header">
              <div>
                <div className="inf-card-title">Booking Breakdown</div>
                <div className="inf-card-sub">Every booking made using your promo code</div>
              </div>
              <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
                {['all', 'confirmed', 'pending'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                      background: activeFilter === f ? 'white' : 'transparent',
                      color: activeFilter === f ? '#0a0e1a' : '#64748b',
                      boxShadow: activeFilter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      textTransform: 'capitalize',
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="inf-table-wrap">
              {filteredBookings.length === 0 ? (
                <div className="inf-empty">
                  <div className="inf-empty-icon">📭</div>
                  <div className="inf-empty-title">No bookings yet</div>
                  <div className="inf-empty-sub">Share your promo code and bookings will appear here</div>
                </div>
              ) : (
                <table className="inf-table">
                  <thead>
                    <tr>
                      {['Client', 'Package', 'Date', 'Booking Value', 'Your Commission', 'Status'].map(h => (
                        <th key={h} className="inf-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(booking => {
                      const type = TYPE_CONFIG[booking.package_type] || TYPE_CONFIG.tourist;
                      return (
                        <tr key={booking.id} className="inf-tr">
                          <td className="inf-td">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {booking.client_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0a0e1a' }}>{booking.client_name}</span>
                            </div>
                          </td>
                          <td className="inf-td">
                            <span className="inf-badge" style={{ background: type.bg, color: type.color }}>
                              {type.emoji} {booking.package}
                            </span>
                          </td>
                          <td className="inf-td" style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(booking.booking_date)}</td>
                          <td className="inf-td" style={{ fontSize: 13, fontWeight: 700, color: '#0a0e1a' }}>{formatMoney(booking.amount)}</td>
                          <td className="inf-td">
                            <span style={{ fontSize: 13, fontWeight: 800, color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>
                              {formatMoney(booking.commission)}
                            </span>
                          </td>
                          <td className="inf-td">
                            <span className="inf-badge" style={{
                              background: booking.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: booking.status === 'confirmed' ? '#059669' : '#d97706',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                              {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* TIPS CARD */}
          <div className="inf-card inf-animate inf-animate-5">
            <div className="inf-card-header">
              <div>
                <div className="inf-card-title">💡 How to Earn More</div>
                <div className="inf-card-sub">Tips to maximize your influencer earnings</div>
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: '📱', title: 'Share on Social Media', desc: 'Post your promo code on Instagram, TikTok and Twitter. The more people see it the more you earn.' },
                { icon: '👥', title: 'Target the Right Audience', desc: 'Share with people who are planning to travel, study abroad or need visa assistance.' },
                { icon: '💬', title: 'Tell Personal Stories', desc: 'Share your own Ingress experience. People trust recommendations from people they know.' },
              ].map((tip, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', border: '1px solid #eef0f6' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0a0e1a', marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{tip.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}