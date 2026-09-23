import React, { useState } from 'react';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../utils/currency';
import { PiggyBank } from 'lucide-react';

export default function AddFundsForm({ goal, onSubmitSuccess, onCancel }) {
  const { addGoalFunds } = useFinance();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = Math.max(0, (goal?.targetAmount || 0) - (goal?.savedAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      // Uses the server-confirmed updated goal (already clamped at
      // targetAmount by the backend) rather than re-deriving the new total
      // locally — avoids the message ever disagreeing with what was
      // actually persisted.
      const updatedGoal = await addGoalFunds(goal.id, parsedAmount);
      if (onSubmitSuccess) {
        const message = updatedGoal.savedAmount >= updatedGoal.targetAmount
          ? `Goal complete! "${goal.name}" is fully funded.`
          : `Added ${formatCurrency(parsedAmount)} to "${goal.name}".`;
        onSubmitSuccess(message);
      }
    } catch (err) {
      setError(err.message || 'Could not add funds. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40">
        <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
          <PiggyBank className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-brand-800 dark:text-brand-300">
          <p className="font-bold">{formatCurrency(remaining)} remaining</p>
          <p className="opacity-80">to fully fund "{goal?.name}"</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Amount to Add (₹) *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            autoFocus
            className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
              error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
            } text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
          />
        </div>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {[100, 250, 500, 1000].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(String(preset))}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ₹{preset}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" size="md" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="success" size="md" icon={PiggyBank} loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Money'}
        </Button>
      </div>
    </form>
  );
}
