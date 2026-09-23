import React from 'react';
import { useFinance } from '../../hooks/useFinance';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import CategoryPieChart from '../../components/analytics/CategoryPieChart';
import MonthlySpendingTrendChart from '../../components/analytics/MonthlySpendingTrendChart';
import IncomeExpenseBarChart from '../../components/analytics/IncomeExpenseBarChart';
import WeeklyTrendChart from '../../components/analytics/WeeklyTrendChart';
import SpendingInsights from '../../components/dashboard/SpendingInsights';
import { formatCurrency } from '../../utils/currency';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateCategorySpending,
} from '../../utils/calculations';
import { BarChart3, TrendingUp, TrendingDown, Tag } from 'lucide-react';

// Renamed from Analytics.jsx (Phase B8) — some browser content/ad blockers
// treat a source module path containing "/Analytics/Analytics.jsx" as a
// tracking-related resource and block the request (seen in normal Edge;
// InPrivate windows, which disable extensions, worked fine). The route
// ("/analytics"), the Sidebar/MobileNav nav label ("Analytics"), and the
// page title in Header.jsx ("Analytics & Insights") are all unchanged —
// only this internal file/folder/component name moved.
export default function SpendingOverview() {
  const { state } = useFinance();
  const { transactions, budget } = state;

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No analytics data available"
            description="Add transactions to start seeing your spending patterns, category breakdowns, and weekly trends."
          />
        </Card>
      </div>
    );
  }

  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const categorySpending = calculateCategorySpending(transactions);
  const topCategoryEntry = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">All-Time Income</p>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
          </div>
        </Card>
        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">All-Time Expenses</p>
            <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(totalExpenses)}</p>
          </div>
        </Card>
        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Top Category This Month</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
              {topCategoryEntry ? topCategoryEntry[0] : '—'}
            </p>
          </div>
        </Card>
      </div>

      <CategoryPieChart transactions={transactions} />

      <MonthlySpendingTrendChart transactions={transactions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IncomeExpenseBarChart transactions={transactions} />
        <WeeklyTrendChart transactions={transactions} />
      </div>

      <SpendingInsights
        transactions={transactions}
        monthlyBudget={Number(budget.monthlySpendingBudget) || 0}
        categoryBudgets={budget.categoryBudgets}
      />
    </div>
  );
}
