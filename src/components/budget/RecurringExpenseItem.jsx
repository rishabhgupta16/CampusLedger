import React from 'react';
import CategoryIcon from '../common/CategoryIcon';
import { getCategoryDetails } from '../../constants/categories';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate, getDueStatusBadge } from '../../utils/dateUtils';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';

const BADGE_TONE_CLASSES = {
  danger: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
  warning: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
};

export default function RecurringExpenseItem({
  recurring,
  onEdit,
  onDelete,
  onMarkPaid,
  isPaying = false,
}) {
  const { name, amount, category, frequency, nextDueDate } = recurring;
  const details = getCategoryDetails(category, 'expense');
  const dueBadge = getDueStatusBadge(nextDueDate);

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-dark-card hover:border-slate-200 dark:hover:border-slate-700/80 transition-all group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${details.color}15`, color: details.color }}
        >
          <CategoryIcon name={details.icon} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</h4>
            {dueBadge.label && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${BADGE_TONE_CLASSES[dueBadge.tone] || ''}`}>
                {dueBadge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {frequency} • Next due {formatShortDate(nextDueDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(amount)}
        </span>
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMarkPaid(recurring)}
            disabled={isPaying}
            title="Mark as paid (logs a transaction)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(recurring)}
            title="Edit"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(recurring)}
            title="Delete"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
