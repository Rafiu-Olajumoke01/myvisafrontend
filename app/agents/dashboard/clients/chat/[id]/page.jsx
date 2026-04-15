'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const POLL_INTERVAL = 4000;

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }

    .chat-shell { display: flex; min-height: 100vh; background: #f0f2f5; }

    /* ── Sidebar ── */
    .chat-sidebar { width: 240px; flex-shrink: 0; background: #ffffff; border-right: 1px solid #e8eaed; display: flex; flex-direction: column; padding: 24px 0 20px; position: sticky; top: 0; height: 100vh; }
    .chat-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #e8eaed; }
    .chat-sidebar-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .chat-sidebar-logo-text { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #0f172a; }
    .chat-sidebar-logo-sub { font-size: 10px; color: #94a3b8; font-weight: 500; letter-spacing: 0.04em; }
    .chat-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
    .chat-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; cursor: pointer; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #64748b; transition: all 0.15s; text-align: left; width: 100%; }
    .chat-nav-item:hover { background: #f4f6f8; color: #374151; }
    .chat-nav-item.active { background: #e0f7fe; color: #07b3f2; }
    .chat-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; }
    .chat-sidebar-profile { padding: 12px 16px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #e8eaed; }
    .chat-sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; }

    /* ── Main layout ── */
    .chat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

    /* ── Chat topbar ── */
    .chat-topbar { display: flex; align-items: center; gap: 14px; padding: 16px 24px; background: white; border-bottom: 1px solid #e8eaed; flex-shrink: 0; }
    .chat-topbar-back { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid #e8eaed; background: white; cursor: pointer; flex-shrink: 0; color: #64748b; transition: all 0.15s; }
    .chat-topbar-back:hover { border-color: #07b3f2; color: #07b3f2; background: #f0f9ff; }
    .chat-topbar-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #e0f7fe, #bae6fd); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #07b3f2; flex-shrink: 0; font-family: 'Playfair Display', serif; }
    .chat-topbar-info { flex: 1; min-width: 0; }
    .chat-topbar-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .chat-topbar-status { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    .chat-online-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; display: inline-block; }
    .chat-topbar-actions { display: flex; align-items: center; gap: 8px; }
    .chat-topbar-action-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 9px; border: 1px solid #e8eaed; background: white; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.15s; }
    .chat-topbar-action-btn:hover { border-color: #07b3f2; color: #07b3f2; background: #f0f9ff; }

    /* ── Messages area ── */
    .chat-messages-wrap { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 4px; scroll-behavior: smooth; }
    .chat-messages-wrap::-webkit-scrollbar { width: 5px; }
    .chat-messages-wrap::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }

    /* ── Date separator ── */
    .chat-date-sep { display: flex; align-items: center; gap: 10px; margin: 12px 0; }
    .chat-date-sep-line { flex: 1; height: 1px; background: #e8eaed; }
    .chat-date-sep-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }

    /* ── Message bubbles ── */
    .chat-msg-row { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 2px; }
    .chat-msg-row.agent { flex-direction: row-reverse; }
    .chat-msg-avatar { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; font-family: 'Playfair Display', serif; }
    .chat-msg-avatar.client { background: linear-gradient(135deg, #e0f7fe, #bae6fd); color: #07b3f2; }
    .chat-msg-avatar.agent { background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; }
    .chat-msg-bubble-wrap { display: flex; flex-direction: column; max-width: 65%; gap: 3px; }
    .chat-msg-row.agent .chat-msg-bubble-wrap { align-items: flex-end; }
    .chat-msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; word-break: break-word; font-weight: 500; }
    .chat-msg-bubble.client { background: white; color: #0f172a; border: 1px solid #e8eaed; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .chat-msg-bubble.agent { background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(7,179,242,0.25); }
    .chat-msg-meta { font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 4px; padding: 0 2px; }
    .chat-msg-row.agent .chat-msg-meta { flex-direction: row-reverse; }

    /* ── File bubble ── */
    .chat-file-bubble { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 14px; text-decoration: none; }
    .chat-file-bubble.agent { background: linear-gradient(135deg, #07b3f2, #0284c7); border-bottom-right-radius: 4px; }
    .chat-file-bubble.client { background: white; border: 1px solid #e8eaed; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .chat-file-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; flex-shrink: 0; }
    .chat-file-icon.agent { background: rgba(255,255,255,0.2); color: white; }
    .chat-file-icon.client { background: #f0f9ff; color: #07b3f2; }

    /* ── Empty state ── */
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; color: #94a3b8; }
    .chat-empty-icon { font-size: 48px; margin-bottom: 14px; }
    .chat-empty-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px; font-family: 'Playfair Display', serif; }
    .chat-empty-sub { font-size: 12px; line-height: 1.6; max-width: 280px; }

    /* ── Input bar ── */
    .chat-input-bar { padding: 16px 24px; background: white; border-top: 1px solid #e8eaed; display: flex; align-items: flex-end; gap: 10px; flex-shrink: 0; }
    .chat-input-wrap { flex: 1; background: #f8fafc; border: 1.5px solid #e8eaed; border-radius: 14px; display: flex; align-items: flex-end; gap: 8px; padding: 10px 14px; transition: border-color 0.2s, background 0.2s; }
    .chat-input-wrap:focus-within { border-color: #07b3f2; background: white; }
    .chat-textarea { flex: 1; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a; resize: none; outline: none; max-height: 120px; min-height: 20px; line-height: 1.5; font-weight: 500; }
    .chat-textarea::placeholder { color: #94a3b8; }
    .chat-send-btn { width: 38px; height: 38px; border-radius: 10px; border: none; background: linear-gradient(135deg, #07b3f2, #0284c7); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 2px 8px rgba(7,179,242,0.3); }
    .chat-send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.05); }
    .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
    .chat-attach-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e8eaed; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
    .chat-attach-btn:hover { background: #e0f7fe; color: #07b3f2; border-color: #07b3f2; }

    /* ── Right info panel ── */
    .chat-info-panel { width: 270px; flex-shrink: 0; background: white; border-left: 1px solid #e8eaed; display: flex; flex-direction: column; overflow-y: auto; }
    .chat-info-panel::-webkit-scrollbar { width: 3px; }
    .chat-info-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }
    .chat-info-header { padding: 20px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
    .chat-info-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .chat-info-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #07b3f2, #0284c7); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: white; font-family: 'Playfair Display', serif; margin-bottom: 10px; border: 3px solid white; box-shadow: 0 2px 10px rgba(7,179,242,0.25); }
    .chat-info-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; font-family: 'Playfair Display', serif; }
    .chat-info-email { font-size: 11px; color: #64748b; }
    .chat-info-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
    .chat-info-item { background: #f8fafc; border-radius: 10px; padding: 10px 12px; border: 1px solid #f1f5f9; }
    .chat-info-item-label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .chat-info-item-value { font-size: 12px; font-weight: 600; color: #0f172a; }

    /* ── Toast ── */
    @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: white; padding: 12px 18px; border-radius: 12px; font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.25); z-index: 200; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 8px; }
    .toast.success { background: #16a34a; }
    .toast.error { background: #dc2626; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.25s ease both; }

    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    .skeleton { background: linear-gradient(90deg,#f0f2f5 25%,#e4e6ea 50%,#f0f2f5 75%); background-size: 200% auto; animation: shimmer 1.4s linear infinite; border-radius: 8px; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { animation: spin 0.7s linear infinite; }

    @media (max-width: 1100px) { .chat-info-panel { display: none; } }
    @media (max-width: 768px) { .chat-sidebar { display: none; } .chat-messages-wrap { padding: 16px; } .chat-input-bar { padding: 12px 16px; } }
  `}</style>
);

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}
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
function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' });
}
function getFileExt(name = '') { return name.split('.').pop().toUpperCase(); }

export default function AgentChatPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id; // This is the APPLICATION id, not client id

  const [application, setApplication] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [inputText, setInputText]     = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [agentProfile, setAgentProfile] = useState(null);
  const [toast, setToast]             = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);
  const pollRef        = useRef(null);
  const lastMsgIdRef   = useRef(null);

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const showToast = (msg, type = '') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Load agent profile ──
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) { try { setAgentProfile(JSON.parse(saved)); } catch {} }
    const fetchProfile = async () => {
      const t = token(); if (!t) return;
      try {
        const res = await fetch(`${API_BASE}/auth/profile/`, { headers: { Authorization: `Bearer ${t}` } });
        if (res.ok) { const d = await res.json(); setAgentProfile(d); localStorage.setItem('user', JSON.stringify(d)); }
      } catch {}
    };
    fetchProfile();
  }, []);

  // ── Fetch application details ──
  useEffect(() => {
    if (!applicationId) return;
    const fetchApplication = async () => {
      try {
        const res = await fetch(`${API_BASE}/applications/${applicationId}/`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApplication(data.application || data);
        } else if (res.status === 401) {
          router.push('/agents/login');
        }
      } catch (e) { console.error('Application fetch error:', e); }
    };
    fetchApplication();
  }, [applicationId]);

  // ── Fetch messages (used for initial load + polling) ──
  const fetchMessages = useCallback(async (initial = false) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/messages/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const msgs = data.messages || data;
        setMessages(msgs);
        if (initial) setLoading(false);
        const latestId = msgs[msgs.length - 1]?.id;
        if (latestId !== lastMsgIdRef.current) {
          lastMsgIdRef.current = latestId;
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch { if (initial) setLoading(false); }
  }, [applicationId, scrollToBottom]);

  useEffect(() => {
    if (!applicationId) return;
    fetchMessages(true);
    pollRef.current = setInterval(() => fetchMessages(false), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // ── Send text message ──
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    // Optimistic temp message
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: text,
      sender_role: 'consultant',
      created_at: new Date().toISOString(),
      message_type: 'text',
      is_temp: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/messages/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        await fetchMessages(false);
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        showToast('❌ Message failed to send. Try again.', 'error');
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      showToast('❌ Network error. Try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  // ── File upload ──
  const handleFileUpload = async (files) => {
    if (!files?.length) return;
    setUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/applications/${applicationId}/messages/file/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
          body: formData,
        });
        if (res.ok) { await fetchMessages(false); setTimeout(scrollToBottom, 100); }
        else { showToast('❌ File upload failed.', 'error'); }
      }
    } catch { showToast('❌ Network error during upload.', 'error'); }
    finally { setUploadingFile(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; }
  };

  // ── Derived values ──
  const agentInitials = agentProfile
    ? (`${agentProfile.first_name?.[0] || ''}${agentProfile.last_name?.[0] || ''}`.toUpperCase() || '?') : '?';
  const agentFullName = agentProfile
    ? (`${agentProfile.first_name || ''} ${agentProfile.last_name || ''}`.trim() || agentProfile.username || 'Agent') : 'Agent';

  // Client name from application — tries multiple field names your serializer might return
  const clientName = application?.user_name
    || application?.applicant_name
    || application?.user?.full_name
    || application?.user?.first_name
    || 'Applicant';
  const clientEmail = application?.user?.email || application?.user_email || '—';
  const clientInitials = getInitials(clientName);
  const packageCountry = application?.package_country || application?.package?.country || '';

  // Group messages by date for separators
  const grouped = messages.reduce((g, msg) => {
    const k = msg.created_at ? new Date(msg.created_at).toDateString() : 'Unknown';
    if (!g[k]) g[k] = [];
    g[k].push(msg);
    return g;
  }, {});

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
      <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
        onChange={e => { handleFileUpload(e.target.files); e.target.value = ''; }} />

      <div className="chat-shell">

        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-logo">
            <div className="chat-sidebar-logo-icon">✈️</div>
            <div>
              <div className="chat-sidebar-logo-text">MyVisa</div>
              <div className="chat-sidebar-logo-sub">AGENT PORTAL</div>
            </div>
          </div>
          <nav className="chat-nav">
            {navItems.map(item => (
              <button key={item.key}
                className={`chat-nav-item${item.key === 'clients' ? ' active' : ''}`}
                onClick={() => router.push(item.route)}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
          <div className="chat-sidebar-profile">
            <div className="chat-sidebar-avatar">{agentInitials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{agentFullName}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Visa Consultant</div>
            </div>
          </div>
        </aside>

        {/* ── Chat area + info panel ── */}
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>

          {/* ── Center: chat ── */}
          <div className="chat-main">

            {/* Topbar */}
            <div className="chat-topbar">
              <button className="chat-topbar-back"
                onClick={() => router.push('/agents/dashboard/clients')}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                </svg>
              </button>

              {loading ? (
                <>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 13, width: 140, marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: 90 }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="chat-topbar-avatar">{clientInitials}</div>
                  <div className="chat-topbar-info">
                    <div className="chat-topbar-name">{clientName}</div>
                    <div className="chat-topbar-status">
                      <span className="chat-online-dot" />
                      <span>
                        Application #{applicationId}
                        {packageCountry ? ` · ${packageCountry}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="chat-topbar-actions">
                    {/* Agent badge */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '4px 10px', borderRadius: 999 }}>
                      🧑‍💼 Agent View
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>
                      {agentInitials}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages-wrap">
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 60 }}>
                  <div className="spinner" style={{ width: 28, height: 28, border: '3px solid #e0f7fe', borderTopColor: '#07b3f2', borderRadius: '50%' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty fade-up">
                  <div className="chat-empty-icon">💬</div>
                  <div className="chat-empty-title">No messages yet</div>
                  <div className="chat-empty-sub">
                    Start the conversation with {clientName}. They're waiting to hear from you.
                  </div>
                </div>
              ) : (
                Object.entries(grouped).map(([dateKey, msgs]) => (
                  <div key={dateKey}>
                    {/* Date separator */}
                    <div className="chat-date-sep">
                      <div className="chat-date-sep-line" />
                      <div className="chat-date-sep-label">{formatDate(msgs[0]?.created_at)}</div>
                      <div className="chat-date-sep-line" />
                    </div>

                    {msgs.map((msg, idx) => {
                      const isOwn = msg.sender_role === 'consultant';
                      const isFile = msg.message_type === 'file' || msg.file_url;
                      const showAvatar = !isOwn && (idx === 0 || msgs[idx - 1]?.sender_role !== msg.sender_role);

                      return (
                        <div key={msg.id} className={`chat-msg-row${isOwn ? ' agent' : ''} fade-up`}>
                          {/* Avatar — only show for client, hide if consecutive */}
                          {!isOwn && (
                            <div className="chat-msg-avatar client"
                              style={{ opacity: showAvatar ? 1 : 0 }}>
                              {showAvatar ? clientInitials : ''}
                            </div>
                          )}

                          <div className="chat-msg-bubble-wrap">
                            {isFile ? (
                              <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                                className={`chat-file-bubble ${isOwn ? 'agent' : 'client'}`}>
                                <div className={`chat-file-icon ${isOwn ? 'agent' : 'client'}`}>
                                  {getFileExt(msg.file_name)}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: isOwn ? 'white' : '#0f172a' }}>
                                    {msg.file_name || 'Document'}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                                    Tap to open ↗
                                  </p>
                                </div>
                              </a>
                            ) : (
                              <div className={`chat-msg-bubble ${isOwn ? 'agent' : 'client'}`}
                                style={{ opacity: msg.is_temp ? 0.65 : 1 }}>
                                {msg.content}
                              </div>
                            )}
                            <div className="chat-msg-meta">
                              <span>{formatTime(msg.created_at)}</span>
                              {msg.is_temp && <span>· Sending...</span>}
                              {isOwn && !msg.is_temp && <span style={{ color: '#bae6fd', fontWeight: 600 }}>· You</span>}
                              {!isOwn && <span style={{ fontWeight: 600 }}>· Client</span>}
                            </div>
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
            <div className="chat-input-bar">
              <button className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                title="Attach file">
                {uploadingFile
                  ? <div className="spinner" style={{ width: 14, height: 14, border: '2px solid #bae6fd', borderTopColor: '#07b3f2', borderRadius: '50%' }} />
                  : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                }
              </button>

              <div className="chat-input-wrap">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder={`Reply to ${clientName}...`}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
              </div>

              <button className="chat-send-btn" onClick={handleSend}
                disabled={!inputText.trim() || sending}>
                {sending
                  ? <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                  : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                }
              </button>
            </div>

            <p style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: '6px 0 10px', fontWeight: 500 }}>
              <strong style={{ color: '#64748b' }}>Enter</strong> to send · <strong style={{ color: '#64748b' }}>Shift+Enter</strong> for new line
            </p>
          </div>

          {/* ── Right info panel ── */}
          {!loading && application && (
            <div className="chat-info-panel">
              <div className="chat-info-header">
                <div className="chat-info-label">Client Profile</div>
                <div className="chat-info-avatar">{clientInitials}</div>
                <div className="chat-info-name">{clientName}</div>
                <div className="chat-info-email">{clientEmail}</div>
              </div>
              <div className="chat-info-body">
                <div className="chat-info-item">
                  <div className="chat-info-item-label">Application Status</div>
                  <div className="chat-info-item-value" style={{ textTransform: 'capitalize' }}>
                    {application.status?.replace('_', ' ') || '—'}
                  </div>
                </div>
                <div className="chat-info-item">
                  <div className="chat-info-item-label">Meeting Status</div>
                  <div className="chat-info-item-value" style={{ textTransform: 'capitalize' }}>
                    {application.meeting_status || '—'}
                  </div>
                </div>
                {packageCountry && (
                  <div className="chat-info-item">
                    <div className="chat-info-item-label">Destination</div>
                    <div className="chat-info-item-value">{packageCountry}</div>
                  </div>
                )}
                <div className="chat-info-item">
                  <div className="chat-info-item-label">Consultant</div>
                  <div className="chat-info-item-value">{application.consultant_name || agentFullName}</div>
                </div>
                {application.meeting_date && (
                  <div className="chat-info-item">
                    <div className="chat-info-item-label">Meeting Date</div>
                    <div className="chat-info-item-value">
                      {new Date(application.meeting_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}