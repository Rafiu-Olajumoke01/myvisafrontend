'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/calls/';

const JOURNEY_STEPS = [
  { label: 'Discovery Call', sub: 'Completed', done: true },
  { label: 'Payment', sub: 'Pending confirmation', active: true },
  { label: 'Document Upload', sub: 'Awaiting step 2' },
  { label: 'Application Submitted', sub: 'Awaiting step 3' },
];

export default function ChatPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Passed from call page via: router.push(`/chat?session_id=abc&agent_name=Sarah&agent_initials=SM`)
  const sessionId     = searchParams.get('session_id');
  const agentName     = searchParams.get('agent_name') || 'Your Consultant';
  const agentInitials = searchParams.get('agent_initials')
    || agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const [messages,      setMessages]      = useState([]);
  const [newMessage,    setNewMessage]    = useState('');
  const [isTyping,      setIsTyping]      = useState(false);
  const [wsStatus,      setWsStatus]      = useState('connecting');
  const [currentUserId, setCurrentUserId] = useState(null);

  const wsRef            = useRef(null);
  const messagesEndRef   = useRef(null);
  const textareaRef      = useRef(null);
  const fileInputRef     = useRef(null);
  const reconnectTimer   = useRef(null);
  // Ref copy so WS callbacks always read latest value without stale closure
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Get logged-in user id from your existing profile endpoint ─────────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[Chat] No access_token found in localStorage');
      return;
    }

    fetch('http://127.0.0.1:8000/api/auth/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.id) {
          const uid = String(data.id);
          setCurrentUserId(uid);
          currentUserIdRef.current = uid;
          console.log('[Chat] Current user id:', uid);
        }
      })
      .catch(() => console.warn('[Chat] Could not fetch current user profile'));
  }, []);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (!sessionId) {
      console.warn('[Chat] No session_id — cannot connect WS');
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setWsStatus('connecting');

    ws.onopen = () => {
      console.log('[Chat WS] Connected');
      setWsStatus('open');
      // Load previous messages for this session immediately
      ws.send(JSON.stringify({ type: 'chat_history', session_id: sessionId }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('[Chat WS] received:', data.type);

      switch (data.type) {

        // Previous messages when page loads
        case 'chat_history': {
          const uid = currentUserIdRef.current;
          setMessages(
            data.messages.map((m, i) => ({
              id:         m.created_at + i,
              content:    m.message,
              senderId:   m.sender_id,
              senderName: m.sender_name,
              time:       formatTimeFromISO(m.created_at),
              isOwn:      uid ? String(m.sender_id) === uid : false,
              isFile:     false,
            }))
          );
          break;
        }

        // New incoming message
        case 'chat_message': {
          setIsTyping(false);
          const uid = currentUserIdRef.current;
          setMessages(prev => {
            // Remove the optimistic copy we added in handleSend
            const cleaned = prev.filter(
              m => !(m._optimistic && m.content === data.message && m.isOwn)
            );
            return [
              ...cleaned,
              {
                id:         Date.now() + Math.random(),
                content:    data.message,
                senderId:   data.sender_id,
                senderName: data.sender_name,
                time:       formatTime(),
                isOwn:      uid ? String(data.sender_id) === uid : false,
                isFile:     false,
              },
            ];
          });
          break;
        }

        case 'call_completed':
          // Already on chat page — nothing to do
          break;

        default:
          break;
      }
    };

    ws.onerror = () => setWsStatus('error');

    ws.onclose = () => {
      console.log('[Chat WS] closed — reconnecting in 3s');
      setWsStatus('closed');
      reconnectTimer.current = setTimeout(connectWS, 3000);
    };
  }, [sessionId]);

  useEffect(() => {
    connectWS();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connectWS]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type:       'chat_message',
      session_id: sessionId,
      message:    text,
    }));

    // Show immediately on UI — replaced by real echo from backend
    setMessages(prev => [
      ...prev,
      {
        id:          Date.now(),
        content:     text,
        senderId:    currentUserIdRef.current || 'me',
        senderName:  'You',
        time:        formatTime(),
        isOwn:       true,
        isFile:      false,
        _optimistic: true,
      },
    ]);

    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileUpload = (files) => {
    for (const file of Array.from(files)) {
      const ext  = file.name.split('.').pop().toUpperCase();
      const size = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      setMessages(prev => [...prev, {
        id:       Date.now() + Math.random(),
        senderId: currentUserIdRef.current || 'me',
        time:     formatTime(),
        isOwn:    true,
        isFile:   true,
        fileName: file.name,
        fileExt:  ext,
        fileSize: size,
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatTimeFromISO = (iso) => {
    try { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const getFileColor = (ext) => ({
    PDF:  'bg-red-50 text-red-500 border-red-100',
    JPG:  'bg-yellow-50 text-yellow-600 border-yellow-100',
    JPEG: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    PNG:  'bg-purple-50 text-purple-600 border-purple-100',
    DOC:  'bg-blue-50 text-blue-500 border-blue-100',
    DOCX: 'bg-blue-50 text-blue-500 border-blue-100',
  }[ext] || 'bg-gray-50 text-gray-500 border-gray-100');

  const wsStatusColor = { connecting: 'bg-yellow-400', open: 'bg-green-400', closed: 'bg-red-400', error: 'bg-red-400' }[wsStatus];
  const wsStatusLabel = { connecting: 'Connecting...', open: 'Online', closed: 'Reconnecting...', error: 'Connection error' }[wsStatus];

  // ── No session guard ──────────────────────────────────────────────────────
  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f3f7f9]">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">No session found.</p>
          <p className="text-gray-400 text-sm mt-1">Please complete a discovery call first.</p>
          <button onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#07b3f2] text-white rounded-xl text-sm font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex"
      style={{ fontFamily: "'DM Sans', sans-serif", background: '#f3f7f9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
        .msg-in{animation:msgIn .2s ease-out}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .typing-dot{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:typingBounce 1.2s infinite}
        .typing-dot:nth-child(2){animation-delay:.2s}
        .typing-dot:nth-child(3){animation-delay:.4s}
        @keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        textarea{resize:none}textarea:focus{outline:none}
        .step-connector{width:1px;height:16px;margin-left:10px;background:rgba(255,255,255,.2)}
      `}</style>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: '30%', background: 'linear-gradient(160deg,#0f4c8a 0%,#0a82c8 55%,#07b3f2 100%)', padding: '24px 20px' }}>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">VisaRoute</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Visa Consultancy</p>
          </div>
        </div>

        {/* Passport illustration */}
        <div className="rounded-2xl mb-5"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px' }}>
          <svg viewBox="0 0 160 100" width="100%" style={{ display: 'block' }}>
            <rect x="15" y="5" width="130" height="90" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
            <rect x="15" y="5" width="16" height="90" rx="4" fill="rgba(255,255,255,0.22)"/>
            <rect x="40" y="18" width="28" height="34" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <circle cx="54" cy="30" r="7" fill="rgba(255,255,255,0.28)"/>
            <path d="M42 52 Q54 44 66 52" fill="rgba(255,255,255,0.28)"/>
            <rect x="78" y="22" width="52" height="4" rx="2" fill="rgba(255,255,255,0.35)"/>
            <rect x="78" y="31" width="40" height="4" rx="2" fill="rgba(255,255,255,0.25)"/>
            <rect x="78" y="40" width="46" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
            <circle cx="108" cy="68" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="5,3"/>
            <text x="108" y="66" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.85)" fontWeight="800">VISA</text>
            <text x="108" y="75" textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.6)" fontWeight="600">APPROVED</text>
            <rect x="22" y="82" width="116" height="2.5" rx="1.2" fill="rgba(255,255,255,0.15)"/>
            <rect x="22" y="88" width="116" height="2.5" rx="1.2" fill="rgba(255,255,255,0.15)"/>
          </svg>
          <div className="flex justify-center mt-3">
            <span className="inline-flex items-center gap-2 text-white font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '4px 12px', fontSize: 11 }}>
              🇬🇧 UK Student Visa
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[{ val: '94%', label: 'Success Rate' }, { val: '3–5 wks', label: 'Avg. Timeline' }].map(s => (
            <div key={s.label} className="rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', padding: '10px 8px' }}>
              <p className="text-white font-black" style={{ fontSize: 18 }}>{s.val}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Journey steps */}
        <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', marginBottom: 12 }}>YOUR JOURNEY</p>
        <div className="flex flex-col">
          {JOURNEY_STEPS.map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center font-black"
                  style={{ width: 22, height: 22, borderRadius: '50%', fontSize: 10,
                    background: step.done ? 'rgba(255,255,255,0.9)' : step.active ? '#fff' : 'rgba(255,255,255,0.18)',
                    color: step.done || step.active ? '#0a82c8' : 'rgba(255,255,255,0.6)',
                    boxShadow: step.active ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none', marginTop: 1 }}>
                  {step.done ? '✓' : i + 1}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{step.label}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{step.sub}</p>
                </div>
              </div>
              {i < JOURNEY_STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div className="mt-auto rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', padding: '10px 12px' }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.06em' }}>UKVI AUTHORIZED PARTNER</p>
          <p style={{ fontSize: 11, color: '#fff', fontWeight: 700, marginTop: 3 }}>Tier 4 Student Specialist</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-[#f3f7f9] flex items-center justify-center text-gray-500 hover:bg-[#e8f6fd] hover:text-[#07b3f2] transition-all flex-shrink-0">
            ←
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {agentInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900">{agentName}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${wsStatusColor}`} />
                <p className="text-[10px] text-gray-400 font-medium">{wsStatusLabel} · Senior Visa Consultant</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 bg-[#f3f7f9] rounded-xl px-3 py-1.5 border border-gray-200">
            <p className="text-[10px] font-bold text-gray-400">Session</p>
            <p className="text-[10px] font-black text-gray-600 font-mono">{sessionId?.slice(0, 8)}…</p>
          </div>
        </div>

        {/* Banner */}
        <div className="flex-shrink-0 bg-[#e8f6fd] border-b border-[#07b3f2]/10 px-4 md:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">🇬🇧</span>
            <p className="text-xs font-bold text-[#07b3f2]">UK Student Visa Application</p>
          </div>
          <span className="text-[10px] font-bold text-[#07b3f2] bg-white px-2 py-0.5 rounded-full border border-[#07b3f2]/20">
            In Progress
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-4 md:px-6 py-4 flex flex-col gap-1 min-h-0">
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 px-2">Today</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {messages.length === 0 && wsStatus === 'open' && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm font-medium">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}
              className={`flex items-end gap-2 mb-1 msg-in ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isOwn && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {agentInitials}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                {!msg.isOwn && (
                  <p className="text-[10px] font-bold text-gray-400 mb-0.5 pl-1">{msg.senderName}</p>
                )}
                {msg.isFile ? (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${msg.isOwn ? 'bg-gradient-to-br from-[#07b3f2] to-[#055fa3] border-transparent' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 border ${msg.isOwn ? 'bg-white/20 text-white border-white/20' : getFileColor(msg.fileExt)}`}>
                      {msg.fileExt}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate max-w-[140px] ${msg.isOwn ? 'text-white' : 'text-gray-800'}`}>{msg.fileName}</p>
                      <p className={`text-[10px] mt-0.5 ${msg.isOwn ? 'text-white/70' : 'text-gray-400'}`}>{msg.fileSize}</p>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${msg.isOwn ? 'text-white/80' : 'text-[#07b3f2]'}`}>↗</span>
                  </div>
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium ${msg.isOwn ? 'bg-gradient-to-br from-[#07b3f2] to-[#055fa3] text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
                    {msg.content}
                    {msg._optimistic && <span className="ml-2 text-[9px] opacity-40">sending…</span>}
                  </div>
                )}
                <p className={`text-[9px] mt-1 font-medium text-gray-400 ${msg.isOwn ? 'pr-1' : 'pl-1'}`}>{msg.time}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2 mb-1 msg-in">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {agentInitials}
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-6 py-4">
          <input ref={fileInputRef} type="file" multiple className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)} />
          <div className="flex items-end gap-3">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-2xl bg-[#f3f7f9] flex items-center justify-center text-gray-400 hover:bg-[#e8f6fd] hover:text-[#07b3f2] transition-all flex-shrink-0 mb-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <div className="flex-1 bg-[#f3f7f9] rounded-2xl px-4 py-2.5 border border-transparent focus-within:border-[#07b3f2]/30 focus-within:bg-white transition-all">
              <textarea ref={textareaRef} value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={wsStatus === 'open' ? 'Type a message...' : 'Connecting...'}
                disabled={wsStatus !== 'open'}
                rows={1}
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 font-medium leading-relaxed disabled:opacity-50"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
            </div>
            <button onClick={handleSend}
              disabled={!newMessage.trim() || wsStatus !== 'open'}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-white transition-all flex-shrink-0 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#07b3f2]/25 mb-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
            <span className="font-bold text-gray-500">Enter</span> to send ·
            <span className="font-bold text-gray-500"> Shift+Enter</span> for new line
          </p>
        </div>
      </div>
    </div>
  );
}