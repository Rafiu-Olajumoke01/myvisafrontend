'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COUNTRIES = [
  { name: "Afghanistan", code: "AF", currency: "AFN" },
  { name: "Albania", code: "AL", currency: "ALL" },
  { name: "Algeria", code: "DZ", currency: "DZD" },
  { name: "Andorra", code: "AD", currency: "EUR" },
  { name: "Angola", code: "AO", currency: "AOA" },
  { name: "Antigua and Barbuda", code: "AG", currency: "XCD" },
  { name: "Argentina", code: "AR", currency: "ARS" },
  { name: "Armenia", code: "AM", currency: "AMD" },
  { name: "Australia", code: "AU", currency: "AUD" },
  { name: "Austria", code: "AT", currency: "EUR" },
  { name: "Azerbaijan", code: "AZ", currency: "AZN" },
  { name: "Bahamas", code: "BS", currency: "BSD" },
  { name: "Bahrain", code: "BH", currency: "BHD" },
  { name: "Bangladesh", code: "BD", currency: "BDT" },
  { name: "Barbados", code: "BB", currency: "BBD" },
  { name: "Belarus", code: "BY", currency: "BYN" },
  { name: "Belgium", code: "BE", currency: "EUR" },
  { name: "Belize", code: "BZ", currency: "BZD" },
  { name: "Benin", code: "BJ", currency: "XOF" },
  { name: "Bhutan", code: "BT", currency: "BTN" },
  { name: "Bolivia", code: "BO", currency: "BOB" },
  { name: "Bosnia and Herzegovina", code: "BA", currency: "BAM" },
  { name: "Botswana", code: "BW", currency: "BWP" },
  { name: "Brazil", code: "BR", currency: "BRL" },
  { name: "Brunei", code: "BN", currency: "BND" },
  { name: "Bulgaria", code: "BG", currency: "BGN" },
  { name: "Burkina Faso", code: "BF", currency: "XOF" },
  { name: "Burundi", code: "BI", currency: "BIF" },
  { name: "Cabo Verde", code: "CV", currency: "CVE" },
  { name: "Cambodia", code: "KH", currency: "KHR" },
  { name: "Cameroon", code: "CM", currency: "XAF" },
  { name: "Canada", code: "CA", currency: "CAD" },
  { name: "Central African Republic", code: "CF", currency: "XAF" },
  { name: "Chad", code: "TD", currency: "XAF" },
  { name: "Chile", code: "CL", currency: "CLP" },
  { name: "China", code: "CN", currency: "CNY" },
  { name: "Colombia", code: "CO", currency: "COP" },
  { name: "Comoros", code: "KM", currency: "KMF" },
  { name: "Congo (DRC)", code: "CD", currency: "CDF" },
  { name: "Congo (Republic)", code: "CG", currency: "XAF" },
  { name: "Costa Rica", code: "CR", currency: "CRC" },
  { name: "Croatia", code: "HR", currency: "EUR" },
  { name: "Cuba", code: "CU", currency: "CUP" },
  { name: "Cyprus", code: "CY", currency: "EUR" },
  { name: "Czech Republic", code: "CZ", currency: "CZK" },
  { name: "Denmark", code: "DK", currency: "DKK" },
  { name: "Djibouti", code: "DJ", currency: "DJF" },
  { name: "Dominica", code: "DM", currency: "XCD" },
  { name: "Dominican Republic", code: "DO", currency: "DOP" },
  { name: "Ecuador", code: "EC", currency: "USD" },
  { name: "Egypt", code: "EG", currency: "EGP" },
  { name: "El Salvador", code: "SV", currency: "USD" },
  { name: "Equatorial Guinea", code: "GQ", currency: "XAF" },
  { name: "Eritrea", code: "ER", currency: "ERN" },
  { name: "Estonia", code: "EE", currency: "EUR" },
  { name: "Eswatini", code: "SZ", currency: "SZL" },
  { name: "Ethiopia", code: "ET", currency: "ETB" },
  { name: "Fiji", code: "FJ", currency: "FJD" },
  { name: "Finland", code: "FI", currency: "EUR" },
  { name: "France", code: "FR", currency: "EUR" },
  { name: "Gabon", code: "GA", currency: "XAF" },
  { name: "Gambia", code: "GM", currency: "GMD" },
  { name: "Georgia", code: "GE", currency: "GEL" },
  { name: "Germany", code: "DE", currency: "EUR" },
  { name: "Ghana", code: "GH", currency: "GHS" },
  { name: "Greece", code: "GR", currency: "EUR" },
  { name: "Grenada", code: "GD", currency: "XCD" },
  { name: "Guatemala", code: "GT", currency: "GTQ" },
  { name: "Guinea", code: "GN", currency: "GNF" },
  { name: "Guinea-Bissau", code: "GW", currency: "XOF" },
  { name: "Guyana", code: "GY", currency: "GYD" },
  { name: "Haiti", code: "HT", currency: "HTG" },
  { name: "Honduras", code: "HN", currency: "HNL" },
  { name: "Hungary", code: "HU", currency: "HUF" },
  { name: "Iceland", code: "IS", currency: "ISK" },
  { name: "India", code: "IN", currency: "INR" },
  { name: "Indonesia", code: "ID", currency: "IDR" },
  { name: "Iran", code: "IR", currency: "IRR" },
  { name: "Iraq", code: "IQ", currency: "IQD" },
  { name: "Ireland", code: "IE", currency: "EUR" },
  { name: "Israel", code: "IL", currency: "ILS" },
  { name: "Italy", code: "IT", currency: "EUR" },
  { name: "Jamaica", code: "JM", currency: "JMD" },
  { name: "Japan", code: "JP", currency: "JPY" },
  { name: "Jordan", code: "JO", currency: "JOD" },
  { name: "Kazakhstan", code: "KZ", currency: "KZT" },
  { name: "Kenya", code: "KE", currency: "KES" },
  { name: "Kiribati", code: "KI", currency: "AUD" },
  { name: "Kuwait", code: "KW", currency: "KWD" },
  { name: "Kyrgyzstan", code: "KG", currency: "KGS" },
  { name: "Laos", code: "LA", currency: "LAK" },
  { name: "Latvia", code: "LV", currency: "EUR" },
  { name: "Lebanon", code: "LB", currency: "LBP" },
  { name: "Lesotho", code: "LS", currency: "LSL" },
  { name: "Liberia", code: "LR", currency: "LRD" },
  { name: "Libya", code: "LY", currency: "LYD" },
  { name: "Liechtenstein", code: "LI", currency: "CHF" },
  { name: "Lithuania", code: "LT", currency: "EUR" },
  { name: "Luxembourg", code: "LU", currency: "EUR" },
  { name: "Madagascar", code: "MG", currency: "MGA" },
  { name: "Malawi", code: "MW", currency: "MWK" },
  { name: "Malaysia", code: "MY", currency: "MYR" },
  { name: "Maldives", code: "MV", currency: "MVR" },
  { name: "Mali", code: "ML", currency: "XOF" },
  { name: "Malta", code: "MT", currency: "EUR" },
  { name: "Marshall Islands", code: "MH", currency: "USD" },
  { name: "Mauritania", code: "MR", currency: "MRU" },
  { name: "Mauritius", code: "MU", currency: "MUR" },
  { name: "Mexico", code: "MX", currency: "MXN" },
  { name: "Micronesia", code: "FM", currency: "USD" },
  { name: "Moldova", code: "MD", currency: "MDL" },
  { name: "Monaco", code: "MC", currency: "EUR" },
  { name: "Mongolia", code: "MN", currency: "MNT" },
  { name: "Montenegro", code: "ME", currency: "EUR" },
  { name: "Morocco", code: "MA", currency: "MAD" },
  { name: "Mozambique", code: "MZ", currency: "MZN" },
  { name: "Myanmar", code: "MM", currency: "MMK" },
  { name: "Namibia", code: "NA", currency: "NAD" },
  { name: "Nauru", code: "NR", currency: "AUD" },
  { name: "Nepal", code: "NP", currency: "NPR" },
  { name: "Netherlands", code: "NL", currency: "EUR" },
  { name: "New Zealand", code: "NZ", currency: "NZD" },
  { name: "Nicaragua", code: "NI", currency: "NIO" },
  { name: "Niger", code: "NE", currency: "XOF" },
  { name: "Nigeria", code: "NG", currency: "NGN" },
  { name: "North Korea", code: "KP", currency: "KPW" },
  { name: "North Macedonia", code: "MK", currency: "MKD" },
  { name: "Norway", code: "NO", currency: "NOK" },
  { name: "Oman", code: "OM", currency: "OMR" },
  { name: "Pakistan", code: "PK", currency: "PKR" },
  { name: "Palau", code: "PW", currency: "USD" },
  { name: "Palestine", code: "PS", currency: "ILS" },
  { name: "Panama", code: "PA", currency: "PAB" },
  { name: "Papua New Guinea", code: "PG", currency: "PGK" },
  { name: "Paraguay", code: "PY", currency: "PYG" },
  { name: "Peru", code: "PE", currency: "PEN" },
  { name: "Philippines", code: "PH", currency: "PHP" },
  { name: "Poland", code: "PL", currency: "PLN" },
  { name: "Portugal", code: "PT", currency: "EUR" },
  { name: "Qatar", code: "QA", currency: "QAR" },
  { name: "Romania", code: "RO", currency: "RON" },
  { name: "Russia", code: "RU", currency: "RUB" },
  { name: "Rwanda", code: "RW", currency: "RWF" },
  { name: "Saint Kitts and Nevis", code: "KN", currency: "XCD" },
  { name: "Saint Lucia", code: "LC", currency: "XCD" },
  { name: "Saint Vincent and the Grenadines", code: "VC", currency: "XCD" },
  { name: "Samoa", code: "WS", currency: "WST" },
  { name: "San Marino", code: "SM", currency: "EUR" },
  { name: "Sao Tome and Principe", code: "ST", currency: "STN" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR" },
  { name: "Senegal", code: "SN", currency: "XOF" },
  { name: "Serbia", code: "RS", currency: "RSD" },
  { name: "Seychelles", code: "SC", currency: "SCR" },
  { name: "Sierra Leone", code: "SL", currency: "SLL" },
  { name: "Singapore", code: "SG", currency: "SGD" },
  { name: "Slovakia", code: "SK", currency: "EUR" },
  { name: "Slovenia", code: "SI", currency: "EUR" },
  { name: "Solomon Islands", code: "SB", currency: "SBD" },
  { name: "Somalia", code: "SO", currency: "SOS" },
  { name: "South Africa", code: "ZA", currency: "ZAR" },
  { name: "South Korea", code: "KR", currency: "KRW" },
  { name: "South Sudan", code: "SS", currency: "SSP" },
  { name: "Spain", code: "ES", currency: "EUR" },
  { name: "Sri Lanka", code: "LK", currency: "LKR" },
  { name: "Sudan", code: "SD", currency: "SDG" },
  { name: "Suriname", code: "SR", currency: "SRD" },
  { name: "Sweden", code: "SE", currency: "SEK" },
  { name: "Switzerland", code: "CH", currency: "CHF" },
  { name: "Syria", code: "SY", currency: "SYP" },
  { name: "Taiwan", code: "TW", currency: "TWD" },
  { name: "Tajikistan", code: "TJ", currency: "TJS" },
  { name: "Tanzania", code: "TZ", currency: "TZS" },
  { name: "Thailand", code: "TH", currency: "THB" },
  { name: "Timor-Leste", code: "TL", currency: "USD" },
  { name: "Togo", code: "TG", currency: "XOF" },
  { name: "Tonga", code: "TO", currency: "TOP" },
  { name: "Trinidad and Tobago", code: "TT", currency: "TTD" },
  { name: "Tunisia", code: "TN", currency: "TND" },
  { name: "Turkey", code: "TR", currency: "TRY" },
  { name: "Turkmenistan", code: "TM", currency: "TMT" },
  { name: "Tuvalu", code: "TV", currency: "AUD" },
  { name: "Uganda", code: "UG", currency: "UGX" },
  { name: "Ukraine", code: "UA", currency: "UAH" },
  { name: "United Arab Emirates", code: "AE", currency: "AED" },
  { name: "United Kingdom", code: "GB", currency: "GBP" },
  { name: "United States", code: "US", currency: "USD" },
  { name: "Uruguay", code: "UY", currency: "UYU" },
  { name: "Uzbekistan", code: "UZ", currency: "UZS" },
  { name: "Vanuatu", code: "VU", currency: "VUV" },
  { name: "Vatican City", code: "VA", currency: "EUR" },
  { name: "Venezuela", code: "VE", currency: "VES" },
  { name: "Vietnam", code: "VN", currency: "VND" },
  { name: "Yemen", code: "YE", currency: "YER" },
  { name: "Zambia", code: "ZM", currency: "ZMW" },
  { name: "Zimbabwe", code: "ZW", currency: "ZWL" },
];

