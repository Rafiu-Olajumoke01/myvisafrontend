'use client';
import React, { useState, useEffect, useRef } from 'react';

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── LIVE CALL INDICATOR ── */
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes liveRipple {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* ── MINIMIZED FLOATING PILL ── */
  .eval-minimized-pill {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 1000;
    background: linear-gradient(135deg, #07b3f2 0%, #0284c7 100%);
    border-radius: 999px;
    padding: 12px 20px 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    box-shadow: 0 8px 28px rgba(7,179,242,0.45);
    transition: transform 0.2s, box-shadow 0.2s;
    animation: pillSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    user-select: none;
  }
  .eval-minimized-pill:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(7,179,242,0.55);
  }
  @keyframes pillSlideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pill-live-dot {
    position: relative;
    width: 10px; height: 10px;
    flex-shrink: 0;
  }
  .pill-live-dot-inner {
    width: 10px; height: 10px; border-radius: 50%;
    background: #fff;
    animation: livePulse 1.4s ease-in-out infinite;
    position: relative; z-index: 1;
  }
  .pill-live-dot-ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    animation: liveRipple 1.4s ease-out infinite;
  }
  .pill-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: white;
    white-space: nowrap;
  }
  .pill-progress {
    background: rgba(255,255,255,0.25);
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 700;
    color: white;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── OVERLAY ── */
  .eval-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 16px;
    animation: evalFadeIn 0.25s ease;
  }
  @keyframes evalFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes evalSlideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop {
    0%   { transform: scale(0.7); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes scoreCount {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  /* ── MODAL ── */
  .eval-modal {
    background: #ffffff;
    border-radius: 24px;
    width: 100%; max-width: 560px;
    max-height: 92vh; overflow-y: auto;
    box-shadow: 0 32px 80px rgba(0,0,0,0.22);
    animation: evalSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'DM Sans', sans-serif;
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
  }
  .eval-modal::-webkit-scrollbar { width: 5px; }
  .eval-modal::-webkit-scrollbar-track { background: transparent; }
  .eval-modal::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }

  /* ── HEADER ── */
  .eval-header {
    background: linear-gradient(135deg, #07b3f2 0%, #0284c7 100%);
    padding: 24px 28px 20px;
    border-radius: 24px 24px 0 0;
    position: relative; overflow: hidden;
  }
  .eval-header::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 140px; height: 140px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }
  .eval-header::after {
    content: '';
    position: absolute; bottom: -20px; left: 30px;
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .eval-header-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 16px;
  }
  .eval-header-icon {
    width: 46px; height: 46px; border-radius: 14px;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .eval-header-actions {
    display: flex; align-items: center; gap: 8px;
    position: relative; z-index: 1;
  }
  .eval-icon-btn {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: white; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .eval-icon-btn:hover { background: rgba(255,255,255,0.28); }
  .eval-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: white;
    margin-bottom: 5px; position: relative; z-index: 1;
  }
  .eval-header p {
    font-size: 12.5px; color: rgba(255,255,255,0.82);
    position: relative; z-index: 1; line-height: 1.5;
  }

  /* ── LIVE BADGE IN HEADER ── */
  .eval-live-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 999px;
    padding: 4px 10px 4px 8px;
    margin-bottom: 10px;
    position: relative; z-index: 1;
  }
  .live-dot-wrap { position: relative; width: 8px; height: 8px; }
  .live-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #fff;
    animation: livePulse 1.4s ease-in-out infinite;
    position: relative; z-index: 1;
  }
  .live-dot-ring {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(255,255,255,0.5);
    animation: liveRipple 1.4s ease-out infinite;
  }
  .eval-live-badge span {
    font-size: 10.5px; font-weight: 700; color: white;
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  /* ── APPLICANT STRIP ── */
  .eval-applicant {
    display: flex; align-items: center; gap: 10px;
    background: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
    padding: 14px 28px;
  }
  .eval-applicant-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .eval-applicant-name { font-size: 13px; font-weight: 600; color: #0f172a; }
  .eval-applicant-meta { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .eval-applicant-badge {
    margin-left: auto; font-size: 10px; font-weight: 700;
    padding: 4px 10px; border-radius: 999px;
    display: flex; align-items: center; gap: 5px;
  }
  .badge-live {
    background: #fef2f2; color: #dc2626;
    border: 1px solid #fecaca;
  }
  .badge-ended {
    background: #e0f2fe; color: #0284c7;
    border: 1px solid #bae6fd;
  }
  .badge-dot-live {
    width: 6px; height: 6px; border-radius: 50%;
    background: #dc2626;
    animation: livePulse 1.2s ease-in-out infinite;
  }
  .badge-dot-ended {
    width: 6px; height: 6px; border-radius: 50%;
    background: #0284c7;
  }

  /* ── CALL TIMER ── */
  .eval-call-timer {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #fff8f8;
    border-bottom: 1px solid #fecaca;
    padding: 9px 28px;
    font-size: 12px; font-weight: 600; color: #dc2626;
    font-family: 'DM Sans', sans-serif;
  }
  .eval-call-timer.ended {
    background: #f0f9ff;
    border-bottom-color: #bae6fd;
    color: #0284c7;
  }

  /* ── BODY ── */
  .eval-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }

  /* ── SECTION ── */
  .eval-section-label {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .eval-section-label::after {
    content: ''; flex: 1; height: 1px; background: #f1f5f9;
  }

  /* ── YES/NO ── */
  .eval-question { margin-bottom: 14px; }
  .eval-question:last-child { margin-bottom: 0; }
  .eval-question-text { font-size: 13px; font-weight: 500; color: #1e293b; margin-bottom: 8px; line-height: 1.5; }
  .eval-yn-row { display: flex; gap: 8px; }
  .eval-yn-btn {
    flex: 1; padding: 10px 0; border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc; font-size: 12px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 5px;
    transition: all 0.18s; font-family: 'DM Sans', sans-serif;
    color: #64748b;
  }
  .eval-yn-btn:hover { border-color: #07b3f2; color: #07b3f2; background: #f0fbff; }
  .eval-yn-btn.yes-active { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
  .eval-yn-btn.no-active  { border-color: #dc2626; background: #fff1f2; color: #dc2626; }

  /* ── STARS ── */
  .eval-stars { display: flex; gap: 6px; }
  .eval-star {
    width: 38px; height: 38px; border-radius: 10px;
    border: 1.5px solid #e2e8f0; background: #f8fafc;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 18px;
    transition: all 0.15s; position: relative;
  }
  .eval-star:hover { border-color: #f59e0b; background: #fffbeb; transform: scale(1.08); }
  .eval-star.active { border-color: #f59e0b; background: #fffbeb; }
  .eval-star-label {
    font-size: 10px; color: #94a3b8; margin-top: 5px;
    display: flex; justify-content: space-between; padding: 0 2px;
  }

  /* ── RECOMMENDATION ── */
  .eval-rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .eval-rec-btn {
    padding: 12px 6px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: #f8fafc;
    cursor: pointer; text-align: center;
    transition: all 0.18s; font-family: 'DM Sans', sans-serif;
  }
  .eval-rec-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.07); }
  .eval-rec-icon { font-size: 20px; margin-bottom: 5px; }
  .eval-rec-label { font-size: 11px; font-weight: 600; }
  .eval-rec-btn.approve-active { border-color: #16a34a; background: #f0fdf4; }
  .eval-rec-btn.approve-active .eval-rec-label { color: #16a34a; }
  .eval-rec-btn.reject-active  { border-color: #dc2626; background: #fff1f2; }
  .eval-rec-btn.reject-active  .eval-rec-label { color: #dc2626; }
  .eval-rec-btn.more-active    { border-color: #d97706; background: #fffbeb; }
  .eval-rec-btn.more-active    .eval-rec-label { color: #d97706; }

  /* ── SCORE PREVIEW ── */
  .eval-score-preview {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border: 1px solid #bae6fd; border-radius: 16px;
    padding: 16px 20px;
    display: flex; align-items: center; gap: 16px;
  }
  .eval-score-ring { position: relative; width: 70px; height: 70px; flex-shrink: 0; }
  .eval-score-ring svg { transform: rotate(-90deg); }
  .eval-score-val {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .eval-score-num {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700; color: #07b3f2;
    line-height: 1; animation: scoreCount 0.4s ease;
  }
  .eval-score-pct { font-size: 9px; color: #0284c7; font-weight: 600; }
  .eval-score-info h4 { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
  .eval-score-info p  { font-size: 11px; color: #64748b; line-height: 1.5; }
  .eval-score-bar-wrap {
    height: 5px; background: #bae6fd; border-radius: 999px;
    margin-top: 7px; overflow: hidden;
  }
  .eval-score-bar {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #07b3f2, #0284c7);
    transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── SAVE BANNER (shown after mid-call save) ── */
  .eval-saved-banner {
    margin: 0 28px 0;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 600; color: #16a34a;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── FOOTER ── */
  .eval-footer {
    padding: 16px 28px 24px;
    border-top: 1px solid #f1f5f9;
    display: flex; gap: 10px; flex-direction: column;
  }
  .eval-footer-row { display: flex; gap: 10px; }
  .eval-cancel-btn {
    flex: 1; padding: 13px;
    border-radius: 12px; border: 1.5px solid #e2e8f0;
    background: transparent; color: #64748b;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .eval-cancel-btn:hover { background: #f8fafc; }
  .eval-minimize-btn {
    flex: 1; padding: 13px;
    border-radius: 12px; border: 1.5px solid #e2e8f0;
    background: transparent; color: #64748b;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .eval-minimize-btn:hover { background: #f8fafc; border-color: #07b3f2; color: #07b3f2; }
  .eval-submit-btn {
    flex: 2; padding: 13px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    color: white; font-size: 13px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 7px;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 14px rgba(7,179,242,0.3);
  }
  .eval-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .eval-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* hint text */
  .eval-footer-hint {
    font-size: 11px; color: #94a3b8; text-align: center;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── SUCCESS ── */
  .eval-success {
    padding: 48px 28px 40px;
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    animation: evalSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .eval-success-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin-bottom: 20px;
    animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 12px 32px rgba(7,179,242,0.3);
  }
  .eval-success h3 {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;
  }
  .eval-success p { font-size: 13px; color: #64748b; line-height: 1.6; max-width: 320px; }
  .eval-success-score-wrap {
    margin: 24px 0;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border: 1px solid #bae6fd;
    border-radius: 20px; padding: 20px 32px; width: 100%;
  }
  .eval-success-score-num {
    font-family: 'Playfair Display', serif;
    font-size: 52px; font-weight: 700; color: #07b3f2; line-height: 1;
  }
  .eval-success-score-label { font-size: 12px; color: #0284c7; font-weight: 600; margin-top: 4px; }
  .eval-done-btn {
    width: 100%; padding: 14px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #07b3f2, #0284c7);
    color: white; font-size: 14px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; box-shadow: 0 4px 14px rgba(7,179,242,0.3);
    transition: opacity 0.2s;
  }
  .eval-done-btn:hover { opacity: 0.9; }

  @media (max-width: 480px) {
    .eval-modal { border-radius: 20px; }
    .eval-header { padding: 20px 20px 16px; }
    .eval-body { padding: 20px; }
    .eval-footer { padding: 14px 20px 20px; }
    .eval-minimized-pill { bottom: 16px; right: 16px; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateScore(answers) {
  let total = 0, max = 0;
  max += 20; if (answers.hasDocuments === 'yes') total += 20;
  max += 25; if (answers.meetsEligibility === 'yes') total += 25;
  max += 25; if (answers.communicationScore > 0) total += (answers.communicationScore / 5) * 25;
  max += 15; if (answers.understandsProcess === 'yes') total += 15;
  max += 15; if (answers.answeredSatisfactorily === 'yes') total += 15;
  return max > 0 ? Math.round((total / max) * 100) : 0;
}
function getScoreColor(s) {
  if (s >= 75) return '#16a34a';
  if (s >= 50) return '#d97706';
  return '#dc2626';
}
function getScoreLabel(s) {
  if (s >= 80) return 'Highly Ready';
  if (s >= 60) return 'Moderately Ready';
  if (s >= 40) return 'Needs Preparation';
  return 'Not Ready';
}
function fmtTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreRing({ score, size = 70 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = getScoreColor(score);
  return (
    <div className="eval-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e0f2fe" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="eval-score-val">
        <span className="eval-score-num" style={{ color }}>{score}</span>
        <span className="eval-score-pct">/ 100</span>
      </div>
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="eval-yn-row">
      <button className={`eval-yn-btn${value === 'yes' ? ' yes-active' : ''}`} onClick={() => onChange('yes')}>✓ Yes</button>
      <button className={`eval-yn-btn${value === 'no'  ? ' no-active'  : ''}`} onClick={() => onChange('no')}>✗ No</button>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return (
    <div>
      <div className="eval-stars">
        {[1,2,3,4,5].map(n => (
          <button key={n}
            className={`eval-star${(hover || value) >= n ? ' active' : ''}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
          >⭐</button>
        ))}
      </div>
      <div className="eval-star-label">
        <span>Poor</span>
        {value > 0 && <span style={{ color:'#f59e0b', fontWeight:600, fontSize:11 }}>{labels[hover||value]}</span>}
        <span>Excellent</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * CallEvaluationForm
 *
 * Props:
 *  isOpen      - boolean: controls visibility
 *  isCallLive  - boolean: true = call in progress, false = call ended
 *  onClose     - fn: called when agent dismisses entirely (only after call ends)
 *  onSubmit    - fn(payload): called after successful backend save
 *  callData    - object with applicant info
 */
export default function CallEvaluationForm({
  isOpen = true,
  isCallLive = true,           // ← KEY PROP: true while call is active
  onClose,
  onSubmit,
  callData = {
    applicantName: 'John Adeyemi',
    applicantInitials: 'JA',
    visaType: 'Student Visa',
    callDuration: '18 min',
    callId: 'CALL-20240315-001',
  }
}) {
  const [answers, setAnswers] = useState({
    hasDocuments: null,
    meetsEligibility: null,
    communicationScore: 0,
    understandsProcess: null,
    answeredSatisfactorily: null,
    recommendation: null,
  });
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [minimized, setMinimized]     = useState(false);
  const [savedDuringCall, setSavedDuringCall] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const timerRef = useRef(null);

  // Live call timer — ticks while call is active and form is open
  useEffect(() => {
    if (isCallLive && isOpen) {
      timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCallLive, isOpen]);

  const score = calculateScore(answers);
  const answeredCount = [
    answers.hasDocuments,
    answers.meetsEligibility,
    answers.communicationScore > 0,
    answers.understandsProcess,
    answers.answeredSatisfactorily,
    answers.recommendation,
  ].filter(Boolean).length;
  const isComplete = answeredCount === 6;

  const set = (key) => (v) => setAnswers(p => ({ ...p, [key]: v }));

  const handleSubmit = async () => {
    if (!isComplete) return;
    setSubmitting(true);
    try {
      const payload = {
        call_id: callData.callId,
        has_right_documents: answers.hasDocuments === 'yes',
        meets_eligibility: answers.meetsEligibility === 'yes',
        communication_score: answers.communicationScore,
        understands_process: answers.understandsProcess === 'yes',
        answered_satisfactorily: answers.answeredSatisfactorily === 'yes',
        recommendation: answers.recommendation,
        readiness_score: score,
        submitted_during_call: isCallLive,   // ← tells backend when it was filled
      };
      const res = await fetch('/api/call-evaluations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save evaluation');
      onSubmit?.(payload);

      if (isCallLive) {
        // Mid-call save: don't show success screen — show a saved banner
        // and minimise the form so the agent can keep talking
        setSavedDuringCall(true);
        setMinimized(true);
      } else {
        // Call already ended: show full success screen
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      // Fallback for demo
      if (isCallLive) { setSavedDuringCall(true); setMinimized(true); }
      else setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── MINIMIZED PILL ──
  if (minimized) {
    return (
      <>
        <style>{styles}</style>
        <div className="eval-minimized-pill" onClick={() => setMinimized(false)}>
          <div className="pill-live-dot">
            <div className="pill-live-dot-ripple" />
            <div className="pill-live-dot-inner" />
          </div>
          <span className="pill-text">
            {savedDuringCall ? '✓ Saved · ' : ''}{callData.applicantName}
          </span>
          <span className="pill-progress">{answeredCount}/6</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="eval-overlay" onClick={isCallLive ? undefined : onClose}>
        <div className="eval-modal" onClick={e => e.stopPropagation()}>

          {submitted ? (
            /* ── Full Success Screen (only after call ends) ── */
            <div className="eval-success">
              <div className="eval-success-icon">✅</div>
              <h3>Evaluation Saved!</h3>
              <p>The applicant's assessment has been recorded and the readiness score has been calculated.</p>
              <div className="eval-success-score-wrap">
                <div className="eval-success-score-num" style={{ color: getScoreColor(score) }}>{score}%</div>
                <div className="eval-success-score-label">{getScoreLabel(score)} — {callData.applicantName}</div>
                <div className="eval-score-bar-wrap" style={{ marginTop: 12 }}>
                  <div className="eval-score-bar" style={{ width:`${score}%`, background:`linear-gradient(90deg,${getScoreColor(score)},${getScoreColor(score)}aa)` }} />
                </div>
              </div>
              <button className="eval-done-btn" onClick={onClose}>Done</button>
            </div>

          ) : (
            <>
              {/* ── Header ── */}
              <div className="eval-header">
                <div className="eval-header-top">
                  <div className="eval-header-icon">📋</div>
                  <div className="eval-header-actions">
                    {/* Minimize button — only while call is live */}
                    {isCallLive && (
                      <button className="eval-icon-btn" onClick={() => setMinimized(true)} title="Minimize">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/>
                        </svg>
                      </button>
                    )}
                    {/* Close — only when call has ended */}
                    {!isCallLive && (
                      <button className="eval-icon-btn" onClick={onClose} title="Close">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* LIVE badge */}
                {isCallLive && (
                  <div className="eval-live-badge">
                    <div className="live-dot-wrap">
                      <div className="live-dot-ring" />
                      <div className="live-dot" />
                    </div>
                    <span>Live Call</span>
                  </div>
                )}

                <h2>{isCallLive ? 'Live Call Evaluation' : 'Post-Call Evaluation'}</h2>
                <p>
                  {isCallLive
                    ? 'Fill in answers as you speak with the applicant — your progress saves automatically.'
                    : 'Rate the applicant based on the call you just completed.'}
                </p>
              </div>

              {/* ── Call Timer Strip ── */}
              <div className={`eval-call-timer${isCallLive ? '' : ' ended'}`}>
                {isCallLive ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                    </svg>
                    Call in progress · {fmtTime(elapsedSecs)}
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Call ended · Duration: {callData.callDuration}
                  </>
                )}
              </div>

              {/* ── Saved-during-call banner ── */}
              {savedDuringCall && (
                <div style={{ padding: '12px 28px 0' }}>
                  <div className="eval-saved-banner">
                    ✓ Evaluation saved — you can continue editing until the call ends.
                  </div>
                </div>
              )}

              {/* ── Applicant Strip ── */}
              <div className="eval-applicant">
                <div className="eval-applicant-avatar">{callData.applicantInitials}</div>
                <div>
                  <div className="eval-applicant-name">{callData.applicantName}</div>
                  <div className="eval-applicant-meta">{callData.visaType} · {callData.callDuration}</div>
                </div>
                <div className={`eval-applicant-badge ${isCallLive ? 'badge-live' : 'badge-ended'}`}>
                  <div className={isCallLive ? 'badge-dot-live' : 'badge-dot-ended'} />
                  {isCallLive ? 'On Call' : 'Call Ended'}
                </div>
              </div>

              {/* ── Body ── */}
              <div className="eval-body">

                {/* Section 1 */}
                <div>
                  <div className="eval-section-label">📁 Section 1 — Documents</div>
                  <div className="eval-question">
                    <div className="eval-question-text">Does the applicant have the right documents?</div>
                    <YesNo value={answers.hasDocuments} onChange={set('hasDocuments')} />
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <div className="eval-section-label">🛂 Section 2 — Eligibility & Assessment</div>
                  <div className="eval-question">
                    <div className="eval-question-text">Does the applicant meet the eligibility requirements?</div>
                    <YesNo value={answers.meetsEligibility} onChange={set('meetsEligibility')} />
                  </div>
                  <div className="eval-question">
                    <div className="eval-question-text">How well is the applicant communicating?</div>
                    <StarRating value={answers.communicationScore} onChange={set('communicationScore')} />
                  </div>
                  <div className="eval-question">
                    <div className="eval-question-text">Does the applicant understand the visa process?</div>
                    <YesNo value={answers.understandsProcess} onChange={set('understandsProcess')} />
                  </div>
                  <div className="eval-question">
                    <div className="eval-question-text">Is the applicant answering questions satisfactorily?</div>
                    <YesNo value={answers.answeredSatisfactorily} onChange={set('answeredSatisfactorily')} />
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <div className="eval-section-label">✅ Section 3 — Recommendation</div>
                  <div className="eval-rec-grid">
                    {[
                      { key:'approve',        icon:'✅', label:'Approve',   cls:'approve-active' },
                      { key:'reject',         icon:'❌', label:'Reject',    cls:'reject-active'  },
                      { key:'more_documents', icon:'📎', label:'Need Docs', cls:'more-active'    },
                    ].map(opt => (
                      <button key={opt.key}
                        className={`eval-rec-btn${answers.recommendation === opt.key ? ' '+opt.cls : ''}`}
                        onClick={() => setAnswers(p => ({ ...p, recommendation: opt.key }))}
                      >
                        <div className="eval-rec-icon">{opt.icon}</div>
                        <div className="eval-rec-label" style={{
                          color: answers.recommendation === opt.key
                            ? opt.key==='approve' ? '#16a34a' : opt.key==='reject' ? '#dc2626' : '#d97706'
                            : '#64748b'
                        }}>{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Preview */}
                {answeredCount >= 2 && (
                  <div className="eval-score-preview">
                    <ScoreRing score={score} />
                    <div className="eval-score-info">
                      <h4>Readiness Score</h4>
                      <p style={{ color: getScoreColor(score), fontWeight:600 }}>{getScoreLabel(score)}</p>
                      <div className="eval-score-bar-wrap">
                        <div className="eval-score-bar" style={{ width:`${score}%` }} />
                      </div>
                      <p style={{ marginTop:5 }}>Based on {answeredCount}/6 answers so far</p>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Footer ── */}
              <div className="eval-footer">
                <div className="eval-footer-row">
                  {isCallLive ? (
                    <button className="eval-minimize-btn" onClick={() => setMinimized(true)}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/>
                      </svg>
                      Minimise
                    </button>
                  ) : (
                    <button className="eval-cancel-btn" onClick={onClose}>Cancel</button>
                  )}
                  <button className="eval-submit-btn" onClick={handleSubmit} disabled={!isComplete || submitting}>
                    {submitting ? (
                      <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    ) : (
                      <>
                        {isCallLive ? 'Save & Minimise' : 'Save Evaluation'}
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                {isCallLive && (
                  <p className="eval-footer-hint">
                    💡 The form stays open while you're on the call. Minimise it anytime to get it out of the way.
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}