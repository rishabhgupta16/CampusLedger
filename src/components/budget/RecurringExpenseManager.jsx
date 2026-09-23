import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import RecurringExpenseForm from './RecurringExpenseForm';
import RecurringExpenseItem from './RecurringExpenseItem';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../utils/currency';
import { Plus, RotateCw } from 'lucide-react';

export default function RecurringExpenseManager({ onToast }) {
  const { state, deleteRecurring, markRecurringPaid } = useFinance();
  const { recurringExpenses } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [deletingRecurring, setDeletingRecurring] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const sortedRecurring = [...recurringExpenses].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  );
  const totalMonthly = recurringExpenses
    .filter((r) => r.frequency === 'Monthly')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleOpenAdd = () => {
    setEditingRecurring(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (recurring) => {
    setEditingRecurring(recurring);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (msg) => {
    setIsFormOpen(false);
    setEditingRecurring(null);
    if (onToast) onToast(msg);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecurring || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteRecurring(deletingRecurring.id);
      if (onToast) onToast(`Removed "${deletingRecurring.name}" from recurring expenses.`);
    } catch (error) {
      if (onToast) onToast(error.message || 'Could not remove this recurring expense. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingRecurring(null);
    }
  };

  const handleMarkPaid = async (recurring) => {
    if (payingId) return;
    setPayingId(recurring.id);
    try {
      await markRecurringPaid(recurring);
      if (onToast) onToast(`Logged ${recurring.name} (${formatCurrency(recurring.amount)}) and scheduled next due date.`);
    } catch (error) {
      if (onToast) onToast(error.message || 'Could not log this payment. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recurring Expenses
            </h3>
            <p className="text-[11px] text-slate-400">
              {recurringExpenses.length > 0
                ? `${formatCurrency(totalMonthly)}/month in scheduled subscriptions & bills`
                : 'Track subscriptions, gym fees, and hostel bills'}
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Recurring
        </Button>
      </div>

      {sortedRecurring.length === 0 ? (
        <EmptyState
          icon={RotateCw}
          title="No recurring expenses tracked"
          description="Add gym memberships, hostel Wi-Fi, or subscriptions so you never miss a due date."
          actionText="Add Recurring Expense"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-2.5">
          {sortedRecurring.map((recurring) => (
            <RecurringExpenseItem
              key={recurring.id}
              recurring={recurring}
              onEdit={handleOpenEdit}
              onDelete={(r) => setDeletingRecurring(r)}
              onMarkPaid={handleMarkPaid}
              isPaying={Boolean(payingId)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRecurring ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
        subtitle="Scheduled bills, subscriptions, and memberships"
        maxWidth="max-w-md"
      >
        <RecurringExpenseForm
          initialData={editingRecurring}
          onSubmitSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingRecurring)}
        onClose={() => setDeletingRecurring(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Recurring Expense"
        message={`Stop tracking "${deletingRecurring?.name}"? Past logged transactions will not be affected.`}
        confirmText="Yes, Remove"
        loading={isDeleting}
      />
    </Card>
  );
}
