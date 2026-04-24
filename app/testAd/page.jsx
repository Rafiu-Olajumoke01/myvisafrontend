"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const stats = {
    applicants: 1200,
    serviceProviders: 45,
    visaCalls: 320,
    pendingReviews: 18,
  };

  const providers = [
    { id: 1, name: "SkyBridge Visa Services", status: "pending" },
    { id: 2, name: "Global Travel Consult", status: "approved" },
    { id: 3, name: "EuroPath Immigration", status: "rejected" },
    { id: 4, name: "VisaConnect Agency", status: "pending" },
  ];

  const calls = [
    { id: 1, user: "John Doe", status: "Completed Visa Screening" },
    { id: 2, user: "Amina Yusuf", status: "Missed Consultation" },
    { id: 3, user: "David Mark", status: "Approved Session" },
    { id: 4, user: "Sarah Bello", status: "Pending Review" },
  ];

  const pieData = [
    { name: "Applicants", value: stats.applicants },
    { name: "Providers", value: stats.serviceProviders },
    { name: "Calls", value: stats.visaCalls },
    { name: "Pending", value: stats.pendingReviews },
  ];

  const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen relative">

      {/* ✈️ BACKGROUND IMAGE (FULL SCREEN) */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1529070538774-1843cb3265df"
          alt="airplane background"
          className="w-full h-full object-cover"
        />
        {/* dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* CONTENT OVERLAY */}
      <div className="relative z-10 p-6 text-white">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            ✈️ Ingress Visa & Travel Admin
          </h1>
          <p className="text-gray-200">
            Manage visa applications, service providers & travel operations
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl">
            <p className="text-gray-200">Applicants</p>
            <h2 className="text-3xl font-bold">{stats.applicants}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl">
            <p className="text-gray-200">Service Providers</p>
            <h2 className="text-3xl font-bold">{stats.serviceProviders}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl">
            <p className="text-gray-200">Visa Calls</p>
            <h2 className="text-3xl font-bold">{stats.visaCalls}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-red-400/30 p-5 rounded-2xl">
            <p className="text-gray-200">Pending Reviews</p>
            <h2 className="text-3xl font-bold text-red-300">
              {stats.pendingReviews}
            </h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <h2 className="mb-4 font-semibold">Visa Platform Overview</h2>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
            <h2 className="mb-4 font-semibold">Activity Overview</h2>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pieData}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Bar dataKey="value" fill="#60A5FA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PROVIDERS */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 mb-8">
          <h2 className="mb-4 font-semibold">✈️ Service Providers</h2>

          {providers.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center border-b border-white/10 py-3"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-300">{p.status}</p>
              </div>

              <div className="flex gap-2">
                <button className="bg-green-500 px-3 py-1 rounded-lg text-white">
                  Approve
                </button>
                <button className="bg-red-500 px-3 py-1 rounded-lg text-white">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CALLS */}
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
          <h2 className="mb-4 font-semibold">📞 Visa Consultation Calls</h2>

          {calls.map((c) => (
            <div key={c.id} className="border-b border-white/10 py-3">
              <p className="font-medium">{c.user}</p>
              <p className="text-sm text-gray-300">{c.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}