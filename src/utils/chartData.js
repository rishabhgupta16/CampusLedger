/**
 * Recharts Data Transformation Utilities
 * Transforms raw transaction arrays into chart-ready formats.
 */

import { EXPENSE_CATEGORIES } from '../constants/categories.js';
import { formatDateToLocalISO } from './dateUtils.js';

/**
 * Format category expense breakdown for Pie/Donut Chart
 */
export function getCategoryPieData(transactions = []) {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const catTotals = {};

  expenseTransactions.forEach((t) => {
    const category = t.category || 'Other Expenses';
    catTotals[category] = (catTotals[category] || 0) + (Number(t.amount) || 0);
  });

  const categoryColorMap = {};
  EXPENSE_CATEGORIES.forEach((c) => {
    categoryColorMap[c.name] = c.color;
  });

  return Object.entries(catTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: categoryColorMap[name] || '#6366F1',
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Format Income vs Expense comparisons for Bar Chart
 */
export function getIncomeExpenseBarData(transactions = []) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  
  // Last 4 months
  const recentMonths = [];
  for (let i = 3; i >= 0; i--) {
    const mIdx = (currentMonthIdx - i + 12) % 12;
    recentMonths.push({
      monthIndex: mIdx,
      label: months[mIdx],
      income: 0,
      expense: 0,
    });
  }

  transactions.forEach((t) => {
    if (!t.date) return;
    const d = new Date(t.date);
    const m = d.getMonth();
    const target = recentMonths.find((item) => item.monthIndex === m);
    if (target) {
      if (t.type === 'income') {
        target.income += Number(t.amount) || 0;
      } else {
        target.expense += Number(t.amount) || 0;
      }
    }
  });

  return recentMonths.map(({ label, income, expense }) => ({
    name: label,
    Income: income,
    Expense: expense,
  }));
}

/**
 * Format weekly spending trend for Area/Line Chart
 */
export function getWeeklyTrendData(transactions = []) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const past7Days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Local-date string, not toISOString() — see formatDateToLocalISO's doc
    // comment for why (UTC conversion silently shifts "today" back a day for
    // IST users between midnight and 5:30am local).
    const iso = formatDateToLocalISO(d);
    past7Days.push({
      iso,
      day: days[d.getDay()],
      spent: 0,
    });
  }

  transactions.forEach((t) => {
    if (t.type === 'expense' && t.date) {
      const datePart = t.date.split('T')[0];
      const match = past7Days.find((item) => item.iso === datePart);
      if (match) {
        match.spent += Number(t.amount) || 0;
      }
    }
  });

  return past7Days.map(({ day, spent }) => ({
    name: day,
    Spending: spent,
  }));
}

/**
 * Total EXPENSE-only spending per month for the last `monthsCount` months,
 * in chronological order. Distinct from getIncomeExpenseBarData (which pairs
 * income against expense over 4 months) — this is a pure spending-over-time
 * trend line spanning a longer window.
 */
export function getMonthlyTrendData(transactions = [], monthsCount = 6) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();

  const recentMonths = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    recentMonths.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      label: months[d.getMonth()],
      spending: 0,
    });
  }

  transactions.forEach((t) => {
    if (t.type !== 'expense' || !t.date) return;
    const d = new Date(t.date);
    if (isNaN(d.getTime())) return;
    const match = recentMonths.find(
      (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear()
    );
    if (match) match.spending += Number(t.amount) || 0;
  });

  return recentMonths.map(({ label, spending }) => ({
    name: label,
    Spending: spending,
  }));
}
