import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-light-base dark:bg-surface-dark-base text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar for Desktop & Tablet */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <MobileNav />
      </div>
    </div>
  );
}
