'use client';
import React, { useState, useEffect, useRef } from 'react';

const API = 'https://web-production-f50dc.up.railway.app/api';
function authHeaders() {
  return {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}`,
    'Content-Type': 'application/json',
  };
}

// ─── tiny helpers ────────────────────────────────────────────────────────────
const ini   = n => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
const fmtD  = d => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
const COLORS = ['#6366f1','#06b6d4','#8b5cf6','#059669','#f59e0b','#ef4444','#ec4899','#0ea5e9'];

const STATUS_MAP = {
  not_started: { label:'Not Started', dot:'#94a3b8', bg:'rgba(148,163,184,0.12)', text:'#64748b' },
  started:     { label:'Started',     dot:'#6366f1', bg:'rgba(99,102,241,0.10)',  text:'#4f46e5' },
  processing:  { label:'Processing',  dot:'#f59e0b', bg:'rgba(245,158,11,0.10)',  text:'#d97706' },
  completed:   { label:'Completed',   dot:'#10b981', bg:'rgba(16,185,129,0.10)',  text:'#059669' },
};

// ─── Inline SVG sparkline ─────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#6366f1', height = 40, fill = true }) {
  if (!data.length) return null;
  const w = 120, h = height;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h * 0.85) - h * 0.07;
    return `${x},${y}`;
  });
  const line = 'M' + pts.join(' L');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
      {fill && (
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#sg-${color.replace('#','')})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Donut chart (pure SVG) ───────────────────────────────────────────────────
function DonutChart({ segments, size = 130, thickness = 22 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const gap = 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ - gap;
        const spacer = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${Math.max(dash,0)} ${spacer}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
          />
        );
        offset += pct * circ;
        return el;
      })}
    </svg>
  );
}

// ─── Mini bar chart (pure SVG) ────────────────────────────────────────────────
function MiniBar({ data = [], color = '#6366f1', height = 56 }) {
  if (!data.length) return null;
  const w = 200;
  const max = Math.max(...data, 1);
  const barW = (w / data.length) * 0.6;
  const gap   = (w / data.length) * 0.4;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / max) * (height - 8);
        const x  = i * (barW + gap) + gap / 2;
        return (
          <rect
            key={i}
            x={x} y={height - bh}
            width={barW} height={bh}
            rx="2"
            fill={color}
            fillOpacity={0.15 + (v / max) * 0.7}
          />
        );
      })}
    </svg>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCount({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0, startTime = null;
    const step = ts => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setDisplay(Math.round(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── Global styles ─────────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

    .ov2 *, .ov2 *::before, .ov2 *::after { box-sizing: border-box; }
    .ov2 {
      font-family: 'Bricolage Grotesque', sans-serif;
      --ink:    #080e1c;
      --ink2:   #1e2d45;
      --ink3:   #374151;
      --muted:  #64748b;
      --muted2: #94a3b8;
      --border: #e4eaf4;
      --border2:#f1f5fb;
      --surf:   #f7f9fc;
      --surf2:  #eef2f8;
      --white:  #ffffff;
      --indigo: #6366f1;
      --cyan:   #06b6d4;
      --green:  #10b981;
      --amber:  #f59e0b;
      --red:    #ef4444;
      --purple: #8b5cf6;
    }

    @keyframes ov2-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ov2-pop  { from { opacity:0; transform:scale(0.94); }      to { opacity:1; transform:scale(1); }     }
    @keyframes ov2-pulse{ 0%,100%{opacity:1;} 50%{opacity:0.35;} }
    @keyframes ov2-shim { 0%{background-position:-200% center;} 100%{background-position:200% center;} }

    .ov2-a  { animation: ov2-up  0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .ov2-p  { animation: ov2-pop 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .ov2-a1 { animation-delay:0.04s; } .ov2-a2 { animation-delay:0.09s; }
    .ov2-a3 { animation-delay:0.14s; } .ov2-a4 { animation-delay:0.19s; }
    .ov2-a5 { animation-delay:0.24s; } .ov2-a6 { animation-delay:0.29s; }
    .ov2-a7 { animation-delay:0.34s; } .ov2-a8 { animation-delay:0.39s; }

    /* skeleton */
    .ov2-sk { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% auto; animation:ov2-shim 1.3s linear infinite; border-radius:12px; }

    /* stat cards */
    .ov2-card { background:var(--white); border:1px solid var(--border); border-radius:20px; transition:transform 0.2s,box-shadow 0.2s; overflow:hidden; }
    .ov2-card:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,0.07); }

    /* hero card */
    .ov2-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
      border: none;
      border-radius: 24px;
      position: relative;
      overflow: hidden;
    }
    .ov2-hero::before {
      content:'';
      position:absolute; top:-60px; right:-60px;
      width:240px; height:240px; border-radius:50%;
      background:radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%);
      pointer-events:none;
    }
    .ov2-hero::after {
      content:'';
      position:absolute; bottom:-40px; left:-20px;
      width:160px; height:160px; border-radius:50%;
      background:radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%);
      pointer-events:none;
    }

    /* mini stat in hero */
    .ov2-pill {
      display:inline-flex; align-items:center; gap:5px;
      padding:4px 10px; border-radius:999px;
      font-size:11px; font-weight:700;
    }

    /* table */
    .ov2-tr { border-top:1px solid var(--border2); transition:background 0.12s; }
    .ov2-tr:hover { background:var(--surf); }
    .ov2-th { padding:9px 18px; font-size:9px; font-weight:800; color:var(--muted2); text-transform:uppercase; letter-spacing:0.1em; background:var(--surf); text-align:left; white-space:nowrap; }
    .ov2-td { padding:12px 18px; font-size:13px; color:var(--ink3); }

    /* badge */
    .ov2-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px 3px 6px; border-radius:999px; font-size:10.5px; font-weight:700; }
    .ov2-dot   { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

    /* avatar */
    .ov2-av { border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; color:white; flex-shrink:0; font-size:11px; font-family:'DM Mono',monospace; }

    /* section header */
    .ov2-sh { font-size:11px; font-weight:700; color:var(--muted2); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
    .ov2-sh::after { content:''; flex:1; height:1px; background:var(--border); }

    /* progress bar */
    .ov2-prog { height:4px; border-radius:999px; overflow:hidden; background:var(--border2); }
    .ov2-prog-fill { height:100%; border-radius:999px; transition:width 1.1s cubic-bezier(0.22,1,0.36,1); }

    /* live dot */
    .ov2-live { width:7px; height:7px; border-radius:50%; background:#10b981; animation:ov2-pulse 1.8s infinite; display:inline-block; }

    /* empty */
    .ov2-empty { padding:48px 20px; text-align:center; color:var(--muted2); font-size:13px; }

    /* chart legend */
    .ov2-leg { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--muted); }
    .ov2-leg-dot { width:8px; height:8px; border-radius:2px; flex-shrink:0; }
  `}</style>
);

