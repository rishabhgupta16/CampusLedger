import React from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/currency';
import { ArrowDownLeft, ArrowUpRight, Flame, Scale } from 'lucide-react';

export default function SummaryCards({
  currentMonthIncome = 0,
  currentMonthExpenses = 0,
  noSpendStreak = { days: 0, hasHistory: false },
}) {
  const netMonth = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Current Month Income */}
      <Card padding="p-4" subtle3D className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Month Inflow
          </span>
          <ArrowDownLeft className="w-4 h-4" />
        </div>
        <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
          +{formatCurrency(currentMonthIncome)}
        </p>
      </Card>

      {/* Current Month Expense */}
      <Card padding="p-4" subtle3D className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Month Outflow
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
        <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
          -{formatCurrency(currentMonthExpenses)}
        </p>
      </Card>

      {/* Net Month Result */}
      <Card padding="p-4" subtle3D className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Net Month Flow
          </span>
          <Scale className="w-4 h-4" />
        </div>
        <p
          className={`text-base sm:text-lg font-black ${
            netMonth >= 0
              ? 'text-slate-900 dark:text-white'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {formatCurrency(netMonth)}
        </p>
      </Card>

      {/* No Spend Streak / Activity */}
      <Card padding="p-4" subtle3D className="flex flex-col justify-between">
        <div className="flex items-center justify-between text-amber-500 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            No-Spend Streak
          </span>
          <Flame className="w-4 h-4" />
        </div>
        <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
          {!noSpendStreak.hasHistory
            ? 'Start Tracking'
            : noSpendStreak.days > 0
            ? `${noSpendStreak.days} Day${noSpendStreak.days > 1 ? 's' : ''}`
            : 'Spent Today'}
        </p>
      </Card>
    </div>
  );
}
