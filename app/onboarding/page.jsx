'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws/calls/';

const ONBOARDING_STEPS = [
  { id: 'profile',   icon: '⚙️',  label: 'Setting up your profile',       duration: 2200 },
  { id: 'chat',      icon: '💬',  label: 'Unlocking chat with consultant', duration: 2000 },
  { id: 'documents', icon: '📁',  label: 'Activating document upload',     duration: 1800 },
  { id: 'review',    icon: '🔍',  label: 'Preparing your visa roadmap',    duration: 1600 },
  { id: 'complete',  icon: '✅',  label: 'Almost there...',               duration: 1000 },
];

function UnlockStep({ step, state }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 14,
      background: state === 'done' ? 'rgba(7,179,242,0.08)' : state === 'active' ? 'rgba(7,179,242,0.05)' : 'rgba(255,255,255,0.02)',
      border: state === 'done' ? '1px solid rgba(7,179,242,0.28)' : state === 'active' ? '1px solid rgba(7,179,242,0.18)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
      transform: state === 'active' ? 'translateX(4px)' : 'translateX(0)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        background: state === 'done' ? 'rgba(7,179,242,0.15)' : state === 'active' ? 'rgba(7,179,242,0.1)' : 'rgba(255,255,255,0.04)',
        border: state === 'done' ? '1px solid rgba(7,179,242,0.35)' : state === 'active' ? '1px solid rgba(7,179,242,0.22)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.4s ease',
      }}>
        {state === 'done'
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07b3f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <span style={{ opacity: state === 'active' ? 1 : 0.28 }}>{step.icon}</span>}
      </div>
      <span style={{
        flex: 1, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        color: state === 'done' ? '#7dd3fc' : state === 'active' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
        transition: 'color 0.4s ease',
      }}>{step.label}</span>
      {state === 'active' && (
        <div style={{ width: 16, height: 16, border: '2px solid rgba(7,179,242,0.2)', borderTop: '2px solid #07b3f2', borderRadius: '50%', animation: 'obSpin 0.9s linear infinite' }} />
      )}
      {state === 'done' && (
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#07b3f2', background: 'rgba(7,179,242,0.12)', padding: '3px 9px', borderRadius: 999 }}>Done</span>
      )}
    </div>
  );
}

function OnboardingPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const sessionId     = searchParams.get('session_id');
  const applicationId = searchParams.get('application_id');
  const agentName     = searchParams.get('agent_name') || 'Your Consultant';

  const [phase, setPhase]             = useState('onboarding');
  const [result, setResult]           = useState(null);
  const [wsStatus, setWsStatus]       = useState('connecting');
  const [activeStep, setActiveStep]   = useState(0);
  const [doneSteps, setDoneSteps]     = useState([]);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const stepTimers = useRef([]);

  useEffect(() => {
    if (phase !== 'onboarding') return;
    let delay = 0;
    ONBOARDING_STEPS.forEach((step, i) => {
      stepTimers.current.push(
        setTimeout(() => setActiveStep(i), delay),
        setTimeout(() => setDoneSteps(prev => [...prev, i]), delay + step.duration),
      );
      delay += step.duration + 200;
    });
    return () => stepTimers.current.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'welcome') return;
    const t = [
      setTimeout(() => setWelcomeStep(1), 100),
      setTimeout(() => setWelcomeStep(2), 380),
      setTimeout(() => setWelcomeStep(3), 680),
      setTimeout(() => setWelcomeStep(4), 1000),
    ];
    return () => t.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (!sessionId) return;
    const token = localStorage.getItem('access_token');
    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;
      ws.onopen = () => setWsStatus('open');
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'onboarding_complete') {
          stepTimers.current.forEach(clearTimeout);
          setDoneSteps([0,1,2,3,4]); setActiveStep(-1);
          setTimeout(() => {
            setResult({ readiness_score: data.readiness_score, recommendation: data.recommendation, applicant_name: data.applicant_name });
            setPhase('welcome');
          }, 500);
        }
      };
      ws.onerror = () => setWsStatus('error');
      ws.onclose = () => { setWsStatus('reconnecting'); reconnectTimer.current = setTimeout(connect, 3000); };
    };
    connect();
    return () => { clearTimeout(reconnectTimer.current); wsRef.current?.close(); };
  }, [sessionId]);

  const scoreColor = result ? result.readiness_score >= 75 ? '#4ade80' : result.readiness_score >= 50 ? '#fbbf24' : '#f87171' : '#07b3f2';

  if (!sessionId) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 16 }}>No session found.</p>
        <button onClick={() => router.back()} style={{ padding: '10px 24px', background: '#07b3f2', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0c2a4a 50%, #0f172a 100%)',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes obSpin    { to { transform: rotate(360deg); } }
        @keyframes obGlow    { 0%,100%{opacity:.4;} 50%{opacity:.75;} }
        @keyframes obFadeUp  { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes obFadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes obPop     { 0%{transform:scale(.5);opacity:0;} 65%{transform:scale(1.1);} 100%{transform:scale(1);opacity:1;} }
        @keyframes obPulse   { 0%{transform:scale(1);opacity:.6;} 100%{transform:scale(1.9);opacity:0;} }
        @keyframes obConfetti{ 0%{transform:translateY(-20px) rotate(0deg);opacity:1;} 100%{transform:translateY(110vh) rotate(720deg);opacity:0;} }
        .ob-fade-up  { animation: obFadeUp  0.5s cubic-bezier(.22,1,.36,1) both; }
        .ob-fade-in  { animation: obFadeIn  0.4s ease both; }
        .ob-pop      { animation: obPop     0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .ob-confetti { position:absolute; border-radius:2px; animation:obConfetti linear infinite; pointer-events:none; }
      `}</style>

      <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(7,179,242,0.1) 0%,transparent 70%)', animation:'obGlow 4s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(7,179,242,0.07) 0%,transparent 70%)', animation:'obGlow 4s ease-in-out infinite 2s', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>

        {phase === 'onboarding' && (
          <div className="ob-fade-in">
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>✈️ &nbsp;MyVisa</span>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(7,179,242,0.15)', borderRadius:28, padding:'40px 32px', backdropFilter:'blur(20px)', boxShadow:'0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
                <div style={{ position:'relative', width:80, height:80 }}>
                  <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1.5px solid rgba(7,179,242,0.2)', animation:'obPulse 2s ease-out infinite' }} />
                  <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1.5px solid rgba(7,179,242,0.1)', animation:'obPulse 2s ease-out infinite 0.75s' }} />
                  <div style={{ width:80, height:80, borderRadius:22, background:'linear-gradient(135deg,rgba(7,179,242,0.2),rgba(2,132,199,0.08))', border:'1px solid rgba(7,179,242,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34 }}>🚀</div>
                  <div style={{ position:'absolute', inset:-6, borderRadius:'50%', border:'2px solid transparent', borderTop:'2px solid #07b3f2', animation:'obSpin 1.8s linear infinite' }} />
                </div>
              </div>
              <div style={{ textAlign:'center', marginBottom:6 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:8 }}>Onboarding</h1>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>
                  <span style={{ color:'#7dd3fc', fontWeight:600 }}>{agentName}</span> is completing your profile and setting up your MyVisa account.
                </p>
              </div>
              <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'22px 0' }} />
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
                {ONBOARDING_STEPS.map((step, i) => {
                  const isDone = doneSteps.includes(i);
                  const isActive = activeStep === i && !isDone;
                  return <UnlockStep key={step.id} step={step} state={isDone ? 'done' : isActive ? 'active' : 'pending'} />;
                })}
              </div>
              <div style={{ background:'rgba(7,179,242,0.06)', border:'1px solid rgba(7,179,242,0.15)', borderRadius:14, padding:'11px 14px' }}>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.6, textAlign:'center' }}>
                  🔒 Keep this page open — you'll be redirected automatically when setup is complete.
                </p>
              </div>
            </div>
            <div style={{ textAlign:'center', marginTop:14 }}>
              <span style={{ fontSize:10, fontWeight:700, color: wsStatus === 'open' ? '#4ade80' : '#fbbf24' }}>
                {wsStatus === 'open' ? '● Connected — setting up your account' : '● Reconnecting...'}
              </span>
            </div>
          </div>
        )}

        {phase === 'welcome' && result && (
          <>
            {[...Array(18)].map((_,i) => (
              <div key={i} className="ob-confetti" style={{
                left:`${(i*5.6)%100}%`, top:'-10px',
                background:['#07b3f2','#0284c7','#7dd3fc','#fbbf24','#4ade80','#bae6fd'][i%6],
                width:`${5+(i%5)*2}px`, height:`${5+(i%4)*2}px`,
                animationDuration:`${2.2+(i%5)*.45}s`,
                animationDelay:`${(i*.17)%1.8}s`,
                borderRadius: i%3===0 ? '50%' : '3px',
              }}/>
            ))}
            <div className="ob-fade-in">
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>✈️ &nbsp;MyVisa</span>
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(7,179,242,0.3)', borderRadius:28, padding:'44px 32px', backdropFilter:'blur(20px)', boxShadow:'0 24px 60px rgba(0,0,0,0.4), 0 0 60px rgba(7,179,242,0.1), inset 0 1px 0 rgba(255,255,255,0.06)', textAlign:'center' }}>
                {welcomeStep >= 1 && (
                  <div className="ob-pop" style={{ display:'flex', justifyContent:'center', marginBottom:22 }}>
                    <div style={{ width:88, height:88, borderRadius:24, background:'linear-gradient(135deg,rgba(7,179,242,0.22),rgba(2,132,199,0.1))', border:'1.5px solid rgba(7,179,242,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, boxShadow:'0 8px 32px rgba(7,179,242,0.22)' }}>🎉</div>
                  </div>
                )}
                {welcomeStep >= 2 && (
                  <div className="ob-fade-up" style={{ marginBottom:6 }}>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:6 }}>Welcome to MyVisa,</h1>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:'#7dd3fc', lineHeight:1.2, marginBottom:14 }}>{result.applicant_name?.split(' ')[0] || 'there'}! ✈️</h1>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>Your account is fully set up. Chat, documents, and your full application are now unlocked.</p>
                  </div>
                )}
                {welcomeStep >= 3 && (
                  <div className="ob-fade-up" style={{ margin:'22px 0' }}>
                    <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:16 }} />
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                      {[
                        { icon:'💬', label:'Chat with your consultant', tag:'Unlocked' },
                        { icon:'📁', label:'Document upload portal',    tag:'Unlocked' },
                        { icon:'🗺️', label:'Your visa roadmap',         tag:'Ready'   },
                      ].map((item,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:13, textAlign:'left', background:'rgba(7,179,242,0.07)', border:'1px solid rgba(7,179,242,0.18)' }}>
                          <span style={{ fontSize:17 }}>{item.icon}</span>
                          <span style={{ flex:1, fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{item.label}</span>
                          <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#07b3f2', background:'rgba(7,179,242,0.12)', padding:'3px 9px', borderRadius:999 }}>{item.tag}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'15px 17px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                        <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Readiness Score</span>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:scoreColor }}>{result.readiness_score}%</span>
                      </div>
                      <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${result.readiness_score}%`, background:`linear-gradient(90deg,${scoreColor}99,${scoreColor})`, borderRadius:999, transition:'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:7, textAlign:'left' }}>
                        {result.readiness_score >= 80 ? 'Excellent — highly prepared!' : result.readiness_score >= 60 ? 'Great — well prepared!' : "Good start — let's build from here!"}
                      </p>
                    </div>
                  </div>
                )}
                {welcomeStep >= 4 && (
                  <button onClick={() => router.push(applicationId ? `/application/${applicationId}` : '/dashboard')}
                    className="ob-fade-up"
                    onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                    style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#07b3f2,#0284c7)', color:'white', fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', boxShadow:'0 8px 28px rgba(7,179,242,0.35)', transition:'opacity 0.15s ease' }}>
                    Continue to My Application →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        Loading...
      </div>
    }>
      <OnboardingPage />
    </Suspense>
  );
}