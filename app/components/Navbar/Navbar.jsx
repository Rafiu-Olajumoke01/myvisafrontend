'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './navbar.css';

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

  return (
    <nav className={`vc-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="vc-navbar-inner">
        
        <div className="vc-nav-left">
          {/* This container matches your 68px sidebar width */}
          <div className="vc-logo-container">
            <Link href="/package" className="vc-logo">MyVisa</Link>
          </div>

          {showSearch && (
            <div className="vc-search-wrap">
              <span className="vc-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                className="vc-search-input"
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="vc-nav-auth">
          <Link href="/login" className="vc-btn-login">Login</Link>
          <Link href="/signup" className="vc-btn-signup">Sign Up</Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;