'use client';
import React, { useState, useEffect } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
const EditIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const TrashIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const ImageIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const CheckIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const XIcon       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
const ClockIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const GridIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>;
const ListIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const ShieldIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const FilterIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

const VISA_CATEGORIES = [
  { value: 'student',  label: 'Student',  emoji: '🎓', dot: '#7c3aed', bg: 'rgba(124,58,237,0.10)', text: '#7c3aed' },
  { value: 'tourist',  label: 'Tourist',  emoji: '✈️', dot: '#0284c7', bg: 'rgba(2,132,199,0.10)',   text: '#0284c7' },
  { value: 'business', label: 'Business', emoji: '🏢', dot: '#d97706', bg: 'rgba(217,119,6,0.10)',   text: '#d97706' },
  { value: 'medical',  label: 'Medical',  emoji: '🏥', dot: '#dc2626', bg: 'rgba(220,38,38,0.10)',   text: '#dc2626' },
];
const DEGREE_TYPES = ['BSc', 'BA', 'MSc', 'MA', 'MBA', 'PhD', 'HND', 'OND', 'Diploma', 'Certificate', 'Other'];
const getCat = v => VISA_CATEGORIES.find(c => c.value === v) || null;

const EMPTY = {
  title: '', category: '', is_active: true, is_free: false, price: '',
  university_name: '', university_logo: '', location: '',
  tuition_fees: '', course: '', course_duration: '', degree_type: '',
  course_city: '', course_expectations: '',
  application_fees: '', service_fee: '', processing_time: '',
  post_study_work_visa: '', admission_requirement: '', visa_required: '',
  trip_duration: '', cost: '',
  covers_visa: false, covers_flight: false, covers_airport_pickup: false,
  covers_accommodation: false, covers_daily_tours: false, covers_food: false, covers_local_transport: false,
  country: '', visa_duration: '', description: '', requirements: '',
  hospital_name: '', hospital_city: '', medical_expectations: '',
};

