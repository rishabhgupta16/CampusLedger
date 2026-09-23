import React, { useState } from 'react';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { getCategoriesByPersona } from '../../constants/categories';
import { Save, PlusCircle, AlertCircle } from 'lucide-react';

export default function CategoryBudgetForm({
  initialCategory = null,
  initialAmount = null,
  onSubmitSuccess,
  onCancel,
}) {
  const { state, setCategoryBudget } = useFinance();
  const persona = state.preferences.persona;
  const isEditing = Boolean(initialCategory);

  const allCategories = getCategoriesByPersona(persona);
  const alreadyBudgeted = new Set(Object.keys(state.budget.categoryBudgets || {}));
  const selectableCategories = isEditing
    ? allCategories
    : allCategories.filter((c) => !alreadyBudgeted.has(c.name));

  const [category, setCategory] = useState(initialCategory || selectableCategories[0]?.name || '');
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    const parsedAmount = parseFloat(amount);

    if (!category) {
      errs.category = 'Please select a category.';
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Budget amount must be greater than zero.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      await setCategoryBudget(category, parsedAmount);
      if (onSubmitSuccess) {
        onSubmitSuccess(isEditing ? 'Category budget updated.' : 'Category budget added.');
      }
    } catch (error) {
      setServerError(error.message || 'Could not save this budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing && selectableCategories.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You already have budgets set for every available category. Edit an existing one instead.
        </p>
        <div className="pt-5">
          <Button variant="outline" size="md" onClick={onCancel} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

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
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isEditing}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.category
              ? 'border-rose-500 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors disabled:opacity-60`}
        >
          {selectableCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Monthly Limit (₹) *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2000"
            autoFocus
            className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
              errors.amount
                ? 'border-rose-500 bg-rose-50/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            } text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
        )}
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Category Budget'}
        </Button>
      </div>
    </form>
  );
}
