import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptIndianRupee,
  BarChart3,
  WalletCards,
  Target,
  Settings,
} from 'lucide-react';

export default function MobileNav() {
  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Spends', path: '/transactions', icon: ReceiptIndianRupee },
    { name: 'Budget', path: '/budget', icon: WalletCards },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-dark-card/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                    }`}
                  />
                  <span className="text-[10px] mt-0.5 tracking-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
