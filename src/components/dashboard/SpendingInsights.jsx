import React from 'react';
import Card from '../common/Card';
import { generateSpendingInsights } from '../../utils/insights';
import { Sparkles, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function SpendingInsights({
  transactions = [],
  monthlyBudget = 0,
  categoryBudgets = {},
}) {
  const insights = generateSpendingInsights({
    transactions,
    monthlyBudget,
    categoryBudgets,
  });

  const getInsightIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-brand-500 shrink-0" />;
    }
  };

  const getInsightStyles = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-200';
      case 'warning':
        return 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200';
      case 'success':
        return 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200';
      default:
        return 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-3.5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-brand-500 text-white shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Smart Spending Insights
          </h3>
          <p className="text-[11px] text-slate-400">
            Calculated rules based on your real campus transactions
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3 transition-colors ${getInsightStyles(
              insight.type
            )}`}
          >
            <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs mb-0.5">{insight.title}</h4>
              <p className="opacity-90">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
