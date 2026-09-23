import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { formatCurrency } from '../../utils/currency';
import { formatDate, daysUntil } from '../../utils/dateUtils';
import {
  Laptop,
  Plane,
  Dumbbell,
  GraduationCap,
  ShieldAlert,
  Gift,
  Target,
  PiggyBank,
  Edit2,
  Trash2,
  PartyPopper,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Tech: Laptop,
  Trip: Plane,
  Fitness: Dumbbell,
  Education: GraduationCap,
  'Emergency Fund': ShieldAlert,
  Gadgets: Gift,
  Other: Target,
};

export default function GoalCard({ goal, onAddFunds, onEdit, onDelete }) {
  const { name, targetAmount, savedAmount, category, targetDate } = goal;
  const Icon = CATEGORY_ICONS[category] || Target;
  const percentage = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0;
  const isComplete = savedAmount >= targetAmount && targetAmount > 0;
  const remaining = Math.max(0, targetAmount - savedAmount);
  const remainingDays = targetDate ? daysUntil(targetDate) : null;

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4 relative overflow-hidden">
      {isComplete && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
          <PartyPopper className="w-3 h-3" />
          <span>Achieved</span>
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</h3>
          <p className="text-[11px] text-slate-400">
            {category}
            {targetDate ? ` • Target ${formatDate(targetDate)}` : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">{percentage}% funded</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(savedAmount)} / {formatCurrency(targetAmount)}
          </span>
        </div>
        <ProgressBar value={percentage} max={100} size="md" variant={isComplete ? 'safe' : 'brand'} />
      </div>

      {!isComplete && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span>Still needed</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(remaining)}</span>
        </div>
      )}

      {targetDate && remainingDays !== null && remainingDays >= 0 && !isComplete && (
        <p className="text-[11px] text-slate-400">
          {remainingDays === 0 ? 'Target date is today' : `${remainingDays} day${remainingDays === 1 ? '' : 's'} left to reach your target date`}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        {!isComplete && (
          <Button variant="success" size="sm" icon={PiggyBank} onClick={() => onAddFunds(goal)} className="flex-1">
            Add Money
          </Button>
        )}
        <Button variant="outline" size="sm" icon={Edit2} onClick={() => onEdit(goal)} className={isComplete ? 'flex-1' : ''}>
          Edit
        </Button>
        <button
          type="button"
          onClick={() => onDelete(goal)}
          title="Delete goal"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