function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState('user'); // 👈 new
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    password: '',
    confirmPassword: '',
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleCountrySelect = (country) => {
    setFormData({ ...formData, nationality: country.name });
    setCountrySearch(country.name);
    setShowCountryDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nationality) {
      setError('Please select your nationality/citizenship country.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://web-production-f50dc.up.railway.app/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          country: formData.nationality,
          password: formData.password,
          password2: formData.confirmPassword,
          role: role, // 👈 send role to backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 👈 redirect based on role
        if (data.user.role === 'agent') {
          router.push('/agents/pending');
        } else {
          const intendedPackage = localStorage.getItem('intendedPackage');
          if (intendedPackage) {
            router.push(`/apply/${intendedPackage}`);
            localStorage.removeItem('intendedPackage');
          } else {
            router.push('/package');
          }
        }
      } else {
        if (data.username)   setError(data.username[0]);
        else if (data.email) setError(data.email[0]);
        else if (data.password) setError(data.password[0]);
        else setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#07b3f2] to-[#0891c7] bg-clip-text text-transparent">
            MyVisa
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sign Up</h2>

          {/* ── Role Toggle ── */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === 'user'
                  ? 'bg-white text-[#07b3f2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              👤 I am a User
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === 'agent'
                  ? 'bg-white text-[#07b3f2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              🎧 I am an Agent
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row 1: First Name + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text" name="first_name" value={formData.first_name}
                  onChange={handleChange} required disabled={loading} placeholder="John"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text" name="last_name" value={formData.last_name}
                  onChange={handleChange} required disabled={loading} placeholder="Doe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2: Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text" name="username" value={formData.username}
                onChange={handleChange} required disabled={loading} placeholder="johndoe"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Row 3: Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} required disabled={loading} placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} required disabled={loading} placeholder="+234 801 234 5678"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 4: Nationality */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality / Citizenship <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                This helps us show whether you need a visa for each destination
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                  disabled={loading}
                  placeholder="Search your country (e.g. Nigeria, Ghana...)"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {showCountryDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-52 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button key={country.code} type="button" onMouseDown={() => handleCountrySelect(country)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#07b3f2]/10 transition-colors flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">{country.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{country.currency}</span>
                    </button>
                  ))}
                </div>
              )}
              {showCountryDropdown && filteredCountries.length === 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 px-4 py-3">
                  <p className="text-sm text-gray-400">No country found</p>
                </div>
              )}
            </div>

            {/* Row 5: Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleChange} required disabled={loading} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} required disabled={loading} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07b3f2]/20 focus:border-[#07b3f2] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-[#07b3f2] text-white py-3 rounded-lg font-medium hover:bg-[#0891c7] transition-all mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : `Create ${role === 'agent' ? 'Agent' : ''} Account`}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#07b3f2] font-medium hover:underline">Login</Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-[#07b3f2]">← Back to packages</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;