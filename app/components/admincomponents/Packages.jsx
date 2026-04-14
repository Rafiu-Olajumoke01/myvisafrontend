'use client';
import React, { useState, useEffect } from 'react';

// ── Icons ──────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VISA_CATEGORIES = [
  { value: 'student', label: 'Student', emoji: '🎓', dot: '#7c3aed', bg: 'rgba(124,58,237,0.10)', text: '#7c3aed' },
  { value: 'tourist', label: 'Tourist', emoji: '✈️', dot: '#0284c7', bg: 'rgba(2,132,199,0.10)', text: '#0284c7' },
  { value: 'business', label: 'Business', emoji: '🏢', dot: '#d97706', bg: 'rgba(217,119,6,0.10)', text: '#d97706' },
  { value: 'medical', label: 'Medical', emoji: '🏥', dot: '#dc2626', bg: 'rgba(220,38,38,0.10)', text: '#dc2626' },
];
const DEGREE_TYPES = ['BSc', 'BA', 'MSc', 'MA', 'MBA', 'PhD', 'HND', 'OND', 'Diploma', 'Certificate', 'Other'];
const getCategoryInfo = (value) => VISA_CATEGORIES.find(c => c.value === value) || null;

const emptyFormData = {
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

const API_BASE = 'https://web-production-f50dc.up.railway.app/api/packages';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
});

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .pm-root * { box-sizing: border-box; }
    .pm-root {
      font-family: 'DM Sans', sans-serif;
      --blue: #07b3f2; --blue-dark: #0284c7;
      --ink: #0a0f1e; --ink2: #1e293b;
      --muted: #64748b; --border: #e2e8f0;
      --surface: #f8fafc; --white: #ffffff;
    }

    @keyframes pm-fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pm-fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pm-slideUp { from { opacity:0; transform:translateY(24px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes pm-shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }

    .pm-fade { animation: pm-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
    .pm-fade-1 { animation-delay: 0.04s; }
    .pm-fade-2 { animation-delay: 0.10s; }
    .pm-fade-3 { animation-delay: 0.16s; }

    .pm-card {
      background: white; border: 1px solid #e2e8f0; border-radius: 18px;
      overflow: hidden; display: flex; flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pm-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

    .pm-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700;
    }
    .pm-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

    .pm-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 20px; border-radius: 11px; border: none;
      background: linear-gradient(135deg, #07b3f2, #0284c7);
      color: white; font-size: 13px; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      box-shadow: 0 3px 12px rgba(7,179,242,0.28);
    }
    .pm-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .pm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .pm-btn-ghost {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 7px 14px; border-radius: 9px; border: 1.5px solid #e2e8f0;
      background: white; color: #475569; font-size: 12px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .pm-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; }

    .pm-btn-danger {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 7px 14px; border-radius: 9px; border: 1.5px solid rgba(239,68,68,0.2);
      background: rgba(239,68,68,0.06); color: #dc2626; font-size: 12px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .pm-btn-danger:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); }

    .pm-input {
      width: 100%; padding: 10px 13px; border-radius: 11px;
      border: 1.5px solid #e2e8f0; background: white;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1e293b;
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .pm-input:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,0.10); }
    .pm-input::placeholder { color: #94a3b8; }

    .pm-select {
      width: 100%; padding: 10px 36px 10px 13px; border-radius: 11px;
      border: 1.5px solid #e2e8f0; background: white;
      font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1e293b;
      outline: none; cursor: pointer; transition: border-color 0.15s; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 13px center;
    }
    .pm-select:focus { border-color: #07b3f2; box-shadow: 0 0 0 3px rgba(7,179,242,0.10); }

    .pm-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 5px; display: block; }

    .pm-check-label {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      padding: 8px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      transition: all 0.15s; font-size: 12px; font-weight: 500; color: #475569;
    }
    .pm-check-label:hover { border-color: #07b3f2; background: rgba(7,179,242,0.04); color: #0284c7; }

    .pm-modal-overlay {
      position: fixed; inset: 0; background: rgba(10,15,30,0.6);
      backdrop-filter: blur(8px); z-index: 50;
      display: flex; align-items: flex-start; justify-content: center;
      padding: 24px; overflow-y: auto; animation: pm-fadeIn 0.2s ease;
    }
    .pm-modal {
      background: white; border-radius: 22px; width: 100%; max-width: 680px;
      margin: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.22);
      animation: pm-slideUp 0.35s cubic-bezier(0.22,1,0.36,1);
    }

    .pm-section {
      background: #f8fafc; border: 1px solid #f0f4f8; border-radius: 14px; padding: 16px 18px;
    }
    .pm-section-title { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }

    .pm-skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% auto; animation: pm-shimmer 1.4s linear infinite; border-radius: 12px;
    }

    .pm-drag-zone {
      border: 2px dashed #e2e8f0; border-radius: 14px; padding: 24px;
      text-align: center; cursor: pointer; transition: all 0.2s;
    }
    .pm-drag-zone:hover, .pm-drag-zone.dragging { border-color: #07b3f2; background: rgba(7,179,242,0.04); }
  `}</style>
);

const Field = ({ label, children }) => (
  <div>
    <label className="pm-label">{label}</label>
    {children}
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="pm-check-label">
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 14, height: 14, accentColor: '#07b3f2' }} />
    {label}
  </label>
);

function StudentFields({ formData, setFormData }) {
  const [logoLoading, setLogoLoading] = useState(false);
  useEffect(() => {
    if (!formData.university_name || formData.university_name.length < 4) return;
    const timer = setTimeout(async () => {
      setLogoLoading(true);
      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(formData.university_name)}`);
        const data = await res.json();
        if (data?.[0]?.logo) setFormData(f => ({ ...f, university_logo: data[0].logo }));
      } catch (_) { }
      setLogoLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.university_name]);

  const coursePreview = [formData.degree_type, formData.course ? `in ${formData.course}` : '', formData.university_name ? `at ${formData.university_name}` : ''].filter(Boolean).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Field label="University / School Name *">
            <input className="pm-input" type="text" required value={formData.university_name}
              onChange={e => setFormData(f => ({ ...f, university_name: e.target.value }))}
              placeholder="e.g., University of Toronto" />
          </Field>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 22 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', overflow: 'hidden' }}>
            {logoLoading ? <div style={{ width: 16, height: 16, border: '2px solid #07b3f2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'pm-spin 0.7s linear infinite' }} />
              : formData.university_logo ? <img src={formData.university_logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                : <span style={{ fontSize: 20 }}>🏫</span>}
          </div>
          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Auto logo</span>
        </div>
      </div>

      {coursePreview && (
        <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 700, marginBottom: 2 }}>PREVIEW</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6' }}>🎓 {coursePreview}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Degree Type *">
          <select className="pm-select" required value={formData.degree_type} onChange={e => setFormData(f => ({ ...f, degree_type: e.target.value }))}>
            <option value="">— Select —</option>
            {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Course Name *">
          <input className="pm-input" type="text" required value={formData.course} onChange={e => setFormData(f => ({ ...f, course: e.target.value }))} placeholder="e.g., Computer Engineering" />
        </Field>
        <Field label="City *">
          <input className="pm-input" type="text" required value={formData.course_city} onChange={e => setFormData(f => ({ ...f, course_city: e.target.value }))} placeholder="e.g., Toronto" />
        </Field>
        <Field label="Duration *">
          <input className="pm-input" type="text" required value={formData.course_duration} onChange={e => setFormData(f => ({ ...f, course_duration: e.target.value }))} placeholder="e.g., 4 years" />
        </Field>
        <Field label="Tuition Fee">
          <input className="pm-input" type="text" value={formData.tuition_fees} onChange={e => setFormData(f => ({ ...f, tuition_fees: e.target.value }))} placeholder="$25,000/year" />
        </Field>
        <Field label="Application Fees">
          <input className="pm-input" type="text" value={formData.application_fees} onChange={e => setFormData(f => ({ ...f, application_fees: e.target.value }))} placeholder="$150" />
        </Field>
        <Field label="Processing Time">
          <input className="pm-input" type="text" value={formData.processing_time} onChange={e => setFormData(f => ({ ...f, processing_time: e.target.value }))} placeholder="6–8 weeks" />
        </Field>
        <Field label="Post Study Work Visa">
          <select className="pm-select" value={formData.post_study_work_visa} onChange={e => setFormData(f => ({ ...f, post_study_work_visa: e.target.value }))}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
      </div>
      <Field label="What to Expect">
        <textarea className="pm-input" rows={2} style={{ resize: 'none' }} value={formData.course_expectations} onChange={e => setFormData(f => ({ ...f, course_expectations: e.target.value }))} placeholder="Hands-on labs, internship opportunities..." />
      </Field>
      <Field label="Visa Required">
        <select className="pm-select" value={formData.visa_required} onChange={e => setFormData(f => ({ ...f, visa_required: e.target.value }))}>
          <option value="">— Select —</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>
    </div>
  );
}

function TouristFields({ formData, setFormData }) {
  const toggle = key => setFormData(f => ({ ...f, [key]: !f[key] }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Trip Duration (days) *"><input className="pm-input" type="number" required value={formData.trip_duration} onChange={e => setFormData(f => ({ ...f, trip_duration: e.target.value }))} placeholder="7" /></Field>
        <Field label="Location *"><input className="pm-input" type="text" required value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} placeholder="Paris, France" /></Field>
        <Field label="Cost *"><input className="pm-input" type="text" required value={formData.cost} onChange={e => setFormData(f => ({ ...f, cost: e.target.value }))} placeholder="$2,500" /></Field>
        <Field label="Processing Time"><input className="pm-input" type="text" value={formData.processing_time} onChange={e => setFormData(f => ({ ...f, processing_time: e.target.value }))} placeholder="3–5 days" /></Field>
      </div>
      <Field label="What does the cost cover?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 2 }}>
          <Checkbox label="✈️ Flight" checked={formData.covers_flight} onChange={() => toggle('covers_flight')} />
          <Checkbox label="🛂 Visa (if applicable)" checked={formData.covers_visa} onChange={() => toggle('covers_visa')} />
          <Checkbox label="🚗 Airport Pickup" checked={formData.covers_airport_pickup} onChange={() => toggle('covers_airport_pickup')} />
          <Checkbox label="🏨 Accommodation" checked={formData.covers_accommodation} onChange={() => toggle('covers_accommodation')} />
          <Checkbox label="🗺️ Daily Tours" checked={formData.covers_daily_tours} onChange={() => toggle('covers_daily_tours')} />
          <Checkbox label="🍽️ Daily Food" checked={formData.covers_food} onChange={() => toggle('covers_food')} />
          <Checkbox label="🚌 Local Transport" checked={formData.covers_local_transport} onChange={() => toggle('covers_local_transport')} />
        </div>
      </Field>
      <Field label="Visa Required">
        <select className="pm-select" value={formData.visa_required} onChange={e => setFormData(f => ({ ...f, visa_required: e.target.value }))}>
          <option value="">— Select —</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>
    </div>
  );
}

function BusinessFields({ formData, setFormData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Field label="Country *"><input className="pm-input" type="text" required value={formData.country} onChange={e => setFormData(f => ({ ...f, country: e.target.value }))} placeholder="e.g., Germany" /></Field>
      <Field label="Visa Duration"><input className="pm-input" type="text" value={formData.visa_duration} onChange={e => setFormData(f => ({ ...f, visa_duration: e.target.value }))} placeholder="e.g., 90 days" /></Field>
      <Field label="Processing Time"><input className="pm-input" type="text" value={formData.processing_time} onChange={e => setFormData(f => ({ ...f, processing_time: e.target.value }))} placeholder="2–3 weeks" /></Field>
    </div>
  );
}

function MedicalFields({ formData, setFormData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Hospital Name *"><input className="pm-input" type="text" required value={formData.hospital_name} onChange={e => setFormData(f => ({ ...f, hospital_name: e.target.value }))} placeholder="Toronto General Hospital" /></Field>
        <Field label="City *"><input className="pm-input" type="text" required value={formData.hospital_city} onChange={e => setFormData(f => ({ ...f, hospital_city: e.target.value }))} placeholder="e.g., Toronto" /></Field>
        <Field label="Country *"><input className="pm-input" type="text" required value={formData.country} onChange={e => setFormData(f => ({ ...f, country: e.target.value }))} placeholder="e.g., Canada" /></Field>
        <Field label="Visa Duration"><input className="pm-input" type="text" value={formData.visa_duration} onChange={e => setFormData(f => ({ ...f, visa_duration: e.target.value }))} placeholder="e.g., 90 days" /></Field>
        <Field label="Processing Time"><input className="pm-input" type="text" value={formData.processing_time} onChange={e => setFormData(f => ({ ...f, processing_time: e.target.value }))} placeholder="2–3 weeks" /></Field>
      </div>
      <Field label="What to Expect">
        <textarea className="pm-input" rows={2} style={{ resize: 'none' }} value={formData.medical_expectations} onChange={e => setFormData(f => ({ ...f, medical_expectations: e.target.value }))} placeholder="World-class specialists, modern equipment..." />
      </Field>
    </div>
  );
}

export default function PackagesManager() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE}/admin/`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      let arr = Array.isArray(data) ? data : data.packages || data.results || [];
      setPackages(arr.map(pkg => ({
        ...pkg,
        images: (pkg.images || []).map(img => ({
          ...img,
          image: img.image || ''
        }))
      })));
    } catch (e) { setError('Unable to load packages.'); setPackages([]); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 20) { alert('Maximum 20 images allowed'); return; }
    setImageFiles(files); setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };
  const removeImage = i => { setImageFiles(f => f.filter((_, idx) => idx !== i)); setImagePreviews(p => p.filter((_, idx) => idx !== i)); };
  const clearAllImages = () => { setImageFiles([]); setImagePreviews([]); };

  const buildFormData = (data, files) => {
    const fd = new FormData();
    Object.keys(data).forEach(k => {
      const val = data[k];
      if (k === 'price' && data.is_free) fd.append(k, '');
      else if (val === null || val === undefined) fd.append(k, '');
      else fd.append(k, val);
    });
    files.forEach(f => fd.append('images', f));
    return fd;
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) { alert('Please upload at least one image'); return; }
    try {
      const res = await fetch(`${API_BASE}/admin/`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: buildFormData(formData, imageFiles)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      await fetchPackages(); resetForm(); setShowCreateModal(false);
    } catch (e) { alert(`Failed: ${e.message}`); }
  };

  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/${editingPackage.id}/`, {
        method: 'PUT',
        headers: { ...authHeaders() },
        body: buildFormData(formData, imageFiles)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      await fetchPackages(); resetForm(); setShowEditModal(false); setEditingPackage(null);
    } catch (e) { alert(`Failed: ${e.message}`); }
  };

  const handleDeletePackage = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/${deletingPackage.id}/`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error('Failed');
      await fetchPackages(); setShowDeleteConfirm(false); setDeletingPackage(null);
    } catch (e) { alert('Failed to delete.'); }
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({ ...emptyFormData, ...pkg, requirements: Array.isArray(pkg.requirements) ? pkg.requirements.join('\n') : pkg.requirements || '' });
    if (pkg.images?.length > 0) setImagePreviews(pkg.images.map(img => img.image));
    setImageFiles([]); setShowEditModal(true);
  };

  const resetForm = () => { setFormData(emptyFormData); setImageFiles([]); setImagePreviews([]); };

  const filtered = packages.filter(pkg => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (pkg.country || '').toLowerCase().includes(q) || (pkg.title || '').toLowerCase().includes(q);
  });

  const catCounts = VISA_CATEGORIES.map(c => ({ ...c, count: packages.filter(p => p.category === c.value).length }));

  return (
    <div className="pm-root">
      <GlobalStyles />

      <div className="pm-fade pm-fade-1" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: '#0a0f1e', lineHeight: 1.1 }}>Packages</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{packages.length} packages · manage your visa offerings</div>
        </div>
        <button className="pm-btn-primary" onClick={() => setShowCreateModal(true)}>
          <PlusIcon /> Create Package
        </button>
      </div>

      <div className="pm-fade pm-fade-2" style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {catCounts.map(c => (
          <div key={c.value} className="pm-badge" style={{ background: c.bg, color: c.text, padding: '5px 12px', fontSize: 11 }}>
            <span className="pm-badge-dot" style={{ background: c.dot }} />
            {c.emoji} {c.label} · {c.count}
          </div>
        ))}
      </div>

      <div className="pm-fade pm-fade-2" style={{ marginBottom: 20 }}>
        <input className="pm-input" type="text" placeholder="🔍  Search by country or title..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {error && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Connection Issue</div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>{error}</div>
          </div>
          <button className="pm-btn-primary" onClick={fetchPackages} style={{ padding: '7px 16px', fontSize: 12 }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="pm-skeleton" style={{ height: 240, borderRadius: 18 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{searchQuery ? 'No packages found' : 'No packages yet'}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>{searchQuery ? 'Try a different search' : 'Create your first visa package'}</div>
          {!searchQuery && <button className="pm-btn-primary" onClick={() => setShowCreateModal(true)}><PlusIcon /> Create Package</button>}
        </div>
      ) : (
        <div className="pm-fade pm-fade-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map((pkg, i) => {
            const cat = getCategoryInfo(pkg.category);
            const pkgTitle = pkg.category === 'student' && pkg.degree_type && pkg.course
              ? `${pkg.degree_type} in ${pkg.course}`
              : pkg.category === 'medical' && pkg.hospital_name
                ? `Treatment at ${pkg.hospital_name}`
                : pkg.title || '—';
            const pkgSub = pkg.course_city || pkg.hospital_city || pkg.country || pkg.location || '—';

            return (
              <div key={pkg.id} className="pm-card" style={{ animationDelay: `${i * 0.03}s` }}>
                <div style={{ position: 'relative', height: 130, background: '#f1f5f9', flexShrink: 0 }}>
                  {pkg.images?.length > 0
                    ? <img src={pkg.images[0].image} alt={pkgTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><ImageIcon /></div>
                  }
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    {cat && <span className="pm-badge" style={{ background: 'rgba(255,255,255,0.92)', color: cat.text, backdropFilter: 'blur(4px)' }}>
                      <span className="pm-badge-dot" style={{ background: cat.dot }} />{cat.emoji} {cat.label}
                    </span>}
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className="pm-badge" style={{ background: pkg.is_active ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white', backdropFilter: 'blur(4px)' }}>
                      {pkg.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat?.emoji} {pkgTitle}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{pkgSub}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    {pkg.is_free
                      ? <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>FREE</span>
                      : <div>
                        <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fee</div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#07b3f2' }}>${pkg.price}</span>
                      </div>
                    }
                    {pkg.processing_time && <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{pkg.processing_time}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                    <button className="pm-btn-ghost" style={{ flex: 1, padding: '6px 10px', fontSize: 11 }} onClick={() => openEditModal(pkg)}>
                      <EditIcon /> Edit
                    </button>
                    <button className="pm-btn-danger" style={{ flex: 1, padding: '6px 10px', fontSize: 11 }} onClick={() => { setDeletingPackage(pkg); setShowDeleteConfirm(true); }}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <PackageFormModal title="Create Package" formData={formData} setFormData={setFormData}
          imageFiles={imageFiles} imagePreviews={imagePreviews}
          handleImageChange={handleImageChange} removeImage={removeImage} clearAllImages={clearAllImages}
          onSubmit={handleCreatePackage} onClose={() => { setShowCreateModal(false); resetForm(); }} />
      )}

      {showEditModal && (
        <PackageFormModal title="Edit Package" formData={formData} setFormData={setFormData}
          imageFiles={imageFiles} imagePreviews={imagePreviews}
          handleImageChange={handleImageChange} removeImage={removeImage} clearAllImages={clearAllImages}
          onSubmit={handleUpdatePackage} isEdit onClose={() => { setShowEditModal(false); setEditingPackage(null); resetForm(); }} />
      )}

      {showDeleteConfirm && deletingPackage && (
        <div className="pm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="pm-modal" style={{ maxWidth: 380, margin: 'auto', padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, background: 'rgba(239,68,68,0.10)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>🗑️</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: '#0a0f1e', marginBottom: 8 }}>Delete Package?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: '#1e293b' }}>{deletingPackage.title || deletingPackage.country}</strong>? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pm-btn-ghost" style={{ flex: 1, padding: '11px' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button onClick={handleDeletePackage} style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', boxShadow: '0 3px 10px rgba(239,68,68,0.28)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageFormModal({ title, formData, setFormData, imageFiles, imagePreviews, handleImageChange, removeImage, clearAllImages, onSubmit, onClose, isEdit = false }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleImageChange({ target: { files } });
  };

  const cat = formData.category;
  const catInfo = getCategoryInfo(cat);

  return (
    <div className="pm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal" style={{ margin: '24px auto', maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#0a0f1e' }}>{title}</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Offer Title *">
                <input className="pm-input" type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Canada Student Visa" />
              </Field>
              <Field label="Category *">
                <select className="pm-select" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">— Select category —</option>
                  {VISA_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Status">
              <select className="pm-select" style={{ maxWidth: 200 }} value={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}>
                <option value="true">✅ Active</option>
                <option value="false">❌ Inactive</option>
              </select>
            </Field>

            {cat && (
              <div className="pm-section">
                <div className="pm-section-title">{catInfo?.emoji} {catInfo?.label} Details</div>
                {cat === 'student' && <StudentFields formData={formData} setFormData={setFormData} />}
                {cat === 'tourist' && <TouristFields formData={formData} setFormData={setFormData} />}
                {cat === 'business' && <BusinessFields formData={formData} setFormData={setFormData} />}
                {cat === 'medical' && <MedicalFields formData={formData} setFormData={setFormData} />}
              </div>
            )}

            <div className="pm-section">
              <div className="pm-section-title">💰 Pricing</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button type="button" onClick={() => setFormData({ ...formData, is_free: false })}
                  style={{ flex: 1, padding: '9px', borderRadius: 10, border: `2px solid ${!formData.is_free ? '#07b3f2' : '#e2e8f0'}`, background: !formData.is_free ? 'rgba(7,179,242,0.08)' : 'white', color: !formData.is_free ? '#0284c7' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                  💳 Paid Package
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, is_free: true })}
                  style={{ flex: 1, padding: '9px', borderRadius: 10, border: `2px solid ${formData.is_free ? '#10b981' : '#e2e8f0'}`, background: formData.is_free ? 'rgba(16,185,129,0.08)' : 'white', color: formData.is_free ? '#059669' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                  🆓 Free Package
                </button>
              </div>
              {!formData.is_free && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Price (USD) *">
                    <input className="pm-input" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="3500.00" />
                  </Field>
                  <Field label="Service Fee (USD)">
                    <input className="pm-input" type="text" value={formData.service_fee} onChange={e => setFormData({ ...formData, service_fee: e.target.value })} placeholder="15" />
                  </Field>
                </div>
              )}
            </div>

            <Field label="Description">
              <textarea className="pm-input" rows={3} style={{ resize: 'none' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Package description..." />
            </Field>

            <Field label="Requirements (one per line)">
              <textarea className="pm-input" rows={3} style={{ resize: 'none', fontFamily: 'monospace', fontSize: 12 }} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder={"Valid passport\nLetter of acceptance\nProof of finances"} />
            </Field>

            <div>
              <label className="pm-label">Images {!isEdit && '*'} (max 20)</label>
              <div
                className={`pm-drag-zone${isDragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
              >
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="pm-img-upload" />
                <label htmlFor="pm-img-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(7,179,242,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><ImageIcon /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{isDragging ? 'Drop images here!' : 'Click or drag & drop'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>PNG, JPG up to 10MB each</div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div style={{ marginTop: 12, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''}</span>
                    {imageFiles.length > 0 && <button type="button" onClick={clearAllImages} style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                    {imagePreviews.map((preview, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={preview} alt="" style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        {imageFiles.length > 0 && (
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <button type="button" className="pm-btn-ghost" style={{ flex: 1, padding: '11px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="pm-btn-primary" style={{ flex: 2, padding: '11px' }}>
                {isEdit ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}