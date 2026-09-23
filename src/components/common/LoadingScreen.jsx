import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function LoadingScreen({ label = 'Loading CampusLedger...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-light-base dark:bg-surface-dark-base text-slate-600 dark:text-slate-300">
      <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 animate-pulse">
        <GraduationCap className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
