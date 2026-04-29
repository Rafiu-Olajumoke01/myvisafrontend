'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';
const CHAT_POLL_INTERVAL = 4000;

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ percent }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e8f6fd" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#07b3f2" strokeWidth="9"
        strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50" y="46" textAnchor="middle" fontSize="17" fontWeight="800" fill="#07b3f2" fontFamily="'DM Sans',sans-serif">{percent}%</text>
      <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="'DM Sans',sans-serif">Complete</text>
    </svg>
  );
}

// ─── Step Timeline ────────────────────────────────────────────────────────────
function StepTimeline({ status }) {
  const steps = ['Not Started', 'Started', 'Processing', 'Completed'];
  const keys = ['not_started', 'started', 'processing', 'completed'];
  const current = keys.indexOf(status);
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => (
        <React.Fragment key={keys[i]}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${i <= current ? 'bg-[#07b3f2] text-white' : 'bg-gray-100 text-gray-400'} ${i === current ? 'ring-4 ring-[#07b3f2]/20' : ''}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`mt-1.5 text-[9px] sm:text-[10px] font-semibold whitespace-nowrap ${i === current ? 'text-[#07b3f2]' : i < current ? 'text-gray-600' : 'text-gray-400'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all duration-700 ${i < current ? 'bg-[#07b3f2]' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────
function DocumentRow({ file, onDelete }) {
  const ext = (file.file_name || '').split('.').pop().toUpperCase();
  const colors = { PDF: 'bg-red-50 text-red-500', JPG: 'bg-yellow-50 text-yellow-600', JPEG: 'bg-yellow-50 text-yellow-600', PNG: 'bg-purple-50 text-purple-600', DOC: 'bg-blue-50 text-blue-500', DOCX: 'bg-blue-50 text-blue-500' };
  const date = file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-[#07b3f2]/30 hover:bg-[#f3f7f9] transition-all group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${colors[ext] || 'bg-gray-50 text-gray-500'}`}>{ext}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{file.file_name}</p>
        <p className="text-[10px] text-gray-400">{file.file_size} · {date}</p>
      </div>
      <span className="text-[10px] font-bold text-green-500 flex-shrink-0 bg-green-50 px-2 py-0.5 rounded-full">Uploaded</span>
      <button onClick={() => onDelete(file.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 text-red-400 flex items-center justify-center text-xs hover:bg-red-100 transition-all flex-shrink-0">x</button>
    </div>
  );
}

// ─── Calling Screen ───────────────────────────────────────────────────────────
function CallingScreen({ callStatus, meetLink, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c2a4a 50%,#0f172a 100%)' }}>
      <style>{`@keyframes pulse-ring{0%{transform:scale(.8);opacity:1}100%{transform:scale(2);opacity:0}}.pulse-ring{position:absolute;width:100px;height:100px;border-radius:50%;border:3px solid rgba(7,179,242,0.4);animation:pulse-ring 1.5s ease-out infinite}.pulse-ring-2{animation-delay:.5s}.pulse-ring-3{animation-delay:1s}`}</style>
      <div className="flex flex-col items-center text-center text-white px-8 w-full max-w-sm">
        <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-8" style={{ fontFamily: "'DM Sans',sans-serif" }}>✈️ MyVisa</p>
        <div className="relative flex items-center justify-center mb-8" style={{ width: 120, height: 120 }}>
          {callStatus === 'calling' && <><div className="pulse-ring" /><div className="pulse-ring pulse-ring-2" /><div className="pulse-ring pulse-ring-3" /></>}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl relative z-10" style={{ background: callStatus === 'connected' ? 'rgba(34,197,94,0.3)' : callStatus === 'declined' ? 'rgba(239,68,68,0.3)' : 'rgba(7,179,242,0.2)', border: '1px solid rgba(7,179,242,0.3)' }}>
            {callStatus === 'connected' ? '✅' : callStatus === 'declined' ? '❌' : '📞'}
          </div>
        </div>
        {callStatus === 'calling' && <><h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Connecting you to an agent</h2><p className="text-sm opacity-70 mb-1">Linking you to a MyVisa agent...</p><p className="text-xs opacity-50 mb-10">Please wait, this won't take long</p></>}
        {callStatus === 'connected' && <><h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Agent Connected! 🎉</h2><p className="text-sm opacity-70 mb-8">Your MyVisa agent is ready for your discovery call</p><a href={meetLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-2xl font-bold text-[#07b3f2] mb-4 text-sm" style={{ background: 'white', fontFamily: "'DM Sans',sans-serif" }}>Join Discovery Call →</a></>}
        {callStatus === 'declined' && <><h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>No Agents Available</h2><p className="text-sm opacity-70 mb-8">All our agents are currently busy. Please try again shortly.</p></>}
        {callStatus !== 'connected' && <button onClick={onCancel} className="mt-4 px-6 py-2.5 rounded-2xl text-xs font-bold border border-white/30 text-white/70 hover:bg-white/10 transition-all" style={{ fontFamily: "'DM Sans',sans-serif" }}>{callStatus === 'declined' ? 'Go Back' : 'Cancel Request'}</button>}
      </div>
    </div>
  );
}

// ─── Onboarding Steps ─────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { id: 'profile', icon: '⚙️', label: 'Setting up your profile' },
  { id: 'chat', icon: '💬', label: 'Unlocking chat with consultant' },
  { id: 'documents', icon: '📁', label: 'Activating document upload' },
  { id: 'review', icon: '🔍', label: 'Preparing your visa roadmap' },
  { id: 'complete', icon: '✅', label: 'Almost there...' },
];

function UnlockStep({ step, state }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 14,
      background: state === 'done' ? 'rgba(7,179,242,0.08)' : state === 'active' ? 'rgba(7,179,242,0.05)' : 'rgba(255,255,255,0.02)',
      border: state === 'done' ? '1px solid rgba(7,179,242,0.28)' : state === 'active' ? '1px solid rgba(7,179,242,0.18)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)', transform: state === 'active' ? 'translateX(4px)' : 'translateX(0)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        background: state === 'done' ? 'rgba(7,179,242,0.15)' : state === 'active' ? 'rgba(7,179,242,0.1)' : 'rgba(255,255,255,0.04)',
        border: state === 'done' ? '1px solid rgba(7,179,242,0.35)' : state === 'active' ? '1px solid rgba(7,179,242,0.22)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.4s ease',
      }}>
        {state === 'done' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07b3f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          : <span style={{ opacity: state === 'active' ? 1 : 0.28 }}>{step.icon}</span>}
      </div>
      <span style={{
        flex: 1, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
        color: state === 'done' ? '#7dd3fc' : state === 'active' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
        transition: 'color 0.4s ease',
      }}>{step.label}</span>
      {state === 'active' && <div style={{ width: 16, height: 16, border: '2px solid rgba(7,179,242,0.2)', borderTop: '2px solid #07b3f2', borderRadius: '50%', animation: 'obSpin 0.9s linear infinite' }} />}
      {state === 'done' && <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#07b3f2', background: 'rgba(7,179,242,0.12)', padding: '3px 9px', borderRadius: 999 }}>Done</span>}
    </div>
  );
}

// ─── Unified Onboarding Overlay ───────────────────────────────────────────────
function OnboardingOverlay({ agentName, phase, result, onContinue }) {
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const stepTimers = useRef([]);
  const DURATIONS = [2000, 1800, 1700, 1500, 900];

  useEffect(() => {
    if (phase !== 'onboarding') return;
    stepTimers.current.forEach(clearTimeout); stepTimers.current = [];
    let delay = 0;
    ONBOARDING_STEPS.forEach((_, i) => {
      stepTimers.current.push(
        setTimeout(() => setActiveStep(i), delay),
        setTimeout(() => setDoneSteps(prev => [...prev, i]), delay + DURATIONS[i]),
      );
      delay += DURATIONS[i] + 180;
    });
    return () => stepTimers.current.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase === 'welcome') { stepTimers.current.forEach(clearTimeout); setDoneSteps([0, 1, 2, 3, 4]); setActiveStep(-1); }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'welcome') return;
    const t = [setTimeout(() => setWelcomeStep(1), 120), setTimeout(() => setWelcomeStep(2), 400), setTimeout(() => setWelcomeStep(3), 700), setTimeout(() => setWelcomeStep(4), 1050)];
    return () => t.forEach(clearTimeout);
  }, [phase]);

  const scoreColor = result ? result.readiness_score >= 75 ? '#4ade80' : result.readiness_score >= 50 ? '#fbbf24' : '#f87171' : '#07b3f2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c2a4a 50%,#0f172a 100%)', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes obSpin     { to{transform:rotate(360deg);} }
        @keyframes obGlow     { 0%,100%{opacity:.4;} 50%{opacity:.75;} }
        @keyframes obFadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes obFadeIn   { from{opacity:0;} to{opacity:1;} }
        @keyframes obPop      { 0%{transform:scale(.5);opacity:0;} 65%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
        @keyframes obPulse    { 0%{transform:scale(1);opacity:.6;} 100%{transform:scale(1.9);opacity:0;} }
        @keyframes obConfetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(110vh) rotate(720deg);opacity:0;} }
        .ob-fade-up  { animation: obFadeUp  0.5s cubic-bezier(.22,1,.36,1) both; }
        .ob-fade-in  { animation: obFadeIn  0.4s ease both; }
        .ob-pop      { animation: obPop     0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .ob-confetti { position:fixed; border-radius:2px; animation:obConfetti linear infinite; pointer-events:none; }
      `}</style>

      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(7,179,242,0.1) 0%,transparent 70%)', animation: 'obGlow 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(7,179,242,0.07) 0%,transparent 70%)', animation: 'obGlow 4s ease-in-out infinite 2s', pointerEvents: 'none' }} />

      {phase === 'welcome' && [...Array(18)].map((_, i) => (
        <div key={i} className="ob-confetti" style={{
          left: `${(i * 5.6) % 100}%`, top: '-10px',
          background: ['#07b3f2', '#0284c7', '#7dd3fc', '#fbbf24', '#4ade80', '#bae6fd'][i % 6],
          width: `${5 + (i % 5) * 2}px`, height: `${5 + (i % 4) * 2}px`,
          animationDuration: `${2.2 + (i % 5) * .45}s`, animationDelay: `${(i * .17) % 1.8}s`,
          borderRadius: i % 3 === 0 ? '50%' : '3px',
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>✈️ &nbsp;MyVisa</span>
        </div>

        {phase === 'onboarding' && (
          <div className="ob-fade-in">
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(7,179,242,0.15)', borderRadius: 28, padding: '28px 20px', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
                <div style={{ position: 'relative', width: 76, height: 76 }}>
                  <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '1.5px solid rgba(7,179,242,0.2)', animation: 'obPulse 2s ease-out infinite' }} />
                  <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '1.5px solid rgba(7,179,242,0.1)', animation: 'obPulse 2s ease-out infinite 0.75s' }} />
                  <div style={{ width: 76, height: 76, borderRadius: 20, background: 'linear-gradient(135deg,rgba(7,179,242,0.2),rgba(2,132,199,0.08))', border: '1px solid rgba(7,179,242,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🚀</div>
                  <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid transparent', borderTop: '2px solid #07b3f2', animation: 'obSpin 1.8s linear infinite' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>Onboarding</h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                  <span style={{ color: '#7dd3fc', fontWeight: 600 }}>{agentName}</span> is completing your profile and setting up your account.
                </p>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '18px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
                {ONBOARDING_STEPS.map((step, i) => {
                  const isDone = doneSteps.includes(i), isActive = activeStep === i && !isDone;
                  return <UnlockStep key={step.id} step={step} state={isDone ? 'done' : isActive ? 'active' : 'pending'} />;
                })}
              </div>
              <div style={{ background: 'rgba(7,179,242,0.06)', border: '1px solid rgba(7,179,242,0.15)', borderRadius: 13, padding: '10px 14px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', lineHeight: 1.6, textAlign: 'center' }}>
                  🔒 Keep this page open — you'll be notified automatically when setup is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {phase === 'welcome' && result && (
          <div className="ob-fade-in">
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(7,179,242,0.3)', borderRadius: 28, padding: '32px 20px', backdropFilter: 'blur(20px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 60px rgba(7,179,242,0.1), inset 0 1px 0 rgba(255,255,255,0.06)', textAlign: 'center' }}>
              {welcomeStep >= 1 && (
                <div className="ob-pop" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 84, height: 84, borderRadius: 22, background: 'linear-gradient(135deg,rgba(7,179,242,0.22),rgba(2,132,199,0.1))', border: '1.5px solid rgba(7,179,242,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 8px 32px rgba(7,179,242,0.22)' }}>🎉</div>
                </div>
              )}
              {welcomeStep >= 2 && (
                <div className="ob-fade-up" style={{ marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>Welcome to MyVisa,</h1>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#7dd3fc', lineHeight: 1.2, marginBottom: 14 }}>{result.applicant_name?.split(' ')[0] || 'there'}! ✈️</h1>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7 }}>Your account is fully set up. Chat, documents, and your application are now unlocked.</p>
                </div>
              )}
              {welcomeStep >= 3 && (
                <div className="ob-fade-up" style={{ margin: '20px 0' }}>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 14 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {[
                      { icon: '💬', label: 'Chat with your consultant', tag: 'Unlocked' },
                      { icon: '📁', label: 'Document upload portal', tag: 'Unlocked' },
                      { icon: '🗺️', label: 'Your visa roadmap', tag: 'Ready' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 13, textAlign: 'left', background: 'rgba(7,179,242,0.07)', border: '1px solid rgba(7,179,242,0.18)' }}>
                        <span style={{ fontSize: 17 }}>{item.icon}</span>
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{item.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#07b3f2', background: 'rgba(7,179,242,0.12)', padding: '3px 8px', borderRadius: 999 }}>{item.tag}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>Readiness Score</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: scoreColor }}>{result.readiness_score}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.readiness_score}%`, background: `linear-gradient(90deg,${scoreColor}99,${scoreColor})`, borderRadius: 999, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 7, textAlign: 'left' }}>
                      {result.readiness_score >= 80 ? 'Excellent — highly prepared!' : result.readiness_score >= 60 ? 'Great — well prepared!' : "Good start — let's build from here!"}
                    </p>
                  </div>
                </div>
              )}
              {welcomeStep >= 4 && (
                <button onClick={onContinue} className="ob-fade-up"
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  style={{ width: '100%', padding: '14px', borderRadius: 15, border: 'none', background: 'linear-gradient(135deg,#07b3f2,#0284c7)', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', boxShadow: '0 8px 28px rgba(7,179,242,0.35)', transition: 'opacity 0.15s ease' }}>
                  Continue to My Application →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rejection Screen ─────────────────────────────────────────────────────────
function RejectionScreen({ applicantName, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c2a4a 100%)' }}>
      <style>{`@keyframes rejFadeIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}.rej-content{animation:rejFadeIn 0.5s ease forwards;}`}</style>
      <div className="rej-content flex flex-col items-center text-center text-white px-6 max-w-md w-full">
        <p className="text-sm font-bold tracking-widest uppercase opacity-60 mb-10" style={{ fontFamily: "'DM Sans',sans-serif" }}>✈️ MyVisa</p>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6" style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.25)' }}>📋</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Thank you, {applicantName?.split(' ')[0] || 'there'}</h1>
        <p className="text-sm opacity-70 leading-relaxed mb-4">Our consultant has reviewed your consultation and we need a bit more time to assess your eligibility.</p>
        <p className="text-sm opacity-55 leading-relaxed mb-10">Our team will be in touch shortly with next steps and additional guidance.</p>
        <div className="w-full rounded-2xl px-5 py-4 mb-8 text-left" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">What happens next</p>
          {['📧 Check your email for a detailed review', '📞 Our team may call you for clarifications', '📁 Prepare any missing documents', '🔄 You can request another consultation'].map((item, i) => (
            <p key={i} className="text-sm opacity-65 mb-2" style={{ fontFamily: "'DM Sans',sans-serif" }}>{item}</p>
          ))}
        </div>
        <button onClick={onBack} className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ fontFamily: "'DM Sans',sans-serif", background: 'rgba(7,179,242,0.12)', border: '1px solid rgba(7,179,242,0.25)', color: 'rgba(255,255,255,0.8)' }}>
          Back to My Application
        </button>
      </div>
    </div>
  );
}

// ─── Collapsible Section (mobile) ─────────────────────────────────────────────
function CollapsibleSection({ title, subtitle, badge, children, defaultOpen = false, pulseClass = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${pulseClass}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          {subtitle && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{subtitle}</p>}
          <p className="text-sm font-black text-gray-900">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── Inline Chat Panel ────────────────────────────────────────────────────────
// ✅ FIX: Added `chatUnlocked` prop — chat only polls when unlocked
function InlineChatPanel({ applicationId, consultantName, onOpenFullChat, chatUnlocked }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const token = () => localStorage.getItem('access_token');

  const fetchMessages = async (initial = false) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/messages/`, {
        headers: { 'Authorization': `Bearer ${token()}` },
      });

      // ✅ FIX: Stop polling immediately on 401 — no more spam
      if (res.status === 401) {
        clearInterval(pollRef.current);
        if (initial) setChatLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const msgs = data.messages || data;
        setMessages(msgs);
        if (initial) setChatLoading(false);
        const latestId = msgs[msgs.length - 1]?.id;
        if (latestId !== lastMsgIdRef.current) {
          lastMsgIdRef.current = latestId;
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } else if (initial) setChatLoading(false);
    } catch { if (initial) setChatLoading(false); }
  };

  useEffect(() => {
    // ✅ FIX: Don't fetch or poll at all if chat isn't unlocked yet
    if (!chatUnlocked) {
      setChatLoading(false);
      return;
    }

    fetchMessages(true);
    pollRef.current = setInterval(() => fetchMessages(false), CHAT_POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [applicationId, chatUnlocked]); // ✅ re-run when chatUnlocked changes

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    const text = inputValue.trim();
    setInputValue('');
    setSending(true);

    const tempMsg = { id: `temp-${Date.now()}`, content: text, sender_role: 'client', created_at: new Date().toISOString(), is_temp: true };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/messages/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) await fetchMessages(false);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isOwn = (msg) => msg.sender_role === 'client';
  const providerInitials = consultantName ? consultantName.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  // ✅ FIX: Show a locked state if chat isn't unlocked yet
  if (!chatUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
        <span className="text-3xl">🔒</span>
        <p className="text-xs font-bold text-gray-500">Chat not yet unlocked</p>
        <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">
          Complete your discovery call to unlock chat with your consultant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="overflow-y-auto space-y-2 pr-1 mb-3" style={{ maxHeight: '260px', minHeight: '160px' }}>
        {chatLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#07b3f2]/20 border-t-[#07b3f2] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
            <span className="text-2xl">💬</span>
            <p className="text-xs font-bold text-gray-500">No messages yet</p>
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">Send a message to start the conversation with your consultant.</p>
          </div>
        ) : (
          messages.map(msg => {
            const own = isOwn(msg);
            return (
              <div key={msg.id} className={`flex gap-2 items-end ${own ? 'flex-row-reverse' : 'flex-row'}`}>
                {!own && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {providerInitials}
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${own ? 'bg-[#07b3f2] text-white rounded-tr-sm' : 'bg-[#f0f2f5] text-gray-700 rounded-tl-sm'}`}
                  style={{ opacity: msg.is_temp ? 0.6 : 1 }}
                >
                  {msg.content}
                  {msg.is_temp && <span className="text-[9px] opacity-60 ml-1">Sending...</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-2xl px-3 py-2 flex-shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || sending}
          className="w-7 h-7 rounded-xl bg-[#07b3f2] text-white flex items-center justify-center disabled:opacity-40 transition-all hover:bg-[#0596cf] flex-shrink-0"
        >
          {sending
            ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          }
        </button>
      </div>

      {/* Open full chat link */}
      <button onClick={onOpenFullChat} className="mt-2 text-[10px] text-[#07b3f2] font-bold text-center hover:underline flex-shrink-0">
        Open full conversation →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const fileInputRef = useRef(null);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [callStatus, setCallStatus] = useState('idle');
  const [meetLink, setMeetLink] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const [phase, setPhase] = useState('idle');
  const [evalAgentName, setEvalAgentName] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [step3Highlight, setStep3Highlight] = useState(false);

  const [chatUnlocked, setChatUnlocked] = useState(true);

  const token = () => localStorage.getItem('access_token');

  useEffect(() => { fetchApplication(); }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    function connect() {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      const ws = new WebSocket(`wss://web-production-f50dc.up.railway.app/ws/calls/?token=${accessToken}`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'call_accepted') { setMeetLink(data.meet_link); setCallStatus('connected'); }
          if (data.type === 'call_declined') { setCallStatus('declined'); }
          if (data.type === 'call_completed') {
            setCallStatus('idle'); setSessionId(null);
            setEvalAgentName(data.agent_name || 'Your Consultant');
            setPhase('onboarding');
          }
          if (data.type === 'evaluation_result') {
            setEvalResult({ readiness_score: data.readiness_score || 0, applicant_name: data.applicant_name || '' });
            setPhase(data.is_positive ? 'welcome' : 'rejected');
          }
          if (data.type === 'unlock_chat') { setChatUnlocked(true); }
        } catch (err) { console.error('[WS] parse error:', err); }
      };
      ws.onerror = (e) => console.error('[WS] error:', e);
      ws.onclose = (e) => {
        console.warn('[WS] closed:', e.code);
        if (e.code !== 1000 && e.code !== 4001) { reconnectTimer.current = setTimeout(connect, 3000); }
      };
    }

    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(1000); }
    };
  }, []);

  const handleOnboardingComplete = () => {
    setPhase('idle'); setCallStatus('idle'); setMeetLink(''); setSessionId(null);
    setStep3Highlight(true); fetchApplication();
    setTimeout(() => setStep3Highlight(false), 6000);
  };

  const fetchApplication = async () => {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/`, { headers: { 'Authorization': `Bearer ${token()}` } });
      if (res.ok) {
        const data = await res.json();
        const app = data.application || data;
        setApplication(app);
        if (app.chat_unlocked) setChatUnlocked(true);
      }
      else if (res.status === 401) router.push('/login');
      else setError('Application not found');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/start/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' } });
      if (res.ok) { const data = await res.json(); setApplication(data.application || data); }
    } catch (e) { console.error(e); } finally { setStarting(false); }
  };

  const handleCancelMeeting = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/meeting/cancel/`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' } });
      if (res.ok) { const data = await res.json(); setApplication(data.application || data); }
    } catch (e) { console.error(e); } finally { setActionLoading(false); setShowCancelModal(false); }
  };

  const handleCallRequest = async () => {
    setCallStatus('calling'); setMeetLink(''); setSessionId(null);
    try {
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/calls/request/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: application?.package_title || 'Discovery Call' })
      });
      const data = await res.json();
      if (!res.ok) { setCallStatus('declined'); return; }
      setSessionId(data.session_id);
    } catch { setCallStatus('declined'); }
  };

  const handleFileUpload = async (files) => {
    setUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData(); formData.append('file', file);
        const res = await fetch(`${API_BASE}/applications/${id}/documents/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token()}` }, body: formData });
        if (res.ok) { const data = await res.json(); setApplication(prev => ({ ...prev, documents: [...(prev.documents || []), data.document] })); }
      }
    } catch (e) { console.error(e); } finally { setUploadingFile(false); }
  };

  const handleDeleteFile = async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/documents/${docId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
      if (res.ok) setApplication(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== docId) }));
    } catch (e) { console.error(e); }
  };

  const calcProgress = () => {
    if (!application) return 0;
    const docs = application.documents?.length || 0;
    if (application.status === 'completed') return 100;
    if (application.status === 'processing') return Math.min(60 + docs * 5, 90);
    if (application.is_paid) return Math.min(50 + docs * 5, 55);
    if (application.meeting_status === 'completed') return 35;
    if (application.status === 'started') return 15;
    return 0;
  };

  const formatDate = (d) => {
    if (!d) return 'To be scheduled';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="h-screen w-screen bg-[#f0f2f5] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#07b3f2]/20 border-t-[#07b3f2] rounded-full animate-spin" /></div>;
  if (error) return <div className="h-screen w-screen bg-[#f0f2f5] flex items-center justify-center"><div className="text-center px-6"><p className="text-red-500 font-bold">{error}</p><button onClick={() => router.push('/dashboard')} className="mt-4 px-6 py-2 bg-[#07b3f2] text-white rounded-xl text-sm font-bold">Go to Dashboard</button></div></div>;

  const progress = calcProgress();
  const status = application?.status || 'not_started';
  const documents = application?.documents || [];
  const isPaid = application?.is_paid || false;
  const step2ShouldPulse = status === 'started';

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes borderPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(7,179,242,0.45),0 0 0 0 rgba(7,179,242,0.2);border-color:#07b3f2;}
          50%{box-shadow:0 0 0 8px rgba(7,179,242,0.15),0 0 0 18px rgba(7,179,242,0.06);border-color:#07b3f2;}
        }
        @keyframes step3Pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(7,179,242,0.4),0 0 0 0 rgba(7,179,242,0.15);border-color:#07b3f2;}
          50%{box-shadow:0 0 0 8px rgba(7,179,242,0.12),0 0 0 20px rgba(7,179,242,0.05);border-color:#07b3f2;}
        }
        @keyframes badgePop { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        .step2-pulse { border:2px solid #07b3f2 !important; animation:borderPulse 2s ease-in-out infinite; }
        .step3-pulse { border:2px solid #07b3f2 !important; animation:step3Pulse 2s ease-in-out infinite; }
        .step2-badge-pulse { animation:badgePop 2s ease-in-out infinite; }
        .step3-badge-pulse { animation:badgePop 2s ease-in-out infinite; }
      `}</style>

      {callStatus !== 'idle' && (
        <CallingScreen callStatus={callStatus} meetLink={meetLink} onCancel={() => { setCallStatus('idle'); setMeetLink(''); }} />
      )}

      {(phase === 'onboarding' || phase === 'welcome') && callStatus === 'idle' && (
        <OnboardingOverlay agentName={evalAgentName} phase={phase} result={evalResult} onContinue={handleOnboardingComplete} />
      )}

      {phase === 'rejected' && (
        <RejectionScreen applicantName={evalResult?.applicant_name || ''} onBack={() => { setPhase('idle'); fetchApplication(); }} />
      )}

      {/* ── DESKTOP LAYOUT (lg+) ── */}
      <div className="hidden lg:flex h-screen overflow-hidden flex-col px-6 py-4 gap-4">
        {/* Row 1 */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{application?.package_country} — {application?.package_title}</p>
            <h2 className="text-xl font-black text-gray-900 leading-tight">My Application</h2>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-6 py-3 border border-gray-100 shadow-sm">
            <StepTimeline status={status} />
          </div>

          <button
            onClick={handleCallRequest}
            disabled={callStatus === 'calling'}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-xl hover:border-[#07b3f2]/40 hover:text-[#07b3f2] hover:bg-[#f0f9ff] transition-all shadow-sm disabled:opacity-50"
          >
            <span className="text-xs">📞</span>
            {callStatus === 'calling' ? 'Connecting...' : 'Call Customer Care'}
          </button>

          {!isPaid
            ? <button onClick={() => router.push(`/application/${id}/payment`)} className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white border border-[#07b3f2]/30 text-[#07b3f2] text-xs font-bold rounded-xl hover:bg-[#07b3f2] hover:text-white transition-all shadow-sm">Make Payment →</button>
            : <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-600 text-xs font-bold rounded-xl">✓ Payment Confirmed</div>
          }
        </div>

        {/* Row 2: 3 columns */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Col 1 */}
          <div className="col-span-3 flex flex-col gap-3 overflow-y-auto min-h-0 pb-1">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center flex-shrink-0">
              <div className="w-full flex flex-col items-start mb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Step 1</p>
                <h3 className="text-base font-black text-gray-900">Application Progress</h3>
              </div>
              <CircularProgress percent={progress} />
              <p className="text-[11px] text-gray-400 mt-1 leading-snug px-2">
                {status === 'not_started' && <span className="font-bold text-gray-600">Click Start Application to begin your visa journey</span>}
                {status === 'started' && 'Upload your documents and chat with your consultant'}
                {status === 'processing' && 'Your application is under review by our team'}
                {status === 'completed' && 'Congratulations! Your visa is ready'}
              </p>
              {status === 'not_started' && (
                <button onClick={handleStart} disabled={starting} className="mt-3 w-full py-2.5 bg-[#07b3f2] text-white text-xs font-bold rounded-2xl hover:bg-[#0596cf] transition-all shadow-lg shadow-[#07b3f2]/25 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {starting ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Starting...</> : 'Start Application'}
                </button>
              )}
              {isPaid && <button onClick={() => router.push(`/application/${id}/chat`)} className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#07b3f2] to-[#055fa3] text-white text-xs font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#07b3f2]/25">Open Full Chat</button>}
              {status === 'processing' && <div className="mt-3 w-full py-2 bg-amber-50 rounded-2xl text-center"><p className="text-xs font-bold text-amber-600">Under Review</p><p className="text-[10px] text-amber-500 mt-0.5">Our team is processing your application</p></div>}
              {status === 'completed' && <div className="mt-3 w-full py-2 bg-green-50 rounded-2xl text-center"><p className="text-xs font-bold text-green-600">Visa Approved!</p></div>}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-shrink-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Consultant</p>
              {status === 'not_started' ? (
                <div className="flex flex-col items-center text-center py-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl mb-2">👤</div>
                  <p className="text-xs font-semibold text-gray-500">Assigned after you start</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(application?.consultant_name || 'CM').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{application?.consultant_name || 'Consultant'}</p>
                      <p className="text-[10px] text-gray-400">{application?.consultant_title || 'Visa Consultant'}</p>
                    </div>
                  </div>
                  <div className="bg-[#f0f2f5] rounded-2xl p-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Date</p>
                    <p className="text-xs font-bold text-gray-800">{formatDate(application?.meeting_date)}</p>
                    {application?.meeting_time && <p className="text-[10px] text-gray-500 mt-0.5">{application.meeting_time}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex-shrink-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Required Documents</p>
              <div className="space-y-2">
                {['International Passport', 'Bank Statement', 'Admission Letter', 'Birth Certificate', 'Sponsor Letter', 'Passport Photographs'].map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07b3f2]/40 flex-shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 — Inline Chat (Step 2) */}
          <div className="col-span-4 overflow-y-auto min-h-0 pb-1">
            <div className={`bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-full transition-all duration-300 ${step2ShouldPulse ? 'step2-pulse' : 'border border-gray-100'}`}>
              <div className="flex items-start justify-between flex-shrink-0">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Step 2 · Optional</p>
                  <h3 className="text-base font-black text-gray-900">Messages</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Chat with your consultant</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0284c7] flex-shrink-0">
                  {chatUnlocked ? 'Chat Active ✓' : 'Available'}
                </span>
              </div>
              <div className="flex-1 min-h-0">
                {/* ✅ FIX: Pass chatUnlocked prop */}
                <InlineChatPanel
                  applicationId={id}
                  consultantName={application?.consultant_name}
                  onOpenFullChat={() => router.push(`/application/${id}/chat`)}
                  chatUnlocked={chatUnlocked}
                />
              </div>
            </div>
          </div>

          {/* Col 3 — Documents (Step 3) */}
          <div className="col-span-5 overflow-y-auto min-h-0 pb-1">
            <div className={`bg-white rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-full transition-all duration-500 ${step3Highlight ? 'step3-pulse' : 'border border-gray-100'}`}>
              <div className="flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Step 3</p>
                  <h3 className="text-base font-black text-gray-900">Upload Documents</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Upload files as directed by your consultant</p>
                </div>
                <div className="flex items-center gap-2">
                  {step3Highlight && <span className="step3-badge-pulse px-3 py-1 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#07b3f2]">✨ Now Active!</span>}
                  {documents.length > 0 && <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#07b3f2] text-xs font-bold">{documents.length} files</span>}
                </div>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex-shrink-0 ${isDragging ? 'border-[#07b3f2] bg-[#e0f2fe] scale-[1.01]' : 'border-gray-200 hover:border-[#07b3f2]/50 hover:bg-[#f0f2f5]'}`}>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                {uploadingFile
                  ? <div className="flex items-center justify-center gap-2 py-1"><div className="w-4 h-4 border-2 border-[#07b3f2]/30 border-t-[#07b3f2] rounded-full animate-spin" /><p className="text-xs text-[#07b3f2] font-bold">Uploading...</p></div>
                  : <><p className="text-sm font-bold text-gray-700">Drop files here or <span className="text-[#07b3f2] underline underline-offset-2">browse</span></p><p className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG, DOC — Max 10MB</p></>}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 border border-[#07b3f2]/30 text-[#07b3f2] text-xs font-bold rounded-2xl hover:bg-[#e0f2fe] transition-all flex-shrink-0">+ Upload New File</button>
              <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                {documents.length === 0
                  ? <div className="text-center py-6 bg-[#f0f2f5] rounded-2xl"><p className="text-xs font-semibold text-gray-400">No files uploaded yet</p><p className="text-[10px] text-gray-300 mt-0.5">Your consultant will tell you what to upload</p></div>
                  : documents.map(file => <DocumentRow key={file.id} file={file} onDelete={handleDeleteFile} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET LAYOUT (< lg) ── */}
      <div className="lg:hidden flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{application?.package_country} — {application?.package_title}</p>
              <h2 className="text-base font-black text-gray-900 leading-tight">My Application</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCallRequest}
                disabled={callStatus === 'calling'}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-semibold rounded-xl hover:border-[#07b3f2]/40 hover:text-[#07b3f2] transition-all shadow-sm disabled:opacity-50"
              >
                <span>📞</span>
                <span className="hidden sm:inline">Customer Care</span>
              </button>
              {!isPaid
                ? <button onClick={() => router.push(`/application/${id}/payment`)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#07b3f2]/30 text-[#07b3f2] text-xs font-bold rounded-xl hover:bg-[#07b3f2] hover:text-white transition-all shadow-sm">Pay →</button>
                : <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-600 text-xs font-bold rounded-xl">✓ Paid</div>
              }
            </div>
          </div>
          <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2">
            <StepTimeline status={status} />
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          <CollapsibleSection
            title="Application Progress"
            subtitle="Step 1"
            defaultOpen={true}
            badge={<span className="text-xs font-bold text-[#07b3f2] bg-[#e0f2fe] px-2 py-0.5 rounded-full">{progress}%</span>}
          >
            <div className="flex items-center gap-4 mb-4">
              <CircularProgress percent={progress} />
              <p className="text-xs text-gray-500 leading-relaxed flex-1">
                {status === 'not_started' && <span className="font-bold text-gray-600">Click Start Application to begin your visa journey</span>}
                {status === 'started' && 'Upload your documents and chat with your consultant'}
                {status === 'processing' && 'Your application is under review by our team'}
                {status === 'completed' && 'Congratulations! Your visa is ready'}
              </p>
            </div>
            {status === 'not_started' && (
              <button onClick={handleStart} disabled={starting} className="w-full py-3 bg-[#07b3f2] text-white text-sm font-bold rounded-2xl hover:bg-[#0596cf] transition-all shadow-lg shadow-[#07b3f2]/25 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {starting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Starting...</> : 'Start Application'}
              </button>
            )}
            {isPaid && <button onClick={() => router.push(`/application/${id}/chat`)} className="w-full py-3 bg-gradient-to-r from-[#07b3f2] to-[#055fa3] text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#07b3f2]/25">Open Full Chat</button>}
            {status === 'processing' && <div className="w-full py-2.5 bg-amber-50 rounded-2xl text-center"><p className="text-sm font-bold text-amber-600">Under Review</p></div>}
            {status === 'completed' && <div className="w-full py-2.5 bg-green-50 rounded-2xl text-center"><p className="text-sm font-bold text-green-600">Visa Approved!</p></div>}
            {status !== 'not_started' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Consultant</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#07b3f2] to-[#055fa3] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(application?.consultant_name || 'CM').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{application?.consultant_name || 'Consultant'}</p>
                    <p className="text-[10px] text-gray-400">{application?.consultant_title || 'Visa Consultant'}</p>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Messages"
            subtitle="Step 2 · Optional"
            defaultOpen={true}
            pulseClass={step2ShouldPulse ? 'step2-pulse' : ''}
            badge={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0284c7]">
                {chatUnlocked ? 'Active ✓' : 'Available'}
              </span>
            }
          >
            {/* ✅ FIX: Pass chatUnlocked prop here too (mobile) */}
            <InlineChatPanel
              applicationId={id}
              consultantName={application?.consultant_name}
              onOpenFullChat={() => router.push(`/application/${id}/chat`)}
              chatUnlocked={chatUnlocked}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Upload Documents"
            subtitle="Step 3"
            defaultOpen={true}
            pulseClass={step3Highlight ? 'step3-pulse' : ''}
            badge={
              <div className="flex items-center gap-1.5">
                {step3Highlight && <span className="step3-badge-pulse px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#07b3f2]">✨ Active!</span>}
                {documents.length > 0 && <span className="px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#07b3f2] text-xs font-bold">{documents.length}</span>}
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${isDragging ? 'border-[#07b3f2] bg-[#e0f2fe] scale-[1.01]' : 'border-gray-200 hover:border-[#07b3f2]/50 hover:bg-[#f0f2f5]'}`}>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                {uploadingFile
                  ? <div className="flex items-center justify-center gap-2 py-1"><div className="w-4 h-4 border-2 border-[#07b3f2]/30 border-t-[#07b3f2] rounded-full animate-spin" /><p className="text-xs text-[#07b3f2] font-bold">Uploading...</p></div>
                  : <><p className="text-sm font-bold text-gray-700">Tap to browse files</p><p className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG, DOC — Max 10MB</p></>}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 border border-[#07b3f2]/30 text-[#07b3f2] text-xs font-bold rounded-2xl hover:bg-[#e0f2fe] transition-all">+ Upload New File</button>
              <div className="space-y-2">
                {documents.length === 0
                  ? <div className="text-center py-6 bg-[#f0f2f5] rounded-2xl"><p className="text-xs font-semibold text-gray-400">No files uploaded yet</p><p className="text-[10px] text-gray-300 mt-0.5">Your consultant will tell you what to upload</p></div>
                  : documents.map(file => <DocumentRow key={file.id} file={file} onDelete={handleDeleteFile} />)}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Required Documents" defaultOpen={false}>
            <div className="space-y-2">
              {['International Passport', 'Bank Statement', 'Admission Letter', 'Birth Certificate', 'Sponsor Letter', 'Passport Photographs'].map(doc => (
                <div key={doc} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07b3f2]/40 flex-shrink-0" />
                  {doc}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <div className="h-6" />
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-1">Cancel Meeting?</h3>
            <p className="text-xs text-gray-400 mb-6">You can reschedule after cancelling.</p>
            <div className="flex gap-3">
              <button onClick={handleCancelMeeting} disabled={actionLoading} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm">Keep Meeting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}