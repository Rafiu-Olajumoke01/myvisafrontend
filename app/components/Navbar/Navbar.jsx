'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import './nav.css';

const SEARCH_PAGES = ['/package', '/packages', '/visa'];

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false); // ← add this

  const showSearch = SEARCH_PAGES.some(p => pathname?.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMounted(true); // ← add this
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } catch { setUser(null); }
  }, [pathname]);

  const getAvatarUrl = () => {
    const seed = encodeURIComponent(user?.fullname || user?.username || 'user');
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=0f172a`;
  };

  return (
    <nav className={`vc-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="vc-navbar-inner">

        <div className="vc-nav-left">
          <div className="vc-logo-container">
            <Link href="/package" className="vc-logo">
              <Image
                src="/ingress.png"
                alt="Ingress Logo"
                width={250}
                height={92}
                style={{ objectFit: 'contain' }}
                priority
              />
            </Link>
          </div>

          {showSearch && (
            <div className="vc-search-wrap">
              <span className="vc-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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
          {!mounted ? null : user ? (
            <div
              className="vc-avatar"
              onClick={() => router.push('/dashboard')}
              title={user.fullname || user.username}
            >
              <img
                src={user.profile_picture || getAvatarUrl()}
                alt="Profile"
                className="vc-avatar-img"
              />
            </div>
          ) : (
            <Link href="/login" className="vc-btn-login">Login</Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;