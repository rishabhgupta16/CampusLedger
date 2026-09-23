import React, { useState } from 'react';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { getCategoriesByPersona } from '../../constants/categories';
import { getCurrentDateISO } from '../../utils/dateUtils';
import { Save, PlusCircle, AlertCircle } from 'lucide-react';

const FREQUENCIES = ['Weekly', 'Monthly', 'Yearly'];

export default function RecurringExpenseForm({
  initialData = null,
  onSubmitSuccess,
  onCancel,
}) {
  const { state, addRecurring, updateRecurring } = useFinance();
  const persona = state.preferences.persona;
  const isEditing = Boolean(initialData && initialData.id);
  const availableCategories = getCategoriesByPersona(persona);

  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount ? String(initialData.amount) : '');
  const [category, setCategory] = useState(initialData?.category || availableCategories[0]?.name || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || 'Monthly');
  const [nextDueDate, setNextDueDate] = useState(initialData?.nextDueDate || getCurrentDateISO());
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    const parsedAmount = parseFloat(amount);

    if (!name || name.trim() === '') {
      errs.name = 'Please enter a name (e.g. Gym Membership).';
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }
    if (!category) {
      errs.category = 'Please select a category.';
    }
    if (!nextDueDate || isNaN(new Date(nextDueDate).getTime())) {
      errs.nextDueDate = 'Please select a valid due date.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: name.trim(),
      amount: parsedAmount,
      category,
      frequency,
      nextDueDate,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateRecurring({ ...initialData, ...payload });
        if (onSubmitSuccess) onSubmitSuccess('Recurring expense updated.');
      } else {
        await addRecurring(payload);
        if (onSubmitSuccess) onSubmitSuccess('Recurring expense added.');
      }
    } catch (error) {
      setServerError(error.message || 'Could not save this recurring expense. Please try again.');
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
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gym Membership, Hostel Wi-Fi"
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
            Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="800"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl border ${
                errors.amount ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
              } text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
            />
          </div>
          {errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.category ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        >
          {availableCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Next Due Date *
        </label>
        <input
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.nextDueDate ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        />
        {errors.nextDueDate && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nextDueDate}</p>}
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Recurring Expense'}
        </Button>
      </div>
    </form>
  );
}
