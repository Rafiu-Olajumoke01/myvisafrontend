// components/admincomponents/AgentsManager.jsx
'use client';
import { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api';
function authHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  };
}

const STATUS_MAP = {
  pending:  { label: 'Pending',  dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#d97706' },
  approved: { label: 'Approved', dot: '#10b981', bg: 'rgba(16,185,129,0.10)',  text: '#059669' },
  rejected: { label: 'Rejected', dot: '#ef4444', bg: 'rgba(239,68,68,0.10)',   text: '#dc2626' },
};

const avatarColors = ['#07b3f2','#0284c7','#7c3aed','#059669','#dc2626','#d97706'];
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .ag-root * { box-sizing: border-box; }
    .ag-root { font-family: 'DM Sans', sans-serif; }

    @keyframes ag-fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ag-fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes ag-slideUp { from { opacity:0; transform:translateY(24px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ag-shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes ag-toast { from { opacity:0; transform:translateX(120%); } to { opacity:1; transform:translateX(0); } }

    .ag-fade { animation: ag-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .ag-fade-1 { animation-delay: 0.04s; }
    .ag-fade-2 { animation-delay: 0.10s; }
    .ag-fade-3 { animation-delay: 0.16s; }

    .ag-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px 3px 7px; border-radius: 999px;
      font-size: 11px; font-weight: 700;
    }
    .ag-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    .ag-table-row { transition: background 0.12s; }
    .ag-table-row:hover { background: #f8fafc; }

    .ag-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 20px; border-radius: 11px; border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 12px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 3px 12px rgba(7,179,242,0.28);
    }
    .ag-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .ag-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .ag-btn-danger {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 20px; border-radius: 11px;
      border: 1.5px solid rgba(239,68,68,0.25);
      background: rgba(239,68,68,0.06); color: #dc2626;
      font-size: 12px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .ag-btn-danger:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.4); }
    .ag-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .ag-btn-ghost {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 20px; border-radius: 11px; border: 1.5px solid #e2e8f0;
      background: white; color: #475569; font-size: 12px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .ag-btn-ghost:hover { background: #f8fafc; }

    .ag-input {
      padding: 10px 14px; border-radius: 12px; border: 1.5px solid #e2e8f0;
      background: white; font-family: 'DM Sans', sans-serif;
      font-size: 13px; color: #1e293b; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .ag-input:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,0.10); }
    .ag-input::placeholder { color: #94a3b8; }

    .ag-modal-overlay {
      position: fixed; inset: 0; background: rgba(10,15,30,0.55);
      backdrop-filter: blur(8px); z-index: 50;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      animation: ag-fadeIn 0.2s ease;
    }
    .ag-modal {
      background: white; border-radius: 24px; width: 100%; max-width: 500px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.22);
      animation: ag-slideUp 0.35s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
    }

    .ag-section { background: #f8fafc; border: 1px solid #f0f4f8; border-radius: 14px; padding: 18px 20px; }
    .ag-section-title { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
    .ag-field-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 3px; }
    .ag-field-value { font-size: 13px; font-weight: 600; color: #1e293b; }

    .ag-avatar {
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: white; flex-shrink: 0;
    }

    .ag-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% auto; animation: ag-shimmer 1.4s linear infinite; border-radius: 8px;
    }

    .ag-tab {
      padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
      text-transform: capitalize;
    }
    .ag-tab.active { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .ag-tab.inactive { background: transparent; color: #94a3b8; }
    .ag-tab.inactive:hover { color: #64748b; }

    .ag-toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 100;
      background: #0f172a; color: white; padding: 12px 20px;
      border-radius: 14px; font-size: 13px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      animation: ag-toast 0.35s cubic-bezier(0.22,1,0.36,1);
    }
  `}</style>
);

const Badge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className="ag-badge" style={{ background: s.bg, color: s.text }}>
      <span className="ag-badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

export default function AgentsManager() {
  const [agents, setAgents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('pending');
  const [search, setSearch]               = useState('');
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]                 = useState('');

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/calls/agents/`, { headers: authHeaders() });
      const data = await res.json();
      setAgents((data.agents || data || []).map((a, i) => ({ ...a, color: avatarColors[i % avatarColors.length] })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/calls/agents/${id}/${status}/`, { method: 'PATCH', headers: authHeaders() });
      if (res.ok) {
        setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
        showToast(status === 'approved' ? '✅ Agent approved — dashboard access granted' : status === 'rejected' ? '❌ Agent rejected' : '🔄 Agent re-approved');
      }
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const filtered = agents.filter(a => {
    const matchSearch = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount  = agents.filter(a => a.status === 'pending').length;
  const approvedCount = agents.filter(a => a.status === 'approved').length;
  const rejectedCount = agents.filter(a => a.status === 'rejected').length;

  if (loading) {
    return (
      <div className="ag-root" style={{ padding: '8px 0' }}>
        <GlobalStyles />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_,i) => <div key={i} className="ag-skeleton" style={{ height: 60, borderRadius: 14 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="ag-root">
      <GlobalStyles />

      {/* Header */}
      <div className="ag-fade ag-fade-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: '#0a0f1e', lineHeight: 1.1 }}>Agent Applications</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{agents.length} total · {pendingCount} pending review</div>
        </div>
        {/* Status summary */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Pending',  count: pendingCount,  ...STATUS_MAP.pending  },
            { label: 'Approved', count: approvedCount, ...STATUS_MAP.approved },
            { label: 'Rejected', count: rejectedCount, ...STATUS_MAP.rejected },
          ].map(s => (
            <div key={s.label} className="ag-badge" style={{ background: s.bg, color: s.text, padding: '5px 12px', fontSize: 11 }}>
              <span className="ag-badge-dot" style={{ background: s.dot }} />
              {s.count} {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="ag-fade ag-fade-2" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="ag-input"
          style={{ flex: 1, minWidth: 200 }}
          type="text" placeholder="🔍  Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
          {['pending', 'approved', 'rejected', 'all'].map(tab => (
            <button key={tab} className={`ag-tab ${filter === tab ? 'active' : 'inactive'}`} onClick={() => setFilter(tab)}>
              {tab}
              {tab === 'pending' && pendingCount > 0 && (
                <span style={{ marginLeft: 5, background: '#07b3f2', color: 'white', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ag-fade ag-fade-3" style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Agent', 'Contact', 'Experience', 'Speciality', 'Applied', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '56px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>No {filter === 'all' ? '' : filter} agents found</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>New applications will appear here</div>
                  </td>
                </tr>
              ) : filtered.map((agent, i) => (
                <tr key={agent.id} className="ag-table-row" style={{ borderTop: '1px solid #f8fafc' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ag-avatar" style={{ width: 36, height: 36, fontSize: 12, background: avatarColors[i % avatarColors.length] }}>
                        {initials(agent.full_name)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{agent.full_name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ fontSize: 12, color: '#475569' }}>{agent.email}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{agent.phone}</div>
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#64748b' }}>{agent.experience || '—'}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#64748b' }}>{agent.speciality || '—'}</td>
                  <td style={{ padding: '13px 20px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {agent.created_at ? new Date(agent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <Badge status={agent.status} />
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <button className="ag-btn-primary" onClick={() => setSelected(agent)} style={{ padding: '7px 16px', fontSize: 11 }}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="ag-modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="ag-modal">

            {/* Modal Header */}
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="ag-avatar" style={{ width: 48, height: 48, borderRadius: 14, fontSize: 16, background: selected.color || '#07b3f2' }}>
                  {initials(selected.full_name)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: '#0a0f1e', lineHeight: 1.1 }}>{selected.full_name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{selected.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Status */}
              <Badge status={selected.status} />

              {/* Info Grid */}
              <div className="ag-section">
                <div className="ag-section-title">👤 Agent Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                  {[
                    ['Phone',       selected.phone],
                    ['Experience',  selected.experience],
                    ['Speciality',  selected.speciality],
                    ['Location',    selected.location],
                    ['Applied',     selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="ag-field-label">{label}</div>
                      <div className="ag-field-value">{value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="ag-btn-danger" style={{ flex: 1, padding: '11px' }} onClick={() => updateStatus(selected.id, 'rejected')} disabled={actionLoading}>
                    ✕ Reject
                  </button>
                  <button className="ag-btn-primary" style={{ flex: 2, padding: '11px' }} onClick={() => updateStatus(selected.id, 'approved')} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : '✓ Approve & Grant Access'}
                  </button>
                </div>
              )}
              {selected.status === 'approved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Agent has full dashboard access</span>
                  </div>
                  <button className="ag-btn-danger" style={{ width: '100%', padding: '11px' }} onClick={() => updateStatus(selected.id, 'rejected')} disabled={actionLoading}>
                    Revoke Access
                  </button>
                </div>
              )}
              {selected.status === 'rejected' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>❌</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>This agent's access has been revoked</span>
                  </div>
                  <button className="ag-btn-primary" style={{ width: '100%', padding: '11px' }} onClick={() => updateStatus(selected.id, 'approved')} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : '↩ Re-approve Agent'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="ag-toast">{toast}</div>}
    </div>
  );
}