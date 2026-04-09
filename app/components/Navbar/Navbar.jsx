'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SEARCH_PAGES = ['/package', '/packages'];

function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const showSearch = SEARCH_PAGES.some(p => pathname?.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!showSearch) return;
    const params = new URLSearchParams(window.location.search);
    searchQuery ? params.set('search', searchQuery) : params.delete('search');
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, showSearch]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        .vc-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: rgba(255,255,255,0.97);
          border-bottom: 1px solid #e8eaed;
          transition: box-shadow 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .vc-navbar.scrolled {
          box-shadow: 0 1px 12px rgba(0,0,0,0.07);
        }
        .vc-navbar-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 28px;
        }
        .vc-logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #07b3f2 0%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          letter-spacing: -0.3px;
          flex-shrink: 0;
        }
        .vc-search-wrap {
          position: relative;
          width: 340px;
          flex-shrink: 0;
        }
        .vc-search-input {
          width: 100%;
          height: 38px;
          padding: 0 16px 0 40px;
          border-radius: 999px;
          border: 1.5px solid #e4e6ea;
          background: #f7f8fa;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #050505;
          outline: none;
          transition: all 0.2s;
        }
        .vc-search-input::placeholder { color: #94a3b8; }
        .vc-search-input:focus {
          border-color: #07b3f2;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
        }
        .vc-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        @media (max-width: 700px) {
          .vc-navbar-inner { padding: 12px 16px; }
          .vc-search-wrap { width: 100%; flex: 1; }
        }
      `}</style>

      <nav className={`vc-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="vc-navbar-inner">
          <Link href="/package" className="vc-logo">MyVisa</Link>

          {showSearch && (
            <div className="vc-search-wrap">
              <span className="vc-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                className="vc-search-input"
                type="text"
                placeholder="Search country, course, hospital…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;