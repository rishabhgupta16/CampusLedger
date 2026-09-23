import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import CategoryIcon from '../common/CategoryIcon';
import { getCategoryDetails } from '../../constants/categories';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate, getDueStatusBadge, daysUntil } from '../../utils/dateUtils';
import { CalendarClock, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';

const BADGE_TONE_CLASSES = {
  danger: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
  warning: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
};

export default function UpcomingPayments({ recurringExpenses = [], onMarkPaid, payingId = null, limit = 4 }) {
  const upcoming = [...recurringExpenses]
    .sort((a, b) => (daysUntil(a.nextDueDate) ?? Infinity) - (daysUntil(b.nextDueDate) ?? Infinity))
    .slice(0, limit);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Payments
            </h3>
            <p className="text-[11px] text-slate-400">
              Recurring bills & subscriptions due soon
            </p>
          </div>
        </div>

        <Link
          to="/budget"
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 shrink-0"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="py-6 text-center">
          <RotateCw className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No recurring expenses tracked
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add gym memberships, hostel bills, or subscriptions from the Budget page to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((recurring) => {
            const details = getCategoryDetails(recurring.category, 'expense');
            const badge = getDueStatusBadge(recurring.nextDueDate);
            return (
              <div
                key={recurring.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-surface-dark-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${details.color}15`, color: details.color }}
                  >
                    <CategoryIcon name={details.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {recurring.name}
                      </p>
                      {badge.label && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${BADGE_TONE_CLASSES[badge.tone] || ''}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {formatShortDate(recurring.nextDueDate)} • {recurring.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(recurring.amount)}
                  </span>
                  {onMarkPaid && (
                    <button
                      type="button"
                      onClick={() => onMarkPaid(recurring)}
                      disabled={Boolean(payingId)}
                      title="Mark as paid (logs a transaction)"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
