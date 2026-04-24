'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: 'DM Sans', sans-serif; }

  .login-root {
    display: flex;
    min-height: 100vh;
    background: #0a0e1a;
  }

  /* ── LEFT PANEL ── */
  .login-left {
    position: relative;
    flex: 0 0 50%;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .login-left-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(0.65);
  }
  .login-left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7, 14, 35, 0.1) 0%,
      rgba(7, 14, 35, 0.08) 40%,
      rgba(7, 14, 35, 0.7) 75%,
      rgba(7, 14, 35, 0.96) 100%
    );
  }
  .login-left-content {
    position: relative;
    z-index: 2;
    padding: 48px 44px;
  }
  .login-left-tagline {
    font-family: 'Fraunces', serif;
    font-size: 36px;
    font-weight: 600;
    color: white;
    line-height: 1.2;
    margin-bottom: 14px;
    letter-spacing: -0.5px;
  }
  .login-left-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    line-height: 1.6;
    max-width: 300px;
    margin-bottom: 28px;
  }
  .login-left-badges {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .login-left-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 999px;
    font-size: 12px;
    color: rgba(255,255,255,0.8);
    backdrop-filter: blur(8px);
  }
  .login-left-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #07b3f2;
    flex-shrink: 0;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    flex: 1;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 60px;
    overflow-y: auto;
    max-height: 100vh;
  }
  .login-right-header {
    margin-bottom: 32px;
  }
  .login-right-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #07b3f2;
    margin-bottom: 10px;
  }
  .login-right-title {
    font-family: 'Fraunces', serif;
    font-size: 32px;
    font-weight: 700;
    color: #0a0e1a;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .login-right-sub {
    font-size: 13px;
    color: #94a3b8;
  }
  .login-right-sub a {
    color: #07b3f2;
    font-weight: 500;
    text-decoration: none;
  }

  /* ── FORM ── */
  .lg-form { display: flex; flex-direction: column; gap: 16px; }
  .lg-field { display: flex; flex-direction: column; gap: 5px; }
  .lg-label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    letter-spacing: 0.02em;
  }
  .lg-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e8eaed;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #0a0e1a;
    background: #fafafa;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .lg-input:focus {
    border-color: #07b3f2;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
  }
  .lg-input::placeholder { color: #c1c9d2; }
  .lg-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .lg-pw-wrap { position: relative; }
  .lg-pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px;
    display: flex;
    align-items: center;
  }
  .lg-pw-toggle:hover { color: #07b3f2; }

  .lg-forgot {
    text-align: right;
    margin-top: -8px;
  }
  .lg-forgot a {
    font-size: 12px;
    color: #07b3f2;
    text-decoration: none;
    font-weight: 500;
  }
  .lg-forgot a:hover { text-decoration: underline; }

  .lg-error {
    padding: 11px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    font-size: 12.5px;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lg-submit {
    width: 100%;
    padding: 13px;
    background: #07b3f2;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }
  .lg-submit:hover:not(:disabled) { background: #0291c8; transform: translateY(-1px); }
  .lg-submit:disabled { background: #b0d9f0; cursor: not-allowed; }

  .lg-divider {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .lg-divider-line { flex: 1; height: 1px; background: #e8eaed; }
  .lg-divider-text { font-size: 11px; color: #94a3b8; }

  .lg-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    border-radius: 10px;
    border: 1.5px solid #e8eaed;
    background: white;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    color: #374151;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .lg-google:hover { background: #f8fafc; border-color: #d1d5db; }
  .lg-google:disabled { opacity: 0.5; cursor: not-allowed; }

  .lg-signup-link {
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
  }
  .lg-signup-link a {
    color: #07b3f2;
    font-weight: 600;
    text-decoration: none;
  }

  .lg-back {
    text-align: center;
    margin-top: 8px;
  }
  .lg-back a {
    font-size: 12px;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s;
  }
  .lg-back a:hover { color: #07b3f2; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .lg-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @media (max-width: 900px) {
    .login-left { display: none; }
    .login-right { padding: 32px 24px; }
  }
`;

const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('is_staff', data.user.is_staff);
        localStorage.setItem('agent_status', data.user.agent_status);
        if (data.user.is_staff) {
          router.push('/nexus');
        } else if (data.user.role === 'agent') {
          if (data.user.agent_status === 'pending') {
            router.push('/agents/pending');
          } else {
            router.push('/agents/dashboard');
          }
        } else {
          router.push('/package');
        }
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* ── LEFT: city lights photo ── */}
        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80"
            alt="Passport and travel documents"
            className="login-left-img"
          />
          <div className="login-left-overlay" />
          <div className="login-left-content">
            <h2 className="login-left-tagline">
              Welcome<br />back to<br />Ingress.
            </h2>
            <p className="login-left-sub">
              Your visa journey continues here. Pick up right where you left off.
            </p>
            <div className="login-left-badges">
              <span className="login-left-badge">
                <span className="login-left-badge-dot" />
                Student Visa
              </span>
              <span className="login-left-badge">
                <span className="login-left-badge-dot" />
                Tourist Packages
              </span>
              <span className="login-left-badge">
                <span className="login-left-badge-dot" />
                Business Visa
              </span>
              <span className="login-left-badge">
                <span className="login-left-badge-dot" />
                Medical Visa
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div className="login-right">
          <div className="login-right-header">
            <p className="login-right-eyebrow">Ingress Travel</p>
            <h1 className="login-right-title">Sign in to your account</h1>
            <p className="login-right-sub">
              New here? <Link href="/signup">Create an account</Link>
            </p>
          </div>

          {error && (
            <div className="lg-error" style={{ marginBottom: 16 }}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form className="lg-form" onSubmit={handleSubmit}>
            <div className="lg-field">
              <label className="lg-label">Email address</label>
              <input
                className="lg-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">Password</label>
              <div className="lg-pw-wrap">
                <input
                  className="lg-input"
                  style={{ paddingRight: 40 }}
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button type="button" className="lg-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="lg-forgot">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="lg-submit" disabled={loading}>
              {loading ? <><div className="lg-spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="lg-divider" style={{ margin: '20px 0' }}>
            <div className="lg-divider-line" />
            <span className="lg-divider-text">OR</span>
            <div className="lg-divider-line" />
          </div>

          <button className="lg-google" disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="lg-signup-link">
              Don't have an account? <Link href="/signup">Sign up</Link>
            </p>
            <div className="lg-back">
              <Link href="/package">← Back to packages</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 34, height: 34, border: '3px solid #e4e6ea', borderTopColor: '#07b3f2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}