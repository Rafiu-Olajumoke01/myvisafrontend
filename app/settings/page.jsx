'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sp-root {
    min-height: 100vh; background: #f0f2f5;
    padding: 32px 24px 80px; font-family: 'DM Sans', sans-serif;
  }
  .sp-header { max-width: 600px; margin: 0 auto 28px; }
  .sp-header-title {
    font-family: 'Playfair Display', serif; font-size: 26px;
    font-weight: 700; color: #0f172a; letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .sp-header-sub { font-size: 13px; color: #94a3b8; font-weight: 400; }

  .sp-profile-banner {
    max-width: 600px; margin: 0 auto 16px;
    background: linear-gradient(135deg, #07b3f2 0%, #0284c7 100%);
    border-radius: 16px; padding: 22px 24px;
    display: flex; align-items: center; gap: 16px;
    position: relative; overflow: hidden;
  }
  .sp-profile-banner::before {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.08);
  }
  .sp-profile-banner::after {
    content: ''; position: absolute; bottom: -40px; right: 60px;
    width: 90px; height: 90px; border-radius: 50%; background: rgba(255,255,255,0.06);
  }
  .sp-avatar {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(255,255,255,0.22); border: 2px solid rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700; color: white; flex-shrink: 0;
    font-family: 'Playfair Display', serif; position: relative; z-index: 1;
  }
  .sp-profile-name { font-size: 16px; font-weight: 600; color: white; position: relative; z-index: 1; }
  .sp-profile-email { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; position: relative; z-index: 1; }

  .sp-card {
    max-width: 600px; margin: 0 auto 14px;
    background: #ffffff; border-radius: 16px; border: 1px solid #e8eaed; overflow: hidden;
  }
  .sp-card-header {
    padding: 18px 22px 14px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; gap: 12px;
  }
  .sp-card-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sp-card-icon-blue { background: #e0f7fe; }
  .sp-card-icon-red  { background: #fee2e2; }
  .sp-card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 1px; }
  .sp-card-subtitle { font-size: 11px; color: #94a3b8; }
  .sp-card-body { padding: 20px 22px 22px; }

  .sp-field { margin-bottom: 16px; }
  .sp-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
  .sp-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .sp-input {
    width: 100%; height: 42px; padding: 0 14px; border-radius: 10px;
    border: 1.5px solid #e4e6ea; background: #f8fafc;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f172a;
    outline: none; transition: all 0.18s;
  }
  .sp-input::placeholder { color: #94a3b8; }
  .sp-input:focus { border-color: #07b3f2; background: #fff; box-shadow: 0 0 0 3px rgba(7,179,242,0.1); }
  .sp-input:disabled { background: #f0f2f5; color: #94a3b8; cursor: not-allowed; }

  .sp-btn-primary {
    width: 100%; height: 42px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #07b3f2, #0284c7); color: white;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    box-shadow: 0 2px 10px rgba(7,179,242,0.28); transition: opacity 0.2s, transform 0.15s;
  }
  .sp-btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .sp-btn-primary:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

  .sp-btn-outline-red {
    width: 100%; height: 42px; border-radius: 10px;
    border: 1.5px solid #fca5a5; background: transparent; color: #ef4444;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background 0.15s, border-color 0.15s;
  }
  .sp-btn-outline-red:hover { background: #fff5f5; border-color: #ef4444; }

  .sp-btn-link {
    display: flex; width: 100%; height: 42px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #07b3f2, #0284c7); color: white;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    align-items: center; justify-content: center; gap: 7px;
    box-shadow: 0 2px 10px rgba(7,179,242,0.28); text-decoration: none;
    transition: opacity 0.2s, transform 0.15s;
  }
  .sp-btn-link:hover { opacity: 0.92; transform: translateY(-1px); }

  .sp-alert { border-radius: 10px; padding: 10px 14px; font-size: 12px; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .sp-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
  .sp-alert-error   { background: #fff1f2; border: 1px solid #fecdd3; color: #dc2626; }
  .sp-alert-info    { background: #e0f7fe; border: 1px solid #bae6fd; color: #0284c7; font-size: 11px; margin-bottom: 0; margin-top: 14px; }

  @keyframes sp-spin { to { transform: rotate(360deg); } }
  .sp-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: sp-spin 0.7s linear infinite; flex-shrink: 0; }
  .sp-spinner-blue { width: 28px; height: 28px; border: 3px solid #e0f7fe; border-top-color: #07b3f2; border-radius: 50%; animation: sp-spin 0.8s linear infinite; margin: 20px auto; }

  @keyframes sp-fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .sp-appear { animation: sp-fadeUp 0.3s ease both; }

  @media (max-width: 500px) { .sp-field-row { grid-template-columns: 1fr; } }
`;

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', country: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          first_name: data.first_name || '',
          last_name:  data.last_name  || '',
          phone:      data.phone      || '',
          country:    data.country    || '',
        });
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {}
    finally { setLoadingProfile(false); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (saveError)   setSaveError('');
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setSaveSuccess(true);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updated = {
          ...storedUser,
          first_name: data.first_name,
          last_name:  data.last_name,
          fullname:   data.fullname,
        };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
      } else {
        const data = await res.json();
        setSaveError(data.error || 'Failed to update profile');
      }
    } catch { setSaveError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    ['access_token', 'refresh_token', 'user', 'is_staff'].forEach(k => localStorage.removeItem(k));
    router.push('/login');
  };

  const displayName = user
    ? (user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.fullname || user.username || 'User')
    : '';

  const initials = user?.first_name?.charAt(0).toUpperCase()
    || user?.fullname?.charAt(0).toUpperCase()
    || 'U';

  return (
    <>
      <style>{S}</style>
      <div className="sp-root">

        <div className="sp-header sp-appear" style={{ animationDelay: '0ms' }}>
          <h1 className="sp-header-title">Settings</h1>
          <p className="sp-header-sub">Manage your account and preferences</p>
        </div>

        {user && (
          <div className="sp-profile-banner sp-appear" style={{ animationDelay: '60ms' }}>
            <div className="sp-avatar">{initials}</div>
            <div>
              <div className="sp-profile-name">{displayName}</div>
              <div className="sp-profile-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Edit Profile */}
        <div className="sp-card sp-appear" style={{ animationDelay: '120ms' }}>
          <div className="sp-card-header">
            <div className="sp-card-icon sp-card-icon-blue">
              <svg width="18" height="18" fill="none" stroke="#07b3f2" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <div className="sp-card-title">Edit Profile</div>
              <div className="sp-card-subtitle">Update your personal information</div>
            </div>
          </div>
          <div className="sp-card-body">
            {saveSuccess && (
              <div className="sp-alert sp-alert-success">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Profile updated successfully!
              </div>
            )}
            {saveError && (
              <div className="sp-alert sp-alert-error">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                {saveError}
              </div>
            )}
            {loadingProfile ? (
              <div className="sp-spinner-blue" />
            ) : (
              <form onSubmit={handleSave}>
                <div className="sp-field-row">
                  <div>
                    <label className="sp-label">First Name</label>
                    <input className="sp-input" type="text" name="first_name" value={formData.first_name}
                      onChange={handleChange} required disabled={saving} placeholder="John" />
                  </div>
                  <div>
                    <label className="sp-label">Last Name</label>
                    <input className="sp-input" type="text" name="last_name" value={formData.last_name}
                      onChange={handleChange} required disabled={saving} placeholder="Doe" />
                  </div>
                </div>
                <div className="sp-field">
                  <label className="sp-label">Phone Number</label>
                  <input className="sp-input" type="tel" name="phone" value={formData.phone}
                    onChange={handleChange} disabled={saving} placeholder="+234 801 234 5678" />
                </div>
                <div className="sp-field" style={{ marginBottom: 20 }}>
                  <label className="sp-label">Country</label>
                  <input className="sp-input" type="text" name="country" value={formData.country}
                    onChange={handleChange} disabled={saving} placeholder="Nigeria" />
                </div>
                <button type="submit" className="sp-btn-primary" disabled={saving}>
                  {saving ? <><div className="sp-spinner" /> Saving…</> : 'Save Changes'}
                </button>
                <div className="sp-alert sp-alert-info">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                  Email and username cannot be changed here. Contact support if needed.
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="sp-card sp-appear" style={{ animationDelay: '180ms' }}>
          <div className="sp-card-header">
            <div className="sp-card-icon sp-card-icon-blue">
              <svg width="18" height="18" fill="none" stroke="#07b3f2" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <div className="sp-card-title">Password</div>
              <div className="sp-card-subtitle">Reset your account password</div>
            </div>
          </div>
          <div className="sp-card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18, lineHeight: 1.6 }}>
              Need to change your password? We'll send a reset link to your registered email address.
            </p>
            <Link href="/forgot-password" className="sp-btn-link">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>
              Reset Password
            </Link>
          </div>
        </div>

        {/* Logout */}
        <div className="sp-card sp-appear" style={{ animationDelay: '240ms' }}>
          <div className="sp-card-header">
            <div className="sp-card-icon sp-card-icon-red">
              <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
            <div>
              <div className="sp-card-title">Logout</div>
              <div className="sp-card-subtitle">Sign out of your account</div>
            </div>
          </div>
          <div className="sp-card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18, lineHeight: 1.6 }}>
              You'll be signed out and redirected to the login page. Your data stays safe.
            </p>
            <button className="sp-btn-outline-red" onClick={handleLogout}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </>
  );
}