const authH = () => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` });

// ── Styles ────────────────────────────────────────────────────────────────────
const AdminStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
    @keyframes slideUp {from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes shimmer {0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes spin    {to{transform:rotate(360deg)}}
    @keyframes slideIn {from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.4}}

    .adm-pkg { font-family: 'DM Sans', sans-serif; }
    .adm-pkg .fa  { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
    .adm-pkg .fa1 { animation-delay: .04s; }
    .adm-pkg .fa2 { animation-delay: .09s; }
    .adm-pkg .fa3 { animation-delay: .14s; }
    .adm-pkg .fa4 { animation-delay: .19s; }

    /* ── header ── */
    .adm-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
    }
    .adm-title-block {}
    .adm-eyebrow {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase; color: #07b3f2;
      background: rgba(7,179,242,.08); border: 1px solid rgba(7,179,242,.18);
      border-radius: 999px; padding: 3px 10px; margin-bottom: 8px;
    }
    .adm-title {
      font-family: 'Instrument Serif', serif;
      font-size: 28px; color: #0a0f1e; line-height: 1.1;
    }
    .adm-sub { font-size: 13px; color: #94a3b8; margin-top: 4px; font-weight: 500; }

    /* ── stats row ── */
    .adm-stats {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 22px;
    }
    .adm-stat {
      background: white; border: 1px solid #e8eaed; border-radius: 16px;
      padding: 16px 18px; position: relative; overflow: hidden;
      transition: transform .2s, box-shadow .2s;
    }
    .adm-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.07); }
    .adm-stat-blob {
      position: absolute; top: -24px; right: -24px;
      width: 80px; height: 80px; border-radius: 50%; opacity: .07;
    }
    .adm-stat-icon {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; margin-bottom: 10px;
    }
    .adm-stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1;
    }
    .adm-stat-lbl {
      font-size: 10px; font-weight: 600; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .07em; margin-top: 3px;
    }

    /* ── toolbar ── */
    .adm-toolbar {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .adm-search-wrap {
      flex: 1; min-width: 220px; position: relative;
    }
    .adm-search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      color: #94a3b8; pointer-events: none; font-size: 14px;
    }
    .adm-search {
      width: 100%; padding: 9px 13px 9px 36px;
      border-radius: 11px; border: 1.5px solid #e2e8f0;
      background: white; font-family: 'DM Sans', sans-serif;
      font-size: 13px; color: #1e293b; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .adm-search:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,.10); }
    .adm-search::placeholder { color: #94a3b8; }

    /* ── tabs ── */
    .adm-tabs {
      display: flex; gap: 4px; background: #f1f5f9;
      border-radius: 12px; padding: 4px;
    }
    .adm-tab {
      padding: 8px 16px; border-radius: 9px; border: none;
      font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all .15s; color: #64748b;
      background: transparent; display: flex; align-items: center; gap: 6px;
      white-space: nowrap;
    }
    .adm-tab.act { background: white; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,.10); }
    .adm-tab-badge {
      font-size: 10px; font-weight: 700; padding: 1px 6px;
      border-radius: 999px; background: #e2e8f0; color: #64748b;
    }
    .adm-tab.act .adm-tab-badge { background: #07b3f2; color: white; }
    .adm-tab.pending-tab.act .adm-tab-badge { background: #f59e0b; color: white; }

    /* ── category filter pills ── */
    .adm-cat-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 999px; font-size: 11px;
      font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
      transition: all .15s; white-space: nowrap;
    }
    .adm-cat-pill.active { border-width: 1.5px; }
    .adm-cat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    /* ── view toggle ── */
    .adm-view-toggle {
      display: flex; background: #f1f5f9; border-radius: 9px; padding: 3px; gap: 2px;
    }
    .adm-view-btn {
      width: 30px; height: 30px; border: none; border-radius: 7px;
      background: transparent; cursor: pointer; color: #94a3b8;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .adm-view-btn.act { background: white; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,.09); }

    /* ── grid view ── */
    .adm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 14px;
    }
    .adm-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 18px;
      overflow: hidden; display: flex; flex-direction: column;
      transition: transform .2s, box-shadow .2s;
    }
    .adm-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.09); }
    .adm-card-img { width: 100%; height: 130px; object-fit: cover; }
    .adm-card-img-ph {
      width: 100%; height: 130px; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center; color: #cbd5e1;
    }
    .adm-card-body {
      padding: 14px; display: flex; flex-direction: column;
      gap: 6px; flex: 1;
    }
    .adm-card-name {
      font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.35;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .adm-card-loc { font-size: 11px; color: #94a3b8; font-weight: 500; }
    .adm-card-foot { display: flex; gap: 7px; margin-top: 4px; }

    /* ── list view ── */
    .adm-list { display: flex; flex-direction: column; gap: 0; }
    .adm-list-item {
      background: white; display: flex; align-items: center;
      gap: 14px; padding: 14px 18px;
      border-bottom: 1px solid #f1f5f9; transition: background .15s;
    }
    .adm-list-item:first-child { border-radius: 16px 16px 0 0; }
    .adm-list-item:last-child { border-radius: 0 0 16px 16px; border-bottom: none; }
    .adm-list-item:only-child { border-radius: 16px; }
    .adm-list-item:hover { background: #fafbfc; }
    .adm-list-thumb {
      width: 52px; height: 52px; border-radius: 12px; object-fit: cover;
      flex-shrink: 0; border: 1px solid #f1f5f9;
    }
    .adm-list-thumb-ph {
      width: 52px; height: 52px; border-radius: 12px; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      color: #cbd5e1; flex-shrink: 0;
    }
    .adm-list-info { flex: 1; min-width: 0; }
    .adm-list-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .adm-list-meta { font-size: 11px; color: #94a3b8; }
    .adm-list-actions { display: flex; gap: 7px; flex-shrink: 0; }

    /* ── badges ── */
    .adm-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700;
    }
    .adm-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    /* ── pending ribbon ── */
    .adm-pending-ribbon {
      background: linear-gradient(90deg, #fef3c7, #fffbeb);
      border-bottom: 1px solid #fde68a;
      padding: 7px 14px;
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 600; color: #92400e;
    }

    /* ── skeleton ── */
    .adm-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% auto;
      animation: shimmer 1.3s linear infinite;
      border-radius: 14px;
    }

    /* ── empty ── */
    .adm-empty {
      text-align: center; padding: 64px 24px;
      background: white; border-radius: 20px; border: 1px solid #e2e8f0;
    }

    /* ── FORM MODAL ── */
    .adm-overlay {
      position: fixed; inset: 0;
      background: rgba(10,15,30,.7); backdrop-filter: blur(10px);
      z-index: 200; display: flex; align-items: flex-start;
      justify-content: center; padding: 24px; overflow-y: auto;
      animation: fadeIn .2s ease;
    }
    .adm-modal {
      background: white; border-radius: 24px; width: 100%;
      max-width: 700px; margin: auto;
      box-shadow: 0 40px 100px rgba(0,0,0,.28);
      animation: slideUp .35s cubic-bezier(.22,1,.36,1);
      display: flex; flex-direction: column;
      max-height: calc(100vh - 48px);
    }
    .adm-modal-head {
      padding: 0; border-bottom: 1px solid #f1f5f9;
      display: flex; align-items: stretch; flex-shrink: 0;
      border-radius: 24px 24px 0 0; overflow: hidden;
    }
    .adm-modal-head-accent {
      width: 6px;
      background: linear-gradient(180deg, #07b3f2, #0284c7);
      flex-shrink: 0;
    }
    .adm-modal-head-content {
      flex: 1; padding: 20px 22px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .adm-modal-title {
      font-family: 'Instrument Serif', serif;
      font-size: 22px; color: #0a0f1e;
    }
    .adm-modal-close {
      width: 34px; height: 34px; border-radius: 9px;
      border: 1.5px solid #e2e8f0; background: white;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; color: #94a3b8; font-size: 14px;
      transition: all .15s;
    }
    .adm-modal-close:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
    .adm-modal-body { overflow-y: auto; flex: 1; padding: 22px 26px; }
    .adm-modal-foot {
      padding: 16px 26px 20px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 10px; flex-shrink: 0;
    }

    /* ── form fields ── */
    .adm-section {
      background: #f8fafc; border: 1px solid #f0f4f8;
      border-radius: 14px; padding: 16px 18px; margin-bottom: 0;
    }
    .adm-section-label {
      font-size: 9px; font-weight: 800; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px;
      display: flex; align-items: center; gap: 6px;
    }
    .adm-section-label::after {
      content: ''; flex: 1; height: 1px; background: #e8eaed;
    }
    .adm-input {
      width: 100%; padding: 10px 13px; border-radius: 11px;
      border: 1.5px solid #e2e8f0; background: white;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      color: #1e293b; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .adm-input:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,.10); }
    .adm-input::placeholder { color: #94a3b8; }
    .adm-select {
      width: 100%; padding: 10px 36px 10px 13px; border-radius: 11px;
      border: 1.5px solid #e2e8f0;
      background: white url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 13px center;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1e293b;
      outline: none; cursor: pointer; transition: border-color .15s; appearance: none;
    }
    .adm-select:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,.10); }
    .adm-label {
      font-size: 10px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: .07em;
      margin-bottom: 5px; display: block;
    }
    .adm-chk-label {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      transition: all .15s; font-size: 12px; font-weight: 500; color: #475569;
    }
    .adm-chk-label:hover { border-color: #07b3f2; background: rgba(7,179,242,.04); color: #0284c7; }
    .adm-drag-zone {
      border: 2px dashed #e2e8f0; border-radius: 14px;
      padding: 24px; text-align: center; cursor: pointer; transition: all .2s;
    }
    .adm-drag-zone:hover, .adm-drag-zone.drag { border-color: #07b3f2; background: rgba(7,179,242,.04); }

    /* ── buttons ── */
    .adm-btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 10px 20px; border-radius: 11px; border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 13px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: opacity .2s, transform .15s;
      box-shadow: 0 3px 12px rgba(7,179,242,.30);
    }
    .adm-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
    .adm-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .adm-btn-ghost {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 7px 14px; border-radius: 9px;
      border: 1.5px solid #e2e8f0; background: white; color: #475569;
      font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: all .15s;
    }
    .adm-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; }
    .adm-btn-danger {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; padding: 7px 14px; border-radius: 9px;
      border: 1.5px solid rgba(239,68,68,.2);
      background: rgba(239,68,68,.06); color: #dc2626;
      font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: all .15s;
    }
    .adm-btn-danger:hover { background: rgba(239,68,68,.12); }
    .adm-btn-approve {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 5px; flex: 1; padding: 7px 10px; border-radius: 9px; border: none;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white; font-size: 11px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: opacity .2s, transform .15s;
      box-shadow: 0 2px 8px rgba(16,185,129,.25);
    }
    .adm-btn-approve:hover { opacity: .88; transform: translateY(-1px); }
    .adm-btn-reject {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 5px; flex: 1; padding: 7px 10px; border-radius: 9px;
      border: 1.5px solid rgba(239,68,68,.2);
      background: rgba(239,68,68,.06); color: #dc2626;
      font-size: 11px; font-weight: 700; font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: all .15s;
    }
    .adm-btn-reject:hover { background: rgba(239,68,68,.12); }

    /* ── confirm modal ── */
    .adm-confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      backdrop-filter: blur(8px); display: flex; align-items: center;
      justify-content: center; z-index: 300; padding: 16px;
    }
    .adm-confirm-box {
      background: white; border-radius: 20px; padding: 28px;
      max-width: 380px; width: 100%;
      box-shadow: 0 28px 64px rgba(0,0,0,.20);
      animation: slideUp .3s cubic-bezier(.22,1,.36,1);
    }

    /* ── toast ── */
    .adm-toast {
      position: fixed; bottom: 24px; right: 24px;
      background: #0f172a; color: white; padding: 12px 18px;
      border-radius: 12px; font-size: 12px; font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 8px 24px rgba(0,0,0,.25); z-index: 400;
      animation: slideIn .3s ease; display: flex; align-items: center; gap: 8px;
    }

    /* ── provider tag (admin-only) ── */
    .adm-provider-tag {
      display: inline-flex; align-items: center; gap: 4px;
      background: rgba(15,23,42,.06); border: 1px solid rgba(15,23,42,.10);
      border-radius: 6px; padding: 2px 8px;
      font-size: 10px; font-weight: 600; color: #475569;
    }

    @media(max-width:1200px){ .adm-stats { grid-template-columns: repeat(3,1fr); } }
    @media(max-width:768px)  { .adm-stats { grid-template-columns: repeat(2,1fr); } .adm-grid { grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); } }
  `}</style>
);

