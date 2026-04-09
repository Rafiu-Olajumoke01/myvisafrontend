'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const RAPIDAPI_KEY = 'b07cd121admshd8d29393e97d3f7p10cbb5jsn33338f7203f7';

// ─── Country name → ISO 2-letter code ────────────────────────────────────────
const COUNTRY_TO_CODE = {
  "Afghanistan":"AF","Albania":"AL","Algeria":"DZ","Angola":"AO","Argentina":"AR",
  "Armenia":"AM","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahrain":"BH",
  "Bangladesh":"BD","Belarus":"BY","Belgium":"BE","Bolivia":"BO","Brazil":"BR",
  "Bulgaria":"BG","Cambodia":"KH","Cameroon":"CM","Canada":"CA","Chile":"CL",
  "China":"CN","Colombia":"CO","Croatia":"HR","Czech Republic":"CZ","Denmark":"DK",
  "Ecuador":"EC","Egypt":"EG","Ethiopia":"ET","Finland":"FI","France":"FR",
  "Germany":"DE","Ghana":"GH","Greece":"GR","Hungary":"HU","Iceland":"IS",
  "India":"IN","Indonesia":"ID","Iran":"IR","Iraq":"IQ","Ireland":"IE",
  "Israel":"IL","Italy":"IT","Jamaica":"JM","Japan":"JP","Jordan":"JO",
  "Kazakhstan":"KZ","Kenya":"KE","Kuwait":"KW","Latvia":"LV","Lebanon":"LB",
  "Lithuania":"LT","Luxembourg":"LU","Malaysia":"MY","Mexico":"MX","Moldova":"MD",
  "Morocco":"MA","Mozambique":"MZ","Myanmar":"MM","Nepal":"NP","Netherlands":"NL",
  "New Zealand":"NZ","Nigeria":"NG","Norway":"NO","Oman":"OM","Pakistan":"PK",
  "Peru":"PE","Philippines":"PH","Poland":"PL","Portugal":"PT","Qatar":"QA",
  "Romania":"RO","Russia":"RU","Rwanda":"RW","Saudi Arabia":"SA","Senegal":"SN",
  "Serbia":"RS","Singapore":"SG","Slovakia":"SK","Slovenia":"SI","Somalia":"SO",
  "South Africa":"ZA","South Korea":"KR","Spain":"ES","Sri Lanka":"LK",
  "Sudan":"SD","Sweden":"SE","Switzerland":"CH","Syria":"SY","Taiwan":"TW",
  "Tanzania":"TZ","Thailand":"TH","Togo":"TG","Tunisia":"TN","Turkey":"TR",
  "Uganda":"UG","Ukraine":"UA","United Arab Emirates":"AE","United Kingdom":"GB",
  "United States":"US","Uruguay":"UY","Uzbekistan":"UZ","Venezuela":"VE",
  "Vietnam":"VN","Yemen":"YE","Zambia":"ZM","Zimbabwe":"ZW",
  "USA":"US","U.S.A":"US","U.S":"US","United State":"US","United States of America":"US",
  "UK":"GB","U.K":"GB","U.A.E":"AE","UAE":"AE","Korea":"KR","North Korea":"KP",
  "Ivory Coast":"CI","Congo":"CG","DR Congo":"CD","Czech":"CZ","Holland":"NL",
};

