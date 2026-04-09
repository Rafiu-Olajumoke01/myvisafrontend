'use client';
import { useState, useEffect, useRef } from 'react';

const SYSTEM_PROMPT = `You are Vee, a friendly and energetic AI assistant for MyVisa — a visa consultancy platform that helps people apply for visas to study, work, travel or get medical treatment abroad.

Your job is to guide users through how the MyVisa platform works in a warm, simple and encouraging way. Keep responses short, friendly and easy to understand. Use simple language — no jargon.

Here is how MyVisa works:
1. Browse visa packages — users can browse packages by category (Student, Tourist, Business, Medical) and filter by country
2. Book a discovery call — user picks a package and books a free discovery call with a consultant
3. Pay after the call — once the call is done, the consultant sends a payment link
4. Get assigned a consultant — after payment, a dedicated consultant is assigned to handle the application
5. Upload documents — the consultant tells the user exactly what documents to upload
6. Application submitted — the consultant submits the visa application on behalf of the user
7. Track progress — users can track their application status on the dashboard

Key facts about MyVisa:
- 98% visa approval rate
- 50+ countries supported
- Student visas are free (no service fee)
- Other visas have a small service fee (~$15)
- Consultants are UKVI authorized and certified
- Support is available 24/7

Only answer questions about MyVisa and how it works. If someone asks something unrelated, kindly redirect them back to visa topics. Always be upbeat, warm and encouraging. Keep responses under 3 sentences where possible.`;

