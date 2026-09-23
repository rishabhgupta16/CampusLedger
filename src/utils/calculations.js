/**
 * Pure Financial Calculation Utilities
 * All business logic is kept outside UI components for clean testing and maintainability.
 */

import { isDateInCurrentMonth, getRemainingDaysInMonth } from './dateUtils.js';

/**
 * Calculates total income from a list of transactions
 */
export function calculateTotalIncome(transactions = []) {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates total expenses from a list of transactions
 */
export function calculateTotalExpenses(transactions = []) {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates current available balance (total income - total expenses)
 */
export function calculateBalance(transactions = []) {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculates expenses incurred in the current month
 */
export function calculateCurrentMonthExpenses(transactions = [], referenceDate = new Date()) {
  return transactions
    .filter((t) => t.type === 'expense' && isDateInCurrentMonth(t.date, referenceDate))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates income received in the current month
 */
export function calculateCurrentMonthIncome(transactions = [], referenceDate = new Date()) {
  return transactions
    .filter((t) => t.type === 'income' && isDateInCurrentMonth(t.date, referenceDate))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates remaining monthly budget
 */
export function calculateRemainingBudget(monthlyBudget = 0, spentThisMonth = 0) {
  const budget = Number(monthlyBudget) || 0;
  const spent = Number(spentThisMonth) || 0;
  return budget - spent;
}

/**
 * Calculates percentage of budget used
 * @param {number} monthlyBudget
 * @param {number} spentThisMonth
 * @param {boolean} capped - If true, caps at 100 for progress bar display
 */
export function calculateBudgetPercentage(monthlyBudget = 0, spentThisMonth = 0, capped = false) {
  const budget = Number(monthlyBudget) || 0;
  const spent = Number(spentThisMonth) || 0;
  if (budget <= 0) return spent > 0 ? 100 : 0;
  const rawPercentage = Math.round((spent / budget) * 100);
  return capped ? Math.min(100, Math.max(0, rawPercentage)) : rawPercentage;
}

/**
 * Single source of truth for budget-health thresholds, shared by the overall
 * monthly budget (BudgetCard) and individual category budgets (CategoryBudgetItem):
 * - Safe: < 70%
 * - Approaching Limit: 70% - 85%
 * - Warning: 85% - 100%
 * - Over Budget: > 100%
 */
export const BUDGET_HEALTH_THRESHOLDS = {
  APPROACHING: 70,
  WARNING: 85,
};

/**
 * Returns the budget-health state (status/label/colors) for any limit + spent pair,
 * with no context-specific message text. Used directly by category budgets, and
 * wrapped by getBudgetHealthStatus() below for the overall monthly budget.
 */
export function getBudgetHealthState(limit = 0, spent = 0) {
  const limitNum = Number(limit) || 0;
  const spentNum = Number(spent) || 0;

  if (limitNum <= 0) {
    return {
      status: 'no_budget',
      label: 'No Budget Configured',
      percentage: 0,
      color: 'slate',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-600 dark:text-slate-400',
      progressColor: 'bg-slate-400',
    };
  }

  const percentage = calculateBudgetPercentage(limitNum, spentNum, false);

  if (percentage > 100) {
    return {
      status: 'over_budget',
      label: 'Over Budget',
      percentage,
      color: 'rose',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-400',
      progressColor: 'bg-rose-500',
    };
  }

  if (percentage >= BUDGET_HEALTH_THRESHOLDS.WARNING) {
    return {
      status: 'warning',
      label: 'Warning',
      percentage,
      color: 'rose',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/50',
      badgeText: 'text-rose-700 dark:text-rose-400',
      progressColor: 'bg-rose-500',
    };
  }

  if (percentage >= BUDGET_HEALTH_THRESHOLDS.APPROACHING) {
    return {
      status: 'approaching',
      label: 'Approaching Limit',
      percentage,
      color: 'amber',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-400',
      progressColor: 'bg-amber-500',
    };
  }

  return {
    status: 'safe',
    label: 'Safe',
    percentage,
    color: 'emerald',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    progressColor: 'bg-emerald-500',
  };
}

/**
 * Overall monthly budget health: wraps getBudgetHealthState() and adds the
 * dashboard-facing message copy.
 */
export function getBudgetHealthStatus(monthlyBudget = 0, spentThisMonth = 0) {
  const budget = Number(monthlyBudget) || 0;
  const spent = Number(spentThisMonth) || 0;
  const state = getBudgetHealthState(budget, spent);

  const messages = {
    no_budget: 'Configure your monthly budget in Settings to track your financial health.',
    over_budget: `You are ₹${(spent - budget).toLocaleString('en-IN')} over your monthly spending limit!`,
    warning: 'You have consumed over 85% of your budget. Slow down non-essential spends.',
    approaching: 'You have used over 70% of your monthly budget. Watch your daily canteen spends.',
    safe: 'Your spending pace is healthy and well within limits.',
  };

  return { ...state, message: messages[state.status] };
}

/**
 * Calculates Daily Safe Spend:
 * Formula: Remaining Monthly Budget / Remaining Days in Current Month
 * Handles edge cases: budget exceeded, 0 remaining, 0 budget configured.
 */
export function calculateDailySafeSpend(monthlyBudget = 0, spentThisMonth = 0, referenceDate = new Date()) {
  const budget = Number(monthlyBudget) || 0;
  const spent = Number(spentThisMonth) || 0;

  if (budget <= 0) {
    return {
      amount: 0,
      status: 'no_budget',
      message: 'Set a monthly budget to calculate your daily safe spending.',
      remainingDays: getRemainingDaysInMonth(referenceDate),
    };
  }

  const remainingBudget = budget - spent;
  const remainingDays = getRemainingDaysInMonth(referenceDate);

  if (remainingBudget <= 0) {
    return {
      amount: 0,
      status: 'exceeded',
      message: 'Monthly budget reached. Limit unnecessary spends for the rest of the month.',
      remainingDays,
    };
  }

  const safeDaily = Math.floor(remainingBudget / remainingDays);

  return {
    amount: safeDaily,
    status: 'safe',
    message: `You can safely spend approximately ₹${safeDaily.toLocaleString('en-IN')}/day for the remaining ${remainingDays} days.`,
    remainingDays,
  };
}

/**
 * Calculates spending breakdown by category for current month
 */
export function calculateCategorySpending(transactions = [], referenceDate = new Date()) {
  const currentMonthTransactions = transactions.filter(
    (t) => t.type === 'expense' && isDateInCurrentMonth(t.date, referenceDate)
  );

  const categoryMap = {};
  currentMonthTransactions.forEach((t) => {
    const cat = t.category || 'Other Expenses';
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(t.amount) || 0);
  });

  return categoryMap;
}

/**
 * Calculates the actual consecutive no-spend streak leading up to (and including)
 * the reference date. No artificial day cap: counts backward until it hits either
 * a day with a logged expense, or the earliest transaction on record (the natural
 * "start of tracking" boundary — we can't claim a no-spend day before the user
 * started using the app).
 *
 * Returns { days, hasHistory } rather than a bare number so callers can render a
 * neutral "start tracking" state for a brand-new account instead of a misleadingly
 * large streak.
 */
export function calculateNoSpendStreak(transactions = [], referenceDate = new Date()) {
  if (!transactions || transactions.length === 0) {
    return { days: 0, hasHistory: false };
  }

  const expenseDates = new Set(
    transactions
      .filter((t) => t.type === 'expense' && Number(t.amount) > 0)
      .map((t) => (t.date ? t.date.split('T')[0] : ''))
  );

  const earliestDate = transactions
    .map((t) => (t.date ? t.date.split('T')[0] : null))
    .filter(Boolean)
    .sort()[0];

  let streak = 0;
  const checkDate = new Date(referenceDate);

  // Bound the loop generously (~10 years) purely as a runaway-loop safeguard.
  // The real stop conditions are: an expense day, or the earliest tracked date.
  const MAX_LOOKBACK_DAYS = 3650;

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    if (expenseDates.has(dateStr)) break;
    if (earliestDate && dateStr < earliestDate) break;

    streak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { days: streak, hasHistory: true };
}