const fetchVisaMapForPassport = async (passportCountry) => {
  const passportCode = COUNTRY_TO_CODE[passportCountry];
  if (!passportCode) return null;
  try {
    const response = await fetch('https://visa-requirement.p.rapidapi.com/v2/visa/map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'visa-requirement.p.rapidapi.com',
      },
      body: JSON.stringify({ passport: passportCode }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const colors = data?.data?.colors || data?.colors;
    if (!colors) return null;
    const noVisaSet = new Set();
    const visaRequiredSet = new Set();
    Object.entries(colors).forEach(([colorKey, codeStr]) => {
      const codes = (codeStr || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      if (colorKey.toLowerCase().includes('red')) codes.forEach(c => visaRequiredSet.add(c));
      else codes.forEach(c => noVisaSet.add(c));
    });
    return { visaRequiredSet, noVisaSet };
  } catch { return null; }
};

const checkVisaFromMap = (visaMap, destinationCountry) => {
  if (!visaMap) return null;
  const destCode = COUNTRY_TO_CODE[destinationCountry];
  if (!destCode) return null;
  if (visaMap.visaRequiredSet.has(destCode)) return true;
  if (visaMap.noVisaSet.has(destCode)) return false;
  return null;
};

// ─── Visa Eligibility Card ────────────────────────────────────────────────────
function VisaEligibilityCard({ destinationCountry, userCountry }) {
  const [visaStatus, setVisaStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (userCountry && destinationCountry) runVisaCheck(userCountry);
  }, [userCountry, destinationCountry]);

  const runVisaCheck = async (passport) => {
    if (!passport || !destinationCountry) return;
    setLoading(true); setChecked(false);
    const visaMap = await fetchVisaMapForPassport(passport);
    const result = checkVisaFromMap(visaMap, destinationCountry);
    setVisaStatus(result); setLoading(false); setChecked(true);
  };

  if (userCountry) {
    return (
      <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Visa Eligibility</p>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid #07b3f2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Checking your eligibility...</span>
          </div>
        ) : checked ? (
          visaStatus === null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Visa info unavailable for your passport</span>
            </div>
          ) : visaStatus ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '1px solid #fdba74' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#9a3412', margin: 0 }}>Visa Required</p>
                <p style={{ fontSize: '11px', color: '#c2410c', margin: '2px 0 0' }}>You'll need a visa to visit {destinationCountry}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: '1px solid #6ee7b7' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', margin: 0 }}>No Visa Needed</p>
                <p style={{ fontSize: '11px', color: '#047857', margin: '2px 0 0' }}>Your passport gets visa-free access</p>
              </div>
            </div>
          )
        ) : null}
        <p style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '8px', fontWeight: '500' }}>Based on your passport: {userCountry}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Visa Eligibility</p>
      <p style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.5', margin: 0 }}>
        <span style={{ fontWeight: '600' }}>Sign in</span> to instantly check if you need a visa for {destinationCountry} based on your passport.
      </p>
    </div>
  );
}

