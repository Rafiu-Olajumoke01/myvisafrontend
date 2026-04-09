'use client';
import { useRouter } from 'next/navigation';

export default function AgentPending() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✈️</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontFamily: 'Playfair Display, serif' }}>MyVisa</div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Agent Portal</div>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: 20, padding: '40px 36px', width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(7,179,242,0.25)' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 10px', fontFamily: 'Playfair Display, serif' }}>Application under review</h1>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: '0 0 28px' }}>
            Your agent application has been received. Our team will review your details and get back to you within <strong style={{ color: '#0f172a' }}>24–48 hours</strong>.
          </p>

          {/* Steps */}
          <div style={{ background: '#f8fafc', border: '1px solid #e8eaed', borderRadius: 14, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>What happens next</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { step: 1, title: 'Admin reviews your details', sub: 'Your name, contact info and experience are checked' },
                { step: 2, title: 'You get an email notification', sub: "Approved or rejected — either way, we'll let you know" },
                { step: 3, title: 'Access granted to agent dashboard', sub: 'Once approved, log in and start attending to clients' },
              ].map(({ step, title, sub }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #07b3f2, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{step}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email info */}
          <div style={{ background: '#e0f7fe', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, textAlign: 'left' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <span style={{ fontSize: 12, color: '#0284c7', fontWeight: 500 }}>Questions? Reach us at <strong>support@myvisaapp.com</strong></span>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/login')}
            style={{ width: '100%', padding: 13, borderRadius: 10, border: '1px solid #e8eaed', background: 'white', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            Back to login
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 20 }}>MyVisa · Agent Onboarding</p>
      </div>
    </div>
  );
}