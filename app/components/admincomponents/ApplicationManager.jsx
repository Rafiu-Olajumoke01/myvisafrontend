'use client';
import React, { useState, useEffect } from 'react';

const API = 'https://web-production-f50dc.up.railway.app/api';
function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' };
}

const STATUS_MAP = {
  not_started: { label: 'Not Started', dot: '#94a3b8', bg: 'rgba(148,163,184,0.12)', text: '#64748b' },
  started:     { label: 'Started',     dot: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  text: '#2563eb' },
  processing:  { label: 'Processing',  dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#d97706' },
  completed:   { label: 'Completed',   dot: '#10b981', bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
};

const MEETING_MAP = {
  scheduled: { label: 'Scheduled', dot: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  text: '#2563eb' },
  cancelled: { label: 'Cancelled', dot: '#ef4444', bg: 'rgba(239,68,68,0.10)',   text: '#dc2626' },
  completed: { label: 'Completed', dot: '#10b981', bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .am-root * { box-sizing: border-box; }
    .am-root {
      font-family: 'DM Sans', sans-serif;
      --blue: #07b3f2;
      --blue-dark: #0284c7;
      --ink: #0a0f1e;
      --ink2: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --surface: #f8fafc;
      --white: #ffffff;
    }

    @keyframes am-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes am-fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes am-slideUp {
      from { opacity: 0; transform: translateY(28px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes am-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .am-fade { animation: am-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .am-fade-1 { animation-delay: 0.04s; }
    .am-fade-2 { animation-delay: 0.10s; }
    .am-fade-3 { animation-delay: 0.16s; }

    .am-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px 3px 7px; border-radius: 999px;
      font-size: 11px; font-weight: 700;
    }
    .am-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    .am-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 18px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 12px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 3px 10px rgba(7,179,242,0.25);
    }
    .am-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .am-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .am-btn-ghost {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 18px; border-radius: 10px; border: 1.5px solid var(--border);
      background: white; color: #475569; font-size: 12px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: all 0.15s;
    }
    .am-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; }

    .am-input {
      width: 100%; padding: 10px 14px; border-radius: 12px;
      border: 1.5px solid var(--border); background: white;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink2);
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .am-input:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,0.10); }

    .am-select {
      padding: 10px 14px; border-radius: 12px;
      border: 1.5px solid var(--border); background: white;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink2);
      outline: none; cursor: pointer; transition: border-color 0.15s;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center;
      padding-right: 36px;
    }
    .am-select:focus { border-color: #07b3f2; }

    .am-table-row { transition: background 0.12s; }
    .am-table-row:hover { background: #f8fafc; }

    .am-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(10,15,30,0.55);
      backdrop-filter: blur(8px);
      z-index: 50; display: flex; align-items: flex-start;
      justify-content: center; padding: 24px; overflow-y: auto;
      animation: am-fadeIn 0.2s ease;
    }
    .am-modal {
      background: white; border-radius: 24px;
      width: 100%; max-width: 760px; margin: auto;
      box-shadow: 0 32px 80px rgba(0,0,0,0.2);
      animation: am-slideUp 0.35s cubic-bezier(0.22,1,0.36,1);
    }
    .am-modal-sm { max-width: 520px; }

    .am-section {
      background: #f8fafc; border: 1px solid #f1f5f9;
      border-radius: 16px; padding: 20px 22px;
    }
    .am-section-title {
      font-size: 9px; font-weight: 800; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;
    }

    .am-field-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 3px; }
    .am-field-value { font-size: 13px; font-weight: 600; color: #1e293b; }

    .am-doc-row {
      display: flex; align-items: center; justify-content: space-between;
      background: white; border: 1px solid #f1f5f9; border-radius: 12px;
      padding: 12px 14px; transition: border-color 0.15s;
    }
    .am-doc-row:hover { border-color: #07b3f2; }

    .am-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: white; flex-shrink: 0;
    }

    .am-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% auto;
      animation: am-shimmer 1.4s linear infinite;
      border-radius: 8px;
    }

    .am-empty { padding: 56px 20px; text-align: center; }
    .am-empty-icon { font-size: 36px; margin-bottom: 10px; }
    .am-empty-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .am-empty-sub { font-size: 12px; color: #94a3b8; }

    .am-tag-row { display: flex; gap-size: 8px; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }

    .am-success-bar {
      display: flex; align-items: center; gap: 8px;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      border-radius: 12px; padding: 12px 16px; margin-top: 12px;
    }
  `}</style>
);

const avatarColors = ['#07b3f2','#0284c7','#7c3aed','#059669','#f59e0b','#ef4444','#ec4899'];
const initials = name => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || '?';

const Badge = ({ status, map }) => {
  const s = map[status] || Object.values(map)[0];
  return (
    <span className="am-badge" style={{ background: s.bg, color: s.text }}>
      <span className="am-badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

export default function ApplicationsManager() {
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm]       = useState({});

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch(`${API}/applications/admin/all/`, { headers: authHeaders() });
      const data = await res.json();
      setApps(data.applications || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSingle = async (id) => {
    try {
      const res = await fetch(`${API}/applications/${id}/`, { headers: authHeaders() });
      const data = await res.json();
      setSelected(data.application);
    } catch (e) { console.error(e); }
  };

  const handleCompleteMeeting = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/applications/${selected.id}/meeting/complete/`, {
        method: 'PATCH', headers: authHeaders(),
      });
      if (res.ok) { await fetchSingle(selected.id); await fetchApps(); }
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/applications/${selected.id}/admin/update/`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(editForm),
      });
      if (res.ok) { await fetchSingle(selected.id); await fetchApps(); setShowEditModal(false); }
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const openEdit = () => {
    setEditForm({
      status:           selected.status || 'not_started',
      consultant_name:  selected.consultant_name || '',
      consultant_title: selected.consultant_title || '',
      meeting_date:     selected.meeting_date || '',
      meeting_time:     selected.meeting_time || '',
      meeting_status:   selected.meeting_status || 'scheduled',
    });
    setShowEditModal(true);
  };

  const filtered = apps.filter(a => {
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="am-root" style={{ padding: '8px 0' }}>
        <GlobalStyles />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="am-skeleton" style={{ height: 64, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="am-root">
      <GlobalStyles />

      {/* Header */}
      <div className="am-fade am-fade-1" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: '#0a0f1e', lineHeight: 1.1 }}>
              Applications
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>
              {apps.length} total · {apps.filter(a=>a.status==='processing').length} under review
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['not_started','started','processing','completed'].map(s => {
              const count = apps.filter(a=>a.status===s).length;
              const sm = STATUS_MAP[s];
              return (
                <div key={s} style={{ background: sm.bg, color: sm.text, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sm.dot, display: 'inline-block' }} />
                  {count}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="am-fade am-fade-2" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="am-input"
          style={{ flex: 1, minWidth: 200 }}
          type="text" placeholder="🔍  Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="am-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="started">Started</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="am-fade am-fade-3" style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Student', 'Package', 'Status', 'Meeting', 'Docs', ''].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="am-empty">
                      <div className="am-empty-icon">📭</div>
                      <div className="am-empty-title">No applications found</div>
                      <div className="am-empty-sub">Try adjusting your search or filter</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((app, i) => (
                <tr key={app.id} className="am-table-row" style={{ borderTop: '1px solid #f8fafc' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="am-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                        {initials(app.full_name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{app.full_name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{app.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {app.package_country || '—'}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <Badge status={app.status} map={STATUS_MAP} />
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <Badge status={app.meeting_status || 'scheduled'} map={MEETING_MAP} />
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{app.documents_count ?? 0}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>files</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <button className="am-btn-primary" onClick={() => fetchSingle(app.id)} style={{ padding: '7px 16px', fontSize: 11 }}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="am-modal" style={{ margin: '24px auto' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="am-avatar" style={{ width: 48, height: 48, borderRadius: 14, fontSize: 16, background: avatarColors[0] }}>
                  {initials(selected.full_name)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#0a0f1e', lineHeight: 1.1 }}>{selected.full_name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{selected.email} · {selected.package_country}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="am-btn-ghost" onClick={openEdit} style={{ padding: '8px 16px', fontSize: 12 }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setSelected(null)} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.15s' }}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Status tags */}
              <div className="am-tag-row">
                <Badge status={selected.status} map={STATUS_MAP} />
                <Badge status={selected.meeting_status || 'scheduled'} map={MEETING_MAP} />
              </div>

              {/* Personal Info */}
              <div className="am-section">
                <div className="am-section-title">👤 Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px 20px' }}>
                  {[
                    ['Full Name',    selected.full_name],
                    ['Email',        selected.email],
                    ['Phone',        selected.phone],
                    ['Nationality',  selected.nationality],
                    ['Passport No.', selected.passport_number],
                    ['Date of Birth',selected.date_of_birth],
                    ['Address',      selected.address],
                    ['City',         selected.city],
                    ['Country',      selected.country],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="am-field-label">{label}</div>
                      <div className="am-field-value">{value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultant & Meeting */}
              <div className="am-section">
                <div className="am-section-title">📅 Consultant & Discovery Call</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px 20px', marginBottom: 14 }}>
                  {[
                    ['Consultant',   selected.consultant_name  || 'Not assigned'],
                    ['Title',        selected.consultant_title || '—'],
                    ['Meeting Date', selected.meeting_date ? new Date(selected.meeting_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—'],
                    ['Meeting Time', selected.meeting_time || '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="am-field-label">{label}</div>
                      <div className="am-field-value">{value}</div>
                    </div>
                  ))}
                </div>

                {selected.status === 'started' && selected.meeting_status !== 'completed' && (
                  <button className="am-btn-primary" onClick={handleCompleteMeeting} disabled={actionLoading}
                    style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 3px 10px rgba(16,185,129,0.25)' }}>
                    {actionLoading ? 'Marking...' : '✓ Mark Discovery Call as Completed'}
                  </button>
                )}
                {selected.meeting_status === 'completed' && (
                  <div className="am-success-bar">
                    <span style={{ fontSize: 16 }}>✅</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Discovery call completed successfully</span>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="am-section">
                <div className="am-section-title">📁 Uploaded Documents ({selected.documents?.length || 0})</div>
                {selected.documents?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.documents.map(doc => (
                      <div key={doc.id} className="am-doc-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(7,179,242,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#0284c7', flexShrink: 0 }}>
                            {doc.file_name?.split('.').pop().toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{doc.file_name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{doc.file_size}</div>
                          </div>
                        </div>
                        <a href={`http://localhost:8000${doc.file}`} target="_blank" rel="noreferrer"
                          style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 11, fontWeight: 700, color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
                          ↓ Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                    📂 No documents uploaded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selected && (
        <div className="am-modal-overlay" style={{ zIndex: 60 }} onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="am-modal am-modal-sm" style={{ margin: 'auto' }}>
            <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: '#0a0f1e' }}>Edit Application</div>
              <button onClick={() => setShowEditModal(false)} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleUpdateApplication} style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <div className="am-field-label" style={{ marginBottom: 6 }}>Application Status</div>
                <select className="am-select" style={{ width: '100%' }} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="not_started">Not Started</option>
                  <option value="started">Started</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="am-field-label" style={{ marginBottom: 6 }}>Consultant Name</div>
                  <input className="am-input" value={editForm.consultant_name} onChange={e => setEditForm({...editForm, consultant_name: e.target.value})} placeholder="e.g. Sarah Mitchell" />
                </div>
                <div>
                  <div className="am-field-label" style={{ marginBottom: 6 }}>Consultant Title</div>
                  <input className="am-input" value={editForm.consultant_title} onChange={e => setEditForm({...editForm, consultant_title: e.target.value})} placeholder="e.g. Visa Consultant" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="am-field-label" style={{ marginBottom: 6 }}>Meeting Date</div>
                  <input className="am-input" type="date" value={editForm.meeting_date} onChange={e => setEditForm({...editForm, meeting_date: e.target.value})} />
                </div>
                <div>
                  <div className="am-field-label" style={{ marginBottom: 6 }}>Meeting Time</div>
                  <input className="am-input" value={editForm.meeting_time} onChange={e => setEditForm({...editForm, meeting_time: e.target.value})} placeholder="e.g. 10:00 AM – 10:30 AM" />
                </div>
              </div>

              <div>
                <div className="am-field-label" style={{ marginBottom: 6 }}>Meeting Status</div>
                <select className="am-select" style={{ width: '100%' }} value={editForm.meeting_status} onChange={e => setEditForm({...editForm, meeting_status: e.target.value})}>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" className="am-btn-ghost" style={{ flex: 1, padding: '11px' }} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="am-btn-primary" style={{ flex: 2, padding: '11px' }} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}