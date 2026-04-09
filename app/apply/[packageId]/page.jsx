'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPage({ params }) {
  const router = useRouter();
  const { packageId } = React.use(params);

  const [packageData, setPackageData] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    passport_number: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchPackage();
    prefillFromProfile();
  }, []);

  const fetchPackage = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/packages/${packageId}/`);
      if (res.ok) {
        const data = await res.json();
        setPackageData(data.package || data);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingPackage(false); }
  };

  const prefillFromProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }

      const res = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) { router.push('/login'); return; }

      if (res.ok) {
        const data = await res.json();
        const updates = {};

        // Read first_name and last_name directly from the API
        if (data.first_name) updates.first_name  = data.first_name;
        if (data.last_name)  updates.last_name   = data.last_name;
        if (data.email)      updates.email        = data.email;
        if (data.phone)      updates.phone        = data.phone;
        if (data.country)    updates.country      = data.country;
        if (data.country)    updates.nationality  = data.country;

        setFormData(prev => ({ ...prev, ...updates }));
      }
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      // Combine first + last into full_name for the backend
      const payload = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        package: packageId,
      };
      const res = await fetch('http://127.0.0.1:8000/api/applications/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/application/${data.application.id}`);
      } else {
        setError(
          data.error ||
          Object.values(data.errors || {}).flat().join(', ') ||
          'Something went wrong. Please try again.'
        );
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid =
    formData.first_name &&
    formData.last_name &&
    formData.email &&
    formData.phone &&
    formData.nationality &&
    formData.passport_number &&
    formData.date_of_birth;

  const isStep2Valid = formData.address && formData.city && formData.country;

  const inputClass = 'w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all bg-gray-50 focus:bg-white';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f3f7f9] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden mt-5">
        <div className="w-full max-w-2xl flex flex-col gap-5">

          {/* Package Summary */}
          {!loadingPackage && packageData && (
            <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applying for</p>
                <p className="text-sm font-black text-gray-800">{packageData.country} — {packageData.visa_type || 'Student Visa'}</p>
              </div>
              <p className="text-lg font-black text-[#07b3f2]">${packageData.price}</p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {['Personal Information', 'Address Details'].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${i + 1 < step ? 'bg-[#07b3f2] text-white' : i + 1 === step ? 'bg-[#07b3f2] text-white ring-4 ring-[#07b3f2]/20' : 'bg-gray-200 text-gray-400'}`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap
                    ${i + 1 === step ? 'text-[#07b3f2]' : i + 1 < step ? 'text-gray-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 transition-all duration-500 ${i + 1 < step ? 'bg-[#07b3f2]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

            {step === 1 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Personal Information</h2>

                {/* Passport notice — bold and prominent */}
                <div className="flex items-start gap-2 bg-[#07b3f2]/8 border border-[#07b3f2]/20 rounded-xl px-4 py-3 mb-6">
                  <svg className="w-4 h-4 text-[#07b3f2] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-[#0284c7] leading-relaxed">
                    <span className="font-black text-[#0284c7]">Enter your name exactly as written in your passport.</span>{' '}
                    Any mismatch may cause delays or rejection of your application.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  {/* First Name + Last Name side by side */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="As in passport"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="As in passport"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Email Address <span className="text-red-400">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="you@email.com" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+234 801 234 5678" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Nationality <span className="text-red-400">*</span></label>
                    <input type="text" name="nationality" value={formData.nationality} onChange={handleChange}
                      placeholder="e.g. Nigerian" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Passport Number <span className="text-red-400">*</span></label>
                    <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange}
                      placeholder="e.g. A12345678" className={inputClass} />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                      className={`${inputClass} text-gray-700`} />
                  </div>

                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Address Details</h2>
                <p className="text-xs text-gray-400 mb-6">Your current residential address</p>
                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Street Address <span className="text-red-400">*</span></label>
                    <textarea name="address" value={formData.address} onChange={handleChange}
                      placeholder="House number, street name, area" rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all resize-none bg-gray-50 focus:bg-white" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">City <span className="text-red-400">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                      placeholder="e.g. Lagos" className={inputClass} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Country <span className="text-red-400">*</span></label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange}
                      placeholder="e.g. Nigeria" className={inputClass} />
                  </div>

                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-600 font-semibold">⚠ {error}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-all">
                ← Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(2)} disabled={!isStep1Valid}
                className="flex-1 py-3.5 bg-[#07b3f2] text-white text-sm font-bold rounded-2xl hover:bg-[#0596cf] transition-all shadow-lg shadow-[#07b3f2]/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!isStep2Valid || submitting}
                className="flex-1 py-3.5 bg-[#07b3f2] text-white text-sm font-bold rounded-2xl hover:bg-[#0596cf] transition-all shadow-lg shadow-[#07b3f2]/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  : 'Submit Application →'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}