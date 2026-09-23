/**
 * Rule-Based Financial Insights Generator
 * Generates transparent, deterministic, and helpful tips for students without any AI APIs.
 */

import {
  calculateCurrentMonthExpenses,
  calculateBudgetPercentage,
  calculateDailySafeSpend,
  calculateCategorySpending,
} from './calculations.js';
import { getRemainingDaysInMonth } from './dateUtils.js';
import { formatCurrency } from './currency.js';

export function generateSpendingInsights({
  transactions = [],
  monthlyBudget = 0,
  categoryBudgets = {},
  referenceDate = new Date(),
}) {
  const insights = [];
  const spentThisMonth = calculateCurrentMonthExpenses(transactions, referenceDate);
  const budgetUsagePercent = calculateBudgetPercentage(monthlyBudget, spentThisMonth);
  const remainingDays = getRemainingDaysInMonth(referenceDate);
  const remainingBudget = monthlyBudget - spentThisMonth;
  const categorySpending = calculateCategorySpending(transactions, referenceDate);

  // If no transactions exist yet
  if (transactions.length === 0) {
    insights.push({
      id: 'first_steps',
      type: 'info',
      title: 'Financial Journey Begins',
      message: 'Record your everyday canteen snacks, tea, or pocket money to generate live spending insights.',
    });
    return insights;
  }

  // 1. Overall Budget Status Insight
  if (monthlyBudget > 0) {
    if (spentThisMonth > monthlyBudget) {
      insights.push({
        id: 'budget_exceeded',
        type: 'danger',
        title: 'Budget Exceeded',
        message: `You've spent ${formatCurrency(spentThisMonth - monthlyBudget)} over your monthly limit of ${formatCurrency(monthlyBudget)}.`,
      });
    } else if (budgetUsagePercent >= 85) {
      insights.push({
        id: 'budget_warning',
        type: 'warning',
        title: 'Approaching Budget Limit',
        message: `You've used ${budgetUsagePercent}% of your monthly budget. You have ${formatCurrency(remainingBudget)} left for the next ${remainingDays} days.`,
      });
    } else if (budgetUsagePercent >= 50 && remainingDays > 15) {
      insights.push({
        id: 'pace_warning',
        type: 'warning',
        title: 'Spending Pace Warning',
        message: `Halfway through your budget with more than half the month (${remainingDays} days) remaining.`,
      });
    } else if (budgetUsagePercent < 50) {
      insights.push({
        id: 'budget_healthy',
        type: 'success',
        title: 'Healthy Budget Pace',
        message: `You've used only ${budgetUsagePercent}% of your monthly budget. Great discipline!`,
      });
    }
  }

  // 2. Highest Spending Category Insight
  const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const topPercent = spentThisMonth > 0 ? Math.round((topAmount / spentThisMonth) * 100) : 0;
    
    if (topPercent >= 30) {
      insights.push({
        id: 'top_category',
        type: 'info',
        title: `Heavy ${topCategory} Spending`,
        message: `${topCategory} accounts for ${topPercent}% (${formatCurrency(topAmount)}) of your total spending this month.`,
      });
    }
  }

  // 3. Category Specific Budget Warning
  Object.entries(categoryBudgets).forEach(([catName, limit]) => {
    const spent = categorySpending[catName] || 0;
    if (limit > 0 && spent > 0) {
      const catPercent = Math.round((spent / limit) * 100);
      if (catPercent >= 100) {
        insights.push({
          id: `cat_over_${catName}`,
          type: 'danger',
          title: `${catName} Limit Reached`,
          message: `You have reached 100% of your ${catName} budget (${formatCurrency(spent)} of ${formatCurrency(limit)}).`,
        });
      } else if (catPercent >= 80) {
        insights.push({
          id: `cat_warn_${catName}`,
          type: 'warning',
          title: `${catName} Budget Alert`,
          message: `You have used ${catPercent}% of your ${catName} budget. Remaining: ${formatCurrency(limit - spent)}.`,
        });
      }
    }
  });

  // 4. Daily Safe Spend Guidance
  const safeSpendInfo = calculateDailySafeSpend(monthlyBudget, spentThisMonth, referenceDate);
  if (safeSpendInfo.status === 'safe') {
    insights.push({
      id: 'daily_safe_spend',
      type: 'info',
      title: 'Daily Safe Spending Target',
      message: `Staying under ${formatCurrency(safeSpendInfo.amount)}/day will keep you comfortably within your monthly budget.`,
    });
  }

  return insights;
}
