/**
 * Realistic Student Demo Data
 * Tailored for Indian college students balancing pocket money, canteen meals, transit, and gym/fitness expenses.
 */

import { getCurrentDateISO } from '../utils/dateUtils';

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

function createDate(dayOffset) {
  const d = new Date(today);
  d.setDate(today.getDate() - dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DEMO_PREFERENCES = {
  persona: 'college_gym', // College + Gym/Fitness
  studentName: 'Rishabh',
  collegeName: 'Campus University',
  preferredCategories: [],
};

export const DEMO_BUDGET = {
  monthlyAllowance: 12000,
  monthlySpendingBudget: 10000,
  savingsTarget: 2000,
  categoryBudgets: {
    'Canteen / Food': 3000,
    'Travel / Transport': 1500,
    'Diet / Fitness Meals': 2500,
    'Gym Membership': 1000,
    'Entertainment': 1000,
  },
};

export const DEMO_TRANSACTIONS = [
  {
    id: 'demo_tx_1',
    type: 'income',
    amount: 12000,
    category: 'Monthly Pocket Money / Allowance',
    description: 'Monthly allowance from parents',
    date: createDate(18),
  },
  {
    id: 'demo_tx_2',
    type: 'expense',
    amount: 120,
    category: 'Canteen / Food',
    description: 'Canteen lunch (Rajma Rice & Chach)',
    date: createDate(0),
  },
  {
    id: 'demo_tx_3',
    type: 'expense',
    amount: 40,
    category: 'Tea / Coffee',
    description: 'Evening tea with friends at campus tapri',
    date: createDate(0),
  },
  {
    id: 'demo_tx_4',
    type: 'expense',
    amount: 180,
    category: 'Diet / Fitness Meals',
    description: 'Post-workout boiled eggs & banana shake',
    date: createDate(1),
  },
  {
    id: 'demo_tx_5',
    type: 'expense',
    amount: 60,
    category: 'Travel / Transport',
    description: 'Metro card top-up for college commute',
    date: createDate(2),
  },
  {
    id: 'demo_tx_6',
    type: 'expense',
    amount: 350,
    category: 'Books & Notes',
    description: 'Data Structures textbook & practical files',
    date: createDate(4),
  },
  {
    id: 'demo_tx_7',
    type: 'expense',
    amount: 800,
    category: 'Gym Membership',
    description: 'Campus fitness club monthly fee',
    date: createDate(10),
  },
  {
    id: 'demo_tx_8',
    type: 'expense',
    amount: 250,
    category: 'Entertainment',
    description: 'Weekend movie ticket with classmates',
    date: createDate(7),
  },
  {
    id: 'demo_tx_9',
    type: 'expense',
    amount: 299,
    category: 'Mobile / Wi-Fi Recharge',
    description: 'Monthly 5G mobile data pack',
    date: createDate(12),
  },
  {
    id: 'demo_tx_10',
    type: 'income',
    amount: 1500,
    category: 'Part-Time / Freelancing',
    description: 'Frontend bug fixes for college club website',
    date: createDate(5),
  },
];

export const DEMO_GOALS = [
  {
    id: 'goal_1',
    name: 'Coding Laptop Upgrade',
    targetAmount: 50000,
    savedAmount: 18500,
    category: 'Tech',
    targetDate: `${currentYear}-12-31`,
  },
  {
    id: 'goal_2',
    name: 'Manali College Trip',
    targetAmount: 8000,
    savedAmount: 4500,
    category: 'Trip',
    targetDate: `${currentYear}-11-15`,
  },
];

export const DEMO_RECURRING = [
  {
    id: 'rec_1',
    name: 'Gym Membership',
    amount: 800,
    category: 'Gym Membership',
    frequency: 'Monthly',
    nextDueDate: `${currentYear}-${currentMonth}-28`,
  },
  {
    id: 'rec_2',
    name: 'Spotify Student Plan',
    amount: 59,
    category: 'Subscriptions',
    frequency: 'Monthly',
    nextDueDate: `${currentYear}-${currentMonth}-25`,
  },
  {
    id: 'rec_3',
    name: 'Hostel Wi-Fi Contribution',
    amount: 200,
    category: 'Mobile / Wi-Fi Recharge',
    frequency: 'Monthly',
    nextDueDate: `${currentYear}-${currentMonth}-30`,
  },
];
