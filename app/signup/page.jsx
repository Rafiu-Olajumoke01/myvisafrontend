'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COUNTRIES = [
  { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" }, { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" }, { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" }, { name: "Bangladesh", code: "BD" },
  { name: "Belgium", code: "BE" }, { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" }, { name: "Chile", code: "CL" },
  { name: "China", code: "CN" }, { name: "Colombia", code: "CO" },
  { name: "Czech Republic", code: "CZ" }, { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" }, { name: "Ethiopia", code: "ET" },
  { name: "Finland", code: "FI" }, { name: "France", code: "FR" },
  { name: "Germany", code: "DE" }, { name: "Ghana", code: "GH" },
  { name: "Greece", code: "GR" }, { name: "Hungary", code: "HU" },
  { name: "India", code: "IN" }, { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" }, { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" }, { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" }, { name: "Jamaica", code: "JM" },
  { name: "Japan", code: "JP" }, { name: "Jordan", code: "JO" },
  { name: "Kenya", code: "KE" }, { name: "Kuwait", code: "KW" },
  { name: "Lebanon", code: "LB" }, { name: "Malaysia", code: "MY" },
  { name: "Mexico", code: "MX" }, { name: "Morocco", code: "MA" },
  { name: "Netherlands", code: "NL" }, { name: "New Zealand", code: "NZ" },
  { name: "Nigeria", code: "NG" }, { name: "Norway", code: "NO" },
  { name: "Pakistan", code: "PK" }, { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" }, { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" }, { name: "Romania", code: "RO" },
  { name: "Russia", code: "RU" }, { name: "Saudi Arabia", code: "SA" },
  { name: "Senegal", code: "SN" }, { name: "Singapore", code: "SG" },
  { name: "South Africa", code: "ZA" }, { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" }, { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" }, { name: "Tanzania", code: "TZ" },
  { name: "Thailand", code: "TH" }, { name: "Tunisia", code: "TN" },
  { name: "Turkey", code: "TR" }, { name: "Uganda", code: "UG" },
  { name: "Ukraine", code: "UA" }, { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" }, { name: "United States", code: "US" },
  { name: "Venezuela", code: "VE" }, { name: "Vietnam", code: "VN" },
  { name: "Zimbabwe", code: "ZW" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: 'DM Sans', sans-serif; }

  .signup-root {
    display: flex;
    min-height: 100vh;
    background: #0a0e1a;
  }

  /* ── LEFT PANEL ── */
  .signup-left {
    position: relative;
    flex: 0 0 50%;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .signup-left-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(0.72);
  }
  .signup-left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7, 14, 35, 0.15) 0%,
      rgba(7, 14, 35, 0.1) 40%,
      rgba(7, 14, 35, 0.75) 80%,
      rgba(7, 14, 35, 0.95) 100%
    );
  }
  .signup-left-content {
    position: relative;
    z-index: 2;
    padding: 48px 44px;
  }
  .signup-left-logo { display: none; }
  .signup-left-tagline {
    font-family: 'Fraunces', serif;
    font-size: 36px;
    font-weight: 600;
    color: white;
    line-height: 1.2;
    margin-bottom: 14px;
    letter-spacing: -0.5px;
  }
  .signup-left-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    max-width: 320px;
    margin-bottom: 28px;
  }
  .signup-left-stats {
    display: flex;
    gap: 28px;
  }
  .signup-left-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .signup-left-stat-num {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 700;
    color: #07b3f2;
  }
  .signup-left-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── RIGHT PANEL ── */
  .signup-right {
    flex: 1;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 60px;
    overflow-y: auto;
    max-height: 100vh;
  }
  .signup-right-header {
    margin-bottom: 28px;
  }
  .signup-right-title {
    font-family: 'Fraunces', serif;
    font-size: 28px;
    font-weight: 700;
    color: #0a0e1a;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .signup-right-sub {
    font-size: 13px;
    color: #94a3b8;
  }
  .signup-right-sub a {
    color: #07b3f2;
    font-weight: 500;
    text-decoration: none;
  }

  /* ── FORM ── */
  .sg-form { display: flex; flex-direction: column; gap: 14px; }
  .sg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sg-field { display: flex; flex-direction: column; gap: 5px; }
  .sg-label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    letter-spacing: 0.02em;
  }
  .sg-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e8eaed;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #0a0e1a;
    background: #fafafa;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .sg-input:focus {
    border-color: #07b3f2;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(7,179,242,0.1);
  }
  .sg-input::placeholder { color: #c1c9d2; }
  .sg-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .sg-pw-wrap { position: relative; }
  .sg-pw-toggle {
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
  .sg-pw-toggle:hover { color: #07b3f2; }

  /* country dropdown */
  .sg-country-wrap { position: relative; }
  .sg-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: white;
    border: 1.5px solid #e8eaed;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    max-height: 180px;
    overflow-y: auto;
    z-index: 50;
  }
  .sg-dropdown-item {
    display: block;
    width: 100%;
    padding: 9px 14px;
    text-align: left;
    background: none;
    border: none;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #374151;
    cursor: pointer;
    transition: background 0.15s;
  }
  .sg-dropdown-item:hover { background: #f0f9ff; color: #07b3f2; }

  /* error */
  .sg-error {
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

  /* submit button */
  .sg-submit {
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
  .sg-submit:hover:not(:disabled) { background: #0291c8; transform: translateY(-1px); }
  .sg-submit:disabled { background: #b0d9f0; cursor: not-allowed; }

  .sg-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0;
  }
  .sg-divider-line { flex: 1; height: 1px; background: #e8eaed; }
  .sg-divider-text { font-size: 11px; color: #94a3b8; }

  .sg-login-link {
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
    margin-top: 4px;
  }
  .sg-login-link a {
    color: #07b3f2;
    font-weight: 600;
    text-decoration: none;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .sg-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @media (max-width: 900px) {
    .signup-left { display: none; }
    .signup-right { width: 100%; padding: 32px 24px; }
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: '',
    email: '', phone: '', nationality: '',
    password: '', confirmPassword: '',
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleCountrySelect = (country) => {
    setFormData({ ...formData, nationality: country.name });
    setCountrySearch(country.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.nationality) { setError('Please select your nationality.'); setLoading(false); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
    try {
      const res = await fetch('https://web-production-f50dc.up.railway.app/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username, email: formData.email,
          first_name: formData.first_name, last_name: formData.last_name,
          phone: formData.phone, country: formData.nationality,
          password: formData.password, password2: formData.confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        const intended = localStorage.getItem('intendedPackage');
        if (intended) { router.push(`/apply/${intended}`); localStorage.removeItem('intendedPackage'); }
        else router.push('/package');
      } else {
        setError(data.username?.[0] || data.email?.[0] || data.password?.[0] || data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <style>{styles}</style>
      <div className="signup-root">

        {/* ── LEFT: plane photo ── */}
        <div className="signup-left">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80"
            alt="Airplane above clouds"
            className="signup-left-img"
          />
          <div className="signup-left-overlay" />
          <div className="signup-left-logo">
            Ingress<span>.</span>
          </div>
          <div className="signup-left-content">
            <h2 className="signup-left-tagline">
              Your journey<br />starts here.
            </h2>
            <p className="signup-left-sub">
              Join thousands of travelers getting their visas approved faster with verified service providers on Ingress.
            </p>
            <div className="signup-left-stats">
              <div className="signup-left-stat">
                <span className="signup-left-stat-num">50+</span>
                <span className="signup-left-stat-label">Countries</span>
              </div>
              <div className="signup-left-stat">
                <span className="signup-left-stat-num">98%</span>
                <span className="signup-left-stat-label">Approval rate</span>
              </div>
              <div className="signup-left-stat">
                <span className="signup-left-stat-num">2k+</span>
                <span className="signup-left-stat-label">Applicants</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div className="signup-right">
          <div className="signup-right-header">
            <h1 className="signup-right-title">Create your account</h1>
            <p className="signup-right-sub">
              Already have one? <Link href="/login">Sign in</Link>
            </p>
          </div>

          {error && (
            <div className="sg-error" style={{ marginBottom: 14 }}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form className="sg-form" onSubmit={handleSubmit}>
            <div className="sg-row">
              <div className="sg-field">
                <label className="sg-label">First name</label>
                <input className="sg-input" type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" required disabled={loading} />
              </div>
              <div className="sg-field">
                <label className="sg-label">Last name</label>
                <input className="sg-input" type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" required disabled={loading} />
              </div>
            </div>

            <div className="sg-field">
              <label className="sg-label">Username</label>
              <input className="sg-input" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" required disabled={loading} />
            </div>

            <div className="sg-row">
              <div className="sg-field">
                <label className="sg-label">Email address</label>
                <input className="sg-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required disabled={loading} />
              </div>
              <div className="sg-field">
                <label className="sg-label">Phone number</label>
                <input className="sg-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234 801 234 5678" required disabled={loading} />
              </div>
            </div>

            <div className="sg-field">
              <label className="sg-label">Nationality</label>
              <div className="sg-country-wrap">
                <input
                  className="sg-input"
                  type="text"
                  value={countrySearch}
                  onChange={e => { setCountrySearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Search country..."
                  disabled={loading}
                />
                {showDropdown && filtered.length > 0 && (
                  <div className="sg-dropdown">
                    {filtered.map(c => (
                      <button key={c.code} type="button" className="sg-dropdown-item" onMouseDown={() => handleCountrySelect(c)}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sg-row">
              <div className="sg-field">
                <label className="sg-label">Password</label>
                <div className="sg-pw-wrap">
                  <input className="sg-input" style={{ paddingRight: 40 }} type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required disabled={loading} />
                  <button type="button" className="sg-pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOffIcon /> : <EyeIcon />}</button>
                </div>
              </div>
              <div className="sg-field">
                <label className="sg-label">Confirm password</label>
                <div className="sg-pw-wrap">
                  <input className="sg-input" style={{ paddingRight: 40 }} type={showCpw ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required disabled={loading} />
                  <button type="button" className="sg-pw-toggle" onClick={() => setShowCpw(!showCpw)}>{showCpw ? <EyeOffIcon /> : <EyeIcon />}</button>
                </div>
              </div>
            </div>

            <button type="submit" className="sg-submit" disabled={loading}>
              {loading ? <><div className="sg-spinner" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <p className="sg-login-link" style={{ marginTop: 20 }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>

      </div>
    </>
  );
}