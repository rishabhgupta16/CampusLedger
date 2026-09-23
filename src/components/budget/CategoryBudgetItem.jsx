import React from 'react';
import ProgressBar from '../common/ProgressBar';
import CategoryIcon from '../common/CategoryIcon';
import { getCategoryDetails } from '../../constants/categories';
import { calculateBudgetPercentage, getBudgetHealthState } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { Edit2, Trash2 } from 'lucide-react';

export default function CategoryBudgetItem({
  category,
  limit,
  spent = 0,
  onEdit,
  onDelete,
}) {
  const details = getCategoryDetails(category, 'expense');
  const cappedPercentage = calculateBudgetPercentage(limit, spent, true);
  const health = getBudgetHealthState(limit, spent);
  const isOver = health.status === 'over_budget';
  const remaining = Math.max(0, limit - spent);

  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-dark-card hover:border-slate-200 dark:hover:border-slate-700/80 transition-all group">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${details.color}15`, color: details.color }}
          >
            <CategoryIcon name={details.icon} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {category}
            </h4>
            <p className="text-[11px] text-slate-400">
              {formatCurrency(spent)} of {formatCurrency(limit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit({ category, limit })}
            title="Edit budget"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            title="Remove budget"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ProgressBar value={cappedPercentage} max={100} size="sm" barClassName={health.progressColor} />

      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[11px] font-bold ${health.badgeText}`}>
          {health.percentage}% used
        </span>
        <span className={`text-[11px] font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {isOver
            ? `${formatCurrency(spent - limit)} over budget`
            : `${formatCurrency(remaining)} remaining`}
        </span>
      </div>
    </div>
  );
}
