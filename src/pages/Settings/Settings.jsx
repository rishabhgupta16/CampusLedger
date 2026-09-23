import React, { useState, useEffect } from 'react';
import { useFinance } from '../../hooks/useFinance';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ThemeToggle from '../../components/common/ThemeToggle';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Sliders,
  Moon,
  GraduationCap,
  Dumbbell,
  CheckCircle2,
  RefreshCw,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { STUDENT_PERSONAS } from '../../constants/categories';
import { formatCurrency } from '../../utils/currency';

export default function Settings() {
  const { state, settingsLoading, demoLoading, demoError, setBudget, setPreferences, loadDemoData } = useFinance();
  const { preferences, budget, transactions, goals, recurringExpenses } = state;

  // Local Form state
  const [persona, setPersona] = useState(preferences.persona || STUDENT_PERSONAS.GENERAL);
  const [monthlyAllowance, setMonthlyAllowance] = useState(String(budget.monthlyAllowance || '12000'));
  const [monthlySpendingBudget, setMonthlySpendingBudget] = useState(String(budget.monthlySpendingBudget || '10000'));
  const [savingsTarget, setSavingsTarget] = useState(String(budget.savingsTarget || '2000'));

  // The form fields above are seeded once via useState's initial value, but
  // that initial value is often INITIAL_STATE's defaults — the real
  // server-loaded values usually arrive a moment later (settingsLoading
  // flips false). Re-sync once when loading finishes so the form doesn't
  // stay stuck showing defaults instead of the user's actual saved settings.
  useEffect(() => {
    if (!settingsLoading) {
      setPersona(preferences.persona || STUDENT_PERSONAS.GENERAL);
      setMonthlyAllowance(String(budget.monthlyAllowance || '0'));
      setMonthlySpendingBudget(String(budget.monthlySpendingBudget || '0'));
      setSavingsTarget(String(budget.savingsTarget || '0'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoading]);

  // Feedback & Dialog
  const [toastMessage, setToastMessage] = useState(null);
  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hasExistingData = transactions.length > 0 || goals.length > 0 || recurringExpenses.length > 0;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    const allowanceNum = Number(monthlyAllowance);
    const budgetNum = Number(monthlySpendingBudget);

    if (!monthlyAllowance || isNaN(allowanceNum) || allowanceNum <= 0) {
      errs.monthlyAllowance = 'Please enter a valid monthly allowance (greater than 0).';
    }
    if (!monthlySpendingBudget || isNaN(budgetNum) || budgetNum <= 0) {
      errs.monthlySpendingBudget = 'Please enter a valid spending budget (greater than 0).';
    } else if (allowanceNum > 0 && budgetNum > allowanceNum) {
      errs.monthlySpendingBudget = 'Spending budget cannot exceed your monthly allowance.';
    }

    if (savingsTarget && (isNaN(Number(savingsTarget)) || Number(savingsTarget) < 0)) {
      errs.savingsTarget = 'Savings target must be a positive number.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    try {
      await setBudget({
        monthlyAllowance: allowanceNum,
        monthlySpendingBudget: budgetNum,
        savingsTarget: Number(savingsTarget) || 0,
      });
      await setPreferences({
        persona,
      });
      showToast('Financial settings updated successfully!');
    } catch (error) {
      setServerError(error.message || 'Could not save your settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Loads the demo dataset through the real APIs (persists to MongoDB, see
  // FinanceContext.loadDemoData). Guarded by demoLoading so a repeated click
  // while it's already running can't kick off a second, overlapping load.
  const handleLoadDemo = async () => {
    if (demoLoading) return;
    try {
      await loadDemoData();
      setMonthlyAllowance('12000');
      setMonthlySpendingBudget('10000');
      setSavingsTarget('2000');
      setPersona(STUDENT_PERSONAS.FITNESS);
      showToast('Loaded realistic student demo dataset.');
    } catch (error) {
      showToast(error.message || 'Demo data did not load completely. Please try again.');
    }
  };

  // Demo loading replaces existing data outright, so guard it behind an
  // explicit confirmation whenever the user already has real transactions,
  // goals, or recurring expenses.
  const handleLoadDemoClick = () => {
    if (demoLoading) return;
    if (hasExistingData) {
      setIsDemoConfirmOpen(true);
    } else {
      handleLoadDemo();
    }
  };

  const handleConfirmLoadDemo = () => {
    setIsDemoConfirmOpen(false);
    handleLoadDemo();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Preferences & Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure your student persona, monthly spending limits, and appearance
        </p>
      </div>

      {/* Budget & Persona Form */}
      <form onSubmit={handleSaveBudget}>
        <Card subtle3D className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget & Persona Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You control your spending threshold. CampusLedger never forces arbitrary limits.
              </p>
            </div>
          </div>

          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {settingsLoading && (
            <p className="text-xs text-slate-400 -mt-2">Loading your saved settings...</p>
          )}

          <fieldset disabled={settingsLoading || isSaving} className="space-y-6 disabled:opacity-60">
          {/* Persona Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Student Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPersona(STUDENT_PERSONAS.GENERAL)}
                aria-pressed={persona === STUDENT_PERSONAS.GENERAL}
                className={`w-full text-left cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  persona === STUDENT_PERSONAS.GENERAL
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold">College Student</p>
                    <p className="text-[10px] text-slate-400">Canteen, tea, transit, books</p>
                  </div>
                </div>
                {persona === STUDENT_PERSONAS.GENERAL && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPersona(STUDENT_PERSONAS.FITNESS)}
                aria-pressed={persona === STUDENT_PERSONAS.FITNESS}
                className={`w-full text-left cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  persona === STUDENT_PERSONAS.FITNESS
                    ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Dumbbell className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold">College + Gym/Fitness</p>
                    <p className="text-[10px] text-slate-400">Gym fee, whey, diet meals</p>
                  </div>
                </div>
                {persona === STUDENT_PERSONAS.FITNESS && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                )}
              </button>
            </div>
          </div>

          {/* Numerical Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Allowance (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={monthlyAllowance}
                  onChange={(e) => setMonthlyAllowance(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              {errors.monthlyAllowance && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.monthlyAllowance}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Budget Limit (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={monthlySpendingBudget}
                  onChange={(e) => setMonthlySpendingBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              {errors.monthlySpendingBudget && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.monthlySpendingBudget}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Savings Target (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>
          </div>

          </fieldset>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" loading={isSaving} disabled={settingsLoading || isSaving}>
              {isSaving ? 'Saving...' : 'Save Financial Settings'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Theme Appearance Card */}
      <Card subtle3D className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Theme & Display
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between soft light and deep charcoal dark theme
              </p>
            </div>
          </div>
          <ThemeToggle showLabel />
        </div>
      </Card>

      {/* Data Management Card */}
      <Card subtle3D className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Demo Tools
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showcase the application with a realistic sample dataset
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Portfolio Presentation Demo Data
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Loads 10 realistic student transactions, budgets, recurring bills, and savings goals — saved to your account.
            </p>
            {demoError && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{demoError}</p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Zap}
            onClick={handleLoadDemoClick}
            loading={demoLoading}
            disabled={demoLoading}
            className="shrink-0"
          >
            {demoLoading ? 'Loading...' : 'Load Demo Data'}
          </Button>
        </div>
      </Card>

      {/* Confirmation Dialog for Demo Data Overwrite */}
      <ConfirmDialog
        isOpen={isDemoConfirmOpen}
        onClose={() => setIsDemoConfirmOpen(false)}
        onConfirm={handleConfirmLoadDemo}
        title="Replace Your Data With Demo Data?"
        message="You already have real transactions, goals, or recurring expenses saved. Loading the demo dataset will replace all of it — your current data will be permanently lost."
        confirmText="Yes, Replace My Data"
        cancelText="Keep My Data"
      />
    </div>
  );
}
