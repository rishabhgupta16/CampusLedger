import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../../hooks/useFinance';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  GraduationCap,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  AlertCircle,
} from 'lucide-react';
import {
  STUDENT_PERSONAS,
  getCategoriesByPersona,
} from '../../constants/categories';
import { formatCurrency } from '../../utils/currency';
import CategoryIcon from '../../components/common/CategoryIcon';

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, completeOnboarding, loadDemoData } = useFinance();

  const [step, setStep] = useState(1); // 1: Persona & Profile, 2: Financial Setup, 3: Category Preferences

  // Form State
  const [persona, setPersona] = useState(STUDENT_PERSONAS.GENERAL);
  const [studentName, setStudentName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [monthlyAllowance, setMonthlyAllowance] = useState('12000');
  const [monthlySpendingBudget, setMonthlySpendingBudget] = useState('10000');
  const [savingsTarget, setSavingsTarget] = useState('2000');
  const [selectedCategories, setSelectedCategories] = useState([
    'Canteen / Food',
    'Tea / Coffee',
    'Travel / Transport',
    'Books & Notes',
    'Recharge',
  ]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);

  // Onboarding stays reachable after first-time setup (for re-configuration),
  // so a returning user with real data could still hit "Load Sample Student
  // Data" here — guard it exactly like Settings' demo button does.
  const hasExistingData =
    state.transactions.length > 0 || state.goals.length > 0 || state.recurringExpenses.length > 0;

  // When persona changes, adjust default category suggestions
  const handlePersonaSelect = (selectedPersona) => {
    setPersona(selectedPersona);
    if (selectedPersona === STUDENT_PERSONAS.FITNESS) {
      setSelectedCategories((prev) => {
        const set = new Set(prev);
        set.add('Gym Membership');
        set.add('Diet / Fitness Meals');
        return Array.from(set);
      });
    }
  };

  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Validation
  const validateStep2 = () => {
    const errs = {};
    const allowanceNum = Number(monthlyAllowance);
    const budgetNum = Number(monthlySpendingBudget);

    if (!monthlyAllowance || isNaN(allowanceNum) || allowanceNum <= 0) {
      errs.monthlyAllowance = 'Please enter a valid monthly allowance (greater than 0).';
    }
    if (!monthlySpendingBudget || isNaN(budgetNum) || budgetNum <= 0) {
      errs.monthlySpendingBudget = 'Please enter a valid monthly budget limit (greater than 0).';
    } else if (allowanceNum > 0 && budgetNum > allowanceNum) {
      errs.monthlySpendingBudget = 'Monthly budget cannot exceed your total monthly allowance.';
    }

    if (savingsTarget && (isNaN(Number(savingsTarget)) || Number(savingsTarget) < 0)) {
      errs.savingsTarget = 'Savings target must be a positive number.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleFinish = async () => {
    const payload = {
      persona,
      studentName: studentName.trim() || (persona === STUDENT_PERSONAS.FITNESS ? 'Gym Scholar' : 'Student'),
      collegeName: collegeName.trim(),
      monthlyAllowance: Number(monthlyAllowance) || 12000,
      monthlySpendingBudget: Number(monthlySpendingBudget) || 10000,
      savingsTarget: Number(savingsTarget) || 0,
      preferredCategories: selectedCategories,
    };

    setSubmitError('');
    setIsSubmitting(true);
    try {
      // Persists to MongoDB (User profile + Budget) and syncs AuthContext's
      // user so onboardingCompleted flips true immediately — no refresh needed.
      await completeOnboarding(payload);
      navigate('/', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Could not save your setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // loadDemoData() now persists everything through the real APIs, including
  // marking onboardingCompleted=true as part of its profile update — no
  // separate setPreferences() call needed here anymore (see FinanceContext).
  const runQuickDemo = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await loadDemoData();
      navigate('/', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Could not load demo data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    if (isSubmitting) return;
    if (hasExistingData) {
      setIsDemoConfirmOpen(true);
    } else {
      runQuickDemo();
    }
  };

  const handleConfirmQuickDemo = () => {
    setIsDemoConfirmOpen(false);
    runQuickDemo();
  };

  const availableCategories = getCategoriesByPersona(persona);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-light-base dark:bg-surface-dark-base text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to CampusLedger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            The student-first financial operating system to control daily pocket money and build lasting habits.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-brand-600'
                    : s < step
                    ? 'w-5 bg-emerald-500'
                    : 'w-5 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <Card subtle3D className="p-6 sm:p-8">
          {/* STEP 1: Persona & Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Choose Your Student Persona
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  We customize your suggested expense categories and insights based on your routine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* General College Student */}
                <button
                  type="button"
                  onClick={() => handlePersonaSelect(STUDENT_PERSONAS.GENERAL)}
                  aria-pressed={persona === STUDENT_PERSONAS.GENERAL}
                  className={`w-full text-left cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                    persona === STUDENT_PERSONAS.GENERAL
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-surface-dark-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {persona === STUDENT_PERSONAS.GENERAL && (
                      <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      College Student
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Focused on canteen food, chai/coffee, metro travel, books, college fests, and hostel rent.
                    </p>
                  </div>
                </button>

                {/* College + Gym/Fitness */}
                <button
                  type="button"
                  onClick={() => handlePersonaSelect(STUDENT_PERSONAS.FITNESS)}
                  aria-pressed={persona === STUDENT_PERSONAS.FITNESS}
                  className={`w-full text-left cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                    persona === STUDENT_PERSONAS.FITNESS
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-surface-dark-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    {persona === STUDENT_PERSONAS.FITNESS && (
                      <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      College + Gym/Fitness
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Includes campus expenses plus gym fee, whey protein, creatine, eggs, and diet meal tracking.
                    </p>
                  </div>
                </button>
              </div>

              {/* Student Name & College Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rishabh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    College / Campus (Optional)
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Delhi University / IIT / RKGIT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Monthly Financial Rules */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: Set Your Monthly Pocket Money & Budget
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  You are in complete control. CampusLedger never hardcodes arbitrary spending caps.
                </p>
              </div>

              <div className="space-y-4">
                {/* Monthly Allowance */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Pocket Money / Allowance (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={monthlyAllowance}
                      onChange={(e) => setMonthlyAllowance(e.target.value)}
                      placeholder="12000"
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                        errors.monthlyAllowance
                          ? 'border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      } text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
                    />
                  </div>
                  {errors.monthlyAllowance && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.monthlyAllowance}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Total amount you receive from parents, stipend, or part-time work every month.
                  </p>
                </div>

                {/* Monthly Spending Budget */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Spending Budget (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={monthlySpendingBudget}
                      onChange={(e) => setMonthlySpendingBudget(e.target.value)}
                      placeholder="10000"
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                        errors.monthlySpendingBudget
                          ? 'border-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      } text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
                    />
                  </div>
                  {errors.monthlySpendingBudget && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">
                      {errors.monthlySpendingBudget}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    The spending limit you set for yourself. We will use this to calculate your Daily Safe Spend!
                  </p>
                </div>

                {/* Savings Target */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Savings Target (₹) (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={savingsTarget}
                      onChange={(e) => setSavingsTarget(e.target.value)}
                      placeholder="2000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Buffer amount you want saved for emergencies, upcoming college trips, or gadgets.
                  </p>
                </div>

                {/* Calculation Preview Banner */}
                {Number(monthlyAllowance) > 0 && Number(monthlySpendingBudget) > 0 && (
                  <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Monthly Savings Buffer
                      </span>
                      <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Math.max(0, Number(monthlyAllowance) - Number(monthlySpendingBudget)))}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Est. Daily Safe Limit
                      </span>
                      <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                        ~{formatCurrency(Math.floor(Number(monthlySpendingBudget) / 30))}/day
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Category Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Preferred Daily Categories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the categories you spend on frequently for quick-tap recording.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  You can fine-tune or add category-specific budgets anytime from the Budget tab.
                </span>
              </div>
            </div>
          )}

          {/* Submission Error */}
          {submitError && (
            <div className="flex items-start gap-2.5 p-3.5 mt-6 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                icon={ArrowLeft}
                onClick={() => setStep((s) => s - 1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isSubmitting}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Zap className="w-3.5 h-3.5" />
                {isSubmitting ? 'Loading...' : 'Load Sample Student Data'}
              </button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                iconPosition="right"
                onClick={handleFinish}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Start Tracking'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog for Demo Data Overwrite (only shown if re-visiting
          onboarding with existing real data already saved) */}
      <ConfirmDialog
        isOpen={isDemoConfirmOpen}
        onClose={() => setIsDemoConfirmOpen(false)}
        onConfirm={handleConfirmQuickDemo}
        title="Replace Your Data With Demo Data?"
        message="You already have real transactions, goals, or recurring expenses saved. Loading the demo dataset will replace all of it — your current data will be permanently lost."
        confirmText="Yes, Replace My Data"
        cancelText="Keep My Data"
      />
    </div>
  );
}
