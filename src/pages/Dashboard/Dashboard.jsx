import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import BalanceCard from '../../components/dashboard/BalanceCard';
import BudgetCard from '../../components/dashboard/BudgetCard';
import SummaryCards from '../../components/dashboard/SummaryCards';
import DailySafeSpend from '../../components/dashboard/DailySafeSpend';
import QuickAddTransaction from '../../components/dashboard/QuickAddTransaction';
import SpendingInsights from '../../components/dashboard/SpendingInsights';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import UpcomingPayments from '../../components/dashboard/UpcomingPayments';
import TransactionModal from '../../components/transactions/TransactionModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  calculateBalance,
  calculateCurrentMonthExpenses,
  calculateCurrentMonthIncome,
  calculateTotalExpenses,
  calculateRemainingBudget,
  calculateNoSpendStreak,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { getCurrentDateISO } from '../../utils/dateUtils';
import { CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { state, addTransaction, deleteTransaction, markRecurringPaid } = useFinance();
  const { transactions, budget, preferences, recurringExpenses } = state;

  // Local Modal and Feedback State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [payingRecurringId, setPayingRecurringId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pure Financial Calculations from real state
  const availableBalance = calculateBalance(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const spentThisMonth = calculateCurrentMonthExpenses(transactions);
  const currentMonthIncome = calculateCurrentMonthIncome(transactions);
  const monthlyAllowance = Number(budget.monthlyAllowance) || 0;
  const monthlySpendingBudget = Number(budget.monthlySpendingBudget) || 0;
  const remainingBudget = calculateRemainingBudget(monthlySpendingBudget, spentThisMonth);
  const noSpendStreak = calculateNoSpendStreak(transactions);
  const savingsTarget = Number(budget.savingsTarget) || 0;

  const handleMarkRecurringPaid = async (recurring) => {
    if (payingRecurringId) return;
    setPayingRecurringId(recurring.id);
    try {
      await markRecurringPaid(recurring);
      showToast(`Logged ${recurring.name} (${formatCurrency(recurring.amount)}) and scheduled next due date.`);
    } catch (error) {
      showToast(error.message || 'Could not log this payment. Please try again.');
    } finally {
      setPayingRecurringId(null);
    }
  };

  // Quick Preset Add Handler
  const handleQuickAddPreset = async (preset) => {
    try {
      await addTransaction({
        type: 'expense',
        amount: preset.amount,
        category: preset.category,
        description: preset.label,
        date: getCurrentDateISO(),
      });
      showToast(`Recorded ${preset.label} (${formatCurrency(preset.amount)})`);
    } catch (error) {
      showToast(error.message || 'Could not record this transaction. Please try again.');
    }
  };

  // Open Modal with Optional Defaults
  const handleOpenModal = (defaults = null) => {
    setModalInitialData(defaults);
    setIsModalOpen(true);
  };

  // Delete Transaction Confirm
  const handleConfirmDelete = async () => {
    if (!deletingTransaction || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTransaction.id);
      showToast('Transaction deleted successfully.');
    } catch (error) {
      showToast(error.message || 'Could not delete this transaction. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingTransaction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. FINANCIAL OVERVIEW / BALANCE */}
      <BalanceCard
        availableBalance={availableBalance}
        monthlyAllowance={monthlyAllowance}
        totalExpenses={totalExpenses}
        savingsTarget={savingsTarget}
        persona={preferences.persona}
        studentName={preferences.studentName}
        onQuickAdd={() => handleOpenModal({ type: 'expense' })}
      />

      {/* Monthly Cashflow Strip */}
      <SummaryCards
        currentMonthIncome={currentMonthIncome}
        currentMonthExpenses={spentThisMonth}
        noSpendStreak={noSpendStreak}
      />

      {/* 2. BUDGET HEALTH & 4. DAILY SAFE SPEND (Side-by-side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BudgetCard
          monthlyBudget={monthlySpendingBudget}
          spentThisMonth={spentThisMonth}
          remainingBudget={remainingBudget}
        />

        <DailySafeSpend
          monthlyBudget={monthlySpendingBudget}
          spentThisMonth={spentThisMonth}
        />
      </div>

      {/* 3. QUICK ACTIONS */}
      <QuickAddTransaction
        onQuickAddPreset={handleQuickAddPreset}
        onOpenModal={handleOpenModal}
        onToast={showToast}
      />

      {/* 4b. UPCOMING RECURRING PAYMENTS */}
      <UpcomingPayments
        recurringExpenses={recurringExpenses}
        onMarkPaid={handleMarkRecurringPaid}
        payingId={payingRecurringId}
      />

      {/* 5. SMART INSIGHTS */}
      <SpendingInsights
        transactions={transactions}
        monthlyBudget={monthlySpendingBudget}
        categoryBudgets={budget.categoryBudgets}
      />

      {/* 6. RECENT TRANSACTIONS */}
      <RecentTransactions
        transactions={transactions}
        onEdit={(tx) => handleOpenModal(tx)}
        onDelete={(tx) => setDeletingTransaction(tx)}
        onAddNew={() => handleOpenModal({ type: 'expense' })}
        limit={5}
      />

      {/* Reusable Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalInitialData}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Safe Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Delete "${deletingTransaction?.description || deletingTransaction?.category}" (${formatCurrency(deletingTransaction?.amount)})?`}
        confirmText="Yes, Delete"
        loading={isDeleting}
      />
    </div>
  );
}
