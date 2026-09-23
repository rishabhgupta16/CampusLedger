import React, { useState } from 'react';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { Save, PlusCircle, AlertCircle } from 'lucide-react';

const GOAL_CATEGORIES = ['Tech', 'Trip', 'Fitness', 'Education', 'Emergency Fund', 'Gadgets', 'Other'];

export default function GoalForm({ initialData = null, onSubmitSuccess, onCancel }) {
  const { addGoal, updateGoal } = useFinance();
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount ? String(initialData.targetAmount) : '');
  const [savedAmount, setSavedAmount] = useState(initialData?.savedAmount ? String(initialData.savedAmount) : '0');
  const [category, setCategory] = useState(initialData?.category || GOAL_CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    const parsedTarget = parseFloat(targetAmount);
    const parsedSaved = parseFloat(savedAmount) || 0;

    if (!name || name.trim() === '') {
      errs.name = 'Please name your goal (e.g. New Laptop).';
    }
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      errs.targetAmount = 'Target amount must be greater than zero.';
    }
    if (parsedSaved < 0) {
      errs.savedAmount = 'Saved amount cannot be negative.';
    } else if (parsedTarget > 0 && parsedSaved > parsedTarget) {
      errs.savedAmount = 'Saved amount cannot exceed the target amount.';
    }
    if (targetDate && isNaN(new Date(targetDate).getTime())) {
      errs.targetDate = 'Please select a valid date.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: name.trim(),
      targetAmount: parsedTarget,
      savedAmount: parsedSaved,
      category,
      targetDate: targetDate || null,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateGoal({ ...initialData, ...payload });
        if (onSubmitSuccess) onSubmitSuccess('Savings goal updated.');
      } else {
        await addGoal(payload);
        if (onSubmitSuccess) onSubmitSuccess('Savings goal created.');
      }
    } catch (error) {
      setServerError(error.message || 'Could not save this goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Goal Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Coding Laptop Upgrade"
          autoFocus
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        />
        {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Target Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="50000"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl border ${
                errors.targetAmount ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
              } text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
            />
          </div>
          {errors.targetAmount && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.targetAmount}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Already Saved (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl border ${
                errors.savedAmount ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
              } text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
            />
          </div>
          {errors.savedAmount && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.savedAmount}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
          >
            {GOAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={targetDate || ''}
            onChange={(e) => setTargetDate(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border ${
              errors.targetDate ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
          />
          {errors.targetDate && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.targetDate}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" size="md" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={isEditing ? Save : PlusCircle}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
