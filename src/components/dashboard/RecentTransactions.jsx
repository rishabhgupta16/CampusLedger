import React from 'react';
import Card from '../common/Card';
import TransactionItem from '../transactions/TransactionItem';
import { ArrowRight, ReceiptText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentTransactions({
  transactions = [],
  onEdit,
  onDelete,
  onAddNew,
  limit = 5,
}) {
  const recentList = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-400">
            Latest campus spends & allowance entries
          </p>
        </div>

        <Link
          to="/transactions"
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentList.length === 0 ? (
        <div className="py-8 text-center">
          <ReceiptText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No transactions yet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your recent everyday campus expenses and pocket money will appear here.
          </p>
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200/60 dark:border-brand-800/40 hover:bg-brand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Spend</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentList.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
