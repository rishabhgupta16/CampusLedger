import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import CategoryBudgetForm from './CategoryBudgetForm';
import CategoryBudgetItem from './CategoryBudgetItem';
import { useFinance } from '../../hooks/useFinance';
import { calculateCategorySpending } from '../../utils/calculations';
import { Plus, ListChecks } from 'lucide-react';

export default function CategoryBudgetManager({ onToast }) {
  const { state, removeCategoryBudget } = useFinance();
  const { transactions, budget } = state;
  const categoryBudgets = budget.categoryBudgets || {};

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categorySpending = calculateCategorySpending(transactions);
  const entries = Object.entries(categoryBudgets);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (msg) => {
    setIsFormOpen(false);
    setEditingEntry(null);
    if (onToast) onToast(msg);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory || isDeleting) return;
    setIsDeleting(true);
    try {
      await removeCategoryBudget(deletingCategory);
      if (onToast) onToast(`Removed budget for "${deletingCategory}".`);
    } catch (error) {
      if (onToast) onToast(error.message || 'Could not remove this budget. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingCategory(null);
    }
  };

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Budgets
            </h3>
            <p className="text-[11px] text-slate-400">
              Fine-grained spending caps for canteen, travel, gym, and more
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Budget
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No category budgets yet"
          description="Set spending caps for individual categories like canteen, travel, or gym to get focused alerts."
          actionText="Add Category Budget"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([category, limit]) => (
            <CategoryBudgetItem
              key={category}
              category={category}
              limit={limit}
              spent={categorySpending[category] || 0}
              onEdit={handleOpenEdit}
              onDelete={(cat) => setDeletingCategory(cat)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEntry ? 'Edit Category Budget' : 'Add Category Budget'}
        subtitle="Set a monthly cap for a specific spending category"
        maxWidth="max-w-md"
      >
        <CategoryBudgetForm
          initialCategory={editingEntry?.category || null}
          initialAmount={editingEntry?.limit || null}
          onSubmitSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Category Budget"
        message={`Remove the spending cap for "${deletingCategory}"? Your transactions will not be affected.`}
        confirmText="Yes, Remove"
        loading={isDeleting}
      />
    </Card>
  );
}
