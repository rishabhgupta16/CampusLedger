import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import BudgetCard from '../../components/dashboard/BudgetCard';
import CategoryBudgetManager from '../../components/budget/CategoryBudgetManager';
import RecurringExpenseManager from '../../components/budget/RecurringExpenseManager';
import {
  calculateCurrentMonthExpenses,
  calculateRemainingBudget,
} from '../../utils/calculations';
import { CheckCircle2 } from 'lucide-react';

export default function Budget() {
  const { state } = useFinance();
  const { transactions, budget } = state;

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const monthlySpendingBudget = Number(budget.monthlySpendingBudget) || 0;
  const spentThisMonth = calculateCurrentMonthExpenses(transactions);
  const remainingBudget = calculateRemainingBudget(monthlySpendingBudget, spentThisMonth);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Budget & Spending Limits
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Control your overall monthly cap plus per-category limits and recurring bills
        </p>
      </div>

      <BudgetCard
        monthlyBudget={monthlySpendingBudget}
        spentThisMonth={spentThisMonth}
        remainingBudget={remainingBudget}
      />

      <CategoryBudgetManager onToast={showToast} />

      <RecurringExpenseManager onToast={showToast} />
    </div>
  );
}
