'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const fileInputRef = useRef(null);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const token = () => localStorage.getItem('access_token');

  // ── Bank details (replace with your real details) ──
  const BANK_DETAILS = {
    bankName: 'Zenith Bank',
    accountName: 'MyVisa Services Ltd',
    accountNumber: '1234567890',
    amount: '15.00',
    currency: 'USD',
  };

  useEffect(() => { fetchApplication(); }, []);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`https://web-production-f50dc.up.railway.app/api/applications/${id}/`, {
        headers: { 'Authorization': `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const app = data.application || data;
        // If already paid, redirect back
        if (app.is_paid) {
          router.push(`/application/${id}`);
          return;
        }
        setApplication(app);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (files) => {
    const file = files[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!proofFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      const res = await fetch(`https://web-production-f50dc.up.railway.app/api/applications/${id}/payment/proof/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: formData,
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#f3f7f9] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#07b3f2]/20 border-t-[#07b3f2] rounded-full animate-spin" />
      </div>
    );
  }

  // ── Submitted / Pending Confirmation ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f3f7f9] flex items-center justify-center px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5 text-3xl">⏳</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-2">
            Your proof of payment has been sent. Our team will confirm your payment within <span className="font-bold text-gray-700">1–2 business hours.</span>
          </p>
          <p className="text-xs text-gray-400 mb-8">You will be notified once your payment is confirmed and your application is unlocked.</p>
          <button
            onClick={() => router.push(`/application/${id}`)}
            className="w-full py-3 bg-[#07b3f2] text-white font-black rounded-2xl hover:bg-[#0596cf] transition-all text-sm shadow-lg shadow-[#07b3f2]/25">
            Back to Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f7f9]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/application/${id}`)}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all text-sm font-bold">
            ←
          </button>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application #{id}</p>
            <h1 className="text-base font-black text-gray-900">Complete Payment</h1>
          </div>
        </div>
        {/* Paystack-style secure badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f7f9] rounded-xl border border-gray-200">
          <div className="w-4 h-4 text-green-500 text-xs">🔒</div>
          <span className="text-[10px] font-bold text-gray-500">Secured Payment</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">

        {/* ── Left: Payment Instructions ── */}
        <div className="col-span-7 space-y-4">

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {['Make Transfer', 'Upload Proof', 'Get Confirmed'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
                    ${i === 0 ? 'bg-[#07b3f2] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-bold ${i === 0 ? 'text-[#07b3f2]' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {/* Bank Transfer Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#07b3f2] to-[#055fa3] px-6 py-5">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Bank Transfer</p>
              <p className="text-white text-2xl font-black">${BANK_DETAILS.amount} <span className="text-base font-semibold text-white/70">{BANK_DETAILS.currency}</span></p>
              <p className="text-white/60 text-xs mt-1">Service fee for {application?.package_title || 'your application'}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transfer to this account</p>

              {/* Bank Name */}
              <div className="flex items-center justify-between p-4 bg-[#f3f7f9] rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Bank Name</p>
                  <p className="text-sm font-black text-gray-800">{BANK_DETAILS.bankName}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg">🏦</div>
              </div>

              {/* Account Number */}
              <div className="flex items-center justify-between p-4 bg-[#f3f7f9] rounded-2xl group">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Account Number</p>
                  <p className="text-xl font-black text-gray-900 tracking-widest">{BANK_DETAILS.accountNumber}</p>
                </div>
                <button
                  onClick={() => handleCopy(BANK_DETAILS.accountNumber, 'account')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5
                    ${copied === 'account'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#07b3f2] hover:text-[#07b3f2]'}`}>
                  {copied === 'account' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between p-4 bg-[#f3f7f9] rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Account Name</p>
                  <p className="text-sm font-black text-gray-800">{BANK_DETAILS.accountName}</p>
                </div>
                <button
                  onClick={() => handleCopy(BANK_DETAILS.accountName, 'name')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${copied === 'name'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#07b3f2] hover:text-[#07b3f2]'}`}>
                  {copied === 'name' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between p-4 bg-[#f3f7f9] rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Exact Amount</p>
                  <p className="text-sm font-black text-gray-800">${BANK_DETAILS.amount}</p>
                </div>
                <button
                  onClick={() => handleCopy(BANK_DETAILS.amount, 'amount')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${copied === 'amount'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#07b3f2] hover:text-[#07b3f2]'}`}>
                  {copied === 'amount' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Important notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs font-black text-amber-700 mb-1">Important</p>
                <ul className="space-y-1">
                  {[
                    'Transfer the exact amount shown above',
                    'Use your full name as the transfer narration',
                    'Take a screenshot of your transfer receipt',
                    'Upload the screenshot below as proof of payment',
                  ].map(note => (
                    <li key={note} className="flex items-start gap-2 text-[11px] text-amber-600">
                      <span className="mt-0.5 flex-shrink-0">→</span> {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Upload Proof ── */}
        <div className="col-span-5 space-y-4">

          {/* Order summary */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Order Summary</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Package</p>
                <p className="text-xs font-bold text-gray-800 max-w-[150px] text-right">{application?.package_title || '—'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Country</p>
                <p className="text-xs font-bold text-gray-800">{application?.package_country || '—'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Application ID</p>
                <p className="text-xs font-bold text-gray-800">#{id}</p>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <p className="text-sm font-black text-gray-700">Total</p>
                <p className="text-lg font-black text-[#07b3f2]">${BANK_DETAILS.amount}</p>
              </div>
            </div>
          </div>

          {/* Upload proof */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Upload Proof of Payment</p>
            <p className="text-[11px] text-gray-400 mb-4">After making the transfer, upload your receipt or screenshot here</p>

            {proofPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 mb-3">
                <img src={proofPreview} alt="Proof" className="w-full h-40 object-cover" />
                <button
                  onClick={() => { setProofFile(null); setProofPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition-all">
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-semibold truncate">{proofFile?.name}</p>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all mb-3
                  ${isDragging ? 'border-[#07b3f2] bg-blue-50' : 'border-gray-200 hover:border-[#07b3f2]/50 hover:bg-[#f3f7f9]'}`}>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={(e) => handleFileChange(e.target.files)} />
                <p className="text-2xl mb-2">📎</p>
                <p className="text-sm font-bold text-gray-600">Drop receipt here or <span className="text-[#07b3f2] underline underline-offset-2">browse</span></p>
                <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, PDF — Max 10MB</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!proofFile || submitting}
              className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2
                ${proofFile && !submitting
                  ? 'bg-[#07b3f2] text-white hover:bg-[#0596cf] shadow-lg shadow-[#07b3f2]/25 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Submitting...</>
                : 'Submit Proof of Payment'}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              Payment confirmation takes 1–2 business hours
            </p>
          </div>

          {/* Help */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Need Help?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Having trouble with payment? Contact us at <span className="font-bold text-[#07b3f2]">support@myvisa.com</span> or send us a WhatsApp message.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}