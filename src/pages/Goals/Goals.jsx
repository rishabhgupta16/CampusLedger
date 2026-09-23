import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import GoalCard from '../../components/goals/GoalCard';
import GoalForm from '../../components/goals/GoalForm';
import AddFundsForm from '../../components/goals/AddFundsForm';
import { formatCurrency } from '../../utils/currency';
import { Target, Plus, CheckCircle2, PiggyBank, Trophy } from 'lucide-react';

export default function Goals() {
  const { state, deleteGoal } = useFinance();
  const { goals } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [fundingGoal, setFundingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalSaved = goals.reduce((sum, g) => sum + (Number(g.savedAmount) || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const completedCount = goals.filter((g) => g.targetAmount > 0 && g.savedAmount >= g.targetAmount).length;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (msg) => {
    setIsFormOpen(false);
    setEditingGoal(null);
    showToast(msg);
  };

  const handleFundsSuccess = (msg) => {
    setFundingGoal(null);
    showToast(msg);
  };

  const handleConfirmDelete = async () => {
    if (!deletingGoal || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteGoal(deletingGoal.id);
      showToast(`Deleted goal "${deletingGoal.name}".`);
    } catch (error) {
      showToast(error.message || 'Could not delete this goal. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingGoal(null);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Save for your laptop, college trip, or fitness targets
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd} className="w-full sm:w-auto font-bold shadow-md shadow-brand-500/20">
          Create Goal
        </Button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Card padding="p-4" subtle3D className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Total Saved</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{formatCurrency(totalSaved)}</p>
            </div>
          </Card>
          <Card padding="p-4" subtle3D className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Combined Target</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{formatCurrency(totalTarget)}</p>
            </div>
          </Card>
          <Card padding="p-4" subtle3D className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Goals Achieved</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{completedCount} / {goals.length}</p>
            </div>
          </Card>
        </div>
      )}

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="Create your first savings goal"
            description="Whether it is a new semester laptop, campus fest road trip, or gym supplements, start putting aside money today."
            actionText="Create Goal"
            onAction={handleOpenAdd}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddFunds={(g) => setFundingGoal(g)}
              onEdit={handleOpenEdit}
              onDelete={(g) => setDeletingGoal(g)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
        subtitle="Set a target amount and track your progress over time"
        maxWidth="max-w-md"
      >
        <GoalForm initialData={editingGoal} onSubmitSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal
        isOpen={Boolean(fundingGoal)}
        onClose={() => setFundingGoal(null)}
        title="Add Money to Goal"
        subtitle={fundingGoal ? `Boost your progress toward "${fundingGoal.name}"` : ''}
        maxWidth="max-w-sm"
      >
        {fundingGoal && (
          <AddFundsForm goal={fundingGoal} onSubmitSuccess={handleFundsSuccess} onCancel={() => setFundingGoal(null)} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Savings Goal"
        message={`Delete "${deletingGoal?.name}"? Your saved progress for this goal will be lost.`}
        confirmText="Yes, Delete"
        loading={isDeleting}
      />
    </div>
  );
}
