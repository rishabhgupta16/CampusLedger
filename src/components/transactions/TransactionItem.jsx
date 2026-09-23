import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { getCategoryDetails } from '../../constants/categories';
import CategoryIcon from '../common/CategoryIcon';
import { Edit2, Trash2 } from 'lucide-react';

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}) {
  const { id, type, amount, category, description, date } = transaction;
  const isIncome = type === 'income';
  const categoryInfo = getCategoryDetails(category, type);

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-dark-card hover:border-slate-200 dark:hover:border-slate-700/80 transition-all duration-150 group">
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{
            backgroundColor: `${categoryInfo.color}15`,
            color: categoryInfo.color,
          }}
        >
          <CategoryIcon name={categoryInfo.icon} className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {description || category}
            </h4>
            <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              {category}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            <span>{formatDate(date)}</span>
            <span className="sm:hidden text-[10px] text-slate-400">• {category}</span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <p
            className={`text-sm sm:text-base font-extrabold tracking-tight ${
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(amount)}
          </p>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            {type}
          </span>
        </div>

        {/* Action Buttons: always accessible, with smooth hover/keyboard-focus visibility */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            title="Edit transaction"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            title="Delete transaction"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
