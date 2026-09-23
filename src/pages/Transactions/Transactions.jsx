import React, { useState, useMemo } from 'react';
import { useFinance } from '../../hooks/useFinance';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionModal from '../../components/transactions/TransactionModal';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import VoiceTransactionModal from '../../components/voice/VoiceTransactionModal';
import { formatCurrency } from '../../utils/currency';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptIndianRupee,
  CheckCircle2,
  Mic,
} from 'lucide-react';

export default function Transactions() {
  const { state, deleteTransaction } = useFinance();
  const { transactions } = state;

  // Filter States (local)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Modal & Confirmation States (local)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Trigger brief toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query Filter (description and category)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const catMatch = (tx.category || '').toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }

      // 2. Type Filter
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // 4. Month Filter (format YYYY-MM)
      if (selectedMonth && tx.date) {
        if (!tx.date.startsWith(selectedMonth)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedMonth]);

  // Summary metrics for current filtered view
  const summaryMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedMonth
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedMonth('');
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

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
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Transactions History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed log of all income, pocket money, canteen meals, and travel expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Mic}
            onClick={() => setIsVoiceOpen(true)}
            className="w-full sm:w-auto font-bold"
          >
            Speak to Add
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
            className="w-full sm:w-auto font-bold shadow-md shadow-brand-500/20"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filtered Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Total Inflow / Allowance
            </p>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(summaryMetrics.income)}
            </p>
          </div>
        </Card>

        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Total Outflow / Spends
            </p>
            <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
              -{formatCurrency(summaryMetrics.expense)}
            </p>
          </div>
        </Card>

        <Card padding="p-4" subtle3D className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ReceiptIndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Net Result ({summaryMetrics.count} entries)
            </p>
            <p
              className={`text-base sm:text-lg font-black ${
                summaryMetrics.net >= 0
                  ? 'text-slate-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(summaryMetrics.net)}
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Transactions List */}
      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleOpenEdit}
        onDelete={(tx) => setDeletingTransaction(tx)}
        onAddNew={handleOpenAdd}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTransaction}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Voice Transaction Modal */}
      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={(msg) => {
          setIsVoiceOpen(false);
          showToast(msg);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.description || deletingTransaction?.category}" (${formatCurrency(deletingTransaction?.amount)})? This will update your balances immediately.`}
        confirmText="Yes, Delete"
        cancelText="Keep"
        loading={isDeleting}
      />
    </div>
  );
}