// ─── Hero Image Slider ────────────────────────────────────────────────────────
function HeroImageSlider({ images, country }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, currentIndex]);

  const nextImage = () => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev + 1) % images.length); };
  const prevImage = () => { setIsAutoPlaying(false); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };
  const goToImage = (index) => { setIsAutoPlaying(false); setCurrentIndex(index); };

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[450px] overflow-hidden bg-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-lg">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative h-[450px] overflow-hidden group">
      {images.map((img, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
          <img src={typeof img === 'string' ? img : img.image} alt={`${country} ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
      {images.length > 1 && (
        <>
          <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-30 border border-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-30 border border-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30 px-4">
          {images.map((img, index) => (
            <button key={index} onClick={() => goToImage(index)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-white scale-110 shadow-xl' : 'border-white/40 hover:border-white/70 opacity-70 hover:opacity-100'}`}>
              <img src={typeof img === 'string' ? img : img.image} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl z-30">
        <span className="text-white text-sm font-bold">{currentIndex + 1} / {images.length}</span>
      </div>
      {isAutoPlaying && images.length > 1 && (
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-30 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">Auto-playing</span>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar: Student ─────────────────────────────────────────────────────────
function StudentSidebar({ pkg, isSaved, saveLoading, onSave, onApply }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 sticky top-10 overflow-hidden">
      <div className="space-y-6">

        {/* Free Service Fee */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
          <p className="text-3xl font-black text-[#07b3f2] tracking-tight">FREE</p>
          <p className="text-[11px] text-gray-400 mt-1">No service charge for students</p>
        </div>

        {/* Course details */}
        <div className="space-y-3">
          {pkg.degree_type && pkg.course && (
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 pt-0.5">Course</p>
              <p className="text-sm font-semibold text-gray-700 text-right">{pkg.degree_type} in {pkg.course}</p>
            </div>
          )}
          {pkg.university_name && (
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 pt-0.5">University</p>
              <p className="text-sm font-semibold text-gray-700 text-right">{pkg.university_name}</p>
            </div>
          )}
          {pkg.course_city && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">City</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.course_city}</p>
            </div>
          )}
          {pkg.course_duration && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Duration</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.course_duration}</p>
            </div>
          )}
          {pkg.tuition_fees && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Tuition Fee</p>
              <p className="text-sm font-semibold text-[#07b3f2]">{pkg.tuition_fees}</p>
            </div>
          )}
          {pkg.application_fees && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">App. Fee</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.application_fees}</p>
            </div>
          )}
          {pkg.processing_time && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Processing</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.processing_time}</p>
            </div>
          )}
          {pkg.post_study_work_visa && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Post-Study Work</p>
              <p className={`text-sm font-semibold ${pkg.post_study_work_visa === 'yes' ? 'text-green-600' : 'text-red-500'}`}>
                {pkg.post_study_work_visa === 'yes' ? 'Available' : 'Not Available'}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3 border-t border-gray-100">
          <button onClick={onSave} disabled={saveLoading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60
              ${isSaved ? 'bg-[#07b3f2] border-[#07b3f2] text-white' : 'border-[#07b3f2] text-[#07b3f2] hover:bg-[#07b3f2] hover:text-white'}`}>
            {saveLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span>{isSaved ? 'SAVED' : 'SAVE FOR LATER'}</span>}
          </button>
          <button onClick={onApply}
            className="w-full bg-[#07b3f2] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#0891c7] shadow-xl shadow-[#07b3f2]/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider">
            Apply Now
          </button>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Verified Secure Application</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar: Medical ─────────────────────────────────────────────────────────
function MedicalSidebar({ pkg, isSaved, saveLoading, onSave, onApply, userCountry }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 sticky top-10 overflow-hidden">
      <div className="space-y-6">

        {/* Service Fee */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
          <p className="text-3xl font-black text-[#07b3f2] tracking-tight">
            {pkg.is_free ? 'FREE' : `$${pkg.service_fee || pkg.price || '15'}`}
          </p>
        </div>

        {/* Hospital details */}
        <div className="space-y-3">
          {pkg.hospital_name && (
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 pt-0.5">Hospital</p>
              <p className="text-sm font-semibold text-gray-700 text-right">{pkg.hospital_name}</p>
            </div>
          )}
          {pkg.hospital_city && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">City</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.hospital_city}</p>
            </div>
          )}
          {pkg.country && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Country</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.country}</p>
            </div>
          )}
          {pkg.visa_duration && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Visa Duration</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.visa_duration}</p>
            </div>
          )}
          {pkg.processing_time && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Processing</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.processing_time}</p>
            </div>
          )}
        </div>

        {/* Visa Eligibility */}
        <div className="pt-2 border-t border-gray-100">
          <VisaEligibilityCard destinationCountry={pkg.country} userCountry={userCountry} />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button onClick={onSave} disabled={saveLoading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60
              ${isSaved ? 'bg-[#07b3f2] border-[#07b3f2] text-white' : 'border-[#07b3f2] text-[#07b3f2] hover:bg-[#07b3f2] hover:text-white'}`}>
            {saveLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span>{isSaved ? 'SAVED' : 'SAVE FOR LATER'}</span>}
          </button>
          <button onClick={onApply}
            className="w-full bg-[#07b3f2] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#0891c7] shadow-xl shadow-[#07b3f2]/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider">
            Start Application
          </button>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Verified Secure Application</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar: Tourist / Business (default) ───────────────────────────────────
function DefaultSidebar({ pkg, isSaved, saveLoading, onSave, onApply, userCountry }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 sticky top-10 overflow-hidden">
      <div className="space-y-6">

        {/* Service fee */}
        <div className="pb-4 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
          <p className="text-3xl font-black text-[#07b3f2] tracking-tight">
            {pkg.is_free ? 'FREE' : `$${pkg.service_fee || '15'}`}
          </p>
        </div>

        <div className="space-y-3">
          {pkg.processing_time && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Processing</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.processing_time}</p>
            </div>
          )}
          {pkg.trip_duration && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Trip Duration</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.trip_duration} days</p>
            </div>
          )}
          {pkg.cost && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Trip Cost</p>
              <p className="text-sm font-semibold text-[#07b3f2]">{pkg.cost}</p>
            </div>
          )}
          {pkg.visa_duration && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Visa Duration</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.visa_duration}</p>
            </div>
          )}
          {pkg.country && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Country</p>
              <p className="text-sm font-semibold text-gray-700">{pkg.country}</p>
            </div>
          )}
        </div>

        {/* Visa Eligibility */}
        <div className="pt-2 border-t border-gray-100">
          <VisaEligibilityCard
            destinationCountry={pkg.country || pkg.location}
            userCountry={userCountry}
          />
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-2">
          <button onClick={onSave} disabled={saveLoading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60
              ${isSaved ? 'bg-[#07b3f2] border-[#07b3f2] text-white' : 'border-[#07b3f2] text-[#07b3f2] hover:bg-[#07b3f2] hover:text-white'}`}>
            {saveLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span>{isSaved ? 'SAVED' : 'SAVE FOR LATER'}</span>}
          </button>
          <button onClick={onApply}
            className="w-full bg-[#07b3f2] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#0891c7] shadow-xl shadow-[#07b3f2]/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider">
            Start Application
          </button>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Verified Secure Application</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PackageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const packageId = parseInt(id);

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState(null);

  const API_BASE = 'http://localhost:8000/api/packages';
  const BOOKMARKS_API = 'http://localhost:8000/api/bookmarks';

  useEffect(() => {
    fetchPackageDetails();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.country) setUserCountry(parsed.country);
      } catch (_) {}
    }
  }, [packageId]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    checkIfSaved(token);
  }, [packageId]);

  const checkIfSaved = async (token) => {
    try {
      const res = await fetch(`${BOOKMARKS_API}/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setIsSaved((data.bookmarks || []).some(b => b.package.id === packageId));
      }
    } catch (e) { console.error(e); }
  };

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/${packageId}/`);
      if (!response.ok) throw new Error('Package not found');
      const data = await response.json();
      setPackageData(data.package || data);
    } catch (error) { console.error('Error fetching package:', error); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { localStorage.setItem('intendedPackage', packageId.toString()); router.push('/login'); return; }
    setSaveLoading(true);
    setIsSaved(prev => !prev);
    try {
      if (isSaved) {
        const res = await fetch(`${BOOKMARKS_API}/${packageId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed');
      } else {
        const res = await fetch(`${BOOKMARKS_API}/create/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ package_id: packageId }) });
        if (!res.ok) throw new Error('Failed');
      }
    } catch (e) { console.error(e); setIsSaved(prev => !prev); }
    finally { setSaveLoading(false); }
  };

  const handleApplyNow = () => {
    const isLoggedIn = !!localStorage.getItem('access_token');
    if (!isLoggedIn) { localStorage.setItem('intendedPackage', packageId.toString()); router.push('/login'); }
    else { router.push(`/apply/${packageId}`); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#07b3f2] border-t-transparent" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-bold">Package not found</p>
      </div>
    );
  }

  const isStudent = packageData.category === 'student';
  const isMedical = packageData.category === 'medical';

  // ── Smart page title ──
  const pageTitle = isStudent && packageData.degree_type && packageData.course
    ? `🎓 ${packageData.degree_type} in ${packageData.course}${packageData.university_name ? ` — ${packageData.university_name}` : ''}`
    : isMedical && packageData.hospital_name
    ? `🏥 Treatment at ${packageData.hospital_name}`
    : packageData.title || packageData.country;

  const pageSubtitle = isStudent
    ? `${packageData.course_city || packageData.location || ''}, ${packageData.country || ''}`.replace(/^, |, $/, '')
    : isMedical
    ? `${packageData.hospital_city || ''}, ${packageData.country || ''}`.replace(/^, |, $/, '')
    : packageData.location || packageData.country || '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <div className="relative">
        <HeroImageSlider images={packageData.images || []} country={pageSubtitle} />
      </div>

      {/* Page header */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-start border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{pageTitle}</h1>
          {pageSubtitle && <p className="text-sm text-gray-500 flex items-center gap-1">📍 {pageSubtitle}</p>}
        </div>
        {packageData.university_logo && isStudent && (
          <img src={packageData.university_logo} alt="University logo" className="h-12 w-12 object-contain rounded-lg border border-gray-100 p-1" />
        )}
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-[#07b3f2]">📌</span> Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">{packageData.description}</p>
            </div>

            {/* What to Expect — student */}
            {isStudent && packageData.course_expectations && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2rem] p-8 border border-purple-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span> What to Expect
                </h2>
                <p className="text-gray-700 leading-relaxed">{packageData.course_expectations}</p>
              </div>
            )}

            {/* What to Expect — medical */}
            {isMedical && packageData.medical_expectations && (
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2rem] p-8 border border-rose-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span> What to Expect
                </h2>
                <p className="text-gray-700 leading-relaxed">{packageData.medical_expectations}</p>
              </div>
            )}

            {/* Tourist coverage */}
            {packageData.category === 'tourist' && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-[#07b3f2]">✈️</span> What's Included
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'covers_flight', label: 'Flight', icon: '✈️' },
                    { key: 'covers_visa', label: 'Visa', icon: '🛂' },
                    { key: 'covers_airport_pickup', label: 'Airport Pickup', icon: '🚗' },
                    { key: 'covers_accommodation', label: 'Accommodation', icon: '🏨' },
                    { key: 'covers_daily_tours', label: 'Daily Tours', icon: '🗺️' },
                    { key: 'covers_food', label: 'Daily Food', icon: '🍽️' },
                    { key: 'covers_local_transport', label: 'Local Transport', icon: '🚌' },
                  ].filter(item => packageData[item.key]).map(item => (
                    <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl border bg-green-50 border-green-100">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-semibold text-green-700">{item.label}</span>
                      <span className="ml-auto text-green-500 text-xs font-bold">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {packageData.requirements && packageData.requirements.length > 0 && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-[#07b3f2]">📄</span> Requirements
                </h2>
                <ul className="space-y-3">
                  {(Array.isArray(packageData.requirements)
                    ? packageData.requirements
                    : packageData.requirements.split('\n').filter(r => r.trim())
                  ).map((req, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-[#07b3f2]/5 transition-colors group">
                      <span className="bg-[#07b3f2] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">✓</span>
                      <span className="text-gray-700 font-medium">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Applicant Stories */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="text-[#07b3f2]">💬</span> Applicant Stories</h2>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border border-gray-200 px-3 py-1 rounded-full">Read Only</span>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07b3f2] to-blue-600 flex items-center justify-center text-white font-black text-lg">RO</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-gray-800">Rafiu O.</p>
                      <p className="text-[10px] text-gray-400">YESTERDAY</p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"The document checklist here is the most detailed I've found. Managed to get my appointment booked!"</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 font-black text-lg">SK</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-gray-800">Samuel K.</p>
                      <p className="text-[10px] text-gray-400">2 DAYS AGO</p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"Does anyone know about the health surcharge? Oh wait, just saw it in the requirements list above. Perfect."</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-xs text-gray-400 font-medium">Commenting is restricted to active applicants only.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar — smart per category ── */}
          <div className="lg:col-span-1">
            {isStudent ? (
              <StudentSidebar pkg={packageData} isSaved={isSaved} saveLoading={saveLoading} onSave={handleSave} onApply={handleApplyNow} />
            ) : isMedical ? (
              <MedicalSidebar pkg={packageData} isSaved={isSaved} saveLoading={saveLoading} onSave={handleSave} onApply={handleApplyNow} userCountry={userCountry} />
            ) : (
              <DefaultSidebar pkg={packageData} isSaved={isSaved} saveLoading={saveLoading} onSave={handleSave} onApply={handleApplyNow} userCountry={userCountry} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default PackageDetailsPage;