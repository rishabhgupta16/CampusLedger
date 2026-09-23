import React, { createContext, useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { APP_CONFIG } from '../constants/appConfig';
import { STUDENT_PERSONAS } from '../constants/categories';
import { useAuth } from './AuthContext';
import * as transactionService from '../services/transactionService';
import * as budgetService from '../services/budgetService';
import * as categoryBudgetService from '../services/categoryBudgetService';
import * as userService from '../services/userService';
import * as recurringService from '../services/recurringService';
import * as goalService from '../services/goalService';
import {
  DEMO_TRANSACTIONS,
  DEMO_BUDGET,
  DEMO_GOALS,
  DEMO_RECURRING,
  DEMO_PREFERENCES,
} from '../data/demoData';

export const FinanceContext = createContext(null);

// Initial default state
const INITIAL_STATE = {
  preferences: {
    persona: STUDENT_PERSONAS.GENERAL,
    studentName: 'Student',
    collegeName: '',
    preferredCategories: [],
  },
  budget: {
    monthlyAllowance: APP_CONFIG.DEFAULT_VALUES.MONTHLY_ALLOWANCE,
    monthlySpendingBudget: APP_CONFIG.DEFAULT_VALUES.MONTHLY_BUDGET,
    savingsTarget: APP_CONFIG.DEFAULT_VALUES.SAVINGS_TARGET,
    categoryBudgets: {},
  },
  transactions: [],
  goals: [],
  recurringExpenses: [],
  isLoaded: false,
};

// Action types
export const FINANCE_ACTIONS = {
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA',
  SET_FINANCIAL_SETTINGS: 'SET_FINANCIAL_SETTINGS',
  SET_PREFERENCES: 'SET_PREFERENCES',
  SET_BUDGET: 'SET_BUDGET',
  SET_CATEGORY_BUDGET: 'SET_CATEGORY_BUDGET',
  REMOVE_CATEGORY_BUDGET: 'REMOVE_CATEGORY_BUDGET',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_GOALS: 'SET_GOALS',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  SET_RECURRING: 'SET_RECURRING',
  ADD_RECURRING: 'ADD_RECURRING',
  UPDATE_RECURRING: 'UPDATE_RECURRING',
  DELETE_RECURRING: 'DELETE_RECURRING',
};

function financeReducer(state, action) {
  switch (action.type) {
    case FINANCE_ACTIONS.LOAD_SAVED_DATA:
      return {
        ...state,
        ...action.payload,
        isLoaded: true,
      };

    // Wholesale replace of preferences+budget — used when (re)fetching from
    // the API (profile/budget/category-budgets), or clearing on logout.
    case FINANCE_ACTIONS.SET_FINANCIAL_SETTINGS:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload.preferences },
        budget: { ...state.budget, ...action.payload.budget },
      };

    case FINANCE_ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    case FINANCE_ACTIONS.SET_BUDGET:
      return {
        ...state,
        budget: {
          ...state.budget,
          ...action.payload,
        },
      };

    case FINANCE_ACTIONS.SET_CATEGORY_BUDGET:
      return {
        ...state,
        budget: {
          ...state.budget,
          categoryBudgets: {
            ...state.budget.categoryBudgets,
            [action.payload.category]: Number(action.payload.amount) || 0,
          },
        },
      };

    case FINANCE_ACTIONS.REMOVE_CATEGORY_BUDGET: {
      const updatedCatBudgets = { ...state.budget.categoryBudgets };
      delete updatedCatBudgets[action.payload.category];
      return {
        ...state,
        budget: {
          ...state.budget,
          categoryBudgets: updatedCatBudgets,
        },
      };
    }

    case FINANCE_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
      };

    case FINANCE_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case FINANCE_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case FINANCE_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case FINANCE_ACTIONS.SET_GOALS:
      return {
        ...state,
        goals: action.payload,
      };

    case FINANCE_ACTIONS.ADD_GOAL:
      return {
        ...state,
        goals: [action.payload, ...state.goals],
      };

    case FINANCE_ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };

    case FINANCE_ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };

    case FINANCE_ACTIONS.SET_RECURRING:
      return {
        ...state,
        recurringExpenses: action.payload,
      };

    case FINANCE_ACTIONS.ADD_RECURRING:
      return {
        ...state,
        recurringExpenses: [action.payload, ...state.recurringExpenses],
      };

    case FINANCE_ACTIONS.UPDATE_RECURRING:
      return {
        ...state,
        recurringExpenses: state.recurringExpenses.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };

    case FINANCE_ACTIONS.DELETE_RECURRING:
      return {
        ...state,
        recurringExpenses: state.recurringExpenses.filter((r) => r.id !== action.payload),
      };

    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, INITIAL_STATE);
  const { isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [recurringError, setRecurringError] = useState(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);

  // Maps category name -> CategoryBudget Mongo id. The frontend UI only ever
  // refers to categories by name (see the existing { [category]: limit } map
  // shape below); this ref is internal bookkeeping so setCategoryBudget/
  // removeCategoryBudget know which document to PUT/DELETE. Not exposed
  // through context — nothing outside this file needs to know a category
  // budget has a Mongo id at all.
  const categoryBudgetIdsRef = useRef({});

  // As of Phase B7, every financial data slice is API-backed — there is
  // nothing left to load from or sync to localStorage. This dispatch only
  // marks state as "loaded" so downstream isLoaded checks keep working;
  // it carries no payload.
  useEffect(() => {
    dispatch({ type: FINANCE_ACTIONS.LOAD_SAVED_DATA, payload: {} });
  }, []);

  // Transactions: MongoDB is the single source of truth for an authenticated
  // user (Phase B4). Fetch on login, clear on logout.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      dispatch({ type: FINANCE_ACTIONS.SET_TRANSACTIONS, payload: [] });
      setTransactionsLoading(false);
      setTransactionsError(null);
      return;
    }

    let cancelled = false;
    setTransactionsLoading(true);
    setTransactionsError(null);

    transactionService
      .getTransactions()
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: FINANCE_ACTIONS.SET_TRANSACTIONS, payload: data.transactions || [] });
      })
      .catch((error) => {
        if (cancelled) return;
        setTransactionsError(error.message || 'Failed to load transactions.');
      })
      .finally(() => {
        if (!cancelled) setTransactionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  // Recurring expenses: MongoDB is the single source of truth for an
  // authenticated user as of Phase B6 — same pattern as transactions.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      dispatch({ type: FINANCE_ACTIONS.SET_RECURRING, payload: [] });
      setRecurringLoading(false);
      setRecurringError(null);
      return;
    }

    let cancelled = false;
    setRecurringLoading(true);
    setRecurringError(null);

    recurringService
      .getRecurringExpenses()
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: FINANCE_ACTIONS.SET_RECURRING, payload: data.recurringExpenses || [] });
      })
      .catch((error) => {
        if (cancelled) return;
        setRecurringError(error.message || 'Failed to load recurring expenses.');
      })
      .finally(() => {
        if (!cancelled) setRecurringLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  // Savings goals: MongoDB is the single source of truth for an
  // authenticated user as of Phase B7 — same pattern as transactions and
  // recurring expenses. This retires the last financial-data slice that was
  // still localStorage-backed.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      dispatch({ type: FINANCE_ACTIONS.SET_GOALS, payload: [] });
      setGoalsLoading(false);
      setGoalsError(null);
      return;
    }

    let cancelled = false;
    setGoalsLoading(true);
    setGoalsError(null);

    goalService
      .getGoals()
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: FINANCE_ACTIONS.SET_GOALS, payload: data.goals || [] });
      })
      .catch((error) => {
        if (cancelled) return;
        setGoalsError(error.message || 'Failed to load savings goals.');
      })
      .finally(() => {
        if (!cancelled) setGoalsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  // Financial settings (profile persona/name/college/preferredCategories +
  // budget + category budgets): MongoDB is the single source of truth for an
  // authenticated user as of Phase B5. Fetched together since Settings/
  // Onboarding/Dashboard all need them together; cleared on logout.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      categoryBudgetIdsRef.current = {};
      dispatch({
        type: FINANCE_ACTIONS.SET_FINANCIAL_SETTINGS,
        payload: { preferences: INITIAL_STATE.preferences, budget: INITIAL_STATE.budget },
      });
      setSettingsLoading(false);
      setSettingsError(null);
      return;
    }

    let cancelled = false;
    setSettingsLoading(true);
    setSettingsError(null);

    Promise.all([userService.getProfile(), budgetService.getBudget(), categoryBudgetService.getCategoryBudgets()])
      .then(([profileData, budgetData, categoryBudgetsData]) => {
        if (cancelled) return;

        const categoryBudgetsMap = {};
        const idMap = {};
        (categoryBudgetsData.categoryBudgets || []).forEach((cb) => {
          categoryBudgetsMap[cb.category] = cb.limit;
          idMap[cb.category] = cb.id;
        });
        categoryBudgetIdsRef.current = idMap;

        dispatch({
          type: FINANCE_ACTIONS.SET_FINANCIAL_SETTINGS,
          payload: {
            preferences: {
              persona: profileData.user.persona,
              studentName: profileData.user.name,
              collegeName: profileData.user.college || '',
              preferredCategories: profileData.user.preferredCategories || [],
            },
            budget: {
              monthlyAllowance: budgetData.budget.monthlyAllowance,
              // Centralized naming bridge — the ONLY place the backend's
              // "monthlyBudget" and the frontend's "monthlySpendingBudget"
              // are converted between each other.
              monthlySpendingBudget: budgetData.budget.monthlyBudget,
              savingsTarget: budgetData.budget.savingsTarget,
              categoryBudgets: categoryBudgetsMap,
            },
          },
        });
      })
      .catch((error) => {
        if (!cancelled) setSettingsError(error.message || 'Failed to load financial settings.');
      })
      .finally(() => {
        if (!cancelled) setSettingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  // Action Helpers for clean component consumption
  const addTransaction = useCallback(async (transaction) => {
    const data = await transactionService.createTransaction(transaction);
    dispatch({ type: FINANCE_ACTIONS.ADD_TRANSACTION, payload: data.transaction });
    return data.transaction;
  }, []);

  const updateTransaction = useCallback(async (transaction) => {
    const { id, ...rest } = transaction;
    const data = await transactionService.updateTransaction(id, rest);
    dispatch({ type: FINANCE_ACTIONS.UPDATE_TRANSACTION, payload: data.transaction });
    return data.transaction;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    await transactionService.deleteTransaction(id);
    dispatch({ type: FINANCE_ACTIONS.DELETE_TRANSACTION, payload: id });
  }, []);

  // budgetData accepts the frontend's existing keys (monthlyAllowance,
  // monthlySpendingBudget, savingsTarget) — the bridge to the backend's
  // "monthlyBudget" happens right here, the one other spot besides the fetch
  // effect above.
  const setBudget = useCallback(async (budgetData) => {
    const payload = {};
    if (budgetData.monthlyAllowance !== undefined) payload.monthlyAllowance = budgetData.monthlyAllowance;
    if (budgetData.monthlySpendingBudget !== undefined) payload.monthlyBudget = budgetData.monthlySpendingBudget;
    if (budgetData.savingsTarget !== undefined) payload.savingsTarget = budgetData.savingsTarget;

    const data = await budgetService.updateBudget(payload);
    dispatch({
      type: FINANCE_ACTIONS.SET_BUDGET,
      payload: {
        monthlyAllowance: data.budget.monthlyAllowance,
        monthlySpendingBudget: data.budget.monthlyBudget,
        savingsTarget: data.budget.savingsTarget,
      },
    });
    return data.budget;
  }, []);

  const setCategoryBudget = useCallback(async (category, amount) => {
    const existingId = categoryBudgetIdsRef.current[category];
    let data;
    if (existingId) {
      data = await categoryBudgetService.updateCategoryBudget(existingId, { limit: amount });
    } else {
      data = await categoryBudgetService.createCategoryBudget({ category, limit: amount });
      categoryBudgetIdsRef.current[category] = data.categoryBudget.id;
    }
    dispatch({
      type: FINANCE_ACTIONS.SET_CATEGORY_BUDGET,
      payload: { category, amount: data.categoryBudget.limit },
    });
    return data.categoryBudget;
  }, []);

  const removeCategoryBudget = useCallback(async (category) => {
    const id = categoryBudgetIdsRef.current[category];
    if (id) {
      await categoryBudgetService.deleteCategoryBudget(id);
      delete categoryBudgetIdsRef.current[category];
    }
    dispatch({ type: FINANCE_ACTIONS.REMOVE_CATEGORY_BUDGET, payload: { category } });
  }, []);

  // Updates the User profile (name/college/persona/preferredCategories/
  // onboardingCompleted — any subset). Also syncs AuthContext's user via
  // updateUser() so routing (which reads user.onboardingCompleted) and any
  // other auth-derived UI stay correct without a refresh.
  const setPreferences = useCallback(async (prefs) => {
    const payload = {};
    if (prefs.persona !== undefined) payload.persona = prefs.persona;
    if (prefs.studentName !== undefined) payload.name = prefs.studentName;
    if (prefs.collegeName !== undefined) payload.college = prefs.collegeName;
    if (prefs.preferredCategories !== undefined) payload.preferredCategories = prefs.preferredCategories;
    if (prefs.onboardingCompleted !== undefined) payload.onboardingCompleted = prefs.onboardingCompleted;

    const data = await userService.updateProfile(payload);

    dispatch({
      type: FINANCE_ACTIONS.SET_PREFERENCES,
      payload: {
        persona: data.user.persona,
        studentName: data.user.name,
        collegeName: data.user.college || '',
        preferredCategories: data.user.preferredCategories || [],
      },
    });

    updateUser(data.user);
    return data.user;
  }, [updateUser]);

  // Loads the realistic demo dataset through the REAL APIs, exactly like any
  // other user action — every write here goes through the same
  // authenticated, ownership-scoped endpoints as manual entry (no fake
  // frontend-only data path, no bypassed auth). The result is real MongoDB
  // data that survives a refresh, unlike the pre-B8 local-only preview.
  //
  // This is a REPLACE, not a merge: it deletes the user's existing
  // transactions/recurring expenses/goals/category budgets first, then
  // creates the demo set. That matches the confirmation dialog's existing,
  // already-shown promise ("will replace all of it — your current data will
  // be permanently lost") — implemented entirely with the existing
  // per-record delete/create endpoints from B4–B7; no new bulk-delete
  // server endpoint was added for this.
  //
  // Not wrapped in a database transaction: this is a sequence of ~20+
  // individual authenticated HTTP requests from the browser, and Mongo
  // sessions can't span that. If a request fails partway through, some
  // records may already be deleted/created while others aren't — demoError
  // is set and re-thrown so the caller shows an honest error rather than a
  // false success, and the next successful load will reconcile state
  // correctly (a fresh delete-then-recreate pass). For a portfolio demo
  // dataset this size, that's a reasonable, simple tradeoff over building
  // real multi-resource rollback.
  const loadDemoData = useCallback(async () => {
    setDemoLoading(true);
    setDemoError(null);
    try {
      // 1. Delete existing records (replace semantics).
      for (const tx of state.transactions) {
        await transactionService.deleteTransaction(tx.id);
      }
      for (const rec of state.recurringExpenses) {
        await recurringService.deleteRecurringExpense(rec.id);
      }
      for (const goal of state.goals) {
        await goalService.deleteGoal(goal.id);
      }
      for (const categoryId of Object.values(categoryBudgetIdsRef.current)) {
        await categoryBudgetService.deleteCategoryBudget(categoryId);
      }
      categoryBudgetIdsRef.current = {};

      // 2. Profile + overall budget (independent of each other).
      const [profileData, budgetData] = await Promise.all([
        userService.updateProfile({
          name: DEMO_PREFERENCES.studentName,
          college: DEMO_PREFERENCES.collegeName,
          persona: DEMO_PREFERENCES.persona,
          preferredCategories: DEMO_PREFERENCES.preferredCategories,
          onboardingCompleted: true,
        }),
        budgetService.updateBudget({
          monthlyAllowance: DEMO_BUDGET.monthlyAllowance,
          monthlyBudget: DEMO_BUDGET.monthlySpendingBudget,
          savingsTarget: DEMO_BUDGET.savingsTarget,
        }),
      ]);

      // 3. Category budgets (fresh creates — everything was just deleted above).
      const newCategoryBudgetsMap = {};
      const newCategoryIds = {};
      for (const [category, limit] of Object.entries(DEMO_BUDGET.categoryBudgets)) {
        const cbData = await categoryBudgetService.createCategoryBudget({ category, limit });
        newCategoryBudgetsMap[category] = cbData.categoryBudget.limit;
        newCategoryIds[category] = cbData.categoryBudget.id;
      }
      categoryBudgetIdsRef.current = newCategoryIds;

      // 4. Transactions, recurring expenses, goals — each demo record
      // created as a new API record. The frontend-only `id` fields on the
      // DEMO_* constants are stripped; the server assigns real ids.
      const newTransactions = [];
      for (const tx of DEMO_TRANSACTIONS) {
        const { id: _txId, ...payload } = tx;
        const txData = await transactionService.createTransaction(payload);
        newTransactions.push(txData.transaction);
      }

      const newRecurring = [];
      for (const rec of DEMO_RECURRING) {
        const { id: _recId, ...payload } = rec;
        const recData = await recurringService.createRecurringExpense(payload);
        newRecurring.push(recData.recurringExpense);
      }

      const newGoals = [];
      for (const goal of DEMO_GOALS) {
        const { id: _goalId, ...payload } = goal;
        const goalData = await goalService.createGoal(payload);
        newGoals.push(goalData.goal);
      }

      // 5. Apply everything to local state from server-confirmed responses.
      dispatch({
        type: FINANCE_ACTIONS.SET_FINANCIAL_SETTINGS,
        payload: {
          preferences: {
            persona: profileData.user.persona,
            studentName: profileData.user.name,
            collegeName: profileData.user.college || '',
            preferredCategories: profileData.user.preferredCategories || [],
          },
          budget: {
            monthlyAllowance: budgetData.budget.monthlyAllowance,
            monthlySpendingBudget: budgetData.budget.monthlyBudget,
            savingsTarget: budgetData.budget.savingsTarget,
            categoryBudgets: newCategoryBudgetsMap,
          },
        },
      });
      dispatch({ type: FINANCE_ACTIONS.SET_TRANSACTIONS, payload: newTransactions });
      dispatch({ type: FINANCE_ACTIONS.SET_RECURRING, payload: newRecurring });
      dispatch({ type: FINANCE_ACTIONS.SET_GOALS, payload: newGoals });

      updateUser(profileData.user);
    } catch (error) {
      setDemoError(
        error.message ||
          'Demo data did not load completely — some records may be missing or only partially replaced.'
      );
      throw error;
    } finally {
      setDemoLoading(false);
    }
  }, [state.transactions, state.recurringExpenses, state.goals, updateUser]);

  // Persists onboarding to the server: User profile (name/college/persona/
  // preferredCategories/onboardingCompleted=true) and Budget
  // (allowance/monthlyBudget/savingsTarget), in parallel. Updates both
  // FinanceContext's financial state AND AuthContext's user (so
  // user.onboardingCompleted flips true immediately and routing moves to
  // the Dashboard without a refresh).
  const completeOnboarding = useCallback(async (payload) => {
    const [profileData, budgetData] = await Promise.all([
      userService.updateProfile({
        name: payload.studentName,
        college: payload.collegeName,
        persona: payload.persona,
        preferredCategories: payload.preferredCategories,
        onboardingCompleted: true,
      }),
      budgetService.updateBudget({
        monthlyAllowance: payload.monthlyAllowance,
        monthlyBudget: payload.monthlySpendingBudget,
        savingsTarget: payload.savingsTarget,
      }),
    ]);

    dispatch({
      type: FINANCE_ACTIONS.SET_FINANCIAL_SETTINGS,
      payload: {
        preferences: {
          persona: profileData.user.persona,
          studentName: profileData.user.name,
          collegeName: profileData.user.college || '',
          preferredCategories: profileData.user.preferredCategories || [],
        },
        budget: {
          monthlyAllowance: budgetData.budget.monthlyAllowance,
          monthlySpendingBudget: budgetData.budget.monthlyBudget,
          savingsTarget: budgetData.budget.savingsTarget,
        },
      },
    });

    updateUser(profileData.user);
    return profileData.user;
  }, [updateUser]);

  // Goal Helpers — API-backed as of Phase B7.
  const addGoal = useCallback(async (goal) => {
    const data = await goalService.createGoal(goal);
    dispatch({ type: FINANCE_ACTIONS.ADD_GOAL, payload: data.goal });
    return data.goal;
  }, []);

  const updateGoal = useCallback(async (goal) => {
    const { id, ...rest } = goal;
    const data = await goalService.updateGoal(id, rest);
    dispatch({ type: FINANCE_ACTIONS.UPDATE_GOAL, payload: data.goal });
    return data.goal;
  }, []);

  // Uses the dedicated add-money endpoint (server clamps savedAmount at
  // targetAmount via Math.min(), the same clamp the original pre-B7
  // client-side reducer used) and applies the server-confirmed goal via
  // UPDATE_GOAL — no client-side clamping logic exists anymore.
  const addGoalFunds = useCallback(async (id, amount) => {
    const data = await goalService.addMoney(id, amount);
    dispatch({ type: FINANCE_ACTIONS.UPDATE_GOAL, payload: data.goal });
    return data.goal;
  }, []);

  const deleteGoal = useCallback(async (id) => {
    await goalService.deleteGoal(id);
    dispatch({ type: FINANCE_ACTIONS.DELETE_GOAL, payload: id });
  }, []);

  // Recurring Expense Helpers — API-backed as of Phase B6.
  const addRecurring = useCallback(async (recurring) => {
    const data = await recurringService.createRecurringExpense(recurring);
    dispatch({ type: FINANCE_ACTIONS.ADD_RECURRING, payload: data.recurringExpense });
    return data.recurringExpense;
  }, []);

  const updateRecurring = useCallback(async (recurring) => {
    const { id, ...rest } = recurring;
    const data = await recurringService.updateRecurringExpense(id, rest);
    dispatch({ type: FINANCE_ACTIONS.UPDATE_RECURRING, payload: data.recurringExpense });
    return data.recurringExpense;
  }, []);

  const deleteRecurring = useCallback(async (id) => {
    await recurringService.deleteRecurringExpense(id);
    dispatch({ type: FINANCE_ACTIONS.DELETE_RECURRING, payload: id });
  }, []);

  // Marking a recurring expense as paid is now a single combined API call —
  // the backend creates the expense transaction AND advances nextDueDate in
  // one request (see server/controllers/recurringController.js). This
  // deliberately does NOT call addTransaction() separately anymore, so
  // exactly one POST /api/transactions-equivalent write happens per mark-
  // paid action, not two. Centralized here so the Budget page and the
  // Dashboard's Upcoming Payments widget share the exact same behavior.
  const markRecurringPaid = useCallback(async (recurring) => {
    const data = await recurringService.markRecurringPaid(recurring.id);
    dispatch({ type: FINANCE_ACTIONS.UPDATE_RECURRING, payload: data.recurringExpense });
    dispatch({ type: FINANCE_ACTIONS.ADD_TRANSACTION, payload: data.transaction });
    return data;
  }, []);

  const value = {
    state,
    dispatch,
    transactionsLoading,
    transactionsError,
    settingsLoading,
    settingsError,
    recurringLoading,
    recurringError,
    goalsLoading,
    goalsError,
    demoLoading,
    demoError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    setCategoryBudget,
    removeCategoryBudget,
    setPreferences,
    completeOnboarding,
    loadDemoData,
    addGoal,
    updateGoal,
    addGoalFunds,
    deleteGoal,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    markRecurringPaid,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}
