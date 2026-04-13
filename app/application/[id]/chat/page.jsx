'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const POLL_INTERVAL = 4000;
const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

export default function AgentChatPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [application, setApplication] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const pollRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) { try { setAgentProfile(JSON.parse(saved)); } catch { } }
    const fetchProfile = async () => {
      const t = token(); if (!t) return;
      try {
        const res = await fetch(`${API_BASE}/auth/profile/`, { headers: { Authorization: `Bearer ${t}` } });
        if (res.ok) { const d = await res.json(); setAgentProfile(d); localStorage.setItem('user', JSON.stringify(d)); }
      } catch { }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`${API_BASE}/applications/${id}/`, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.ok) { const data = await res.json(); setApplication(data.application || data); }
        else if (res.status === 401) router.push('/login');
      } catch { }
    };
    fetchApplication();
  }, [id]);

  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/messages/`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) {
        const data = await res.json();
        const msgs = data.messages || data;
        setMessages(msgs);
        if (initial) setLoading(false);
        const latestId = msgs[msgs.length - 1]?.id;
        if (latestId !== lastMessageIdRef.current) { lastMessageIdRef.current = latestId; setTimeout(scrollToBottom, 100); }
      }
    } catch { if (initial) setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchMessages(true);
    pollRef.current = setInterval(() => fetchMessages(false), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const tempMsg = { id: `temp-${Date.now()}`, content: text, sender_role: 'consultant', created_at: new Date().toISOString(), is_temp: true };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/messages/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) await fetchMessages(false);
    } catch { } finally { setSending(false); }
  };

  const handleFileUpload = async (files) => {
    setUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/applications/${id}/messages/file/`, {
          method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: formData,
        });
        if (res.ok) { await fetchMessages(false); setTimeout(scrollToBottom, 100); }
      }
    } catch { } finally { setUploadingFile(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d), today = new Date(), yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yest.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getFileExt = (name = '') => name.split('.').pop().toUpperCase();
  const isOwn = (msg) => msg.sender_role === 'consultant';

  const agentInitials = agentProfile
    ? (`${agentProfile.first_name?.[0] || ''}${agentProfile.last_name?.[0] || ''}`.toUpperCase() || '?')
    : '?';
  const agentFullName = agentProfile
    ? (`${agentProfile.first_name || ''} ${agentProfile.last_name || ''}`.trim() || agentProfile.username || 'Agent')
    : 'Agent';

  const clientName = application?.user_name || application?.applicant_name || 'Applicant';
  const clientInitials = clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const grouped = messages.reduce((g, msg) => {
    const k = msg.created_at ? new Date(msg.created_at).toDateString() : 'Unknown';
    if (!g[k]) g[k] = [];
    g[k].push(msg);
    return g;
  }, {});

  return (
    <div style={{ display: 'flex', height: '100dvh', width: '100vw', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(7,179,242,0.2); border-radius: 99px; }
        .msg-in { animation: msgIn 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes msgIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(7,179,242,0.45) !important; }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .attach-btn:hover { background: #e0f7fe !important; color: #07b3f2 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
      `}</style>

      {/* ── LEFT PANEL — hidden on mobile ── */}
      {!isMobile && (
        <div style={{ width: window.innerWidth < 1024 ? '32%' : '40%', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Abstract gradient background */}
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(160deg, #020f23 0%, #07509a 55%, #07b3f2 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative blobs */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }} viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice">
              <circle cx="340" cy="100" r="200" fill="white" />
              <circle cx="50" cy="380" r="130" fill="white" />
              <circle cx="360" cy="620" r="220" fill="white" />
              <circle cx="80" cy="800" r="90" fill="white" />
            </svg>
            {/* Dot grid */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.055 }} viewBox="0 0 400 900">
              {Array.from({ length: 12 }).map((_, r) =>
                Array.from({ length: 6 }).map((_, c) => (
                  <circle key={`${r}-${c}`} cx={c * 70 + 25} cy={r * 80 + 25} r="2.2" fill="white" />
                ))
              )}
            </svg>
          </div>

          {/* Back button */}
          <button onClick={() => router.push(`/application/${id}`)} style={{
            position: 'absolute', top: 20, left: 20,
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', zIndex: 2,
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo */}
          <div style={{ position: 'absolute', top: 20, left: 70, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>✈️</div>
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: 'white' }}>MyVisa</span>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.08em' }}>AGENT PORTAL</div>
            </div>
          </div>

          {/* Bottom card */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px', zIndex: 2 }}>
            {/* Agent identity card */}
            <div style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16,
              padding: '14px 16px', marginBottom: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #07b3f2, #0284c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0,
                }}>
                  {agentInitials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>{agentFullName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Visa Consultant · Online</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800,
              color: 'white', lineHeight: 1.25, margin: '0 0 8px',
            }}>
              Guide them<br />to success.
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.65 }}>
              Chatting with <strong style={{ color: 'white' }}>{clientName}</strong>
              {application?.package_country ? ` · ${application.package_country}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* ── RIGHT: Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{
          flexShrink: 0, background: 'white', borderBottom: '1px solid #e8eaed',
          padding: isMobile ? '12px 14px' : '14px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 1px 0 #f1f5f9',
        }}>

          {/* Back button — mobile only (desktop has it in left panel) */}
          {isMobile && (
            <button onClick={() => router.push('/agents/dashboard')} style={{
              width: 34, height: 34, borderRadius: 9, border: '1px solid #e8eaed',
              background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', flexShrink: 0,
            }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Client avatar */}
          <div style={{
            width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: 11,
            background: 'linear-gradient(135deg, #e0f7fe, #bae6fd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#07b3f2',
            fontFamily: "'Playfair Display', serif", flexShrink: 0,
          }}>
            {clientInitials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: isMobile ? 13 : 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {clientName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isMobile
                  ? (application?.package_country || `#${id}`)
                  : `Application #${id}${application?.package_country ? ` · ${application.package_country}` : ''}`
                }
              </span>
            </div>
          </div>

          {/* Agent identity — initials avatar + full name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{agentFullName}</p>
                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>Visa Consultant</p>
              </div>
            )}
            <div style={{
              width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #07b3f2, #0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {agentInitials}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile ? '14px 10px' : '20px',
          display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0,
        }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: 28, height: 28, border: '3px solid #e0f7fe', borderTopColor: '#07b3f2', borderRadius: '50%' }} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No messages yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8', maxWidth: 240, lineHeight: 1.6, margin: 0 }}>
                Start the conversation with {clientName}. They're waiting to hear from you.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '0 8px', whiteSpace: 'nowrap' }}>
                    {formatDate(msgs[0]?.created_at)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                </div>

                {msgs.map((msg, idx) => {
                  const own = isOwn(msg);
                  const isFile = msg.message_type === 'file' || msg.file_url;
                  const showAvatar = !own && (idx === 0 || msgs[idx - 1]?.sender_role !== msg.sender_role);

                  return (
                    <div key={msg.id} className="msg-in" style={{
                      display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 3,
                      flexDirection: own ? 'row-reverse' : 'row',
                    }}>
                      {!own && (
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: showAvatar ? 'linear-gradient(135deg, #e0f7fe, #bae6fd)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, color: '#07b3f2',
                          fontFamily: "'Playfair Display', serif",
                          opacity: showAvatar ? 1 : 0,
                        }}>
                          {showAvatar ? clientInitials : ''}
                        </div>
                      )}

                      <div style={{ maxWidth: isMobile ? '78%' : '65%', display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                        {isFile ? (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 14,
                            background: own ? 'linear-gradient(135deg, #07b3f2, #0284c7)' : 'white',
                            border: own ? 'none' : '1px solid #e8eaed', textDecoration: 'none',
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: own ? 'rgba(255,255,255,0.2)' : '#f0f9ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 800, color: own ? 'white' : '#07b3f2',
                            }}>{getFileExt(msg.file_name)}</div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: own ? 'white' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{msg.file_name || 'Document'}</p>
                              <p style={{ margin: 0, fontSize: 10, color: own ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>Tap to open ↗</p>
                            </div>
                          </a>
                        ) : (
                          <div style={{
                            padding: '9px 13px', borderRadius: 16,
                            borderBottomRightRadius: own ? 3 : 16,
                            borderBottomLeftRadius: own ? 16 : 3,
                            fontSize: 13, lineHeight: 1.55, fontWeight: 500,
                            background: own ? 'linear-gradient(135deg, #07b3f2, #0284c7)' : 'white',
                            color: own ? 'white' : '#0f172a',
                            border: own ? 'none' : '1px solid #e8eaed',
                            boxShadow: own ? '0 2px 12px rgba(7,179,242,0.28)' : '0 1px 3px rgba(0,0,0,0.04)',
                            opacity: msg.is_temp ? 0.65 : 1,
                            wordBreak: 'break-word',
                          }}>
                            {msg.content}
                          </div>
                        )}
                        <p style={{ fontSize: 9, marginTop: 3, color: '#94a3b8', fontWeight: 500, padding: own ? '0 2px 0 0' : '0 0 0 2px' }}>
                          {formatTime(msg.created_at)}{msg.is_temp ? ' · Sending...' : ''}
                          {own && <span style={{ marginLeft: 4, color: '#bae6fd', fontWeight: 600 }}>· You</span>}
                          {!own && <span style={{ marginLeft: 4, color: '#94a3b8', fontWeight: 600 }}>· Client</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          flexShrink: 0, background: 'white', borderTop: '1px solid #e8eaed',
          padding: isMobile ? '10px 12px' : '14px 20px',
          paddingBottom: isMobile ? 'max(10px, env(safe-area-inset-bottom))' : '14px',
        }}>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
            onChange={e => handleFileUpload(e.target.files)} />

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button className="attach-btn" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
              style={{
                width: 38, height: 38, borderRadius: 10, border: '1px solid #e8eaed',
                background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748b', transition: 'all 0.15s', flexShrink: 0, marginBottom: 1,
              }}>
              {uploadingFile
                ? <div className="spinner" style={{ width: 14, height: 14, border: '2px solid #bae6fd', borderTopColor: '#07b3f2', borderRadius: '50%' }} />
                : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              }
            </button>

            <div style={{
              flex: 1, background: '#f8fafc', borderRadius: 12, padding: '9px 12px',
              border: '1.5px solid #e8eaed', display: 'flex', alignItems: 'flex-end',
              transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = '#07b3f2'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#e8eaed'}
            >
              <textarea ref={textareaRef} value={newMessage} rows={1}
                onChange={e => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Reply to applicant..."
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  fontSize: 13, color: '#0f172a', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
                }}
              />
            </div>

            <button className="send-btn" onClick={handleSend} disabled={!newMessage.trim() || sending}
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none',
                background: newMessage.trim() && !sending ? 'linear-gradient(135deg, #07b3f2, #0284c7)' : '#e8eaed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                color: newMessage.trim() && !sending ? 'white' : '#94a3b8',
                transition: 'all 0.2s', flexShrink: 0, marginBottom: 1,
                boxShadow: newMessage.trim() && !sending ? '0 3px 12px rgba(7,179,242,0.3)' : 'none',
              }}>
              {sending
                ? <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              }
            </button>
          </div>

          {!isMobile && (
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, textAlign: 'center', fontWeight: 500 }}>
              <strong style={{ color: '#64748b' }}>Enter</strong> to send · <strong style={{ color: '#64748b' }}>Shift+Enter</strong> for new line
            </p>
          )}
        </div>
      </div>
    </div>
  );
}