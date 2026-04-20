'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SERVICE_FEE_USD = 15;

// ─── Global Styles ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body { height: 100%; overflow-x: hidden; }

    .pkg-shell {
      display: flex;
      min-height: calc(100vh - 60px);
      background: #f0f2f5;
    }

    /* ── Slim sidebar ── */
    .pkg-sidebar {
      width: 68px;
      flex-shrink: 0;
      background: #ffffff;
      border-right: 1px solid #e8eaed;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0 20px;
      position: sticky;
      top: 60px;
      height: calc(100vh - 60px);
      gap: 2px;
    }
    .pkg-sidebar-item {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      border: none; background: transparent;
      position: relative;
      transition: background 0.15s;
      color: #94a3b8;
    }
    .pkg-sidebar-item:hover { background: #f4f6f8; color: #374151; }
    .pkg-sidebar-item.active { background: #e0f7fe; color: #07b3f2; }
    .pkg-sidebar-item svg { width: 20px; height: 20px; flex-shrink: 0; }
    .pkg-sidebar-badge {
      position: absolute; top: 7px; right: 7px;
      width: 7px; height: 7px; border-radius: 50%;
      background: #ff3b5c; border: 1.5px solid #fff;
    }
    .pkg-sidebar-divider {
      width: 28px; height: 1px;
      background: #e8eaed; margin: 6px 0;
    }

    /* ── Main area ── */
    .pkg-main {
      flex: 1;
      min-width: 0;
      padding: 20px 20px 48px;
    }

    /* ── Cards grid ── */
    .pkg-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    @media (max-width: 1100px) { .pkg-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 700px)  { .pkg-grid { grid-template-columns: 1fr; } }

    /* ── Right panel ── */
    .pkg-right {
      width: 220px;
      flex-shrink: 0;
      padding: 20px 16px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: sticky;
      top: 60px;
      height: calc(100vh - 60px);
      overflow-y: auto;
    }
    @media (max-width: 1200px) { .pkg-right { display: none; } }

    /* ── Card ── */
    .pkg-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e8eaed;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      font-family: 'DM Sans', sans-serif;
      display: flex; flex-direction: column;
    }
    .pkg-card:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,0.09);
      transform: translateY(-2px);
    }
    .pkg-card-img {
      width: 100%; aspect-ratio: 16/8;
      overflow: hidden; position: relative;
      background: #e9edf2; flex-shrink: 0;
    }
    .pkg-card-img img {
      width: 100%; height: 100%; object-fit: cover;
      display: block; transition: transform 5s ease;
    }
    .pkg-card:hover .pkg-card-img img { transform: scale(1.05); }
    .pkg-card-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%);
      pointer-events: none;
    }
    .pkg-card-body {
      padding: 12px 14px 14px;
      display: flex; flex-direction: column; flex: 1;
    }
    .pkg-card-top {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 7px;
    }
    .pkg-card-badge {
      font-size: 10px; font-weight: 600;
      padding: 3px 9px; border-radius: 999px;
      display: inline-flex; align-items: center; gap: 3px;
      white-space: nowrap;
    }
    .pkg-card-save {
      width: 28px; height: 28px; border-radius: 8px;
      border: 1px solid #e4e6ea; background: #f7f8fa;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .pkg-card-save:hover { border-color: #07b3f2; }
    .pkg-card-save.saved { background: #07b3f2; border-color: #07b3f2; }
    .pkg-card-title {
      font-size: 13px; font-weight: 600; color: #0f172a;
      font-family: 'Playfair Display', serif;
      line-height: 1.35; margin-bottom: 4px;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .pkg-card-location {
      display: flex; align-items: center; gap: 3px;
      font-size: 10px; color: #94a3b8; margin-bottom: 10px;
    }
    .pkg-card-divider { height: 1px; background: #f1f5f9; margin-bottom: 10px; }
    .pkg-card-footer {
      display: flex; align-items: center;
      justify-content: space-between; margin-top: auto;
    }
    .pkg-card-price-label {
      font-size: 9px; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px;
    }
    .pkg-card-price-val {
      font-size: 15px; font-weight: 700; color: #07b3f2;
      font-family: 'Playfair Display', serif; line-height: 1;
    }
    .pkg-card-btn {
      padding: 7px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 11px; font-weight: 700;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer; display: flex; align-items: center; gap: 4px;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(7,179,242,0.25);
    }
    .pkg-card-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .pkg-free-badge {
      font-size: 10px; font-weight: 700; padding: 3px 9px;
      border-radius: 999px; background: #dbeafe; color: #1d4ed8;
      border: 1px solid #93c5fd;
    }

    /* ── Right panel widgets ── */
    .rp-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaed;
      overflow: hidden;
    }
    .rp-globe-wrap {
      padding: 20px 16px;
      text-align: center;
      background: linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    .rp-stat-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      padding: 12px;
    }
    .rp-stat-item {
      text-align: center; padding: 10px 6px;
      background: #f8fafc; border-radius: 10px;
      border: 1px solid #f1f5f9;
    }

    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes orbit  { from{transform:rotate(0deg) translateX(50px) rotate(0deg)}   to{transform:rotate(360deg) translateX(50px) rotate(-360deg)} }
    @keyframes orbit2 { from{transform:rotate(120deg) translateX(50px) rotate(-120deg)} to{transform:rotate(480deg) translateX(50px) rotate(-480deg)} }
    @keyframes orbit3 { from{transform:rotate(240deg) translateX(50px) rotate(-240deg)} to{transform:rotate(600deg) translateX(50px) rotate(-600deg)} }
    @keyframes pulse-ring { 0%{transform:scale(0.85);opacity:0.6} 70%{transform:scale(1.15);opacity:0} 100%{transform:scale(1.15);opacity:0} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }

    .skeleton {
      background: linear-gradient(90deg,#f0f2f5 25%,#e4e6ea 50%,#f0f2f5 75%);
      background-size: 200% auto;
      animation: shimmer 1.4s linear infinite;
      border-radius: 8px;
    }
    .card-appear { animation: fadeUp 0.3s ease both; }

    .pkg-empty {
      grid-column: 1 / -1;
      text-align: center; padding: 60px 20px;
      background: #fff; border-radius: 14px; border: 1px solid #e8eaed;
    }

    @media (max-width: 700px) {
      .pkg-sidebar { display: none; }
      .pkg-main { padding: 14px 14px 48px; }
    }

    /* ── Mobile TikTok Feed — TRUE FULLSCREEN ── */
    .mobile-feed-wrap {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: #000;
      z-index: 100;
    }
    .mobile-feed-track {
      display: flex;
      flex-direction: column;
      transition: transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94);
      will-change: transform;
      height: 100%;
    }
    .mobile-slide {
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .mobile-slide-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transform: scale(1.06);
      transition: transform 5s ease;
    }
    .mobile-slide.active .mobile-slide-bg { transform: scale(1); }
    .mobile-slide-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.35) 0%,
        transparent 20%,
        transparent 40%,
        rgba(0,0,0,0.5) 65%,
        rgba(0,0,0,0.92) 100%
      );
    }
    .mobile-top-bar {
      position: absolute; top: 0; left: 0; right: 0;
      padding: env(safe-area-inset-top, 16px) 18px 0;
      padding-top: max(env(safe-area-inset-top), 16px);
      display: flex; align-items: center; justify-content: space-between;
      z-index: 10;
    }
    .mobile-top-tabs { display: flex; gap: 18px; }
    .mobile-top-tab {
      font-size: 15px; font-weight: 500;
      color: rgba(255,255,255,0.5); cursor: pointer;
      padding-bottom: 5px; border-bottom: 2px solid transparent;
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-top-tab.active { color: white; border-bottom-color: white; }
    .mobile-pkg-info {
      position: absolute; bottom: 0; left: 0; right: 16px;
      padding: 0 16px;
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 88px);
      z-index: 10;
    }
    .mobile-pkg-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 11px; border-radius: 9999px;
      font-size: 12px; font-weight: 600; margin-bottom: 9px;
      font-family: 'DM Sans', sans-serif;
      backdrop-filter: blur(8px);
    }
    .mobile-pkg-title {
      font-size: 18px; font-weight: 700; color: white;
      line-height: 1.3; margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-pkg-desc {
      font-size: 13px; color: rgba(255,255,255,0.8);
      line-height: 1.55; margin-bottom: 10px;
      font-family: 'DM Sans', sans-serif;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .mobile-cta-row { display: flex; gap: 10px; align-items: center; }
    .mobile-cta-primary {
      flex: 1; padding: 13px; border-radius: 10px;
      background: #07b3f2; color: white;
      font-size: 14px; font-weight: 700; border: none;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 6px;
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-cta-ghost {
      padding: 13px 16px; border-radius: 10px;
      background: rgba(255,255,255,0.12); color: white;
      font-size: 13px; font-weight: 600;
      border: 1px solid rgba(255,255,255,0.22);
      cursor: pointer; white-space: nowrap;
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-bottom-nav {
      position: absolute; bottom: 0; left: 0; right: 0;
      height: calc(env(safe-area-inset-bottom, 0px) + 64px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(18px);
      border-top: 0.5px solid rgba(255,255,255,0.1);
      display: flex; align-items: center;
      justify-content: space-around;
      padding-left: 8px; padding-right: 8px;
      z-index: 20;
    }
    .mobile-nav-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      cursor: pointer; opacity: 0.45; transition: opacity 0.2s;
      padding-bottom: 4px;
    }
    .mobile-nav-item.active { opacity: 1; }
    .mobile-nav-label {
      font-size: 10px; color: white; font-weight: 500;
      font-family: 'DM Sans', sans-serif;
    }
    .mobile-prog-dots {
      position: absolute; right: 5px; top: 50%;
      transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 5px; z-index: 10;
    }
    .mobile-prog-dot {
      width: 3px; border-radius: 9999px;
      background: rgba(255,255,255,0.3); transition: all 0.3s;
    }
    .mobile-prog-dot.active { background: white; }

    /* ── Retry banner ── */
    .retry-banner {
      grid-column: 1 / -1;
      text-align: center; padding: 60px 20px;
      background: #fff; border-radius: 14px; border: 1px solid #e8eaed;
    }

    @media (max-width: 700px) {
      .pkg-shell { display: none !important; }
      .mobile-feed-wrap { display: block !important; }
    }
    @media (min-width: 701px) {
      .pkg-shell { display: flex !important; }
      .mobile-feed-wrap { display: none !important; }
    }
  `}</style>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getVisaPurpose = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('student')) return 'Student Visa';
  if (c.includes('work')) return 'Work Visa';
  if (c.includes('tourist')) return 'Tourist Visa';
  if (c.includes('business')) return 'Business Visa';
  if (c.includes('medical')) return 'Medical Visa';
  return 'Visa Package';
};
const getVisaIcon = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('student')) return '🎓';
  if (c.includes('work')) return '💼';
  if (c.includes('tourist')) return '✈️';
  if (c.includes('business')) return '📊';
  if (c.includes('medical')) return '🏥';
  return '📄';
};
const getCategoryColors = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('student')) return { bg: '#ede9fe', color: '#7c3aed' };
  if (c.includes('tourist')) return { bg: '#e0f2fe', color: '#0284c7' };
  if (c.includes('business')) return { bg: '#fef3c7', color: '#d97706' };
  if (c.includes('medical')) return { bg: '#fee2e2', color: '#dc2626' };
  return { bg: '#e0f2fe', color: '#07b3f2' };
};
const getMobileBadgeColor = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('student')) return { color: '#c084fc', bg: 'rgba(192,132,252,0.18)', border: 'rgba(192,132,252,0.35)' };
  if (c.includes('tourist')) return { color: '#38bdf8', bg: 'rgba(56,189,248,0.18)', border: 'rgba(56,189,248,0.35)' };
  if (c.includes('business')) return { color: '#facc15', bg: 'rgba(250,204,21,0.18)', border: 'rgba(250,204,21,0.35)' };
  if (c.includes('medical')) return { color: '#f87171', bg: 'rgba(248,113,113,0.18)', border: 'rgba(248,113,113,0.35)' };
  return { color: '#38bdf8', bg: 'rgba(56,189,248,0.18)', border: 'rgba(56,189,248,0.35)' };
};
const getCardTitle = (pkg) => {
  if (pkg.category === 'student' && pkg.degree_type && pkg.course)
    return `${pkg.degree_type} in ${pkg.course}${pkg.university_name ? ` at ${pkg.university_name}` : ''}`;
  if (pkg.category === 'medical' && pkg.hospital_name) return `Treatment at ${pkg.hospital_name}`;
  return pkg.title || pkg.name || pkg.country;
};

// ─── Image Carousel ───────────────────────────────────────────────────────────
function ImageCarousel({ images, country }) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || !images?.length || images.length <= 1) return;
    const t = setInterval(() => setIdx(p => (p + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [auto, images?.length]);

  if (!images?.length) return (
    <div className="pkg-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🌍</div>
  );
  return (
    <div className="pkg-card-img" onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
      {images.map((img, i) => (
        <img key={i} src={img.image || img} alt={`${country} ${i + 1}`}
          style={{ position: 'absolute', inset: 0, opacity: i === idx ? 1 : 0, transition: 'opacity 0.7s ease', width: '100%', height: '100%', objectFit: 'cover' }} />
      ))}
      <div className="pkg-card-img-overlay" />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setAuto(false); setIdx(p => (p - 1 + images.length) % images.length); }}
            style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setAuto(false); setIdx(p => (p + 1) % images.length); }}
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, zIndex: 5 }}>
            {images.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setAuto(false); setIdx(i); }}
                style={{ width: i === idx ? 10 : 4, height: 4, borderRadius: 999, background: i === idx ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, index, isBookmarked, isBookmarkLoading, convertedFee, userCurrency, loadingRate, onBookmark, onPackageClick }) {
  const isStudent = (pkg.category || '').toLowerCase() === 'student';
  const isTourist = (pkg.category || '').toLowerCase() === 'tourist';
  const colors = getCategoryColors(pkg.category);
  const location = pkg.course_city || pkg.hospital_city || pkg.country || '—';

  return (
    <div className="pkg-card card-appear" style={{ animationDelay: `${index * 50}ms` }} onClick={() => onPackageClick(pkg.id)}>
      <ImageCarousel images={pkg.images} country={pkg.country} />
      <div className="pkg-card-body">
        <div className="pkg-card-top">
          <span className="pkg-card-badge" style={{ background: colors.bg, color: colors.color }}>
            {getVisaIcon(pkg.category)} {getVisaPurpose(pkg.category)}
          </span>
          <button
            className={`pkg-card-save${isBookmarked ? ' saved' : ''}`}
            onClick={e => { e.stopPropagation(); onBookmark(e, pkg.id); }}
            disabled={isBookmarkLoading}
          >
            {isBookmarkLoading
              ? <div style={{ width: 10, height: 10, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <svg width="11" height="11" viewBox="0 0 24 24" fill={isBookmarked ? 'white' : 'none'} stroke={isBookmarked ? 'white' : '#65676b'} strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>}
          </button>
        </div>

        <h3 className="pkg-card-title">{getCardTitle(pkg)}</h3>

        <div className="pkg-card-location">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {location}
        </div>

        <div className="pkg-card-divider" />

        <div className="pkg-card-footer">
          <div>
            {isStudent ? (
              <span className="pkg-free-badge">🎓 Free to apply</span>
            ) : isTourist ? (
              <>
                <div className="pkg-card-price-label">Trip cost</div>
                <div className="pkg-card-price-val" style={{ color: '#0f172a' }}>{pkg.cost || '—'}</div>
              </>
            ) : (
              <>
                <div className="pkg-card-price-label">Service fee</div>
                {loadingRate
                  ? <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'DM Sans' }}>Loading…</span>
                  : <div className="pkg-card-price-val">{userCurrency} {convertedFee}</div>}
              </>
            )}
          </div>
          <button className="pkg-card-btn" onClick={e => { e.stopPropagation(); onPackageClick(pkg.id); }}>
            View
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Slim Sidebar ─────────────────────────────────────────────────────────────
function SlimSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [tooltip, setTooltip] = useState(null);

  const getActive = () => {
    if (pathname?.startsWith('/bookmarks')) return 'saved';
    if (pathname?.startsWith('/dashboard')) return 'myvisa';
    if (pathname?.startsWith('/settings')) return 'settings';
    if (pathname?.startsWith('/notifications')) return 'alerts';
    return 'home';
  };
  const active = getActive();

  const items = [
    {
      key: 'home', label: 'Home', route: '/package',
      icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
    },
    {
      key: 'myvisa', label: 'My Visa', route: '/visa',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
    },
    {
      key: 'saved', label: 'Saved', route: '/bookmarks',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
    },
    {
      key: 'alerts', label: 'Alerts', route: '/notifications', badge: true,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
    },
    {
      key: 'settings', label: 'Settings', route: '/settings',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.878 3.31.905 2.432 2.432a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.878 1.527-.905 3.31-2.432 2.432a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.878-3.31-.905-2.432-2.432a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.878-1.527.905-3.31 2.432-2.432.996.574 2.296.07 2.573-1.066z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
  ];

  const handleMouseEnter = (e, label) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2 });
  };

  return (
    <>
      {tooltip && (
        <div style={{
          position: 'fixed', left: 76, top: tooltip.y,
          transform: 'translateY(-50%)',
          background: '#0f172a', color: '#fff',
          fontSize: 11, fontWeight: 500,
          padding: '5px 10px', borderRadius: 7,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
          fontFamily: 'DM Sans, sans-serif',
          display: 'flex', alignItems: 'center', gap: 0,
        }}>
          <span style={{
            position: 'absolute', right: '100%', top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: 4, borderStyle: 'solid',
            borderColor: 'transparent #0f172a transparent transparent',
          }} />
          {tooltip.label}
        </div>
      )}
      <aside className="pkg-sidebar">
        {items.map((item, i) => (
          <React.Fragment key={item.key}>
            {i === items.length - 1 && <div className="pkg-sidebar-divider" />}
            <button
              className={`pkg-sidebar-item${active === item.key ? ' active' : ''}`}
              onClick={() => router.push(item.route)}
              onMouseEnter={e => handleMouseEnter(e, item.label)}
              onMouseLeave={() => setTooltip(null)}
            >
              {item.icon}
              {item.badge && <span className="pkg-sidebar-badge" />}
            </button>
          </React.Fragment>
        ))}
      </aside>
    </>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function RightPanel() {
  return (
    <aside className="pkg-right">
      <div className="rp-card">
        <div className="rp-globe-wrap">
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 12px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(7,179,242,0.15)', animation: 'pulse-ring 2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid rgba(7,179,242,0.12)', animation: 'pulse-ring 2s ease-out infinite 0.4s' }} />
            <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, animation: 'float 3s ease-in-out infinite', boxShadow: '0 6px 20px rgba(7,179,242,0.3)' }}>🌍</div>
            <div style={{ position: 'absolute', inset: 0, animation: 'orbit 4s linear infinite' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: '50%', background: 'white', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginLeft: -10, marginTop: -10 }}>✈️</div>
            </div>
            <div style={{ position: 'absolute', inset: 0, animation: 'orbit2 4s linear infinite' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: '50%', background: 'white', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginLeft: -10, marginTop: -10 }}>🎓</div>
            </div>
            <div style={{ position: 'absolute', inset: 0, animation: 'orbit3 4s linear infinite' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: '50%', background: 'white', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, marginLeft: -10, marginTop: -10 }}>💼</div>
            </div>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'DM Sans', marginBottom: 3 }}>Go Anywhere</p>
          <p style={{ fontSize: 11, color: '#0284c7', fontFamily: 'DM Sans', lineHeight: 1.5 }}>50+ countries. One platform.</p>
        </div>
      </div>

      <div className="rp-card">
        <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #e8eaed' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#65676b', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'DM Sans' }}>Our Track Record</p>
        </div>
        <div className="rp-stat-grid">
          {[
            { n: '98%', l: 'Approval Rate', color: '#07b3f2' },
            { n: '50+', l: 'Countries', color: '#7c3aed' },
            { n: '2k+', l: 'Applicants', color: '#d97706' },
            { n: '24h', l: 'Support', color: '#16a34a' },
          ].map(s => (
            <div key={s.l} className="rp-stat-item">
              <div style={{ fontSize: 17, fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{s.n}</div>
              <div style={{ fontSize: 10, color: '#65676b', fontFamily: 'DM Sans', marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: 12, background: 'linear-gradient(135deg, #07b3f2, #0284c7)', padding: '16px 14px' }}>
        <div style={{ fontSize: 20, marginBottom: 7 }}>💬</div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'DM Sans', marginBottom: 4 }}>Not sure where to start?</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.82)', fontFamily: 'DM Sans', lineHeight: 1.5, marginBottom: 11 }}>Talk to a consultant for free.</p>
        <button style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans', cursor: 'pointer' }}>
          Book Free Call
        </button>
      </div>

      <div className="rp-card" style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#65676b', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'DM Sans', marginBottom: 10, paddingBottom: 7, borderBottom: '1px solid #e8eaed' }}>How It Works</p>
        {['Browse & pick a package', 'Book a discovery call', 'Pay after your call', 'Get your consultant', 'Upload documents'].map((step, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans' }}>{i + 1}</div>
              {i < arr.length - 1 && <div style={{ width: 1.5, height: 10, background: '#e4e6ea', marginTop: 2 }} />}
            </div>
            <p style={{ fontSize: 11, color: '#374151', fontFamily: 'DM Sans', paddingTop: 1, lineHeight: 1.4 }}>{step}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Mobile TikTok Slide ──────────────────────────────────────────────────────
function MobileSlide({ pkg, isActive, onPackageClick }) {
  const icon = getVisaIcon(pkg.category);
  const purpose = getVisaPurpose(pkg.category);
  const badgeColor = getMobileBadgeColor(pkg.category);
  const isStudent = (pkg.category || '').toLowerCase() === 'student';
  const isTourist = (pkg.category || '').toLowerCase() === 'tourist';
  const bgImage = pkg.images?.[0]?.image || pkg.images?.[0] || '';
  const feeDisplay = isStudent
    ? { text: 'Free to apply', color: '#4ade80' }
    : isTourist
      ? { text: pkg.cost || '—', color: '#fbbf24' }
      : { text: `${pkg.currency || 'NGN'} ${pkg.service_fee || '—'}`, color: '#07b3f2' };

  return (
    <div className={`mobile-slide${isActive ? ' active' : ''}`}>
      <div className="mobile-slide-bg" style={{ backgroundImage: `url('${bgImage}')` }} />
      <div className="mobile-slide-overlay" />
      <div className="mobile-top-bar">
        <div className="mobile-top-tabs">
          <span className="mobile-top-tab">Following</span>
          <span className="mobile-top-tab active">For You</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
      </div>
      <div className="mobile-pkg-info">
        <div className="mobile-pkg-badge" style={{ background: badgeColor.bg, color: badgeColor.color, border: `1px solid ${badgeColor.border}` }}>{icon} {purpose}</div>
        <div className="mobile-pkg-title">{getCardTitle(pkg)}</div>

        {/* Bold description */}
        <div className="mobile-pkg-desc" style={{ fontWeight: 700 }}>
          {pkg.description || pkg.course_description || `${purpose} package for ${pkg.country}`}
        </div>

        {/* Service provider line — replaces hashtags */}
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'DM Sans, sans-serif',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Service provided by{' '}
          <span style={{ color: 'white', fontWeight: 600 }}>
            {pkg.posted_by || pkg.agent_name || pkg.provider || pkg.consultant_name || 'Ingress'}
          </span>
        </div>

        <div className="mobile-cta-row">
          <button className="mobile-cta-primary" onClick={() => onPackageClick(pkg.id)}>
            View Package
            <svg width="13" height="13" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
          <button className="mobile-cta-ghost" style={{ color: feeDisplay.color }}>{feeDisplay.text}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Feed ──────────────────────────────────────────────────────────────
function MobileFeed({ packages, onPackageClick }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const wrapRef = useRef(null);
  const startYRef = useRef(0);
  const dragDeltaRef = useRef(0);
  const draggingRef = useRef(false);
  const currentRef = useRef(0);

  const slideH = () => wrapRef.current?.offsetHeight || window.innerHeight;

  const goTo = (n) => {
    if (n < 0 || n >= packages.length) return;
    currentRef.current = n;
    setCurrent(n);
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)';
      trackRef.current.style.transform = `translateY(${-n * slideH()}px)`;
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onTS = (e) => {
      startYRef.current = e.touches[0].clientY;
      draggingRef.current = true;
      if (trackRef.current) trackRef.current.style.transition = 'none';
    };
    const onTM = (e) => {
      if (!draggingRef.current) return;
      dragDeltaRef.current = e.touches[0].clientY - startYRef.current;
      if (trackRef.current)
        trackRef.current.style.transform = `translateY(${-currentRef.current * slideH() + dragDeltaRef.current}px)`;
    };
    const onTE = () => {
      draggingRef.current = false;
      if (trackRef.current)
        trackRef.current.style.transition = 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)';
      if (dragDeltaRef.current < -50) goTo(currentRef.current + 1);
      else if (dragDeltaRef.current > 50) goTo(currentRef.current - 1);
      else if (trackRef.current)
        trackRef.current.style.transform = `translateY(${-currentRef.current * slideH()}px)`;
      dragDeltaRef.current = 0;
    };
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 40) goTo(currentRef.current + 1);
      else if (e.deltaY < -40) goTo(currentRef.current - 1);
    };

    el.addEventListener('touchstart', onTS, { passive: true });
    el.addEventListener('touchmove', onTM, { passive: true });
    el.addEventListener('touchend', onTE);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTS);
      el.removeEventListener('touchmove', onTM);
      el.removeEventListener('touchend', onTE);
      el.removeEventListener('wheel', onWheel);
    };
  }, [packages.length]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 700;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (!packages.length) return null;

  return (
    <div className="mobile-feed-wrap" ref={wrapRef}>
      <div className="mobile-feed-track" ref={trackRef}>
        {packages.map((pkg, i) => (
          <MobileSlide key={pkg.id} pkg={pkg} isActive={i === current} onPackageClick={onPackageClick} />
        ))}
      </div>
      <div className="mobile-prog-dots">
        {packages.slice(0, 10).map((_, i) => (
          <div key={i} className={`mobile-prog-dot${i === current ? ' active' : ''}`} style={{ height: i === current ? 22 : 6 }} />
        ))}
      </div>

      {/* Bottom nav — plus button removed */}
      <div className="mobile-bottom-nav">
        <div className="mobile-nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span className="mobile-nav-label">Home</span>
        </div>
        <div className="mobile-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <span className="mobile-nav-label">Explore</span>
        </div>
        <div className="mobile-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
          <span className="mobile-nav-label">Saved</span>
        </div>
        <div className="mobile-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span className="mobile-nav-label">Profile</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookmarkedPackages, setBookmarkedPackages] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [userCurrency, setUserCurrency] = useState('USD');
  const [convertedFee, setConvertedFee] = useState(SERVICE_FEE_USD);
  const [loadingRate, setLoadingRate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  const API_BASE = 'https://web-production-f50dc.up.railway.app/api/packages';
  const BOOKMARKS_API = 'https://web-production-f50dc.up.railway.app/api/bookmarks';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    if (token) fetchBookmarks();
    detectCurrency();
  }, []);

  useEffect(() => { fetchPackages(); }, []);

  const detectCurrency = async () => {
    setLoadingRate(true);
    try {
      const geo = await fetch('https://ipapi.co/json/').then(r => r.json());
      const currency = geo.currency || 'USD';
      setUserCurrency(currency);
      if (currency === 'USD') { setConvertedFee(SERVICE_FEE_USD); return; }
      const rates = await fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json());
      const rate = rates.rates?.[currency];
      rate ? setConvertedFee((SERVICE_FEE_USD * rate).toFixed(2)) : (setConvertedFee(SERVICE_FEE_USD), setUserCurrency('USD'));
    } catch { setConvertedFee(SERVICE_FEE_USD); setUserCurrency('USD'); }
    finally { setLoadingRate(false); }
  };

  const fetchPackages = async (retriesLeft = 3, isManual = false) => {
    try {
      if (isManual) { setRetrying(true); setFetchFailed(false); }
      if (retriesLeft === 3) setLoading(true);

      const res = await fetch(`${API_BASE}/`);
      if (!res.ok) throw new Error('not ok');
      const data = await res.json();

      setPackages((data.packages || []).map(pkg => ({
        ...pkg,
        images: (pkg.images || []).map(img => ({
          ...img,
          image: img.image?.startsWith('http')
            ? img.image
            : `https://res.cloudinary.com/dmbgrroos/${img.image}`
        }))
      })));
      setFetchFailed(false);
      setLoading(false);
      setRetrying(false);
    } catch {
      if (retriesLeft > 1) {
        setTimeout(() => fetchPackages(retriesLeft - 1), 3000);
      } else {
        setPackages([]);
        setFetchFailed(true);
        setLoading(false);
        setRetrying(false);
      }
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BOOKMARKS_API}/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedPackages(new Set((data.bookmarks || []).map(b => b.package.id)));
      }
    } catch { }
  };

  const toggleBookmark = async (e, packageId) => {
    e.stopPropagation();
    if (!isLoggedIn) { setPendingRoute(`/package/${packageId}`); setShowAuthModal(true); return; }
    const isBookmarked = bookmarkedPackages.has(packageId);
    setBookmarkedPackages(prev => { const s = new Set(prev); isBookmarked ? s.delete(packageId) : s.add(packageId); return s; });
    setBookmarkLoading(prev => ({ ...prev, [packageId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      if (isBookmarked) {
        await fetch(`${BOOKMARKS_API}/${packageId}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      } else {
        await fetch(`${BOOKMARKS_API}/create/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ package_id: packageId }) });
      }
    } catch {
      setBookmarkedPackages(prev => { const s = new Set(prev); isBookmarked ? s.add(packageId) : s.delete(packageId); return s; });
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [packageId]: false }));
    }
  };

  const filteredPackages = packages.filter(pkg => {
    if (!searchQuery) return true;
    return [pkg.country, pkg.title, pkg.name, pkg.description, pkg.course, pkg.university_name, pkg.hospital_name]
      .some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handlePackageClick = (id) => router.push(`/package/${id}`);
  const handleGoToLogin = () => {
    setShowAuthModal(false);
    router.push(`/login${pendingRoute ? `?redirect=${encodeURIComponent(pendingRoute)}` : ''}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <GlobalStyles />

      <MobileFeed packages={filteredPackages} onPackageClick={handlePackageClick} />

      <div className="pkg-shell">
        <SlimSidebar />

        <main className="pkg-main">
          <div className="pkg-grid">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '16/8', borderRadius: 0 }} />
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 5 }} />
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 32, borderRadius: 8 }} />
                  </div>
                </div>
              ))
            ) : fetchFailed ? (
              <div className="retry-banner">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
                  Unable to load packages
                </p>
                <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', marginBottom: 18 }}>
                  The server may be waking up. Please try again.
                </p>
                <button
                  onClick={() => fetchPackages(3, true)}
                  disabled={retrying}
                  style={{
                    padding: '10px 24px', borderRadius: 9, border: 'none',
                    background: retrying ? '#e4e6ea' : 'linear-gradient(135deg,#07b3f2,#0284c7)',
                    color: retrying ? '#94a3b8' : 'white',
                    fontSize: 13, fontWeight: 700,
                    fontFamily: 'DM Sans, sans-serif', cursor: retrying ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {retrying
                    ? <><div style={{ width: 12, height: 12, border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Retrying...</>
                    : '🔄 Try Again'}
                </button>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="pkg-empty">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌐</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', fontFamily: 'DM Sans, sans-serif' }}>No packages found</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5, fontFamily: 'DM Sans, sans-serif' }}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No packages available yet.'}
                </p>
              </div>
            ) : (
              filteredPackages.map((pkg, i) => (
                <PackageCard
                  key={pkg.id} pkg={pkg} index={i}
                  isBookmarked={bookmarkedPackages.has(pkg.id)}
                  isBookmarkLoading={bookmarkLoading[pkg.id]}
                  convertedFee={convertedFee} userCurrency={userCurrency} loadingRate={loadingRate}
                  onBookmark={toggleBookmark} onPackageClick={handlePackageClick}
                />
              ))
            )}
          </div>
        </main>

        <RightPanel />
      </div>

      {showAuthModal && (
        <div onClick={() => setShowAuthModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#07b3f2,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
              <svg width="19" height="19" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 19, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Sign in to continue</h2>
            <p style={{ fontSize: 12, color: '#65676b', marginBottom: 16, lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>Create a free account or log in to save packages and start your visa journey.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <button onClick={handleGoToLogin} style={{ padding: 11, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#07b3f2,#0284c7)', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Log in / Sign up</button>
              <button onClick={() => setShowAuthModal(false)} style={{ padding: 11, borderRadius: 9, border: '1px solid #e4e6ea', background: 'transparent', color: '#65676b', fontSize: 12, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
        <div style={{ width: 34, height: 34, border: '3px solid #e4e6ea', borderTopColor: '#07b3f2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{ transform: rotate(360deg) } } `}</style>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}