// ─── main component ───────────────────────────────────────────────────────────
export default function Overview() {
  const [stats,      setStats]      = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [aR, uR] = await Promise.all([
        fetch(`${API}/applications/admin/all/`, { headers: authHeaders() }),
        fetch(`${API}/auth/admin/users/`,       { headers: authHeaders() }),
      ]);
      const apps  = ((await aR.json()).applications || []);
      const users = ((await uR.json()).users        || []);

      // build monthly trend (last 6 months)
      const now = new Date();
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const m = (now.getMonth() - 5 + i + 12) % 12;
        return apps.filter(a => a.submitted_at && new Date(a.submitted_at).getMonth() === m).length;
      });

      // top countries
      const cMap = {};
      apps.forEach(a => { if (a.package_country) cMap[a.package_country] = (cMap[a.package_country] || 0) + 1; });
      const topCountries = Object.entries(cMap).sort((a,b) => b[1]-a[1]).slice(0,5);

      setStats({
        total:       apps.length,
        not_started: apps.filter(a => a.status === 'not_started').length,
        started:     apps.filter(a => a.status === 'started').length,
        processing:  apps.filter(a => a.status === 'processing').length,
        completed:   apps.filter(a => a.status === 'completed').length,
        students:    users.length,
        monthly,
        topCountries,
        completionRate: apps.length ? Math.round((apps.filter(a => a.status === 'completed').length / apps.length) * 100) : 0,
      });
      setRecentApps(apps.slice(0, 8));
    } catch (e) {
      console.error(e);
      // graceful fallback — blank zeros
      setStats({ total:0, not_started:0, started:0, processing:0, completed:0, students:0, monthly:[0,0,0,0,0,0], topCountries:[], completionRate:0 });
    } finally {
      setLoading(false);
    }
  };

  const now    = new Date();
  const hour   = now.getHours();
  const greet  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  // ── loading skeleton ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="ov2">
      <G />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
        {[...Array(6)].map((_,i) => <div key={i} className="ov2-sk" style={{ height:130 }} />)}
      </div>
      <div className="ov2-sk" style={{ height:320 }} />
    </div>
  );

  const T = stats.total || 1;
  const donutSegs = [
    { value: stats.completed,   color:'#6366f1' },
    { value: stats.processing,  color:'#f59e0b' },
    { value: stats.started,     color:'#06b6d4' },
    { value: stats.not_started, color:'#e2e8f0' },
  ];

  // ── stat card definitions ───────────────────────────────────────────────────
  const cards = [
    {
      label:'Started',    value:stats.started,    icon:'✏️',
      color:'#6366f1',    barPct: Math.round((stats.started / T)*100),
      bg:'rgba(99,102,241,0.07)', sparkColor:'#6366f1',
    },
    {
      label:'Processing', value:stats.processing, icon:'⚙️',
      color:'#f59e0b',    barPct: Math.round((stats.processing / T)*100),
      bg:'rgba(245,158,11,0.07)', sparkColor:'#f59e0b',
    },
    {
      label:'Completed',  value:stats.completed,  icon:'✅',
      color:'#10b981',    barPct: Math.round((stats.completed / T)*100),
      bg:'rgba(16,185,129,0.07)', sparkColor:'#10b981',
    },
    {
      label:'Not Started',value:stats.not_started,icon:'⏸️',
      color:'#94a3b8',    barPct: Math.round((stats.not_started / T)*100),
      bg:'rgba(148,163,184,0.07)', sparkColor:'#94a3b8',
    },
    {
      label:'Students',   value:stats.students,   icon:'🎓',
      color:'#8b5cf6',    barPct:100,
      bg:'rgba(139,92,246,0.07)', sparkColor:'#8b5cf6',
    },
    {
      label:'Completion', value:`${stats.completionRate}%`, icon:'📈',
      color:'#06b6d4',    barPct:stats.completionRate,
      bg:'rgba(6,182,212,0.07)', sparkColor:'#06b6d4', isRate:true,
    },
  ];

  const monthLabels = ['', '', '', '', '', ''].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleString('default', { month:'short' });
  });

  return (
    <div className="ov2">
      <G />

      {/* ── greeting row ─────────────────────────────────────────────────── */}
      <div className="ov2-a ov2-a1" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--ink)', letterSpacing:'-0.5px', lineHeight:1.1 }}>
            {greet}, <span style={{ color:'var(--indigo)' }}>Admin</span> 👋
          </div>
          <div style={{ marginTop:5, display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--muted)' }}>
            <span className="ov2-live" />
            {dateStr} · Live data
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div className="ov2-pill" style={{ background:'rgba(16,185,129,0.1)', color:'#059669', border:'1px solid rgba(16,185,129,0.2)' }}>
            ● All systems operational
          </div>
        </div>
      </div>

      {/* ── HERO + mini stats ─────────────────────────────────────────────── */}
      <div className="ov2-a ov2-a2" style={{ display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:14, marginBottom:14 }}>

        {/* HERO card */}
        <div className="ov2-hero" style={{ padding:'28px 28px 24px', position:'relative', zIndex:1 }}>
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:12 }}>
              Total Applications
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:20 }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:60, fontWeight:500, color:'white', lineHeight:1, letterSpacing:'-2px' }}>
                <AnimCount value={stats.total} />
              </div>
              <div style={{ paddingBottom:8 }}>
                <div className="ov2-pill" style={{ background:'rgba(99,102,241,0.3)', color:'#c7d2fe', marginBottom:4 }}>
                  +{stats.monthly[stats.monthly.length-1]} this month
                </div>
                <div className="ov2-pill" style={{ background:'rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
                  {stats.completionRate}% completion
                </div>
              </div>
            </div>

            {/* sparkline */}
            <div style={{ marginBottom:16 }}>
              <Sparkline data={stats.monthly} color="#818cf8" height={52} fill />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                {monthLabels.map((m,i) => (
                  <span key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:600, textTransform:'uppercase' }}>{m}</span>
                ))}
              </div>
            </div>

            {/* status mini pills */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[
                { label:'Not Started', val:stats.not_started, c:'rgba(148,163,184,0.25)',  tc:'#cbd5e1' },
                { label:'Started',     val:stats.started,     c:'rgba(99,102,241,0.3)',    tc:'#a5b4fc' },
                { label:'Processing',  val:stats.processing,  c:'rgba(245,158,11,0.25)',   tc:'#fcd34d' },
                { label:'Completed',   val:stats.completed,   c:'rgba(16,185,129,0.25)',   tc:'#6ee7b7' },
              ].map(p => (
                <div key={p.label} style={{ background:p.c, borderRadius:8, padding:'5px 10px' }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{p.label}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:p.tc, fontFamily:'DM Mono,monospace', marginTop:1 }}>{p.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut + countries */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Donut card */}
          <div className="ov2-card" style={{ padding:'20px', flex:'0 0 auto' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Status Breakdown</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <DonutChart segments={donutSegs} size={120} thickness={18} />
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:22, fontWeight:500, color:'var(--ink)', lineHeight:1 }}>{stats.completionRate}%</div>
                  <div style={{ fontSize:9, color:'var(--muted2)', fontWeight:700, textTransform:'uppercase', marginTop:2 }}>Done</div>
                </div>
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Completed',   val:stats.completed,   color:'#6366f1' },
                  { label:'Processing',  val:stats.processing,  color:'#f59e0b' },
                  { label:'Started',     val:stats.started,     color:'#06b6d4' },
                  { label:'Not Started', val:stats.not_started, color:'#e2e8f0' },
                ].map(seg => (
                  <div key={seg.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <div className="ov2-leg"><span className="ov2-leg-dot" style={{ background:seg.color }} />{seg.label}</div>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--ink2)', fontFamily:'DM Mono,monospace' }}>{seg.val}</span>
                    </div>
                    <div className="ov2-prog"><div className="ov2-prog-fill" style={{ width:`${Math.round((seg.val/T)*100)}%`, background:seg.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top countries card */}
          <div className="ov2-card" style={{ padding:'20px', flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>Top Destinations</div>
            {stats.topCountries.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--muted2)', textAlign:'center', padding:'16px 0' }}>No data yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {stats.topCountries.map(([country, count], i) => (
                  <div key={country} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'white', flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'var(--ink2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{country}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--muted)', fontFamily:'DM Mono,monospace', flexShrink:0, marginLeft:4 }}>{count}</span>
                      </div>
                      <div className="ov2-prog">
                        <div className="ov2-prog-fill" style={{ width:`${Math.round((count / (stats.topCountries[0][1] || 1))*100)}%`, background:COLORS[i%COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6 KPI mini-cards ──────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {cards.map((c, i) => (
          <div key={c.label} className={`ov2-card ov2-a ov2-a${i+3}`} style={{ padding:'18px 20px', position:'relative', overflow:'hidden' }}>
            {/* glow blob */}
            <div style={{ position:'absolute', top:-24, right:-24, width:80, height:80, borderRadius:'50%', background:c.color, opacity:0.06, pointerEvents:'none' }} />
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{c.label}</div>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:32, fontWeight:500, color:'var(--ink)', lineHeight:1 }}>
                  {c.isRate ? c.value : <AnimCount value={c.value} duration={700 + i*60} />}
                </div>
              </div>
              <div style={{ width:36, height:36, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {c.icon}
              </div>
            </div>
            {/* mini bar sparkline */}
            <div style={{ height:36, margin:'0 -2px' }}>
              <MiniBar data={c.isRate ? [40,55,48,62,70,stats.completionRate] : stats.monthly} color={c.color} height={36} />
            </div>
            <div style={{ marginTop:8 }}>
              <div className="ov2-prog">
                <div className="ov2-prog-fill" style={{ width:`${c.barPct}%`, background:c.color }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:10, color:'var(--muted2)' }}>{c.barPct}% of total</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Applications table ─────────────────────────────────────── */}
      <div className="ov2-a ov2-a8" style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>

        {/* table header */}
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)', letterSpacing:'-0.2px' }}>Recent Applications</div>
            <div style={{ fontSize:11, color:'var(--muted2)', marginTop:2 }}>Showing latest {recentApps.length} submissions</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span className="ov2-live" />
            <span style={{ fontSize:11, fontWeight:700, color:'#059669' }}>Live feed</span>
          </div>
        </div>

        {recentApps.length === 0 ? (
          <div className="ov2-empty">
            <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
            No applications yet — check back soon.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Student','Package / Country','Status','Submitted'].map(h => (
                    <th key={h} className="ov2-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app, i) => {
                  const s = STATUS_MAP[app.status] || STATUS_MAP.not_started;
                  return (
                    <tr key={app.id} className="ov2-tr">
                      <td className="ov2-td">
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="ov2-av" style={{ width:34, height:34, background:COLORS[i%COLORS.length] }}>
                            {ini(app.full_name)}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)' }}>{app.full_name || '—'}</div>
                            <div style={{ fontSize:10, color:'var(--muted2)' }}>{app.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ov2-td">
                        <span style={{ fontSize:12, fontWeight:600, color:'var(--ink2)' }}>{app.package_country || '—'}</span>
                      </td>
                      <td className="ov2-td">
                        <span className="ov2-badge" style={{ background:s.bg, color:s.text }}>
                          <span className="ov2-dot" style={{ background:s.dot }} />
                          {s.label}
                        </span>
                      </td>
                      <td className="ov2-td" style={{ fontSize:11, color:'var(--muted2)', fontFamily:'DM Mono,monospace', fontWeight:400 }}>
                        {fmtD(app.submitted_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}