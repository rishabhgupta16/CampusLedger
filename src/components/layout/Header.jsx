import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Calendar, LogOut } from 'lucide-react';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Your monthly pocket money & spending overview' },
  '/transactions': { title: 'Transactions', subtitle: 'Detailed record of everyday campus spends & income' },
  '/analytics': { title: 'Analytics & Insights', subtitle: 'Understand where your pocket money goes' },
  '/budget': { title: 'Budget & Limits', subtitle: 'Control your overall and category spending budgets' },
  '/goals': { title: 'Savings Goals', subtitle: 'Save for your laptop, college trip, or fitness targets' },
  '/settings': { title: 'Settings', subtitle: 'Personalize your student profile and monthly allowance' },
  '/onboarding': { title: 'Welcome to CampusLedger', subtitle: 'Set up your student pocket money and budget' },
};

export default function Header({ onQuickAddClick, onVoiceClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentRoute = PAGE_TITLES[location.pathname] || {
    title: 'CampusLedger',
    subtitle: 'Student Financial Hub',
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-dark-base/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Page Title & Context */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
            {currentRoute.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
            {currentRoute.subtitle}
          </p>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Current Date Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>{formattedDate}</span>
          </div>

          {/* Quick theme toggle */}
          <ThemeToggle />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