export default function VisaAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Show greeting bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!greeted && !dismissed) setShowGreeting(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [greeted, dismissed]);

  // Auto hide greeting after 8 seconds
  useEffect(() => {
    if (!showGreeting) return;
    const timer = setTimeout(() => setShowGreeting(false), 8000);
    return () => clearTimeout(timer);
  }, [showGreeting]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!greeted) {
        setGreeted(true);
        setShowGreeting(false);
        setMessages([{
          role: 'assistant',
          content: "Hey there! 👋 I'm Vee, your MyVisa guide! Would you like me to walk you through how MyVisa works? Just ask me anything — like \"how do I apply?\" or \"what visa types do you have?\" 😊",
        }]);
      }
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again!";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment 😅",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I apply?",
    "What visas do you have?",
    "How much does it cost?",
    "How long does it take?",
  ];

  return (
    <>
      <style>{`
        @keyframes jog {
          0%   { transform: translateY(0px) rotate(-2deg); }
          25%  { transform: translateY(-4px) rotate(1deg); }
          50%  { transform: translateY(0px) rotate(-1deg); }
          75%  { transform: translateY(-3px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(-2deg); }
        }
        @keyframes armSwing {
          0%,100% { transform: rotate(-20deg); }
          50%      { transform: rotate(20deg); }
        }
        @keyframes legSwing {
          0%,100% { transform: rotate(20deg); }
          50%      { transform: rotate(-20deg); }
        }
        @keyframes legSwingR {
          0%,100% { transform: rotate(-20deg); }
          50%      { transform: rotate(20deg); }
        }
        @keyframes bubblePop {
          0%   { opacity: 0; transform: scale(0.7) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chatSlide {
          0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-5px); }
        }
        .jog-body    { animation: jog 0.5s ease-in-out infinite; }
        .arm-left    { animation: armSwing 0.5s ease-in-out infinite; transform-origin: top center; }
        .arm-right   { animation: armSwing 0.5s ease-in-out infinite reverse; transform-origin: top center; }
        .leg-left    { animation: legSwing 0.5s ease-in-out infinite; transform-origin: top center; }
        .leg-right   { animation: legSwingR 0.5s ease-in-out infinite; transform-origin: top center; }
        .bubble-pop  { animation: bubblePop 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .chat-slide  { animation: chatSlide 0.25s ease-out forwards; }
        .typing-dot  { width:6px; height:6px; border-radius:50%; background:#07b3f2; display:inline-block; animation: typingBounce 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .msg-scroll::-webkit-scrollbar { width: 3px; }
        .msg-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* Greeting bubble */}
      {showGreeting && !open && !dismissed && (
        <div
          className="bubble-pop fixed bottom-28 right-6 z-[999] max-w-[220px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <div className="bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-4 py-3 relative">
            <button
              onClick={() => { setDismissed(true); setShowGreeting(false); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
            >✕</button>
            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
              👋 Hi! Want me to walk you through how <span className="text-[#07b3f2] font-bold">MyVisa</span> works?
            </p>
            <button
              onClick={() => { setShowGreeting(false); setOpen(true); }}
              className="mt-2 w-full bg-[#07b3f2] text-white text-[11px] font-bold py-1.5 rounded-xl hover:bg-[#0596cf] transition-all"
            >
              Yes, show me! 🚀
            </button>
          </div>
          {/* Bubble tail */}
          <div style={{ position: 'absolute', bottom: -6, right: 20, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid white', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))' }} />
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="chat-slide fixed bottom-28 right-6 z-[999] w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: 460, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #07b3f2, #055fa3)' }} className="px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <BabyIcon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm">Vee</p>
              <p className="text-white/70 text-[10px] font-medium">MyVisa AI Guide</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-all"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto msg-scroll px-4 py-3 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mb-0.5" style={{ background: 'linear-gradient(135deg, #07b3f2, #055fa3)' }}>
                    <BabyIcon size={14} />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed font-medium"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #07b3f2, #055fa3)', color: 'white', borderBottomRightRadius: 4 }
                    : { background: '#f3f7f9', color: '#1a202c', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #07b3f2, #055fa3)' }}>
                  <BabyIcon size={14} />
                </div>
                <div className="px-3 py-2.5 rounded-2xl bg-[#f3f7f9] flex items-center gap-1" style={{ borderBottomLeftRadius: 4 }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions — show only at start */}
          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => sendMessage(), 0); setInput(q); }}
                  className="text-[10px] font-bold text-[#07b3f2] bg-[#e8f6fd] border border-[#07b3f2]/20 px-2.5 py-1 rounded-full hover:bg-[#07b3f2] hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-100 px-3 py-2.5 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 bg-[#f3f7f9] rounded-xl px-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 border border-transparent focus:border-[#07b3f2]/30 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #07b3f2, #055fa3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating jogging baby button */}
      <button
        onClick={() => { setOpen(o => !o); setShowGreeting(false); }}
        className="fixed bottom-6 right-6 z-[999] flex flex-col items-center gap-1 group"
        title="Chat with Vee"
      >
        {/* Glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-60 transition-opacity"
            style={{ background: 'radial-gradient(circle, #07b3f2 0%, transparent 70%)', transform: 'scale(1.4)' }}
          />
          {/* Button circle */}
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #07b3f2, #055fa3)', boxShadow: '0 8px 24px rgba(7,179,242,0.4)' }}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <div className="jog-body">
                <BabyIcon size={36} color="white" />
              </div>
            )}
          </div>

          {/* Unread dot */}
          {!open && !greeted && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[8px] font-black">1</span>
            </div>
          )}
        </div>
        <span className="text-[10px] font-black text-[#07b3f2] bg-white px-2 py-0.5 rounded-full shadow-sm border border-[#07b3f2]/20">
          {open ? 'Close' : 'Ask Vee'}
        </span>
      </button>
    </>
  );
}

// Cute baby running SVG icon
function BabyIcon({ size = 32, color = '#07b3f2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="24" cy="10" r="7" fill={color} />
      {/* Eyes */}
      <circle cx="21.5" cy="9" r="1.2" fill="white" />
      <circle cx="26.5" cy="9" r="1.2" fill="white" />
      <circle cx="21.8" cy="9.3" r="0.6" fill="#1a202c" />
      <circle cx="26.8" cy="9.3" r="0.6" fill="#1a202c" />
      {/* Smile */}
      <path d="M21 12 Q24 14.5 27 12" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="19" y="18" width="10" height="11" rx="4" fill={color} />
      {/* Left arm */}
      <g className="arm-left" style={{ transformOrigin: '19px 19px' }}>
        <rect x="13" y="18" width="7" height="3" rx="1.5" fill={color} />
      </g>
      {/* Right arm */}
      <g className="arm-right" style={{ transformOrigin: '29px 19px' }}>
        <rect x="29" y="18" width="7" height="3" rx="1.5" fill={color} />
      </g>
      {/* Left leg */}
      <g className="leg-left" style={{ transformOrigin: '21px 29px' }}>
        <rect x="19" y="29" width="4" height="9" rx="2" fill={color} />
      </g>
      {/* Right leg */}
      <g className="leg-right" style={{ transformOrigin: '27px 29px' }}>
        <rect x="25" y="29" width="4" height="9" rx="2" fill={color} />
      </g>
    </svg>
  );
}