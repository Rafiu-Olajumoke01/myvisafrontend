'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://web-production-f50dc.up.railway.app/api';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const ImageIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Constants ─────────────────────────────────────────────────────────────────
const VISA_CATEGORIES = [
  { value:'student',  label:'Student',  emoji:'🎓', dot:'#7c3aed', bg:'rgba(124,58,237,0.10)',  text:'#7c3aed' },
  { value:'tourist',  label:'Tourist',  emoji:'✈️', dot:'#0284c7', bg:'rgba(2,132,199,0.10)',   text:'#0284c7' },
  { value:'business', label:'Business', emoji:'🏢', dot:'#d97706', bg:'rgba(217,119,6,0.10)',   text:'#d97706' },
  { value:'medical',  label:'Medical',  emoji:'🏥', dot:'#dc2626', bg:'rgba(220,38,38,0.10)',   text:'#dc2626' },
];
const DEGREE_TYPES = ['BSc','BA','MSc','MA','MBA','PhD','HND','OND','Diploma','Certificate','Other'];
const getCat = v => VISA_CATEGORIES.find(c => c.value === v) || null;

const EMPTY = {
  title:'', category:'', is_active:true, is_free:false, price:'',
  university_name:'', university_logo:'', location:'',
  tuition_fees:'', course:'', course_duration:'', degree_type:'',
  course_city:'', course_expectations:'',
  application_fees:'', service_fee:'', processing_time:'',
  post_study_work_visa:'', admission_requirement:'', visa_required:'',
  trip_duration:'', cost:'',
  covers_visa:false, covers_flight:false, covers_airport_pickup:false,
  covers_accommodation:false, covers_daily_tours:false, covers_food:false, covers_local_transport:false,
  country:'', visa_duration:'', description:'', requirements:'',
  hospital_name:'', hospital_city:'', medical_expectations:'',
};

const authH = () => ({ Authorization:`Bearer ${typeof window!=='undefined'?localStorage.getItem('access_token'):''}` });

