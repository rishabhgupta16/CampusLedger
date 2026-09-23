import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { TrendingUp, TrendingDown, Plus, GraduationCap, Dumbbell, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function BalanceCard({
  availableBalance = 0,
  monthlyAllowance = 0,
  totalExpenses = 0,
  savingsTarget = 0,
  persona = 'college_student',
  studentName = 'Student',
  onQuickAdd,
}) {
  const isNegative = availableBalance < 0;
  const isFitness = persona === 'college_gym';

  return (
    <Card subtle3D padding="p-6 sm:p-7" className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 dark:from-surface-dark-card dark:via-surface-dark-card dark:to-brand-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40">
              {isFitness ? <Dumbbell className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              <span>{isFitness ? 'College + Gym Persona' : 'College Scholar Persona'}</span>
            </span>
            <span className="text-xs text-slate-400">• Hey {studentName}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Available Balance
          </p>
          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${
              isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatCurrency(availableBalance)}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onQuickAdd}
            className="w-full sm:w-auto font-bold shadow-sm shadow-brand-500/20"
          >
            Record Spend
          </Button>
        </div>
      </div>

      {/* Sub-metrics: Allowance, Outflow, and (if set) Monthly Savings Target */}
      <div className={`grid gap-4 pt-4 ${savingsTarget > 0 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Monthly Allowance
            </p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
              {formatCurrency(monthlyAllowance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              All-Time Outflow
            </p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        {savingsTarget > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Monthly Savings Target
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
                {formatCurrency(savingsTarget)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
