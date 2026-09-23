import mongoose from 'mongoose';
import SavingsGoal from '../models/SavingsGoal.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function assertValidObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw badRequest('Invalid goal id');
  }
}

function validateTargetDate(value) {
  if (value === undefined || value === null || value === '') return null;
  if (!DATE_REGEX.test(value) || isNaN(new Date(value).getTime())) {
    throw badRequest('targetDate must be a valid date in YYYY-MM-DD format');
  }
  return value;
}

/**
 * GET /api/goals
 */
export async function getGoals(req, res) {
  const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, goals });
}

/**
 * POST /api/goals
 */
export async function createGoal(req, res) {
  const { name, targetAmount, savedAmount, category, targetDate } = req.body;

  if (!name || !String(name).trim()) {
    throw badRequest('Name is required');
  }

  const numTarget = Number(targetAmount);
  if (!Number.isFinite(numTarget) || numTarget <= 0) {
    throw badRequest('Target amount must be greater than zero');
  }

  const numSaved = savedAmount !== undefined ? Number(savedAmount) : 0;
  if (!Number.isFinite(numSaved) || numSaved < 0) {
    throw badRequest('Saved amount cannot be negative');
  }
  // Mirrors GoalForm's own client-side check on creation — never allow
  // starting a goal already "over-funded".
  if (numSaved > numTarget) {
    throw badRequest('Saved amount cannot exceed the target amount');
  }

  const goal = await SavingsGoal.create({
    user: req.user._id,
    name: String(name).trim(),
    targetAmount: numTarget,
    savedAmount: numSaved,
    category: category ? String(category).trim() : 'Other',
    targetDate: validateTargetDate(targetDate),
  });

  res.status(201).json({ success: true, goal });
}

/**
 * PUT /api/goals/:id
 * Allow-list only (name/targetAmount/savedAmount/category/targetDate) —
 * ownership (user) can never change through this endpoint, and any other
 * field in the body is simply never read.
 */
export async function updateGoal(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const goal = await SavingsGoal.findOne({ _id: id, user: req.user._id });
  if (!goal) {
    throw notFound('Goal not found');
  }

  const { name, targetAmount, savedAmount, category, targetDate } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) throw badRequest('Name is required');
    goal.name = String(name).trim();
  }

  if (targetAmount !== undefined) {
    const numTarget = Number(targetAmount);
    if (!Number.isFinite(numTarget) || numTarget <= 0) {
      throw badRequest('Target amount must be greater than zero');
    }
    goal.targetAmount = numTarget;
  }

  if (savedAmount !== undefined) {
    const numSaved = Number(savedAmount);
    if (!Number.isFinite(numSaved) || numSaved < 0) {
      throw badRequest('Saved amount cannot be negative');
    }
    goal.savedAmount = numSaved;
  }

  if (category !== undefined) {
    goal.category = category ? String(category).trim() : 'Other';
  }

  if (targetDate !== undefined) {
    goal.targetDate = validateTargetDate(targetDate);
  }

  // Mirrors the existing GoalForm's own client-side validation: saved amount
  // can never exceed target amount. Checked here against the FINAL merged
  // values (not just whichever fields this particular request included), so
  // e.g. a request that only lowers targetAmount below an already-higher
  // savedAmount is still caught. Rejected with a 400 rather than silently
  // clamped — the existing frontend form refuses to submit this combination
  // at all (see GoalForm.jsx's own `parsedSaved > parsedTarget` check), so
  // the backend preserves that exact "never allow the inconsistent state"
  // semantics instead of inventing new clamp-on-edit behavior.
  //
  // This is deliberately DIFFERENT from addMoney() below, which DOES clamp —
  // that mirrors a different existing reducer (ADD_GOAL_FUNDS), which uses
  // Math.min() rather than rejecting.
  if (goal.savedAmount > goal.targetAmount) {
    throw badRequest('Saved amount cannot exceed the target amount');
  }

  await goal.save();
  res.status(200).json({ success: true, goal });
}

/**
 * DELETE /api/goals/:id
 */
export async function deleteGoal(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const goal = await SavingsGoal.findOneAndDelete({ _id: id, user: req.user._id });
  if (!goal) {
    throw notFound('Goal not found');
  }

  res.status(200).json({ success: true, goal });
}

/**
 * POST /api/goals/:id/add-money
 * Mirrors the existing ADD_GOAL_FUNDS reducer exactly: the resulting
 * savedAmount is clamped at targetAmount via Math.min() — over-funding is
 * silently capped, never rejected, never stored as overflow. This is the
 * one place goal completion is reached; the clamp is what guarantees
 * savedAmount === targetAmount exactly at completion, not something above it.
 */
export async function addMoney(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const { amount } = req.body;
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    throw badRequest('Amount must be a number greater than zero');
  }

  const goal = await SavingsGoal.findOne({ _id: id, user: req.user._id });
  if (!goal) {
    throw notFound('Goal not found');
  }

  goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + numAmount);
  await goal.save();

  res.status(200).json({ success: true, goal });
}
