'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f2f5; font-family: 'DM Sans', sans-serif; }

    .clients-shell { display: flex; min-height: 100vh; background: #f0f2f5; }
    .clients-sidebar { width: 240px; flex-shrink: 0; background: #ffffff; border-right: 1px solid #e8eaed; display: flex; flex-direction: column; padding: 24px 0 20px; position: sticky; top: 0; height: 100vh; }
    .clients-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #e8eaed; }
    .clients-sidebar-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .clients-sidebar-logo-text { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #0f172a; }
    .clients-sidebar-logo-sub { font-size: 10px; color: #94a3b8; font-weight: 500; letter-spacing: 0.04em; }
    .clients-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
    .clients-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; cursor: pointer; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #64748b; transition: all 0.15s; text-align: left; width: 100%; }
    .clients-nav-item:hover { background: #f4f6f8; color: #374151; }
    .clients-nav-item.active { background: #e0f7fe; color: #07b3f2; }
    .clients-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
    .clients-sidebar-profile { padding: 12px 16px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #e8eaed; }
    .clients-sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }
    .clients-main { flex: 1; min-width: 0; padding: 24px 24px 48px; }
    .clients-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .clients-topbar-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0f172a; }
    .clients-topbar-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .clients-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .clients-search-wrap { flex: 1; position: relative; }
    .clients-search-input { width: 100%; padding: 10px 14px 10px 38px; border-radius: 10px; border: 1px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a; outline: none; transition: border-color 0.2s; }
    .clients-search-input:focus { border-color: #07b3f2; }
    .clients-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
    .clients-filter-btn { padding: 10px 16px; border-radius: 10px; border: 1px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; white-space: nowrap; }
    .clients-filter-btn:hover { border-color: #07b3f2; color: #07b3f2; }
    .clients-filter-btn.active { border-color: #07b3f2; background: #e0f7fe; color: #07b3f2; }
    .clients-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
    .clients-stat-card { background: white; border-radius: 14px; border: 1px solid #e8eaed; padding: 16px 18px; }
    .clients-stat-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-size: 14px; }
    .clients-stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; font-weight: 600; }
    .clients-stat-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1; }
    .clients-table-card { background: white; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; }
    .clients-table-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .clients-table-title { font-size: 14px; font-weight: 700; color: #0f172a; }
    .clients-table-count { font-size: 11px; color: #94a3b8; }
    .clients-table { width: 100%; border-collapse: collapse; }
    .clients-table th { padding: 10px 20px; text-align: left; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
    .clients-table td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
    .clients-table tr:last-child td { border-bottom: none; }
    .clients-table tr:hover td { background: #fafbfc; }
    .clients-table tr { transition: background 0.15s; }
    .client-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e0f7fe, #bae6fd); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #07b3f2; flex-shrink: 0; font-family: 'Playfair Display', serif; }
    .client-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .client-email { font-size: 11px; color: #94a3b8; margin-top: 1px; }
    .client-badge { font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 999px; display: inline-block; }
    .client-score-wrap { display: flex; align-items: center; gap: 8px; }
    .client-score-bar-bg { flex: 1; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; max-width: 60px; }
    .client-score-bar { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
    .client-score-val { font-size: 11px; font-weight: 700; min-width: 28px; }

    /* ── Message button ── */
    .msg-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 11px; font-weight: 700;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: all 0.18s; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(7,179,242,0.25);
    }
    .msg-btn:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(7,179,242,0.35); }
    .msg-btn:active { transform: scale(0.96); }

    /* ── Detail Modal ── */
    .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
    .detail-modal { background: white; border-radius: 20px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.18); animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .detail-header { background: linear-gradient(135deg, #07b3f2, #0284c7); padding: 24px; border-radius: 20px 20px 0 0; position: relative; overflow: hidden; }
    .detail-header::before { content: ''; position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.08); }
    .detail-close { position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .detail-client-avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: white; font-family: 'Playfair Display', serif; margin-bottom: 12px; }
    .detail-client-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: white; margin-bottom: 4px; }
    .detail-client-email { font-size: 12px; color: rgba(255,255,255,0.8); }
    .detail-body { padding: 20px 24px; }
    .detail-section-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .detail-section-label::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
    .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .detail-info-item { background: #f8fafc; border-radius: 10px; padding: 10px 14px; border: 1px solid #f1f5f9; }
    .detail-info-label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .detail-info-value { font-size: 13px; font-weight: 600; color: #0f172a; }
    .detail-session-item { padding: 12px 14px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; background: #fafbfc; }
    .detail-session-item:last-child { margin-bottom: 0; }
    .detail-session-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .detail-session-name { font-size: 12px; font-weight: 600; color: #0f172a; }
    .detail-session-time { font-size: 10px; color: #94a3b8; margin-top: 1px; }
    .detail-session-badge { margin-left: auto; font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 999px; flex-shrink: 0; }
    .detail-score-big { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .clients-empty { text-align: center; padding: 60px 20px; }
    .clients-empty-icon { font-size: 40px; margin-bottom: 12px; }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    .skeleton { background: linear-gradient(90deg,#f0f2f5 25%,#e4e6ea 50%,#f0f2f5 75%); background-size: 200% auto; animation: shimmer 1.4s linear infinite; border-radius: 8px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    .fade-up { animation: fadeUp 0.3s ease both; }
    @media (max-width: 768px) {
      .clients-sidebar { display: none; }
      .clients-main { padding: 16px; }
      .clients-stats-row { grid-template-columns: repeat(2, 1fr); }
    }
  `}</style>
);

function getScoreColor(s) {
  if (s === null || s === undefined) return '#94a3b8';
  return s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626';
}
function getScoreLabel(s) {
  if (s === null || s === undefined) return 'Not Evaluated';
  return s >= 80 ? 'Highly Ready' : s >= 60 ? 'Moderately Ready' : s >= 40 ? 'Needs Prep' : 'Not Ready';
}
function getRecBadge(rec) {
  if (!rec) return { label: 'Pending', bg: '#f1f5f9', color: '#64748b' };
  if (rec === 'approve') return { label: 'Approved ✓', bg: '#dcfce7', color: '#16a34a' };
  if (rec === 'reject') return { label: 'Rejected', bg: '#fee2e2', color: '#dc2626' };
  return { label: 'Needs Docs', bg: '#fef3c7', color: '#d97706' };
}
function getStatusBadge(status) {
  if (status === 'completed') return { bg: '#dcfce7', color: '#16a34a' };
  if (status === 'missed') return { bg: '#fee2e2', color: '#dc2626' };
  if (status === 'pending') return { bg: '#fef3c7', color: '#d97706' };
  return { bg: '#f1f5f9', color: '#64748b' };
}
function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// ── Client Detail Modal ───────────────────────────────────────────────────────
function ClientDetailModal({ clientId, onClose, onMessage, getToken }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`${API_BASE}/calls/clients/${clientId}/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) { const data = await res.json(); setClient(data); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchClient();
  }, [clientId]);

  const latestEval = client?.sessions?.find(s => s.readiness_score !== null);
  const score = latestEval?.readiness_score ?? null;
  const rec = latestEval?.recommendation ?? null;
  const recBadge = getRecBadge(rec);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skeleton" style={{ height: 20, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
            <div className="skeleton" style={{ height: 80, marginTop: 10 }} />
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        ) : client ? (
          <>
            <div className="detail-header">
              <button className="detail-close" onClick={onClose}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <div className="detail-client-avatar">{getInitials(client.name)}</div>
              <div className="detail-client-name">{client.name}</div>
              <div className="detail-client-email">{client.email}</div>

              {/* ── Message button inside modal ── */}
              {/* CHANGE 3: pass full client object instead of just clientId */}
              <button
                className="msg-btn"
                style={{ marginTop: 14 }}
                onClick={() => { onClose(); onMessage(client); }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Message Client
              </button>
            </div>

            <div className="detail-body">
              {score !== null && (
                <div className="detail-score-big">
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'white', border: `3px solid ${getScoreColor(score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: getScoreColor(score) }}>{score}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Readiness Score</div>
                    <div style={{ fontSize: 12, color: getScoreColor(score), fontWeight: 600, marginBottom: 5 }}>{getScoreLabel(score)}</div>
                    <span className="client-badge" style={{ background: recBadge.bg, color: recBadge.color }}>{recBadge.label}</span>
                  </div>
                </div>
              )}

              <div className="detail-section-label">👤 Client Info</div>
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-label">Phone</div>
                  <div className="detail-info-value">{client.phone || '—'}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Country</div>
                  <div className="detail-info-value">{client.country || '—'}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Total Calls</div>
                  <div className="detail-info-value">{client.total_calls}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Completed</div>
                  <div className="detail-info-value">{client.completed_calls}</div>
                </div>
                <div className="detail-info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-info-label">Member Since</div>
                  <div className="detail-info-value">
                    {new Date(client.date_joined).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="detail-section-label">📞 Call Sessions</div>
              {client.sessions?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: '#94a3b8' }}>No sessions yet</div>
              ) : (
                client.sessions?.map(session => {
                  const statusBadge = getStatusBadge(session.status);
                  const sessionRec = getRecBadge(session.recommendation);
                  return (
                    <div key={session.id} className="detail-session-item">
                      <div className="detail-session-dot" style={{ background: statusBadge.color }} />
                      <div style={{ flex: 1 }}>
                        <div className="detail-session-name">
                          {new Date(session.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="detail-session-time">
                          {new Date(session.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          {session.readiness_score !== null && (
                            <span style={{ marginLeft: 8, color: getScoreColor(session.readiness_score), fontWeight: 600 }}>
                              Score: {session.readiness_score}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className="detail-session-badge" style={{ background: statusBadge.bg, color: statusBadge.color }}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                        {session.recommendation && (
                          <span className="detail-session-badge" style={{ background: sessionRec.bg, color: sessionRec.color }}>
                            {sessionRec.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <p style={{ fontSize: 13, color: '#64748b' }}>Could not load client details</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // ── CHANGE 1: handleMessage now accepts the full client object ──
  // Routes by latest_application_id instead of client user ID
  const handleMessage = (client) => {
    if (!client.latest_application_id) {
      alert('This client has no application yet.');
      return;
    }
    router.push(`/agents/dashboard/clients/chat/${client.latest_application_id}`);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) { try { setAgentProfile(JSON.parse(savedUser)); } catch {} }
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/calls/clients/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { const data = await res.json(); setClients(data.clients || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const agentInitials = agentProfile
    ? (`${agentProfile.first_name?.[0] || ''}${agentProfile.last_name?.[0] || ''}`.toUpperCase() || '?') : '?';
  const agentFullName = agentProfile
    ? (`${agentProfile.first_name || ''} ${agentProfile.last_name || ''}`.trim() || 'Agent') : 'Agent';

  const filteredClients = clients.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.country?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'approved' ? c.recommendation === 'approve' :
      filter === 'rejected' ? c.recommendation === 'reject' :
      filter === 'pending' ? !c.recommendation : true;
    return matchSearch && matchFilter;
  });

  const totalApproved = clients.filter(c => c.recommendation === 'approve').length;
  const totalPending  = clients.filter(c => !c.recommendation).length;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', route: '/agents/dashboard',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { key: 'clients', label: 'Clients', route: '/agents/dashboard/clients',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg> },
    { key: 'settings', label: 'Settings', route: '/agents/settings',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.878 3.31.905 2.432 2.432a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.878 1.527-.905 3.31-2.432 2.432a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.878-3.31-.905-2.432-2.432a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.878-1.527.905-3.31 2.432-2.432.996.574 2.296.07 2.573-1.066z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <GlobalStyles />
      <div className="clients-shell">

        {/* Sidebar */}
        <aside className="clients-sidebar">
          <div className="clients-sidebar-logo">
            <div className="clients-sidebar-logo-icon">✈️</div>
            <div>
              <div className="clients-sidebar-logo-text">MyVisa</div>
              <div className="clients-sidebar-logo-sub">AGENT PORTAL</div>
            </div>
          </div>
          <nav className="clients-nav">
            {navItems.map(item => (
              <button key={item.key}
                className={`clients-nav-item${item.key === 'clients' ? ' active' : ''}`}
                onClick={() => router.push(item.route)}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
          <div className="clients-sidebar-profile">
            <div className="clients-sidebar-avatar">{agentInitials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{agentFullName}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Visa Consultant</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="clients-main">

          {/* Topbar */}
          <div className="clients-topbar">
            <div>
              <div className="clients-topbar-title">Clients</div>
              <div className="clients-topbar-sub">
                {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <button onClick={() => router.push('/agents/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e8eaed', background: 'white', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="clients-stats-row fade-up">
            {[
              { icon: '👥', iconBg: '#e0f7fe', label: 'Total Clients', value: clients.length },
              { icon: '✅', iconBg: '#dcfce7', label: 'Approved',      value: totalApproved },
              { icon: '⏳', iconBg: '#fef3c7', label: 'Pending Review', value: totalPending },
            ].map((stat, i) => (
              <div key={i} className="clients-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="clients-stat-icon" style={{ background: stat.iconBg }}>{stat.icon}</div>
                <div className="clients-stat-label">{stat.label}</div>
                <div className="clients-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="clients-toolbar">
            <div className="clients-search-wrap">
              <svg className="clients-search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="clients-search-input" placeholder="Search by name, email or country..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['all', 'approved', 'rejected', 'pending'].map(f => (
              <button key={f} className={`clients-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="clients-table-card fade-up">
            <div className="clients-table-header">
              <div className="clients-table-title">All Clients</div>
              <div className="clients-table-count">{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</div>
            </div>

            {loading ? (
              <div style={{ padding: '20px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: '60%' }} />
                    </div>
                    <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 999 }} />
                  </div>
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">👥</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                  {search ? 'No clients found' : 'No clients yet'}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  {search ? `No results for "${search}"` : 'Clients will appear here after you complete calls'}
                </p>
              </div>
            ) : (
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Country</th>
                    <th>Calls</th>
                    <th>Last Call</th>
                    <th>Readiness</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => {
                    const score = client.readiness_score;
                    const recBadge = getRecBadge(client.recommendation);
                    return (
                      <tr key={client.id}>

                        {/* Clicking name/avatar opens detail modal */}
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="client-avatar">{getInitials(client.name)}</div>
                            <div>
                              <div className="client-name">{client.name}</div>
                              <div className="client-email">{client.email}</div>
                            </div>
                          </div>
                        </td>
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: 12, color: '#374151' }}>{client.country || '—'}</span>
                        </td>
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{client.total_calls}</span>
                        </td>
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {new Date(client.last_call).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          {score !== null ? (
                            <div className="client-score-wrap">
                              <div className="client-score-bar-bg">
                                <div className="client-score-bar" style={{ width: `${score}%`, background: getScoreColor(score) }} />
                              </div>
                              <span className="client-score-val" style={{ color: getScoreColor(score) }}>{score}%</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Not evaluated</span>
                          )}
                        </td>
                        <td onClick={() => setSelectedClientId(client.id)} style={{ cursor: 'pointer' }}>
                          <span className="client-badge" style={{ background: recBadge.bg, color: recBadge.color }}>
                            {recBadge.label}
                          </span>
                        </td>

                        {/* ── CHANGE 2: Message button passes full client object ── */}
                        <td>
                          <button
                            className="msg-btn"
                            onClick={(e) => { e.stopPropagation(); handleMessage(client); }}
                            title={`Message ${client.name}`}
                          >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Message
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Client Detail Modal */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onMessage={handleMessage}
          getToken={getToken}
        />
      )}
    </div>
  );
}