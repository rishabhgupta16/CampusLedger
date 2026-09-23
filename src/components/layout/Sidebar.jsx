import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptIndianRupee,
  BarChart3,
  WalletCards,
  Target,
  Settings,
  GraduationCap,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptIndianRupee },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Budget', path: '/budget', icon: WalletCards },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-surface-dark-card border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                CampusLedger
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Student Finance OS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-xs border border-brand-200/60 dark:border-brand-800/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Student Habit / Bottom Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-brand-50 via-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-brand-950/30 border border-brand-100/80 dark:border-slate-700/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-lg bg-brand-500 text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Student Smart Tip
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mb-2.5">
          Tracking small tea and canteen spends can save up to ₹1,500 every single month!
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
          <Dumbbell className="w-3 h-3" />
          <span>Gym & College Ready</span>
        </div>
      </div>
    </aside>
  );
}