// ── Shared form helpers ───────────────────────────────────────────────────────
const Fld = ({ label, children }) => (
  <div><label className="adm-label">{label}</label>{children}</div>
);
const Chk = ({ label, checked, onChange }) => (
  <label className="adm-chk-label">
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 14, height: 14, accentColor: '#07b3f2' }} />
    {label}
  </label>
);

// ── Category field groups ─────────────────────────────────────────────────────
function StudentFields({ fd, set }) {
  const [logoLoading, setLogoLoading] = useState(false);
  useEffect(() => {
    if (!fd.university_name || fd.university_name.length < 4) return;
    const t = setTimeout(async () => {
      setLogoLoading(true);
      try {
        const res  = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(fd.university_name)}`);
        const data = await res.json();
        if (data?.[0]?.logo) set(f => ({ ...f, university_logo: data[0].logo }));
      } catch {}
      setLogoLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [fd.university_name]);

  const preview = [fd.degree_type, fd.course ? `in ${fd.course}` : '', fd.university_name ? `at ${fd.university_name}` : ''].filter(Boolean).join(' ');
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <Fld label="University / School Name *">
            <input className="adm-input" required value={fd.university_name} onChange={e => set(f => ({ ...f, university_name: e.target.value }))} placeholder="e.g., University of Toronto" />
          </Fld>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, paddingTop:22 }}>
          <div style={{ width:48, height:48, borderRadius:13, border:'2px dashed #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', background:'white', overflow:'hidden' }}>
            {logoLoading
              ? <div style={{ width:16, height:16, border:'2px solid #07b3f2', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
              : fd.university_logo ? <img src={fd.university_logo} alt="logo" style={{ width:'100%', height:'100%', objectFit:'contain', padding:4 }} />
              : <span style={{ fontSize:22 }}>🏫</span>}
          </div>
          <span style={{ fontSize:9, color:'#94a3b8', fontWeight:600 }}>Auto logo</span>
        </div>
      </div>
      {preview && (
        <div style={{ background:'rgba(124,58,237,.06)', border:'1px solid rgba(124,58,237,.15)', borderRadius:10, padding:'8px 12px' }}>
          <div style={{ fontSize:9, color:'#7c3aed', fontWeight:700, marginBottom:2 }}>PREVIEW</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#5b21b6' }}>🎓 {preview}</div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Degree Type *"><select className="adm-select" required value={fd.degree_type} onChange={e => set(f => ({ ...f, degree_type: e.target.value }))}><option value="">— Select —</option>{DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}</select></Fld>
        <Fld label="Course Name *"><input className="adm-input" required value={fd.course} onChange={e => set(f => ({ ...f, course: e.target.value }))} placeholder="e.g., Computer Engineering" /></Fld>
        <Fld label="City *"><input className="adm-input" required value={fd.course_city} onChange={e => set(f => ({ ...f, course_city: e.target.value }))} placeholder="e.g., Toronto" /></Fld>
        <Fld label="Duration *"><input className="adm-input" required value={fd.course_duration} onChange={e => set(f => ({ ...f, course_duration: e.target.value }))} placeholder="e.g., 4 years" /></Fld>
        <Fld label="Tuition Fee"><input className="adm-input" value={fd.tuition_fees} onChange={e => set(f => ({ ...f, tuition_fees: e.target.value }))} placeholder="$25,000/year" /></Fld>
        <Fld label="Application Fees"><input className="adm-input" value={fd.application_fees} onChange={e => set(f => ({ ...f, application_fees: e.target.value }))} placeholder="$150" /></Fld>
        <Fld label="Processing Time"><input className="adm-input" value={fd.processing_time} onChange={e => set(f => ({ ...f, processing_time: e.target.value }))} placeholder="6–8 weeks" /></Fld>
        <Fld label="Post Study Work Visa">
          <select className="adm-select" value={fd.post_study_work_visa} onChange={e => set(f => ({ ...f, post_study_work_visa: e.target.value }))}>
            <option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </Fld>
      </div>
      <Fld label="What to Expect"><textarea className="adm-input" rows={2} style={{ resize:'none' }} value={fd.course_expectations} onChange={e => set(f => ({ ...f, course_expectations: e.target.value }))} placeholder="Hands-on labs, internship opportunities..." /></Fld>
      <Fld label="Visa Required">
        <select className="adm-select" value={fd.visa_required} onChange={e => set(f => ({ ...f, visa_required: e.target.value }))}>
          <option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option>
        </select>
      </Fld>
    </div>
  );
}

function TouristFields({ fd, set }) {
  const tog = k => set(f => ({ ...f, [k]: !f[k] }));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Trip Duration (days) *"><input className="adm-input" type="number" required value={fd.trip_duration} onChange={e => set(f => ({ ...f, trip_duration: e.target.value }))} placeholder="7" /></Fld>
        <Fld label="Location *"><input className="adm-input" required value={fd.location} onChange={e => set(f => ({ ...f, location: e.target.value }))} placeholder="Paris, France" /></Fld>
        <Fld label="Cost *"><input className="adm-input" required value={fd.cost} onChange={e => set(f => ({ ...f, cost: e.target.value }))} placeholder="$2,500" /></Fld>
        <Fld label="Processing Time"><input className="adm-input" value={fd.processing_time} onChange={e => set(f => ({ ...f, processing_time: e.target.value }))} placeholder="3–5 days" /></Fld>
      </div>
      <Fld label="What does the cost cover?">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginTop:2 }}>
          <Chk label="✈️ Flight"           checked={fd.covers_flight}           onChange={() => tog('covers_flight')} />
          <Chk label="🛂 Visa"             checked={fd.covers_visa}             onChange={() => tog('covers_visa')} />
          <Chk label="🚗 Airport Pickup"   checked={fd.covers_airport_pickup}   onChange={() => tog('covers_airport_pickup')} />
          <Chk label="🏨 Accommodation"    checked={fd.covers_accommodation}    onChange={() => tog('covers_accommodation')} />
          <Chk label="🗺️ Daily Tours"     checked={fd.covers_daily_tours}      onChange={() => tog('covers_daily_tours')} />
          <Chk label="🍽️ Daily Food"      checked={fd.covers_food}             onChange={() => tog('covers_food')} />
          <Chk label="🚌 Local Transport"  checked={fd.covers_local_transport}  onChange={() => tog('covers_local_transport')} />
        </div>
      </Fld>
      <Fld label="Visa Required">
        <select className="adm-select" value={fd.visa_required} onChange={e => set(f => ({ ...f, visa_required: e.target.value }))}>
          <option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option>
        </select>
      </Fld>
    </div>
  );
}

function BusinessFields({ fd, set }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      <Fld label="Country *"><input className="adm-input" required value={fd.country} onChange={e => set(f => ({ ...f, country: e.target.value }))} placeholder="e.g., Germany" /></Fld>
      <Fld label="Visa Duration"><input className="adm-input" value={fd.visa_duration} onChange={e => set(f => ({ ...f, visa_duration: e.target.value }))} placeholder="e.g., 90 days" /></Fld>
      <Fld label="Processing Time"><input className="adm-input" value={fd.processing_time} onChange={e => set(f => ({ ...f, processing_time: e.target.value }))} placeholder="2–3 weeks" /></Fld>
    </div>
  );
}

function MedicalFields({ fd, set }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Hospital Name *"><input className="adm-input" required value={fd.hospital_name} onChange={e => set(f => ({ ...f, hospital_name: e.target.value }))} placeholder="Toronto General Hospital" /></Fld>
        <Fld label="City *"><input className="adm-input" required value={fd.hospital_city} onChange={e => set(f => ({ ...f, hospital_city: e.target.value }))} placeholder="e.g., Toronto" /></Fld>
        <Fld label="Country *"><input className="adm-input" required value={fd.country} onChange={e => set(f => ({ ...f, country: e.target.value }))} placeholder="e.g., Canada" /></Fld>
        <Fld label="Visa Duration"><input className="adm-input" value={fd.visa_duration} onChange={e => set(f => ({ ...f, visa_duration: e.target.value }))} placeholder="e.g., 90 days" /></Fld>
        <Fld label="Processing Time"><input className="adm-input" value={fd.processing_time} onChange={e => set(f => ({ ...f, processing_time: e.target.value }))} placeholder="2–3 weeks" /></Fld>
      </div>
      <Fld label="What to Expect"><textarea className="adm-input" rows={2} style={{ resize:'none' }} value={fd.medical_expectations} onChange={e => set(f => ({ ...f, medical_expectations: e.target.value }))} placeholder="World-class specialists, modern equipment..." /></Fld>
    </div>
  );
}

// ── Package Form Modal ────────────────────────────────────────────────────────
function PackageFormModal({ title, fd, set, imgFiles, imgPreviews, onImageChange, removeImg, clearImgs, onSubmit, onClose, isEdit }) {
  const [isDragging, setIsDragging] = useState(false);
  const cat     = fd.category;
  const catInfo = getCat(cat);

  const handleDrop = e => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    onImageChange({ target: { files } });
  };

  return (
    <div className="adm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        {/* Header with accent bar */}
        <div className="adm-modal-head">
          <div className="adm-modal-head-accent" />
          <div className="adm-modal-head-content">
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#07b3f2', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>
                {isEdit ? '✏️ Edit Package' : '➕ New Package'}
              </div>
              <div className="adm-modal-title">{title}</div>
            </div>
            <button className="adm-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="adm-modal-body">
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Core */}
            <div className="adm-section">
              <div className="adm-section-label">📋 Core Details</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Fld label="Offer Title *">
                  <input className="adm-input" required value={fd.title} onChange={e => set({ ...fd, title: e.target.value })} placeholder="e.g., Canada Student Visa" />
                </Fld>
                <Fld label="Category *">
                  <select className="adm-select" required value={fd.category} onChange={e => set({ ...fd, category: e.target.value })}>
                    <option value="">— Select category —</option>
                    {VISA_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </Fld>
              </div>
              <div style={{ marginTop:12 }}>
                <Fld label="Status">
                  <select className="adm-select" style={{ maxWidth:200 }} value={String(fd.is_active)} onChange={e => set({ ...fd, is_active: e.target.value === 'true' })}>
                    <option value="true">✅ Active</option>
                    <option value="false">❌ Inactive</option>
                  </select>
                </Fld>
              </div>
            </div>

            {/* Category-specific */}
            {cat && (
              <div className="adm-section">
                <div className="adm-section-label">{catInfo?.emoji} {catInfo?.label} Details</div>
                {cat === 'student'  && <StudentFields  fd={fd} set={set} />}
                {cat === 'tourist'  && <TouristFields  fd={fd} set={set} />}
                {cat === 'business' && <BusinessFields fd={fd} set={set} />}
                {cat === 'medical'  && <MedicalFields  fd={fd} set={set} />}
              </div>
            )}

            {/* Pricing */}
            <div className="adm-section">
              <div className="adm-section-label">💰 Pricing</div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[
                  { free:false, label:'💳 Paid Package', act:'#07b3f2', actBg:'rgba(7,179,242,.08)' },
                  { free:true,  label:'🆓 Free Package',  act:'#10b981', actBg:'rgba(16,185,129,.08)' },
                ].map(o => (
                  <button key={String(o.free)} type="button" onClick={() => set({ ...fd, is_free: o.free })}
                    style={{ flex:1, padding:'9px', borderRadius:10, border:`2px solid ${fd.is_free === o.free ? o.act : '#e2e8f0'}`, background: fd.is_free === o.free ? o.actBg : 'white', color: fd.is_free === o.free ? o.act : '#64748b', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all .15s' }}>
                    {o.label}
                  </button>
                ))}
              </div>
              {!fd.is_free && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Fld label="Price (USD) *"><input className="adm-input" type="number" step="0.01" required value={fd.price} onChange={e => set({ ...fd, price: e.target.value })} placeholder="3500.00" /></Fld>
                  <Fld label="Service Fee (USD)"><input className="adm-input" value={fd.service_fee} onChange={e => set({ ...fd, service_fee: e.target.value })} placeholder="15" /></Fld>
                </div>
              )}
            </div>

            {/* Description + Requirements */}
            <div className="adm-section">
              <div className="adm-section-label">📝 Content</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <Fld label="Description">
                  <textarea className="adm-input" rows={3} style={{ resize:'none' }} value={fd.description} onChange={e => set({ ...fd, description: e.target.value })} placeholder="Package description..." />
                </Fld>
                <Fld label="Requirements (one per line)">
                  <textarea className="adm-input" rows={3} style={{ resize:'none', fontFamily:'monospace', fontSize:12 }} value={fd.requirements} onChange={e => set({ ...fd, requirements: e.target.value })} placeholder={"Valid passport\nLetter of acceptance\nProof of finances"} />
                </Fld>
              </div>
            </div>

            {/* Images */}
            <div className="adm-section">
              <div className="adm-section-label">🖼️ Images {!isEdit && '*'} (max 20)</div>
              <div className={`adm-drag-zone${isDragging ? ' drag' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}>
                <input type="file" multiple accept="image/*" onChange={onImageChange} style={{ display:'none' }} id="admin-img-upload" />
                <label htmlFor="admin-img-upload" style={{ cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <div style={{ width:40, height:40, background:'rgba(7,179,242,.10)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#0284c7' }}><ImageIcon /></div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#475569' }}>{isDragging ? 'Drop images here!' : 'Click or drag & drop'}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>PNG, JPG up to 10MB each</div>
                </label>
              </div>
              {imgPreviews.length > 0 && (
                <div style={{ marginTop:12, background:'white', border:'1px solid #f1f5f9', borderRadius:12, padding:12 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#475569' }}>{imgPreviews.length} image{imgPreviews.length !== 1 ? 's' : ''}</span>
                    {imgFiles.length > 0 && <button type="button" onClick={clearImgs} style={{ fontSize:11, color:'#ef4444', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Clear all</button>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                    {imgPreviews.map((src, i) => (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={src} alt="" style={{ width:'100%', height:56, objectFit:'cover', borderRadius:8, border:'1px solid #e2e8f0' }} />
                        {imgFiles.length > 0 && (
                          <button type="button" onClick={() => removeImg(i)} style={{ position:'absolute', top:-5, right:-5, width:18, height:18, background:'#ef4444', color:'white', border:'none', borderRadius:'50%', fontSize:10, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn-ghost" style={{ flex:1, padding:'12px' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn-primary" style={{ flex:2, padding:'12px' }}
            onClick={e => { e.preventDefault(); document.querySelector('.adm-modal form')?.requestSubmit(); }}>
            {isEdit ? 'Update Package' : '🚀 Create Package'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal (approve / reject / delete) ─────────────────────────────────
function ConfirmModal({ type, pkg, onConfirm, onClose }) {
  const cfg = {
    approve: { icon:'✅', iconBg:'rgba(16,185,129,.10)', title:'Approve Package?', btnBg:'linear-gradient(135deg,#10b981,#059669)', btnLabel:'Yes, Approve',
      body: <>Approving <strong style={{ color:'#1e293b' }}>{pkg.title || pkg.country}</strong> will make it visible to all users.</> },
    reject:  { icon:'❌', iconBg:'rgba(239,68,68,.10)',  title:'Reject Package?',  btnBg:'linear-gradient(135deg,#ef4444,#dc2626)', btnLabel:'Yes, Reject',
      body: <>Rejecting <strong style={{ color:'#1e293b' }}>{pkg.title || pkg.country}</strong> will notify the service provider.</> },
    delete:  { icon:'🗑️', iconBg:'rgba(239,68,68,.10)',  title:'Delete Package?',  btnBg:'linear-gradient(135deg,#ef4444,#dc2626)', btnLabel:'Delete',
      body: <>Delete <strong style={{ color:'#1e293b' }}>{pkg.title || pkg.country}</strong>? This cannot be undone.</> },
  };
  const c = cfg[type];
  return (
    <div className="adm-confirm-overlay" onClick={onClose}>
      <div className="adm-confirm-box" onClick={e => e.stopPropagation()} style={{ textAlign:'center' }}>
        <div style={{ width:56, height:56, background:c.iconBg, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:24 }}>{c.icon}</div>
        <div style={{ fontFamily:'Instrument Serif,serif', fontSize:21, color:'#0a0f1e', marginBottom:8 }}>{c.title}</div>
        <div style={{ fontSize:13, color:'#64748b', marginBottom:24, lineHeight:1.6 }}>{c.body}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="adm-btn-ghost" style={{ flex:1, padding:'11px' }} onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'11px', borderRadius:11, border:'none', background:c.btnBg, color:'white', fontSize:13, fontWeight:700, fontFamily:'DM Sans,sans-serif', cursor:'pointer' }}>{c.btnLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Package Card (grid view) ──────────────────────────────────────────────────
function PackageCard({ pkg, isPending, onEdit, onDelete, onApprove, onReject }) {
  const cat    = getCat(pkg.category);
  const title  = pkg.category === 'student' && pkg.degree_type && pkg.course
    ? `${pkg.degree_type} in ${pkg.course}`
    : pkg.category === 'medical' && pkg.hospital_name
      ? `Treatment at ${pkg.hospital_name}`
      : pkg.title || '—';
  const sub    = pkg.course_city || pkg.hospital_city || pkg.country || pkg.location || '—';
  const imgSrc = pkg.images?.[0]?.image || pkg.images?.[0]?.url || null;

  return (
    <div className="adm-card">
      <div style={{ position:'relative' }}>
        {imgSrc
          ? <img src={imgSrc} alt={title} className="adm-card-img" />
          : <div className="adm-card-img-ph"><ImageIcon /></div>}
        {/* category badge */}
        <div style={{ position:'absolute', top:8, left:8 }}>
          {cat && (
            <span className="adm-badge" style={{ background:'rgba(255,255,255,.92)', color:cat.text, backdropFilter:'blur(4px)' }}>
              <span className="adm-badge-dot" style={{ background:cat.dot }} />{cat.emoji} {cat.label}
            </span>
          )}
        </div>
        {/* status badge */}
        <div style={{ position:'absolute', top:8, right:8 }}>
          {isPending
            ? <span className="adm-badge" style={{ background:'rgba(245,158,11,.92)', color:'white', backdropFilter:'blur(4px)' }}>⏳ Pending</span>
            : <span className="adm-badge" style={{ background: pkg.is_active ? 'rgba(16,185,129,.92)' : 'rgba(148,163,184,.92)', color:'white', backdropFilter:'blur(4px)' }}>
                {pkg.is_active ? '● Active' : '● Inactive'}
              </span>
          }
        </div>
        {/* provider tag */}
        {pkg.provider_name && (
          <div style={{ position:'absolute', bottom:8, left:8 }}>
            <span className="adm-badge" style={{ background:'rgba(15,23,42,.72)', color:'white', backdropFilter:'blur(4px)', fontSize:9 }}>
              👤 {pkg.provider_name}
            </span>
          </div>
        )}
      </div>

      <div className="adm-card-body">
        <div className="adm-card-name">{cat?.emoji} {title}</div>
        <div className="adm-card-loc">{sub}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:2 }}>
          {pkg.is_free
            ? <span style={{ fontSize:14, fontWeight:800, color:'#059669' }}>FREE</span>
            : <div>
                <div style={{ fontSize:9, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Fee</div>
                <span style={{ fontSize:14, fontWeight:800, color:'#07b3f2' }}>${pkg.price}</span>
              </div>
          }
          {pkg.processing_time && <span style={{ fontSize:10, color:'#94a3b8' }}>{pkg.processing_time}</span>}
        </div>

        <div className="adm-card-foot">
          {isPending ? (
            <>
              <button className="adm-btn-approve" onClick={onApprove}><CheckIcon /> Approve</button>
              <button className="adm-btn-reject"  onClick={onReject}><XIcon />     Reject</button>
            </>
          ) : (
            <>
              <button className="adm-btn-ghost"   style={{ flex:1, padding:'6px 10px', fontSize:11 }} onClick={onEdit}><EditIcon />   Edit</button>
              <button className="adm-btn-danger"  style={{ flex:1, padding:'6px 10px', fontSize:11 }} onClick={onDelete}><TrashIcon /> Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Package Row (list view) ───────────────────────────────────────────────────
function PackageRow({ pkg, isPending, onEdit, onDelete, onApprove, onReject, isLast, isFirst, isOnly }) {
  const cat    = getCat(pkg.category);
  const title  = pkg.category === 'student' && pkg.degree_type && pkg.course
    ? `${pkg.degree_type} in ${pkg.course}`
    : pkg.category === 'medical' && pkg.hospital_name
      ? `Treatment at ${pkg.hospital_name}`
      : pkg.title || '—';
  const imgSrc = pkg.images?.[0]?.image || pkg.images?.[0]?.url || null;
  const br = isOnly ? 16 : isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : 0;

  return (
    <div className="adm-list-item" style={{ borderRadius: br }}>
      {imgSrc
        ? <img src={imgSrc} alt={title} className="adm-list-thumb" />
        : <div className="adm-list-thumb-ph"><ImageIcon /></div>}
      <div className="adm-list-info">
        <div className="adm-list-name">{cat?.emoji} {title}</div>
        <div className="adm-list-meta" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {cat && (
            <span style={{ color:cat.text, fontWeight:600 }}>{cat.label}</span>
          )}
          {pkg.provider_name && <span className="adm-provider-tag">👤 {pkg.provider_name}</span>}
          {pkg.processing_time && <span>{pkg.processing_time}</span>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        {pkg.is_free
          ? <span style={{ fontSize:13, fontWeight:800, color:'#059669' }}>FREE</span>
          : <span style={{ fontSize:13, fontWeight:800, color:'#07b3f2' }}>${pkg.price}</span>
        }
        {isPending
          ? <span className="adm-badge" style={{ background:'rgba(245,158,11,.12)', color:'#d97706' }}>⏳ Pending</span>
          : <span className="adm-badge" style={{ background: pkg.is_active ? 'rgba(16,185,129,.12)' : 'rgba(148,163,184,.12)', color: pkg.is_active ? '#059669' : '#64748b' }}>
              {pkg.is_active ? '● Active' : '● Inactive'}
            </span>
        }
      </div>
      <div className="adm-list-actions">
        {isPending ? (
          <>
            <button className="adm-btn-approve" style={{ padding:'6px 12px', fontSize:11 }} onClick={onApprove}><CheckIcon /> Approve</button>
            <button className="adm-btn-reject"  style={{ padding:'6px 12px', fontSize:11 }} onClick={onReject}><XIcon /> Reject</button>
          </>
        ) : (
          <>
            <button className="adm-btn-ghost"  style={{ padding:'6px 12px', fontSize:11 }} onClick={onEdit}><EditIcon />   Edit</button>
            <button className="adm-btn-danger" style={{ padding:'6px 12px', fontSize:11 }} onClick={onDelete}><TrashIcon /> Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPackagesSection({ showToast: externalToast }) {
  const [packages,   setPackages]    = useState([]);
  const [pending,    setPending]     = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [search,     setSearch]      = useState('');
  const [activeTab,  setActiveTab]   = useState('all');
  const [catFilter,  setCatFilter]   = useState('');
  const [viewMode,   setViewMode]    = useState('grid');   // 'grid' | 'list'
  const [showCreate, setShowCreate]  = useState(false);
  const [editPkg,    setEditPkg]     = useState(null);
  const [confirmQ,   setConfirmQ]    = useState(null);    // { type, pkg, action? }
  const [fd,         setFd]          = useState(EMPTY);
  const [imgFiles,   setImgFiles]    = useState([]);
  const [imgPreviews,setImgPreviews] = useState([]);
  const [toastMsg,   setToastMsg]    = useState(null);

  const showToast = msg => {
    if (externalToast) { externalToast(msg); return; }
    setToastMsg(msg); setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => () => imgPreviews.forEach(URL.revokeObjectURL), [imgPreviews]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allRes, pendRes] = await Promise.all([
        fetch(`${API_BASE}/packages/admin/`,         { headers: authH() }),
        fetch(`${API_BASE}/packages/admin/pending/`, { headers: authH() }),
      ]);
      const allData  = await allRes.json();
      const pendData = await pendRes.json();
      setPackages(Array.isArray(allData)  ? allData  : allData.packages  || allData.results  || []);
      setPending( Array.isArray(pendData) ? pendData : pendData.packages || pendData.results || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // image helpers
  const onImgChange = e => {
    const files = Array.from(e.target.files).slice(0, 20);
    setImgFiles(files); setImgPreviews(files.map(f => URL.createObjectURL(f)));
  };
  const removeImg = i => {
    setImgFiles(f => f.filter((_, idx) => idx !== i));
    setImgPreviews(p => p.filter((_, idx) => idx !== i));
  };
  const clearImgs  = () => { setImgFiles([]); setImgPreviews([]); };
  const resetForm  = () => { setFd(EMPTY); setImgFiles([]); setImgPreviews([]); };

  const buildFD = (data, files) => {
    const form = new FormData();
    Object.keys(data).forEach(k => {
      const v = data[k];
      if (k === 'price' && data.is_free) form.append(k, '');
      else if (v === null || v === undefined) form.append(k, '');
      else form.append(k, v);
    });
    files.forEach(f => form.append('images', f));
    return form;
  };

  // CRUD
  const handleCreate = async e => {
    e.preventDefault();
    if (imgFiles.length === 0) { showToast('⚠️ At least one image is required'); return; }
    try {
      const res  = await fetch(`${API_BASE}/packages/admin/`, { method:'POST', headers:authH(), body:buildFD(fd, imgFiles) });
      const data = await res.json();
      if (res.ok) { showToast('🎉 Package created!'); resetForm(); setShowCreate(false); fetchAll(); }
      else showToast('❌ ' + (data.error || data.detail || 'Failed to create'));
    } catch { showToast('❌ Network error'); }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const res  = await fetch(`${API_BASE}/packages/admin/${editPkg.id}/`, { method:'PATCH', headers:authH(), body:buildFD(fd, imgFiles) });
      const data = await res.json();
      if (res.ok) { showToast('✏️ Package updated!'); resetForm(); setEditPkg(null); fetchAll(); }
      else showToast('❌ ' + (data.error || data.detail || 'Failed to update'));
    } catch { showToast('❌ Network error'); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/packages/admin/${confirmQ.pkg.id}/`, { method:'DELETE', headers:authH() });
      if (res.ok) { showToast('🗑️ Package deleted'); setPackages(p => p.filter(x => x.id !== confirmQ.pkg.id)); setConfirmQ(null); }
      else showToast('❌ Failed to delete');
    } catch { showToast('❌ Network error'); }
  };

  const handleApproveReject = async () => {
    const { pkg, action } = confirmQ;
    try {
      const res = await fetch(`${API_BASE}/packages/admin/${pkg.id}/${action}/`, {
        method:'POST', headers:{ ...authH(), 'Content-Type':'application/json' }
      });
      if (res.ok) {
        showToast(action === 'approve' ? '✅ Package approved!' : '❌ Package rejected');
        setConfirmQ(null); fetchAll();
      } else showToast('❌ Action failed');
    } catch { showToast('❌ Network error'); }
  };

  const openEdit = pkg => {
    setEditPkg(pkg);
    setFd({ ...EMPTY, ...pkg, requirements: Array.isArray(pkg.requirements) ? pkg.requirements.join('\n') : pkg.requirements || '' });
    setImgFiles([]); setImgPreviews(pkg.images?.map(img => img.image || img.url) || []);
  };

  // derived
  const baseList   = activeTab === 'pending' ? pending : packages;
  const filtered   = baseList.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !search || (p.title || '').toLowerCase().includes(q) || (p.country || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchC = !catFilter || p.category === catFilter;
    return matchQ && matchC;
  });
  const active     = packages.filter(p => p.is_active).length;
  const inactive   = packages.filter(p => !p.is_active).length;
  const avgPrice   = packages.length ? Math.round(packages.reduce((s, p) => s + Number(p.price || 0), 0) / packages.length) : 0;

  const STATS = [
    { label:'Total',     value:packages.length,           icon:'📦', color:'#07b3f2' },
    { label:'Active',    value:active,                    icon:'✅', color:'#10b981' },
    { label:'Inactive',  value:inactive,                  icon:'⏸️', color:'#94a3b8' },
    { label:'Pending',   value:pending.length,            icon:'⏳', color:'#f59e0b' },
    { label:'Avg Price', value:`$${avgPrice.toLocaleString()}`, icon:'💰', color:'#8b5cf6' },
  ];

  return (
    <div className="adm-pkg">
      <AdminStyles />

      {/* ── Header ── */}
      <div className="adm-header fa">
        <div className="adm-title-block">
          <div className="adm-eyebrow"><ShieldIcon /> Admin Control</div>
          <div className="adm-title">Package Management</div>
          <div className="adm-sub">{packages.length} packages · manage all visa offerings across providers</div>
        </div>
        <button className="adm-btn-primary fa fa1" onClick={() => { resetForm(); setShowCreate(true); }}>
          <PlusIcon /> Create Package
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="adm-stats fa fa1">
        {STATS.map(s => (
          <div key={s.label} className="adm-stat">
            <div className="adm-stat-blob" style={{ background:s.color }} />
            <div className="adm-stat-icon" style={{ background:`${s.color}18` }}>{s.icon}</div>
            <div className="adm-stat-num">{s.value}</div>
            <div className="adm-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }} className="fa fa2">
        <div className="adm-tabs">
          <button className={`adm-tab${activeTab === 'all' ? ' act' : ''}`} onClick={() => setActiveTab('all')}>
            📦 All Packages <span className="adm-tab-badge">{packages.length}</span>
          </button>
          <button className={`adm-tab pending-tab${activeTab === 'pending' ? ' act' : ''}`} onClick={() => setActiveTab('pending')}>
            <ClockIcon /> Pending <span className="adm-tab-badge">{pending.length}</span>
          </button>
        </div>
        {pending.length > 0 && activeTab !== 'pending' && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, color:'#92400e', cursor:'pointer' }}
            onClick={() => setActiveTab('pending')}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', animation:'pulse 1.5s infinite', display:'inline-block' }} />
            {pending.length} awaiting review
          </div>
        )}
      </div>

      {/* ── Toolbar: search + category filters + view toggle ── */}
      <div className="adm-toolbar fa fa2">
        <div className="adm-search-wrap">
          <span className="adm-search-icon">🔍</span>
          <input className="adm-search" placeholder="Search by title, country, category..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* category pills */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <button className="adm-cat-pill" onClick={() => setCatFilter('')}
            style={{ background: !catFilter ? '#0f172a' : '#f1f5f9', color: !catFilter ? 'white' : '#64748b', borderColor: !catFilter ? '#0f172a' : 'transparent' }}>
            All
          </button>
          {VISA_CATEGORIES.map(c => (
            <button key={c.value} className={`adm-cat-pill${catFilter === c.value ? ' active' : ''}`}
              onClick={() => setCatFilter(catFilter === c.value ? '' : c.value)}
              style={{ background: catFilter === c.value ? c.bg : '#f1f5f9', color: catFilter === c.value ? c.text : '#64748b', borderColor: catFilter === c.value ? c.dot : 'transparent' }}>
              <span className="adm-cat-dot" style={{ background:c.dot }} />
              {c.emoji} {c.label}
              <span style={{ fontSize:10, fontWeight:700, marginLeft:2 }}>
                {packages.filter(p => p.category === c.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* view toggle */}
        <div className="adm-view-toggle">
          <button className={`adm-view-btn${viewMode === 'grid' ? ' act' : ''}`} onClick={() => setViewMode('grid')} title="Grid view"><GridIcon /></button>
          <button className={`adm-view-btn${viewMode === 'list' ? ' act' : ''}`} onClick={() => setViewMode('list')} title="List view"><ListIcon /></button>
        </div>
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        viewMode === 'grid'
          ? <div className="adm-grid">{[...Array(8)].map((_, i) => <div key={i} className="adm-skeleton" style={{ height:240 }} />)}</div>
          : <div className="adm-list">{[...Array(6)].map((_, i) => <div key={i} className="adm-skeleton" style={{ height:72, marginBottom:2 }} />)}</div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="adm-empty">
          <div style={{ fontSize:44, marginBottom:12 }}>{activeTab === 'pending' ? '⏳' : '📦'}</div>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:18, color:'#1e293b', marginBottom:6 }}>
            {search || catFilter ? 'No packages match your filters' : activeTab === 'pending' ? 'No pending packages' : 'No packages yet'}
          </div>
          <div style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>
            {search || catFilter ? 'Try clearing your search or category filter' : activeTab === 'pending' ? 'All submissions have been reviewed ✅' : 'Create the first visa package to get started'}
          </div>
          {!search && !catFilter && activeTab === 'all' && (
            <button className="adm-btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}><PlusIcon /> Create Package</button>
          )}
          {(search || catFilter) && (
            <button className="adm-btn-ghost" onClick={() => { setSearch(''); setCatFilter(''); }}>
              <FilterIcon /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {!loading && filtered.length > 0 && viewMode === 'grid' && (
        <div className="adm-grid fa fa3">
          {filtered.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} isPending={activeTab === 'pending'}
              onEdit={() => openEdit(pkg)}
              onDelete={() => setConfirmQ({ type:'delete', pkg })}
              onApprove={() => setConfirmQ({ type:'approve', pkg, action:'approve' })}
              onReject={()  => setConfirmQ({ type:'reject',  pkg, action:'reject'  })}
            />
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {!loading && filtered.length > 0 && viewMode === 'list' && (
        <div className="adm-list fa fa3">
          {filtered.map((pkg, i) => (
            <PackageRow key={pkg.id} pkg={pkg} isPending={activeTab === 'pending'}
              isFirst={i === 0} isLast={i === filtered.length - 1} isOnly={filtered.length === 1}
              onEdit={() => openEdit(pkg)}
              onDelete={() => setConfirmQ({ type:'delete', pkg })}
              onApprove={() => setConfirmQ({ type:'approve', pkg, action:'approve' })}
              onReject={()  => setConfirmQ({ type:'reject',  pkg, action:'reject'  })}
            />
          ))}
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <PackageFormModal title="Create Package" fd={fd} set={setFd}
          imgFiles={imgFiles} imgPreviews={imgPreviews}
          onImageChange={onImgChange} removeImg={removeImg} clearImgs={clearImgs}
          onSubmit={handleCreate} onClose={() => { setShowCreate(false); resetForm(); }} />
      )}

      {/* ── Edit modal ── */}
      {editPkg && (
        <PackageFormModal title="Edit Package" fd={fd} set={setFd}
          imgFiles={imgFiles} imgPreviews={imgPreviews}
          onImageChange={onImgChange} removeImg={removeImg} clearImgs={clearImgs}
          onSubmit={handleUpdate} isEdit onClose={() => { setEditPkg(null); resetForm(); }} />
      )}

      {/* ── Confirm modal (delete / approve / reject) ── */}
      {confirmQ && (
        <ConfirmModal
          type={confirmQ.type}
          pkg={confirmQ.pkg}
          onConfirm={confirmQ.type === 'delete' ? handleDelete : handleApproveReject}
          onClose={() => setConfirmQ(null)}
        />
      )}

      {/* ── Toast ── */}
      {!externalToast && toastMsg && <div className="adm-toast">{toastMsg}</div>}
    </div>
  );
}