// ── Global Styles ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f0f2f5;font-family:'DM Sans',sans-serif;}

    @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
    @keyframes slideUp {from{opacity:0;transform:translateY(24px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes shimmer {0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes spin    {to{transform:rotate(360deg)}}
    @keyframes pulse   {0%,100%{opacity:1}50%{opacity:0.35}}
    @keyframes slideIn {from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes successPop{0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes scoreCount{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}

    .fa{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both}
    .fa1{animation-delay:.04s}.fa2{animation-delay:.09s}.fa3{animation-delay:.14s}.fa4{animation-delay:.19s}

    /* shell */
    .shell{display:flex;min-height:100vh;background:#f0f2f5;}

    /* sidebar */
    .sbar{width:240px;flex-shrink:0;background:#fff;border-right:1px solid #e8eaed;display:flex;flex-direction:column;padding:24px 0 20px;position:sticky;top:0;height:100vh;}
    .sbar-logo{display:flex;align-items:center;gap:10px;padding:0 20px 24px;border-bottom:1px solid #e8eaed;}
    .sbar-logo-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#07b3f2,#0284c7);display:flex;align-items:center;justify-content:center;font-size:16px;}
    .sbar-logo-text{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#0f172a;}
    .sbar-logo-sub{font-size:10px;color:#94a3b8;font-weight:500;letter-spacing:.04em;}
    .sbar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:2px;}
    .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#64748b;transition:all .15s;text-align:left;width:100%;}
    .nav-item:hover{background:#f4f6f8;color:#374151;}
    .nav-item.act{background:#e0f7fe;color:#07b3f2;font-weight:600;}
    .nav-item svg{width:17px;height:17px;flex-shrink:0;}
    .nav-badge{margin-left:auto;background:#07b3f2;color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;min-width:20px;text-align:center;}
    .nav-badge.red{background:#ff3b5c;}
    .sbar-profile{padding:12px 16px;display:flex;align-items:center;gap:10px;border-top:1px solid #e8eaed;}
    .sbar-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#07b3f2,#0284c7);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;}

    /* main */
    .main-area{flex:1;min-width:0;padding:24px 24px 48px;}
    .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
    .topbar-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#0f172a;}
    .topbar-sub{font-size:12px;color:#94a3b8;margin-top:2px;}
    .status-wrap{display:flex;align-items:center;gap:10px;background:white;border:1px solid #e8eaed;border-radius:12px;padding:8px 14px;}
    .status-dot{width:8px;height:8px;border-radius:50%;transition:background .3s;}
    .status-dot.available{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.2);}
    .status-dot.busy{background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.2);}
    .status-dot.offline{background:#94a3b8;}
    .status-lbl{font-size:12px;font-weight:600;color:#0f172a;}
    .status-sel{border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:12px;color:#64748b;cursor:pointer;outline:none;}

    /* stats */
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
    .stat-card{background:white;border-radius:14px;border:1px solid #e8eaed;padding:16px 18px;}
    .stat-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;font-weight:600;}
    .stat-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#0f172a;line-height:1;}
    .stat-sub{font-size:11px;color:#94a3b8;margin-top:4px;}
    .stat-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:14px;}

    /* call grid */
    .content-row{display:grid;grid-template-columns:1fr 340px;gap:16px;}
    .call-card{background:white;border-radius:14px;border:1px solid #e8eaed;overflow:hidden;}
    .call-head{padding:16px 18px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;}
    .call-head-title{font-size:14px;font-weight:700;color:#0f172a;}
    .call-count{background:#ff3b5c;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;}
    .req-item{padding:16px 18px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:14px;transition:background .15s;}
    .req-item:hover{background:#fafbfc;}
    .req-item:last-child{border-bottom:none;}
    .req-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#e0f7fe,#bae6fd);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#07b3f2;flex-shrink:0;font-family:'Playfair Display',serif;}
    .req-name{font-size:13px;font-weight:600;color:#0f172a;margin-bottom:2px;}
    .req-meta{font-size:11px;color:#94a3b8;}
    .req-pkg{display:inline-flex;align-items:center;gap:4px;background:#e0f7fe;color:#0284c7;font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;margin-top:5px;}
    .req-actions{display:flex;gap:7px;flex-shrink:0;}
    .btn-accept{padding:7px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#07b3f2,#0284c7);color:white;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(7,179,242,.25);transition:opacity .2s,transform .15s;}
    .btn-accept:hover{opacity:.9;transform:translateY(-1px);}
    .btn-accept:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    .btn-decline{padding:7px 14px;border-radius:8px;border:1px solid #e8eaed;background:white;color:#64748b;font-size:11px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;}
    .btn-decline:hover{border-color:#ff3b5c;color:#ff3b5c;}
    .call-empty{padding:48px 20px;text-align:center;}

    /* active call */
    .right-panel{display:flex;flex-direction:column;gap:14px;}
    .active-card{background:linear-gradient(135deg,#07b3f2,#0284c7);border-radius:14px;padding:18px;color:white;}
    .active-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:12px;}
    .active-user{font-size:16px;font-weight:700;font-family:'Playfair Display',serif;margin-bottom:4px;}
    .active-pkg{font-size:11px;opacity:.8;margin-bottom:14px;}
    .active-timer{font-size:28px;font-weight:700;font-family:'Playfair Display',serif;letter-spacing:.05em;margin-bottom:14px;}
    .active-actions{display:flex;gap:8px;}
    .active-btn{flex:1;padding:9px;border-radius:9px;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;border:none;transition:opacity .2s;}
    .active-btn:hover{opacity:.85;}
    .active-btn.join{background:white;color:#07b3f2;}
    .active-btn.end{background:rgba(255,255,255,.18);color:white;border:1px solid rgba(255,255,255,.3);}
    .history-card{background:white;border-radius:14px;border:1px solid #e8eaed;overflow:hidden;}
    .history-head{padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;}
    .history-item{padding:12px 16px;border-bottom:1px solid #f8fafc;display:flex;align-items:center;gap:12px;}
    .history-item:last-child{border-bottom:none;}
    .h-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
    .h-name{font-size:12px;font-weight:600;color:#0f172a;}
    .h-time{font-size:10px;color:#94a3b8;margin-top:1px;}
    .h-badge{margin-left:auto;font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;flex-shrink:0;}
    .unlock-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:7px;border:1.5px solid #e8eaed;background:white;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;color:#0284c7;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0;}
    .unlock-btn:hover{background:#e0f7fe;border-color:#07b3f2;color:#07b3f2;transform:translateY(-1px);}
    .unlock-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    .unlock-btn.unlocked{background:#dcfce7;border-color:#22c55e;color:#16a34a;cursor:default;}
    .unlock-btn.unlocked:hover{transform:none;background:#dcfce7;}

    /* ── PACKAGES SECTION ── */
    .pkg-section{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both;}
    .pkg-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px;}
    .pkg-title{font-family:'Instrument Serif',serif;font-size:26px;color:#0a0f1e;line-height:1.1;}
    .pkg-sub{font-size:13px;color:#94a3b8;margin-top:4px;font-weight:500;}
    .pkg-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
    .pkg-stat{background:white;border:1px solid #e8eaed;border-radius:14px;padding:14px 16px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;}
    .pkg-stat:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06);}
    .pkg-stat-blob{position:absolute;top:-20px;right:-20px;width:70px;height:70px;border-radius:50%;opacity:.07;}
    .pkg-stat-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#0f172a;line-height:1;}
    .pkg-stat-lbl{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-top:3px;}
    .pkg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
    .pkg-card{background:white;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s;}
    .pkg-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.08);}
    .pkg-img{width:100%;height:130px;object-fit:cover;}
    .pkg-img-ph{width:100%;height:130px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#cbd5e1;}
    .pkg-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;}
    .pkg-badge-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .pkg-body{padding:14px 14px 12px;display:flex;flex-direction:column;gap:6px;flex:1;}
    .pkg-name{font-size:13px;font-weight:700;color:#0f172a;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .pkg-loc{font-size:11px;color:#94a3b8;font-weight:500;}
    .pkg-foot{display:flex;gap:7px;margin-top:4px;}
    .pkg-empty{text-align:center;padding:56px 20px;background:white;border-radius:20px;border:1px solid #e2e8f0;}

    /* ── SHARED FORM/MODAL STYLES ── */
    .pm-modal-overlay{position:fixed;inset:0;background:rgba(10,15,30,.65);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto;animation:fadeIn .2s ease;}
    .pm-modal{background:white;border-radius:22px;width:100%;max-width:680px;margin:auto;box-shadow:0 32px 80px rgba(0,0,0,.22);animation:slideUp .35s cubic-bezier(.22,1,.36,1);}
    .pm-section{background:#f8fafc;border:1px solid #f0f4f8;border-radius:14px;padding:16px 18px;}
    .pm-section-title{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;}
    .pm-input{width:100%;padding:10px 13px;border-radius:11px;border:1.5px solid #e2e8f0;background:white;font-family:'DM Sans',sans-serif;font-size:13px;color:#1e293b;outline:none;transition:border-color .15s,box-shadow .15s;}
    .pm-input:focus{border-color:#07b3f2;box-shadow:0 0 0 3px rgba(7,179,242,.10);}
    .pm-input::placeholder{color:#94a3b8;}
    .pm-select{width:100%;padding:10px 36px 10px 13px;border-radius:11px;border:1.5px solid #e2e8f0;background:white url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 13px center;font-family:'DM Sans',sans-serif;font-size:13px;color:#1e293b;outline:none;cursor:pointer;transition:border-color .15s;appearance:none;}
    .pm-select:focus{border-color:#07b3f2;box-shadow:0 0 0 3px rgba(7,179,242,.10);}
    .pm-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px;display:block;}
    .pm-check-label{display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 12px;border-radius:10px;border:1.5px solid #e2e8f0;transition:all .15s;font-size:12px;font-weight:500;color:#475569;}
    .pm-check-label:hover{border-color:#07b3f2;background:rgba(7,179,242,.04);color:#0284c7;}
    .pm-drag-zone{border:2px dashed #e2e8f0;border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;}
    .pm-drag-zone:hover,.pm-drag-zone.drag{border-color:#07b3f2;background:rgba(7,179,242,.04);}
    .pm-skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% auto;animation:shimmer 1.3s linear infinite;border-radius:12px;}

    /* buttons */
    .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:11px;border:none;background:linear-gradient(135deg,#07b3f2,#0284c7);color:white;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:opacity .2s,transform .15s;box-shadow:0 3px 12px rgba(7,179,242,.28);}
    .btn-primary:hover{opacity:.88;transform:translateY(-1px);}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    .btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 14px;border-radius:9px;border:1.5px solid #e2e8f0;background:white;color:#475569;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;}
    .btn-ghost:hover{background:#f8fafc;border-color:#cbd5e1;}
    .btn-danger{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 14px;border-radius:9px;border:1.5px solid rgba(239,68,68,.2);background:rgba(239,68,68,.06);color:#dc2626;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;}
    .btn-danger:hover{background:rgba(239,68,68,.12);}

    /* modals */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;}
    .modal-box{background:white;border-radius:18px;padding:24px;max-width:360px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.18);}

    /* eval */
    .eval-overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:999;padding:16px;animation:fadeIn .3s ease;}
    .eval-modal{background:#fff;border-radius:24px;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.22);animation:slideUp .35s cubic-bezier(.34,1.56,.64,1);font-family:'DM Sans',sans-serif;}
    .eval-header{background:linear-gradient(135deg,#07b3f2,#0284c7);padding:24px 28px 20px;border-radius:24px 24px 0 0;position:relative;overflow:hidden;}
    .eval-close-btn{width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
    .eval-close-btn:hover{background:rgba(255,255,255,.25);}
    .eval-yn-btn{flex:1;padding:10px 0;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .18s;font-family:'DM Sans',sans-serif;color:#64748b;}
    .eval-yn-btn:hover{border-color:#07b3f2;color:#07b3f2;background:#f0fbff;}
    .eval-yn-btn.yes{border-color:#16a34a;background:#f0fdf4;color:#16a34a;}
    .eval-yn-btn.no{border-color:#dc2626;background:#fff1f2;color:#dc2626;}
    .eval-star{width:38px;height:38px;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;transition:all .15s;}
    .eval-star:hover,.eval-star.on{border-color:#f59e0b;background:#fffbeb;transform:scale(1.08);}
    .eval-rec-btn{padding:12px 6px;border-radius:12px;border:1.5px solid #e2e8f0;background:#f8fafc;cursor:pointer;text-align:center;transition:all .18s;font-family:'DM Sans',sans-serif;}
    .eval-rec-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.07);}
    .eval-rec-btn.app{border-color:#16a34a;background:#f0fdf4;}
    .eval-rec-btn.rej{border-color:#dc2626;background:#fff1f2;}
    .eval-rec-btn.more{border-color:#d97706;background:#fffbeb;}
    .eval-submit-btn{flex:2;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#07b3f2,#0284c7);color:white;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .2s,transform .15s;box-shadow:0 4px 14px rgba(7,179,242,.3);}
    .eval-submit-btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px);}
    .eval-submit-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}

    /* toast */
    .toast{position:fixed;bottom:24px;right:24px;background:#0f172a;color:white;padding:12px 18px;border-radius:12px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:200;animation:slideIn .3s ease;display:flex;align-items:center;gap:8px;}

    @media(max-width:1200px){.content-row{grid-template-columns:1fr;}.pkg-stats{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.sbar{display:none;}.main-area{padding:16px;}.stats-row{grid-template-columns:repeat(2,1fr);}}
  `}</style>
);

// ── Form helpers ──────────────────────────────────────────────────────────────
const Fld = ({ label, children }) => (
  <div><label className="pm-label">{label}</label>{children}</div>
);
const Chk = ({ label, checked, onChange }) => (
  <label className="pm-check-label">
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width:14,height:14,accentColor:'#07b3f2' }} />
    {label}
  </label>
);

// ── Category-specific field groups ───────────────────────────────────────────
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
            <input className="pm-input" required value={fd.university_name} onChange={e => set(f=>({...f,university_name:e.target.value}))} placeholder="e.g., University of Toronto" />
          </Fld>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, paddingTop:22 }}>
          <div style={{ width:46,height:46,borderRadius:12,border:'2px dashed #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',background:'white',overflow:'hidden' }}>
            {logoLoading
              ? <div style={{ width:16,height:16,border:'2px solid #07b3f2',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite' }} />
              : fd.university_logo ? <img src={fd.university_logo} alt="logo" style={{ width:'100%',height:'100%',objectFit:'contain',padding:4 }} />
              : <span style={{ fontSize:20 }}>🏫</span>}
          </div>
          <span style={{ fontSize:9,color:'#94a3b8',fontWeight:600 }}>Auto logo</span>
        </div>
      </div>
      {preview && (
        <div style={{ background:'rgba(124,58,237,.06)',border:'1px solid rgba(124,58,237,.15)',borderRadius:10,padding:'8px 12px' }}>
          <div style={{ fontSize:9,color:'#7c3aed',fontWeight:700,marginBottom:2 }}>PREVIEW</div>
          <div style={{ fontSize:13,fontWeight:600,color:'#5b21b6' }}>🎓 {preview}</div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Degree Type *"><select className="pm-select" required value={fd.degree_type} onChange={e=>set(f=>({...f,degree_type:e.target.value}))}><option value="">— Select —</option>{DEGREE_TYPES.map(d=><option key={d} value={d}>{d}</option>)}</select></Fld>
        <Fld label="Course Name *"><input className="pm-input" required value={fd.course} onChange={e=>set(f=>({...f,course:e.target.value}))} placeholder="e.g., Computer Engineering" /></Fld>
        <Fld label="City *"><input className="pm-input" required value={fd.course_city} onChange={e=>set(f=>({...f,course_city:e.target.value}))} placeholder="e.g., Toronto" /></Fld>
        <Fld label="Duration *"><input className="pm-input" required value={fd.course_duration} onChange={e=>set(f=>({...f,course_duration:e.target.value}))} placeholder="e.g., 4 years" /></Fld>
        <Fld label="Tuition Fee"><input className="pm-input" value={fd.tuition_fees} onChange={e=>set(f=>({...f,tuition_fees:e.target.value}))} placeholder="$25,000/year" /></Fld>
        <Fld label="Application Fees"><input className="pm-input" value={fd.application_fees} onChange={e=>set(f=>({...f,application_fees:e.target.value}))} placeholder="$150" /></Fld>
        <Fld label="Processing Time"><input className="pm-input" value={fd.processing_time} onChange={e=>set(f=>({...f,processing_time:e.target.value}))} placeholder="6–8 weeks" /></Fld>
        <Fld label="Post Study Work Visa">
          <select className="pm-select" value={fd.post_study_work_visa} onChange={e=>set(f=>({...f,post_study_work_visa:e.target.value}))}>
            <option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </Fld>
      </div>
      <Fld label="What to Expect"><textarea className="pm-input" rows={2} style={{ resize:'none' }} value={fd.course_expectations} onChange={e=>set(f=>({...f,course_expectations:e.target.value}))} placeholder="Hands-on labs, internship opportunities..." /></Fld>
      <Fld label="Visa Required"><select className="pm-select" value={fd.visa_required} onChange={e=>set(f=>({...f,visa_required:e.target.value}))}><option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option></select></Fld>
    </div>
  );
}

function TouristFields({ fd, set }) {
  const tog = k => set(f => ({ ...f, [k]:!f[k] }));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Trip Duration (days) *"><input className="pm-input" type="number" required value={fd.trip_duration} onChange={e=>set(f=>({...f,trip_duration:e.target.value}))} placeholder="7" /></Fld>
        <Fld label="Location *"><input className="pm-input" required value={fd.location} onChange={e=>set(f=>({...f,location:e.target.value}))} placeholder="Paris, France" /></Fld>
        <Fld label="Cost *"><input className="pm-input" required value={fd.cost} onChange={e=>set(f=>({...f,cost:e.target.value}))} placeholder="$2,500" /></Fld>
        <Fld label="Processing Time"><input className="pm-input" value={fd.processing_time} onChange={e=>set(f=>({...f,processing_time:e.target.value}))} placeholder="3–5 days" /></Fld>
      </div>
      <Fld label="What does the cost cover?">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginTop:2 }}>
          <Chk label="✈️ Flight"              checked={fd.covers_flight}          onChange={()=>tog('covers_flight')} />
          <Chk label="🛂 Visa (if applicable)" checked={fd.covers_visa}            onChange={()=>tog('covers_visa')} />
          <Chk label="🚗 Airport Pickup"       checked={fd.covers_airport_pickup}  onChange={()=>tog('covers_airport_pickup')} />
          <Chk label="🏨 Accommodation"        checked={fd.covers_accommodation}   onChange={()=>tog('covers_accommodation')} />
          <Chk label="🗺️ Daily Tours"          checked={fd.covers_daily_tours}     onChange={()=>tog('covers_daily_tours')} />
          <Chk label="🍽️ Daily Food"           checked={fd.covers_food}            onChange={()=>tog('covers_food')} />
          <Chk label="🚌 Local Transport"      checked={fd.covers_local_transport} onChange={()=>tog('covers_local_transport')} />
        </div>
      </Fld>
      <Fld label="Visa Required"><select className="pm-select" value={fd.visa_required} onChange={e=>set(f=>({...f,visa_required:e.target.value}))}><option value="">— Select —</option><option value="yes">Yes</option><option value="no">No</option></select></Fld>
    </div>
  );
}

function BusinessFields({ fd, set }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      <Fld label="Country *"><input className="pm-input" required value={fd.country} onChange={e=>set(f=>({...f,country:e.target.value}))} placeholder="e.g., Germany" /></Fld>
      <Fld label="Visa Duration"><input className="pm-input" value={fd.visa_duration} onChange={e=>set(f=>({...f,visa_duration:e.target.value}))} placeholder="e.g., 90 days" /></Fld>
      <Fld label="Processing Time"><input className="pm-input" value={fd.processing_time} onChange={e=>set(f=>({...f,processing_time:e.target.value}))} placeholder="2–3 weeks" /></Fld>
    </div>
  );
}

function MedicalFields({ fd, set }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Fld label="Hospital Name *"><input className="pm-input" required value={fd.hospital_name} onChange={e=>set(f=>({...f,hospital_name:e.target.value}))} placeholder="Toronto General Hospital" /></Fld>
        <Fld label="City *"><input className="pm-input" required value={fd.hospital_city} onChange={e=>set(f=>({...f,hospital_city:e.target.value}))} placeholder="e.g., Toronto" /></Fld>
        <Fld label="Country *"><input className="pm-input" required value={fd.country} onChange={e=>set(f=>({...f,country:e.target.value}))} placeholder="e.g., Canada" /></Fld>
        <Fld label="Visa Duration"><input className="pm-input" value={fd.visa_duration} onChange={e=>set(f=>({...f,visa_duration:e.target.value}))} placeholder="e.g., 90 days" /></Fld>
        <Fld label="Processing Time"><input className="pm-input" value={fd.processing_time} onChange={e=>set(f=>({...f,processing_time:e.target.value}))} placeholder="2–3 weeks" /></Fld>
      </div>
      <Fld label="What to Expect"><textarea className="pm-input" rows={2} style={{ resize:'none' }} value={fd.medical_expectations} onChange={e=>set(f=>({...f,medical_expectations:e.target.value}))} placeholder="World-class specialists, modern equipment..." /></Fld>
    </div>
  );
}

// ── Package Form Modal ────────────────────────────────────────────────────────
function PackageFormModal({ title, fd, set, imgFiles, imgPreviews, onImageChange, removeImg, clearImgs, onSubmit, onClose, isEdit }) {
  const [isDragging, setIsDragging] = useState(false);
  const cat = fd.category;
  const catInfo = getCat(cat);
  const handleDrop = e => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    onImageChange({ target:{ files } });
  };
  return (
    <div className="pm-modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="pm-modal" style={{ margin:'24px auto', maxHeight:'calc(100vh - 48px)', display:'flex', flexDirection:'column' }}>
        {/* header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontFamily:'Instrument Serif,serif', fontSize:22, color:'#0a0f1e' }}>{title}</div>
          <button onClick={onClose} style={{ width:34,height:34,borderRadius:9,border:'1.5px solid #e2e8f0',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:14 }}>✕</button>
        </div>
        {/* body */}
        <div style={{ overflowY:'auto', flex:1, padding:'20px 24px' }}>
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Fld label="Offer Title *"><input className="pm-input" required value={fd.title} onChange={e=>set({...fd,title:e.target.value})} placeholder="e.g., Canada Student Visa" /></Fld>
              <Fld label="Category *">
                <select className="pm-select" required value={fd.category} onChange={e=>set({...fd,category:e.target.value})}>
                  <option value="">— Select category —</option>
                  {VISA_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </Fld>
            </div>
            <Fld label="Status">
              <select className="pm-select" style={{ maxWidth:200 }} value={String(fd.is_active)} onChange={e=>set({...fd,is_active:e.target.value==='true'})}>
                <option value="true">✅ Active</option>
                <option value="false">❌ Inactive</option>
              </select>
            </Fld>
            {cat && (
              <div className="pm-section">
                <div className="pm-section-title">{catInfo?.emoji} {catInfo?.label} Details</div>
                {cat==='student'  && <StudentFields  fd={fd} set={set} />}
                {cat==='tourist'  && <TouristFields  fd={fd} set={set} />}
                {cat==='business' && <BusinessFields fd={fd} set={set} />}
                {cat==='medical'  && <MedicalFields  fd={fd} set={set} />}
              </div>
            )}
            {/* pricing */}
            <div className="pm-section">
              <div className="pm-section-title">💰 Pricing</div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[{free:false,label:'💳 Paid Package',act:'#07b3f2',actBg:'rgba(7,179,242,.08)'},{free:true,label:'🆓 Free Package',act:'#10b981',actBg:'rgba(16,185,129,.08)'}].map(o=>(
                  <button key={String(o.free)} type="button" onClick={()=>set({...fd,is_free:o.free})}
                    style={{ flex:1,padding:'9px',borderRadius:10,border:`2px solid ${fd.is_free===o.free?o.act:'#e2e8f0'}`,background:fd.is_free===o.free?o.actBg:'white',color:fd.is_free===o.free?o.act:'#64748b',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .15s' }}>
                    {o.label}
                  </button>
                ))}
              </div>
              {!fd.is_free && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Fld label="Price (USD) *"><input className="pm-input" type="number" step="0.01" required value={fd.price} onChange={e=>set({...fd,price:e.target.value})} placeholder="3500.00" /></Fld>
                  <Fld label="Service Fee (USD)"><input className="pm-input" value={fd.service_fee} onChange={e=>set({...fd,service_fee:e.target.value})} placeholder="15" /></Fld>
                </div>
              )}
            </div>
            <Fld label="Description"><textarea className="pm-input" rows={3} style={{ resize:'none' }} value={fd.description} onChange={e=>set({...fd,description:e.target.value})} placeholder="Package description..." /></Fld>
            <Fld label="Requirements (one per line)"><textarea className="pm-input" rows={3} style={{ resize:'none',fontFamily:'monospace',fontSize:12 }} value={fd.requirements} onChange={e=>set({...fd,requirements:e.target.value})} placeholder={"Valid passport\nLetter of acceptance\nProof of finances"} /></Fld>
            {/* images */}
            <div>
              <label className="pm-label">Images {!isEdit && '*'} (max 20)</label>
              <div className={`pm-drag-zone${isDragging?' drag':''}`} onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={e=>{e.preventDefault();setIsDragging(false);}} onDrop={handleDrop}>
                <input type="file" multiple accept="image/*" onChange={onImageChange} style={{ display:'none' }} id="sp-img-upload" />
                <label htmlFor="sp-img-upload" style={{ cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}>
                  <div style={{ width:40,height:40,background:'rgba(7,179,242,.10)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#0284c7' }}><ImageIcon /></div>
                  <div style={{ fontSize:13,fontWeight:600,color:'#475569' }}>{isDragging?'Drop images here!':'Click or drag & drop'}</div>
                  <div style={{ fontSize:11,color:'#94a3b8' }}>PNG, JPG up to 10MB each</div>
                </label>
              </div>
              {imgPreviews.length > 0 && (
                <div style={{ marginTop:12,background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:12,padding:12 }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                    <span style={{ fontSize:12,fontWeight:600,color:'#475569' }}>{imgPreviews.length} image{imgPreviews.length!==1?'s':''}</span>
                    {imgFiles.length>0 && <button type="button" onClick={clearImgs} style={{ fontSize:11,color:'#ef4444',fontWeight:600,background:'none',border:'none',cursor:'pointer' }}>Clear all</button>}
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8 }}>
                    {imgPreviews.map((src,i)=>(
                      <div key={i} style={{ position:'relative' }}>
                        <img src={src} alt="" style={{ width:'100%',height:56,objectFit:'cover',borderRadius:8,border:'1px solid #e2e8f0' }} />
                        {imgFiles.length>0 && <button type="button" onClick={()=>removeImg(i)} style={{ position:'absolute',top:-5,right:-5,width:18,height:18,background:'#ef4444',color:'white',border:'none',borderRadius:'50%',fontSize:10,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display:'flex',gap:10,paddingTop:8,borderTop:'1px solid #f1f5f9' }}>
              <button type="button" className="btn-ghost" style={{ flex:1,padding:'11px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex:2,padding:'11px' }}>{isEdit?'Update Package':'Create Package'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Packages Section ──────────────────────────────────────────────────────────
function PackagesSection({ showToast }) {
  const [packages,    setPackages]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showCreate,  setShowCreate]  = useState(false);
  const [editPkg,     setEditPkg]     = useState(null);
  const [delPkg,      setDelPkg]      = useState(null);
  const [fd,          setFd]          = useState(EMPTY);
  const [imgFiles,    setImgFiles]    = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);

  useEffect(() => { fetchPkgs(); }, []);
  useEffect(() => () => imgPreviews.forEach(URL.revokeObjectURL), [imgPreviews]);

  const fetchPkgs = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/packages/sp/`, { headers: authH() });
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onImgChange = e => {
    const files = Array.from(e.target.files).slice(0, 20);
    setImgFiles(files);
    setImgPreviews(files.map(f => URL.createObjectURL(f)));
  };
  const removeImg = i => { setImgFiles(f=>f.filter((_,idx)=>idx!==i)); setImgPreviews(p=>p.filter((_,idx)=>idx!==i)); };
  const clearImgs = () => { setImgFiles([]); setImgPreviews([]); };
  const resetForm = () => { setFd(EMPTY); setImgFiles([]); setImgPreviews([]); };

  const buildFD = (data, files) => {
    const form = new FormData();
    Object.keys(data).forEach(k => {
      const v = data[k];
      if (k==='price' && data.is_free) form.append(k,'');
      else if (v===null||v===undefined) form.append(k,'');
      else form.append(k,v);
    });
    files.forEach(f => form.append('images', f));
    return form;
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (imgFiles.length === 0) { showToast('⚠️ At least one image is required'); return; }
    try {
      const res = await fetch(`${API_BASE}/packages/sp/`, { method:'POST', headers:authH(), body:buildFD(fd, imgFiles) });
      const data = await res.json();
      if (res.ok) { showToast('🎉 Package created!'); resetForm(); setShowCreate(false); fetchPkgs(); }
      else showToast('❌ ' + (data.error || data.detail || 'Failed to create'));
    } catch { showToast('❌ Network error'); }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/packages/sp/${editPkg.id}/`, { method:'PATCH', headers:authH(), body:buildFD(fd, imgFiles) });
      const data = await res.json();
      if (res.ok) { showToast('✏️ Package updated!'); resetForm(); setEditPkg(null); fetchPkgs(); }
      else showToast('❌ ' + (data.error || data.detail || 'Failed to update'));
    } catch { showToast('❌ Network error'); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/packages/sp/${delPkg.id}/`, { method:'DELETE', headers:authH() });
      if (res.ok) { showToast('🗑️ Package deleted'); setPackages(p=>p.filter(x=>x.id!==delPkg.id)); setDelPkg(null); }
      else showToast('❌ Failed to delete');
    } catch { showToast('❌ Network error'); }
  };

  const openEdit = pkg => {
    setEditPkg(pkg);
    setFd({ ...EMPTY, ...pkg, requirements: Array.isArray(pkg.requirements)?pkg.requirements.join('\n'):pkg.requirements||'' });
    setImgFiles([]);
    setImgPreviews(pkg.images?.map(img=>img.image||img.url)||[]);
  };

  const filtered = packages.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title||'').toLowerCase().includes(q) || (p.country||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q);
  });

  const active   = packages.filter(p=>p.is_active).length;
  const inactive = packages.filter(p=>!p.is_active).length;
  const avgPrice = packages.length ? Math.round(packages.reduce((s,p)=>s+Number(p.price||0),0)/packages.length) : 0;

  return (
    <div className="pkg-section">
      {/* header */}
      <div className="pkg-header">
        <div>
          <div className="pkg-title">My Packages</div>
          <div className="pkg-sub">{packages.length} packages · manage your visa offerings</div>
        </div>
        <button className="btn-primary" onClick={()=>{resetForm();setShowCreate(true);}}>
          <PlusIcon /> Create Package
        </button>
      </div>

      {/* stats */}
      <div className="pkg-stats fa fa2">
        {[
          { label:'Total',     value:packages.length, icon:'📦', color:'#07b3f2' },
          { label:'Active',    value:active,          icon:'✅', color:'#10b981' },
          { label:'Inactive',  value:inactive,        icon:'⏸️', color:'#94a3b8' },
          { label:'Avg Price', value:`$${avgPrice.toLocaleString()}`, icon:'💰', color:'#f59e0b' },
        ].map(s=>(
          <div key={s.label} className="pkg-stat">
            <div className="pkg-stat-blob" style={{ background:s.color }} />
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between' }}>
              <div><div className="pkg-stat-num">{s.value}</div><div className="pkg-stat-lbl">{s.label}</div></div>
              <div style={{ width:32,height:32,borderRadius:9,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* search + category badges */}
      <div style={{ display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center' }}>
        <input className="pm-input" style={{ flex:1,minWidth:200 }} placeholder="🔍 Search by title, country, category..." value={search} onChange={e=>setSearch(e.target.value)} />
        {VISA_CATEGORIES.map(c=>(
          <span key={c.value} className="pkg-badge" style={{ background:c.bg,color:c.text,padding:'5px 12px',fontSize:11 }}>
            <span className="pkg-badge-dot" style={{ background:c.dot }} />{c.emoji} {packages.filter(p=>p.category===c.value).length}
          </span>
        ))}
      </div>

      {/* loading */}
      {loading && (
        <div className="pkg-grid">{[...Array(6)].map((_,i)=><div key={i} className="pm-skeleton" style={{ height:240 }} />)}</div>
      )}

      {/* empty */}
      {!loading && filtered.length===0 && (
        <div className="pkg-empty">
          <div style={{ fontSize:40,marginBottom:12 }}>📦</div>
          <div style={{ fontSize:15,fontWeight:700,color:'#1e293b',marginBottom:6 }}>{search?'No packages found':'No packages yet'}</div>
          <div style={{ fontSize:13,color:'#94a3b8',marginBottom:20 }}>{search?'Try a different search':'Create your first visa package to start earning'}</div>
          {!search && <button className="btn-primary" onClick={()=>{resetForm();setShowCreate(true);}}><PlusIcon /> Create Package</button>}
        </div>
      )}

      {/* cards */}
      {!loading && filtered.length>0 && (
        <div className="pkg-grid fa fa3">
          {filtered.map(pkg=>{
            const cat = getCat(pkg.category);
            const pkgTitle = pkg.category==='student' && pkg.degree_type && pkg.course
              ? `${pkg.degree_type} in ${pkg.course}`
              : pkg.category==='medical' && pkg.hospital_name
              ? `Treatment at ${pkg.hospital_name}`
              : pkg.title||'—';
            const pkgSub = pkg.course_city||pkg.hospital_city||pkg.country||pkg.location||'—';
            const imgSrc = pkg.images?.[0]?.image||pkg.images?.[0]?.url||null;
            return (
              <div key={pkg.id} className="pkg-card">
                <div style={{ position:'relative' }}>
                  {imgSrc ? <img src={imgSrc} alt={pkgTitle} className="pkg-img" /> : <div className="pkg-img-ph"><ImageIcon /></div>}
                  <div style={{ position:'absolute',top:8,left:8 }}>
                    {cat && <span className="pkg-badge" style={{ background:'rgba(255,255,255,.92)',color:cat.text,backdropFilter:'blur(4px)' }}><span className="pkg-badge-dot" style={{ background:cat.dot }} />{cat.emoji} {cat.label}</span>}
                  </div>
                  <div style={{ position:'absolute',top:8,right:8 }}>
                    <span className="pkg-badge" style={{ background:pkg.is_active?'rgba(16,185,129,.9)':'rgba(239,68,68,.9)',color:'white',backdropFilter:'blur(4px)' }}>
                      {pkg.is_active?'● Active':'● Inactive'}
                    </span>
                  </div>
                </div>
                <div className="pkg-body">
                  <div className="pkg-name">{cat?.emoji} {pkgTitle}</div>
                  <div className="pkg-loc">{pkgSub}</div>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:2 }}>
                    {pkg.is_free
                      ? <span style={{ fontSize:14,fontWeight:800,color:'#059669' }}>FREE</span>
                      : <div><div style={{ fontSize:9,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em' }}>Fee</div><span style={{ fontSize:14,fontWeight:800,color:'#07b3f2' }}>${pkg.price}</span></div>
                    }
                    {pkg.processing_time && <span style={{ fontSize:10,color:'#94a3b8' }}>{pkg.processing_time}</span>}
                  </div>
                  <div className="pkg-foot">
                    <button className="btn-ghost" style={{ flex:1,padding:'6px 10px',fontSize:11 }} onClick={()=>openEdit(pkg)}><EditIcon /> Edit</button>
                    <button className="btn-danger" style={{ flex:1,padding:'6px 10px',fontSize:11 }} onClick={()=>setDelPkg(pkg)}><TrashIcon /> Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* create modal */}
      {showCreate && (
        <PackageFormModal title="Create Package" fd={fd} set={setFd}
          imgFiles={imgFiles} imgPreviews={imgPreviews}
          onImageChange={onImgChange} removeImg={removeImg} clearImgs={clearImgs}
          onSubmit={handleCreate} onClose={()=>{setShowCreate(false);resetForm();}} />
      )}

      {/* edit modal */}
      {editPkg && (
        <PackageFormModal title="Edit Package" fd={fd} set={setFd}
          imgFiles={imgFiles} imgPreviews={imgPreviews}
          onImageChange={onImgChange} removeImg={removeImg} clearImgs={clearImgs}
          onSubmit={handleUpdate} isEdit onClose={()=>{setEditPkg(null);resetForm();}} />
      )}

      {/* delete confirm */}
      {delPkg && (
        <div className="modal-overlay" onClick={()=>setDelPkg(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ textAlign:'center' }}>
            <div style={{ width:52,height:52,background:'rgba(239,68,68,.10)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:22 }}>🗑️</div>
            <div style={{ fontFamily:'Instrument Serif,serif',fontSize:20,color:'#0a0f1e',marginBottom:8 }}>Delete Package?</div>
            <div style={{ fontSize:13,color:'#64748b',marginBottom:24,lineHeight:1.6 }}>
              Delete <strong style={{ color:'#1e293b' }}>{delPkg.title||delPkg.country}</strong>? This cannot be undone.
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button className="btn-ghost" style={{ flex:1,padding:'11px' }} onClick={()=>setDelPkg(null)}>Cancel</button>
              <button onClick={handleDelete} style={{ flex:1,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'white',fontSize:13,fontWeight:700,fontFamily:'DM Sans,sans-serif',cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Eval helpers ──────────────────────────────────────────────────────────────
function calcScore(a) {
  let total=0,max=0;
  max+=20; if(a.hasDocuments==='yes') total+=20;
  max+=25; if(a.meetsEligibility==='yes') total+=25;
  max+=25; if(a.communicationScore>0) total+=(a.communicationScore/5)*25;
  max+=15; if(a.understandsProcess==='yes') total+=15;
  max+=15; if(a.answeredSatisfactorily==='yes') total+=15;
  return max>0?Math.round((total/max)*100):0;
}
const scoreColor = s => s>=75?'#16a34a':s>=50?'#d97706':'#dc2626';
const scoreLabel = s => s>=80?'Highly Ready':s>=60?'Moderately Ready':s>=40?'Needs Preparation':'Not Ready';

function useElapsed(startedAt) {
  const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{
    if(!startedAt) return;
    const id=setInterval(()=>setElapsed(Math.floor((Date.now()-startedAt)/1000)),1000);
    return ()=>clearInterval(id);
  },[startedAt]);
  return elapsed;
}
const fmtTimer = s=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

function ActiveCallCard({call,onJoin,onEnd}) {
  const elapsed=useElapsed(call.startedAt);
  return (
    <div className="active-card" style={{ animation:'fadeUp .45s cubic-bezier(.22,1,.36,1) both' }}>
      <div className="active-lbl">🔴 LIVE CALL</div>
      <div className="active-user">{call.name}</div>
      <div className="active-pkg">{call.package||'Discovery Call'}</div>
      <div className="active-timer">{fmtTimer(elapsed)}</div>
      <div className="active-actions">
        <button className="active-btn join" onClick={()=>onJoin(call)}>Join Meet</button>
        <button className="active-btn end"  onClick={()=>onEnd(call,elapsed)}>End Call</button>
      </div>
    </div>
  );
}

function ScoreRing({score,size=70}) {
  const r=(size/2)-6,circ=2*Math.PI*r,dash=(score/100)*circ,color=scoreColor(score);
  return (
    <div style={{ position:'relative',width:size,height:size,flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0f2fe" strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray .5s cubic-bezier(.34,1.56,.64,1)' }}/>
      </svg>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:700,color,lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:9,color:'#0284c7',fontWeight:600 }}>/ 100</span>
      </div>
    </div>
  );
}

function YesNo({value,onChange}) {
  return (
    <div style={{ display:'flex',gap:8 }}>
      <button className={`eval-yn-btn${value==='yes'?' yes':''}`} onClick={()=>onChange('yes')}>✓ Yes</button>
      <button className={`eval-yn-btn${value==='no'?' no':''}`}  onClick={()=>onChange('no')}>✗ No</button>
    </div>
  );
}

function StarRating({value,onChange}) {
  const [hover,setHover]=useState(0);
  const labels=['','Poor','Fair','Good','Very Good','Excellent'];
  return (
    <div>
      <div style={{ display:'flex',gap:6 }}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} className={`eval-star${(hover||value)>=n?' on':''}`}
            onClick={()=>onChange(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}>⭐</button>
        ))}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8',marginTop:5,padding:'0 2px' }}>
        <span>Poor</span>
        {value>0 && <span style={{ color:'#f59e0b',fontWeight:600 }}>{labels[hover||value]}</span>}
        <span>Excellent</span>
      </div>
    </div>
  );
}

function EvalForm({isOpen,onClose,callData,getToken}) {
  const [ans,setAns]=useState({ hasDocuments:null,meetsEligibility:null,communicationScore:0,understandsProcess:null,answeredSatisfactorily:null,recommendation:null });
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const score=calcScore(ans);
  const answered=[ans.hasDocuments,ans.meetsEligibility,ans.communicationScore>0,ans.understandsProcess,ans.answeredSatisfactorily,ans.recommendation].filter(Boolean).length;
  const complete=answered===6;

  const handleSubmit=async()=>{
    if(!complete) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/calls/evaluate/${callData.sessionId}/`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${getToken()}`},
        body:JSON.stringify({ has_right_documents:ans.hasDocuments==='yes',meets_eligibility:ans.meetsEligibility==='yes',communication_score:ans.communicationScore,understands_process:ans.understandsProcess==='yes',answered_satisfactorily:ans.answeredSatisfactorily==='yes',recommendation:ans.recommendation,readiness_score:score }),
      });
      setSubmitted(true);
    } catch { setSubmitted(true); }
    finally { setSubmitting(false); }
  };

  if(!isOpen) return null;
  return (
    <div className="eval-overlay">
      <div className="eval-modal" onClick={e=>e.stopPropagation()}>
        {submitted?(
          <div style={{ padding:'48px 28px 40px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center' }}>
            <div style={{ width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#07b3f2,#0284c7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:20,animation:'successPop .5s cubic-bezier(.34,1.56,.64,1)',boxShadow:'0 12px 32px rgba(7,179,242,.3)' }}>✅</div>
            <h3 style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'#0f172a',marginBottom:8 }}>Evaluation Saved!</h3>
            <p style={{ fontSize:13,color:'#64748b',lineHeight:1.6 }}>The applicant's assessment has been recorded.</p>
            <div style={{ margin:'24px 0',background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)',border:'1px solid #bae6fd',borderRadius:20,padding:'20px 32px',width:'100%',textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif',fontSize:52,fontWeight:700,color:scoreColor(score) }}>{score}%</div>
              <div style={{ fontSize:12,color:'#0284c7',fontWeight:600,marginTop:4 }}>{scoreLabel(score)} — {callData.applicantName}</div>
            </div>
            <button onClick={onClose} style={{ width:'100%',padding:'14px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#07b3f2,#0284c7)',color:'white',fontSize:14,fontWeight:700,fontFamily:'DM Sans,sans-serif',cursor:'pointer' }}>Done</button>
          </div>
        ):(
          <>
            <div className="eval-header">
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16 }}>
                <div style={{ width:46,height:46,borderRadius:14,background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>📋</div>
                <button className="eval-close-btn" onClick={onClose}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:700,color:'white',marginBottom:5 }}>Post-Call Evaluation</h2>
              <p style={{ fontSize:12.5,color:'rgba(255,255,255,.8)',lineHeight:1.5 }}>Rate the applicant based on the call you just completed.</p>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:10,background:'#f8fafc',borderBottom:'1px solid #f1f5f9',padding:'14px 28px' }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#07b3f2,#0284c7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'white',flexShrink:0 }}>{callData.applicantInitials}</div>
              <div><div style={{ fontSize:13,fontWeight:600,color:'#0f172a' }}>{callData.applicantName}</div><div style={{ fontSize:11,color:'#94a3b8' }}>Discovery Call · {callData.callDuration}</div></div>
              <div style={{ marginLeft:'auto',fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:999,background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0' }}>Call Ended ✓</div>
            </div>
            <div style={{ padding:'24px 28px',display:'flex',flexDirection:'column',gap:20 }}>
              {[
                { section:'📁 Section 1 — Documents', questions:[{ key:'hasDocuments',label:'Does the applicant have the right documents?',type:'yn' }] },
                { section:'🛂 Section 2 — Eligibility', questions:[
                  { key:'meetsEligibility',label:'Does the applicant meet the eligibility requirements?',type:'yn' },
                  { key:'communicationScore',label:'How well is the applicant communicating?',type:'star' },
                  { key:'understandsProcess',label:'Does the applicant understand the visa process?',type:'yn' },
                  { key:'answeredSatisfactorily',label:'Is the applicant answering questions satisfactorily?',type:'yn' },
                ]},
              ].map(sec=>(
                <div key={sec.section}>
                  <div style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>
                    {sec.section}<span style={{ flex:1,height:1,background:'#f1f5f9',display:'block' }}/>
                  </div>
                  {sec.questions.map(q=>(
                    <div key={q.key} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:13,fontWeight:500,color:'#1e293b',marginBottom:8,lineHeight:1.5 }}>{q.label}</div>
                      {q.type==='yn'   && <YesNo value={ans[q.key]} onChange={v=>setAns(p=>({...p,[q.key]:v}))} />}
                      {q.type==='star' && <StarRating value={ans[q.key]} onChange={v=>setAns(p=>({...p,[q.key]:v}))} />}
                    </div>
                  ))}
                </div>
              ))}
              <div>
                <div style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>✅ Section 3 — Recommendation<span style={{ flex:1,height:1,background:'#f1f5f9',display:'block' }}/></div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                  {[{key:'approve',icon:'✅',label:'Approve',cls:'app'},{key:'reject',icon:'❌',label:'Reject',cls:'rej'},{key:'more_documents',icon:'📎',label:'Need Docs',cls:'more'}].map(opt=>(
                    <button key={opt.key} className={`eval-rec-btn${ans.recommendation===opt.key?' '+opt.cls:''}`} onClick={()=>setAns(p=>({...p,recommendation:opt.key}))}>
                      <div style={{ fontSize:20,marginBottom:5 }}>{opt.icon}</div>
                      <div style={{ fontSize:11,fontWeight:600,color:ans.recommendation===opt.key?(opt.cls==='app'?'#16a34a':opt.cls==='rej'?'#dc2626':'#d97706'):'#64748b' }}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {answered>=2&&(
                <div style={{ background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)',border:'1px solid #bae6fd',borderRadius:16,padding:'16px 20px',display:'flex',alignItems:'center',gap:16 }}>
                  <ScoreRing score={score}/>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:3 }}>Readiness Score</div>
                    <div style={{ fontSize:12,fontWeight:600,color:scoreColor(score) }}>{scoreLabel(score)}</div>
                    <div style={{ height:5,background:'#bae6fd',borderRadius:999,marginTop:7,overflow:'hidden' }}>
                      <div style={{ height:'100%',borderRadius:999,background:'linear-gradient(90deg,#07b3f2,#0284c7)',width:`${score}%`,transition:'width .5s' }}/>
                    </div>
                    <div style={{ fontSize:11,color:'#64748b',marginTop:5 }}>Based on {answered}/6 answers</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding:'16px 28px 24px',borderTop:'1px solid #f1f5f9',display:'flex',gap:10 }}>
              <button style={{ flex:1,padding:13,borderRadius:12,border:'1.5px solid #e2e8f0',background:'transparent',color:'#64748b',fontSize:13,fontWeight:600,fontFamily:'DM Sans,sans-serif',cursor:'pointer' }} onClick={onClose}>Cancel</button>
              <button className="eval-submit-btn" onClick={handleSubmit} disabled={!complete||submitting}>
                {submitting?<div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>:<>Save Evaluation <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const DECLINE_REASONS = ['On another call','Stepped away briefly','Not my specialization','Technical issues'];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SPDashboard() {
  const router = useRouter();

  const [spStatus,       setSpStatus]       = useState('available');
  const [activeNav,      setActiveNav]       = useState('dashboard');
  const [requests,       setRequests]        = useState([]);
  const [activeCalls,    setActiveCalls]     = useState([]);
  const [declineModal,   setDeclineModal]    = useState(null);
  const [selectedReason, setSelectedReason]  = useState('');
  const [toast,          setToast]           = useState(null);
  const [spProfile,      setSpProfile]       = useState(null);
  const [history,        setHistory]         = useState([]);
  const [stats,          setStats]           = useState({ total:0,completed:0,missed:0 });
  const [loadingAccept,  setLoadingAccept]   = useState(null);
  const [showEval,       setShowEval]        = useState(false);
  const [evalData,       setEvalData]        = useState(null);
  const [unlockedChats,  setUnlockedChats]   = useState({});
  const [unlockingId,    setUnlockingId]     = useState(null);

  const wsRef    = useRef(null);
  const getToken = () => typeof window!=='undefined' ? localStorage.getItem('access_token') : null;

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  // guard
  useEffect(()=>{
    const check=async()=>{
      const t=getToken();
      if(!t){router.push('/login');return;}
      try{
        const res=await fetch(`${API_BASE}/providers/status/`,{headers:{Authorization:`Bearer ${t}`}});
        if(res.ok){const d=await res.json();if(!d.has_application||d.status!=='approved')router.push('/dashboard');}
      }catch{router.push('/dashboard');}
    };
    check();
  },[]);

  // profile
  useEffect(()=>{
    const f=async()=>{
      const t=getToken(); if(!t) return;
      try{const res=await fetch(`${API_BASE}/auth/profile/`,{headers:{Authorization:`Bearer ${t}`}});if(res.ok)setSpProfile(await res.json());}catch{}
    };f();
  },[]);

  // history
  const fetchHistory=async()=>{
    try{
      const res=await fetch(`${API_BASE}/calls/history/`,{headers:{Authorization:`Bearer ${getToken()}`}});
      if(res.ok){const d=await res.json();setHistory(d.sessions||[]);setStats({total:d.total||0,completed:d.completed||0,missed:d.missed||0});}
    }catch{}
  };
  useEffect(()=>{fetchHistory();},[]);

  // websocket
  useEffect(()=>{
    const t=getToken();
    const ws=new WebSocket(`wss://web-production-f50dc.up.railway.app/ws/calls/?token=${t}`);
    wsRef.current=ws;
    ws.onmessage=e=>{
      const d=JSON.parse(e.data);
      if(d.type==='call_request'){
        setRequests(prev=>[{id:d.session_id,name:d.user_name,initials:d.user_name?.split(' ').map(n=>n[0]).join('').toUpperCase(),package:d.package||'Discovery Call',time:'Just now',isNew:true},...prev]);
        showToast('📞 New call request incoming!');
      }
    };
    return ()=>ws.close();
  },[]);

  const handleAccept=async req=>{
    setLoadingAccept(req.id);
    try{
      const res=await fetch(`${API_BASE}/calls/accept/${req.id}/`,{method:'POST',headers:{Authorization:`Bearer ${getToken()}`,'Content-Type':'application/json'}});
      if(res.ok){const d=await res.json();setRequests(p=>p.filter(r=>r.id!==req.id));setActiveCalls(p=>[...p,{...req,meet_link:d.meet_link,startedAt:Date.now()}]);showToast('✅ Call accepted');}
      else showToast('❌ Failed to accept call');
    }catch{showToast('❌ Network error');}
    finally{setLoadingAccept(null);}
  };

  const handleDecline=async()=>{
    if(!selectedReason) return;
    const req=declineModal;setDeclineModal(null);
    try{await fetch(`${API_BASE}/calls/decline/${req.id}/`,{method:'POST',headers:{Authorization:`Bearer ${getToken()}`,'Content-Type':'application/json'},body:JSON.stringify({reason:selectedReason})});setRequests(p=>p.filter(r=>r.id!==req.id));showToast('↩️ Call declined');}
    catch{showToast('❌ Failed to decline');}
  };

  const handleEnd=async(call,elapsed)=>{
    const dur=fmtTimer(elapsed);
    try{await fetch(`${API_BASE}/calls/end/${call.id}/`,{method:'POST',headers:{Authorization:`Bearer ${getToken()}`}});}catch{}
    setActiveCalls(p=>p.filter(c=>c.id!==call.id));
    fetchHistory();
    setEvalData({sessionId:call.id,applicantName:call.name,applicantInitials:call.initials,callDuration:dur});
    setShowEval(true);
  };

  const handleUnlock=async(sessionId,userName)=>{
    setUnlockingId(sessionId);
    try{await fetch(`${API_BASE}/calls/unlock-chat/${sessionId}/`,{method:'POST',headers:{Authorization:`Bearer ${getToken()}`,'Content-Type':'application/json'}});setUnlockedChats(p=>({...p,[sessionId]:true}));showToast(`💬 Chat unlocked for ${userName}`);}
    catch{showToast('❌ Could not unlock chat.');}
    finally{setUnlockingId(null);}
  };

  const spInitials  = spProfile?(`${spProfile.first_name?.[0]||''}${spProfile.last_name?.[0]||''}`.toUpperCase()||'?'):'?';
  const spFullName  = spProfile?(`${spProfile.first_name||''} ${spProfile.last_name||''}`.trim()||spProfile.username||'Provider'):'Loading...';

  const NAV = [
    { key:'dashboard', label:'Dashboard', icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { key:'clients',   label:'Clients',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg> },
    { key:'packages',  label:'My Packages',icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>, badge: true },
    { key:'settings',  label:'Settings',  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.878 3.31.905 2.432 2.432a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.878 1.527-.905 3.31-2.432 2.432a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.878-3.31-.905-2.432-2.432a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.878-1.527.905-3.31 2.432-2.432.996.574 2.296.07 2.573-1.066z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  ];

  const TITLES = { dashboard:'SP Dashboard', clients:'Clients', packages:'My Packages', settings:'Settings' };

  return (
    <div style={{ minHeight:'100vh',background:'#f0f2f5' }}>
      <GlobalStyles />
      <div className="shell">

        {/* ── Sidebar ── */}
        <aside className="sbar">
          <div className="sbar-logo">
            <div className="sbar-logo-icon">✈️</div>
            <div><div className="sbar-logo-text">Ingress</div><div className="sbar-logo-sub">SP PORTAL</div></div>
          </div>
          <nav className="sbar-nav">
            {NAV.map(item=>(
              <button key={item.key} className={`nav-item${activeNav===item.key?' act':''}`} onClick={()=>setActiveNav(item.key)}>
                {item.icon}{item.label}
                {item.key==='dashboard' && requests.length>0 && <span className="nav-badge red">{requests.length}</span>}
                {item.key==='packages'  && <span className="nav-badge" style={{ background:'rgba(7,179,242,.15)',color:'#07b3f2',fontSize:9 }}>New</span>}
              </button>
            ))}
          </nav>
          <div className="sbar-profile">
            <div className="sbar-av">{spInitials}</div>
            <div><div style={{ fontSize:12,fontWeight:600,color:'#0f172a' }}>{spFullName}</div><div style={{ fontSize:10,color:'#94a3b8' }}>Service Provider</div></div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-area">

          {/* Topbar */}
          <div className="topbar">
            <div>
              <div className="topbar-title">{TITLES[activeNav]||'Dashboard'}</div>
              <div className="topbar-sub">{new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:13,fontWeight:600,color:'#0f172a' }}>{spFullName}</div><div style={{ fontSize:11,color:'#94a3b8' }}>Service Provider</div></div>
              <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#07b3f2,#0284c7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'white',flexShrink:0 }}>{spInitials}</div>
              <div className="status-wrap">
                <div className={`status-dot ${spStatus}`}/>
                <span className="status-lbl">{{available:'Available',busy:'Busy',offline:'Offline'}[spStatus]}</span>
                <select className="status-sel" value={spStatus} onChange={e=>setSpStatus(e.target.value)}>
                  <option value="available">Set Available</option>
                  <option value="busy">Set Busy</option>
                  <option value="offline">Go Offline</option>
                </select>
              </div>
              <button onClick={()=>router.push('/dashboard')} style={{ padding:'8px 14px',borderRadius:10,border:'1px solid #e8eaed',background:'white',fontSize:12,fontWeight:600,color:'#64748b',cursor:'pointer' }}>← User Dashboard</button>
            </div>
          </div>

          {/* ── PACKAGES SECTION ── */}
          {activeNav==='packages' && <PackagesSection showToast={showToast} />}

          {/* ── DASHBOARD SECTION ── */}
          {activeNav==='dashboard' && (
            <>
              <div className="stats-row">
                {[
                  {icon:'📞',iconBg:'#e0f7fe',label:'Total Calls',  value:stats.total,     sub:'All sessions'},
                  {icon:'✅',iconBg:'#dcfce7',label:'Completed',    value:stats.completed,  sub:'Successfully handled'},
                  {icon:'📭',iconBg:'#fef3c7',label:'Missed',       value:stats.missed,     sub:'No agent available'},
                  {icon:'🔴',iconBg:'#ffe4e6',label:'Active Calls', value:activeCalls.length,sub:'In progress'},
                ].map((s,i)=>(
                  <div key={i} className="stat-card fa" style={{ animationDelay:`${i*60}ms` }}>
                    <div className="stat-icon" style={{ background:s.iconBg }}>{s.icon}</div>
                    <div className="stat-lbl">{s.label}</div>
                    <div className="stat-val">{s.value}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="content-row">
                {/* incoming */}
                <div className="call-card fa fa2">
                  <div className="call-head">
                    <div className="call-head-title">Incoming Call Requests</div>
                    {requests.length>0 && <span className="call-count">{requests.length} waiting</span>}
                  </div>
                  {requests.length===0?(
                    <div className="call-empty">
                      <div style={{ fontSize:36,marginBottom:12 }}>📭</div>
                      <div style={{ fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:4 }}>No pending requests</div>
                      <div style={{ fontSize:12,color:'#94a3b8' }}>New call requests will appear here instantly</div>
                    </div>
                  ):requests.map(req=>(
                    <div key={req.id} className="req-item">
                      <div className="req-av">{req.initials}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div className="req-name">{req.name}</div>
                        <div className="req-meta">{req.time}</div>
                        <div className="req-pkg">{req.package}</div>
                      </div>
                      <div className="req-actions">
                        <button className="btn-accept" onClick={()=>handleAccept(req)} disabled={loadingAccept===req.id}>{loadingAccept===req.id?'Accepting...':'Accept'}</button>
                        <button className="btn-decline" onClick={()=>{setDeclineModal(req);setSelectedReason('');}}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* right panel */}
                <div className="right-panel">
                  {activeCalls.length>0?(
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8,display:'flex',alignItems:'center',gap:6 }}>
                        🔴 Active Calls
                        <span style={{ background:'#ff3b5c',color:'white',fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:999 }}>{activeCalls.length}</span>
                      </div>
                      {activeCalls.map(c=><ActiveCallCard key={c.id} call={c} onJoin={c=>window.open(c.meet_link,'_blank')} onEnd={handleEnd}/>)}
                    </div>
                  ):(
                    <div style={{ background:'white',borderRadius:14,border:'1px solid #e8eaed',padding:18,textAlign:'center' }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>📵</div>
                      <div style={{ fontSize:13,fontWeight:600,color:'#0f172a',marginBottom:4 }}>No Active Calls</div>
                      <div style={{ fontSize:11,color:'#94a3b8' }}>Accept a request to start a session</div>
                    </div>
                  )}
                  <div className="history-card fa fa3">
                    <div className="history-head">Recent Sessions</div>
                    {history.length===0?(
                      <div style={{ padding:20,textAlign:'center',fontSize:12,color:'#94a3b8' }}>No sessions yet</div>
                    ):history.slice(0,5).map(item=>{
                      const isUnlocked=unlockedChats[item.id]||item.chat_unlocked;
                      const isCompleted=item.status==='completed';
                      return(
                        <div key={item.id} className="history-item" style={{ flexWrap:'wrap',gap:8 }}>
                          <div className="h-dot" style={{ background:item.status==='completed'?'#22c55e':item.status==='declined'?'#ef4444':'#f59e0b' }}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div className="h-name">{item.user_name||'Unknown User'}</div>
                            <div className="h-time">{new Date(item.created_at).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}</div>
                          </div>
                          {isCompleted&&(
                            <button className={`unlock-btn${isUnlocked?' unlocked':''}`} onClick={()=>!isUnlocked&&handleUnlock(item.id,item.user_name)} disabled={unlockingId===item.id||isUnlocked}>
                              {isUnlocked?'🔓 Chat Unlocked':'🔒 Unlock Message'}
                            </button>
                          )}
                          <span className="h-badge" style={{ background:item.status==='completed'?'#dcfce7':item.status==='declined'?'#fee2e2':'#fef3c7',color:item.status==='completed'?'#16a34a':item.status==='declined'?'#dc2626':'#d97706' }}>
                            {item.status.charAt(0).toUpperCase()+item.status.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* clients placeholder */}
          {activeNav==='clients' && (
            <div style={{ background:'white',borderRadius:16,border:'1px solid #e8eaed',padding:'48px 20px',textAlign:'center' }}>
              <div style={{ fontSize:36,marginBottom:12 }}>👥</div>
              <div style={{ fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:6 }}>Clients</div>
              <div style={{ fontSize:13,color:'#94a3b8' }}>Your client list will appear here</div>
            </div>
          )}

          {/* settings placeholder */}
          {activeNav==='settings' && (
            <div style={{ background:'white',borderRadius:16,border:'1px solid #e8eaed',padding:'48px 20px',textAlign:'center' }}>
              <div style={{ fontSize:36,marginBottom:12 }}>⚙️</div>
              <div style={{ fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:6 }}>Settings</div>
              <div style={{ fontSize:13,color:'#94a3b8' }}>Account settings will appear here</div>
            </div>
          )}
        </main>
      </div>

      {/* decline modal */}
      {declineModal&&(
        <div className="modal-overlay" onClick={()=>setDeclineModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ width:38,height:38,borderRadius:10,background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginBottom:12 }}>↩️</div>
            <div style={{ fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:5 }}>Decline this call?</div>
            <div style={{ fontSize:12,color:'#94a3b8',marginBottom:16 }}>Please select a reason. {declineModal.name} will be routed to the next available provider.</div>
            <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:16 }}>
              {DECLINE_REASONS.map(r=>(
                <button key={r} onClick={()=>setSelectedReason(r)}
                  style={{ padding:'10px 14px',borderRadius:10,border:`1.5px solid ${selectedReason===r?'#07b3f2':'#e8eaed'}`,background:selectedReason===r?'#e0f7fe':'white',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:500,color:selectedReason===r?'#07b3f2':'#374151',cursor:'pointer',textAlign:'left',transition:'all .15s' }}>
                  {selectedReason===r?'✓ ':''}{r}
                </button>
              ))}
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <button style={{ flex:1,padding:10,borderRadius:9,border:'1px solid #e8eaed',background:'white',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:600,color:'#64748b',cursor:'pointer' }} onClick={()=>setDeclineModal(null)}>Cancel</button>
              <button onClick={handleDecline} disabled={!selectedReason} style={{ flex:1,padding:10,borderRadius:9,border:'none',background:'linear-gradient(135deg,#ff3b5c,#e11d48)',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:700,color:'white',cursor:'pointer',opacity:selectedReason?1:.5 }}>Decline Call</button>
            </div>
          </div>
        </div>
      )}

      {/* eval */}
      {showEval&&evalData&&<EvalForm isOpen={showEval} onClose={()=>{setShowEval(false);setEvalData(null);}} callData={evalData} getToken={getToken}/>}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}