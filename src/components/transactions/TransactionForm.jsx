import React, { useState, useEffect, useMemo } from 'react';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import {
  INCOME_CATEGORIES,
  getCategoriesByPersona,
} from '../../constants/categories';
import { getCurrentDateISO } from '../../utils/dateUtils';
import { PlusCircle, Save, AlertCircle } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';

export default function TransactionForm({
  initialData = null,
  onSubmitSuccess,
  onCancel,
}) {
  const { state, addTransaction, updateTransaction } = useFinance();
  const persona = state.preferences.persona;
  const preferredCategories = state.preferences.preferredCategories || [];

  const isEditing = Boolean(initialData && initialData.id);

  // Form State
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount ? String(initialData.amount) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || getCurrentDateISO());
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense categories are ordered with the student's preferred (onboarding-selected)
  // categories first, without changing which categories are available for their persona.
  const orderedExpenseCategories = useMemo(() => {
    const base = getCategoriesByPersona(persona);
    const preferredSet = new Set(preferredCategories);
    const preferred = base.filter((c) => preferredSet.has(c.name));
    const rest = base.filter((c) => !preferredSet.has(c.name));
    return [...preferred, ...rest];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona, preferredCategories.join('|')]);

  // Categories list based on Type and Persona
  const availableCategories =
    type === 'income'
      ? INCOME_CATEGORIES
      : orderedExpenseCategories;

  // When type changes, ensure valid default category
  useEffect(() => {
    if (!isEditing || initialData?.type !== type) {
      if (availableCategories.length > 0) {
        setCategory(availableCategories[0].name);
      }
    }
  }, [type]);

  // Set initial category on mount if not set
  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0].name);
    }
  }, []);

  const validate = () => {
    const errs = {};
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Amount must be greater than zero.';
    }

    if (!category || category.trim() === '') {
      errs.category = 'Please select a valid category.';
    }

    if (!description || description.trim() === '') {
      errs.description = 'Please enter a brief description (e.g. Canteen lunch, Metro).';
    }

    if (!date || isNaN(new Date(date).getTime())) {
      errs.date = 'Please select a valid date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    const payload = {
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTransaction({
          ...initialData,
          ...payload,
        });
        if (onSubmitSuccess) onSubmitSuccess('Transaction updated successfully.');
      } else {
        await addTransaction(payload);
        if (onSubmitSuccess) onSubmitSuccess('Transaction recorded successfully.');
      }
    } catch (error) {
      setServerError(error.message || 'Something went wrong. Please try again.');
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

      {/* Type Toggle: Expense vs Income */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Income (+)
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Amount (₹) *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            step="any"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
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

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.category
              ? 'border-rose-500 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        >
          {availableCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Description / Note *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'expense' ? 'e.g. Canteen samosa & chai, Metro recharge' : 'e.g. Monthly allowance, Freelance project'}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.description
              ? 'border-rose-500 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.description}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Date *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            errors.date
              ? 'border-rose-500 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
        />
        {errors.date && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>
        )}
      </div>

      {/* Action Buttons */}
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
}
