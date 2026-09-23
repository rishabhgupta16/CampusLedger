import React from 'react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { formatCurrency } from '../../utils/currency';
import { getBudgetHealthStatus, calculateBudgetPercentage } from '../../utils/calculations';
import { WalletCards, ArrowUpRight, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BudgetCard({
  monthlyBudget = 0,
  spentThisMonth = 0,
  remainingBudget = 0,
}) {
  const health = getBudgetHealthStatus(monthlyBudget, spentThisMonth);
  const cappedPercentage = calculateBudgetPercentage(monthlyBudget, spentThisMonth, true);
  const actualPercentage = calculateBudgetPercentage(monthlyBudget, spentThisMonth, false);

  const isOverBudget = health.status === 'over_budget';

  return (
    <Card subtle3D padding="p-6" className="space-y-4">
      {/* Top Header with Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <WalletCards className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Budget Health
            </h3>
            <p className="text-[11px] text-slate-400">
              Current Month Spending Tracker
            </p>
          </div>
        </div>

        {/* Health Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${health.badgeBg} ${health.badgeText}`}
        >
          {health.status === 'safe' && <ShieldCheck className="w-3.5 h-3.5" />}
          {health.status === 'approaching' && <ShieldAlert className="w-3.5 h-3.5" />}
          {(health.status === 'warning' || health.status === 'over_budget') && (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{health.label}</span>
        </span>
      </div>

      {/* Progress Bar & Numerical Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {monthlyBudget > 0 ? `${actualPercentage}% of limit used` : 'No budget set'}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(spentThisMonth)} / {formatCurrency(monthlyBudget)}
          </span>
        </div>

        {/* Visual Progress */}
        <ProgressBar
          value={cappedPercentage}
          max={100}
          size="md"
          barClassName={health.progressColor}
        />
      </div>

      {/* Remaining / Over Budget Banner */}
      <div
        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          isOverBudget
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
            : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
        }`}
      >
        <span className="font-medium">
          {isOverBudget ? 'Budget Exceeded By:' : 'Remaining in Budget:'}
        </span>
        <span className={`text-sm font-black ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
          {formatCurrency(Math.abs(remainingBudget))}
        </span>
      </div>

      {/* Status Message */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {health.message}
      </p>

      {/* Footer Link */}
      <div className="pt-1 flex justify-end">
        <Link
          to="/budget"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Manage Category Budgets</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
