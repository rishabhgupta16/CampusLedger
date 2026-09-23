import React from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/currency';
import { calculateDailySafeSpend } from '../../utils/calculations';
import { ShieldCheck, Calendar, AlertOctagon, Info } from 'lucide-react';

export default function DailySafeSpend({
  monthlyBudget = 0,
  spentThisMonth = 0,
}) {
  const safeSpend = calculateDailySafeSpend(monthlyBudget, spentThisMonth);
  const isSafe = safeSpend.status === 'safe';
  const isExceeded = safeSpend.status === 'exceeded';
  const hasNoBudget = safeSpend.status === 'no_budget';

  return (
    <Card subtle3D padding="p-6" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Daily Spending Guidance
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            Daily Safe Spend
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          <span>{safeSpend.remainingDays} days left</span>
        </div>
      </div>

      {/* Main Safe Amount Callout */}
      <div className="my-4">
        {isSafe && (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400">
              {formatCurrency(safeSpend.amount)}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
              / day
            </span>
          </div>
        )}

        {isExceeded && (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertOctagon className="w-7 h-7 shrink-0" />
            <span className="text-xl sm:text-2xl font-black">
              ₹0 Safe Limit
            </span>
          </div>
        )}

        {hasNoBudget && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Info className="w-6 h-6 shrink-0" />
            <span className="text-base font-bold">
              Budget Not Configured
            </span>
          </div>
        )}
      </div>

      {/* Friendly Explanation Banner */}
      <div
        className={`p-3 rounded-xl border text-xs leading-relaxed ${
          isSafe
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
            : isExceeded
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
        }`}
      >
        <p>{safeSpend.message}</p>
      </div>
    </Card>
  );
}
