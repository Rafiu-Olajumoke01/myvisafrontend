'use client';
import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api';
function authHeaders() {
  return { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' };
}

export default function StudentsManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/auth/admin/users/`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.country?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-[#07b3f2]/20 border-t-[#07b3f2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900">Students</h2>
        <p className="text-sm text-gray-400 mt-1">{users.length} registered students</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email or country..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#07b3f2] focus:ring-2 focus:ring-[#07b3f2]/10 transition-all"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Phone', 'Country', 'Joined', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    {search ? 'No students match your search' : 'No students registered yet'}
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#07b3f2]/10 flex items-center justify-center text-[#07b3f2] font-black text-sm flex-shrink-0">
                        {(u.fullname || u.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.fullname || u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.country || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {u.date_joined
                      ? new Date(u.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}