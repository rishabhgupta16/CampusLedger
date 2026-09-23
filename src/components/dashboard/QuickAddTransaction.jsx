import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import VoiceTransactionModal from '../voice/VoiceTransactionModal';
import { useFinance } from '../../hooks/useFinance';
import { getCategoriesByPersona } from '../../constants/categories';
import {
  Coffee,
  Utensils,
  Bus,
  Apple,
  Plus,
  ArrowDownLeft,
  Mic,
  BookOpen,
  Wifi,
  Film,
  Dumbbell,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

// Candidate quick-tap presets. Only the top 4 are shown, ordered with the
// student's preferred categories (set during onboarding) first, so this list
// personalizes itself instead of always showing the same 4 hardcoded taps.
const PRESET_CATALOG = [
  { label: 'Campus Chai', amount: 20, category: 'Tea / Coffee', icon: Coffee, color: '#8B5CF6' },
  { label: 'Canteen Meal', amount: 100, category: 'Canteen / Food', icon: Utensils, color: '#F97316' },
  { label: 'Metro Commute', amount: 50, category: 'Travel / Transport', icon: Bus, color: '#3B82F6' },
  { label: 'Gym Snack / Diet', amount: 120, category: 'Diet / Fitness Meals', icon: Apple, color: '#84CC16' },
  { label: 'Photocopy / Print', amount: 20, category: 'Books & Notes', icon: BookOpen, color: '#0EA5E9' },
  { label: 'Mobile Recharge', amount: 199, category: 'Mobile / Wi-Fi Recharge', icon: Wifi, color: '#06B6D4' },
  { label: 'Movie / Outing', amount: 250, category: 'Entertainment', icon: Film, color: '#A855F7' },
  { label: 'Gym Fee', amount: 800, category: 'Gym Membership', icon: Dumbbell, color: '#10B981' },
];

function buildQuickPresets(persona, preferredCategories = []) {
  const availableNames = new Set(getCategoriesByPersona(persona).map((c) => c.name));
  const applicable = PRESET_CATALOG.filter((p) => availableNames.has(p.category));

  const preferredSet = new Set(preferredCategories);
  const preferred = applicable.filter((p) => preferredSet.has(p.category));
  const rest = applicable.filter((p) => !preferredSet.has(p.category));

  return [...preferred, ...rest].slice(0, 4);
}

export default function QuickAddTransaction({ onQuickAddPreset, onOpenModal, onToast }) {
  const { state } = useFinance();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const presets = useMemo(
    () => buildQuickPresets(state.preferences.persona, state.preferences.preferredCategories),
    [state.preferences.persona, state.preferences.preferredCategories]
  );

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Record Spends
          </h3>
          <p className="text-[11px] text-slate-400">
            One-tap shortcuts for frequent student expenses
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak to Add</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenModal({ type: 'income' })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Add Pocket Money</span>
          </button>
        </div>
      </div>

      {/* Quick Tap Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onQuickAddPreset(preset)}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-surface-dark-card hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${preset.color}15`, color: preset.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {preset.label}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {formatCurrency(preset.amount)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Entry Trigger */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onOpenModal({ type: 'expense' })}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record Custom Spend / Income</span>
        </button>
      </div>

      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={(msg) => {
          setIsVoiceOpen(false);
          if (onToast) onToast(msg);
        }}
      />
    </Card>
  );
}
