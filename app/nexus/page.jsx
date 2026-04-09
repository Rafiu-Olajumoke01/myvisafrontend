'use client';

import React, { useState } from 'react';
import useAdminGuard from './../components/admincomponents/AdminGuard';
import Sidebar from './../components/admincomponents/Sidebar';
import Overview from './../components/admincomponents/Overview';
import ApplicationsManager from './../components/admincomponents/ApplicationManager';
import PackagesManager from './../components/admincomponents/Packages';
import StudentsManager from './../components/admincomponents/StudentManager';
import AgentsManager from './../components/admincomponents/AgentsManager';

export default function Nexus() {
  const ready = useAdminGuard();
  const [activeSection, setActiveSection] = useState('overview');

  // Show spinner while auth check runs
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#07b3f2]/20 border-t-[#07b3f2] rounded-full animate-spin" />
      </div>
    );
  }

  const sectionTitles = {
    overview:     'Overview',
    applications: 'Applications',
    packages:     'Packages',
    students:     'Students',
    agents:       'Agents'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {sectionTitles[activeSection]}
          </p>
        </div>

        {/* Active Section */}
        <div className="p-8 flex-1">
          {activeSection === 'overview'     && <Overview />}
          {activeSection === 'applications' && <ApplicationsManager />}
          {activeSection === 'packages'     && <PackagesManager />}
          {activeSection === 'students'     && <StudentsManager />}
          {activeSection === 'agents'     && <AgentsManager />}
        </div>

      </main>
    </div>
  );
}