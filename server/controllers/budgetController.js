import Budget from '../models/Budget.js';

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateBudgetInput(body) {
  const { monthlyAllowance, monthlyBudget, savingsTarget } = body;
  const fields = { monthlyAllowance, monthlyBudget, savingsTarget };

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      throw badRequest(`${key} must be a non-negative number`);
    }
  }
}

/**
 * GET /api/budget
 * A new user has no Budget document yet — return sensible zero defaults
 * rather than a 404, so the frontend never has to special-case "no budget".
 */
export async function getBudget(req, res) {
  const budget = await Budget.findOne({ user: req.user._id });

  if (!budget) {
    return res.status(200).json({
      success: true,
      budget: { id: null, monthlyAllowance: 0, monthlyBudget: 0, savingsTarget: 0 },
    });
  }

  res.status(200).json({ success: true, budget });
}

/**
 * PUT /api/budget
 * Create-or-update the authenticated user's single Budget document.
 * Ownership always comes from req.user._id, never the request body.
 */
export async function updateBudget(req, res) {
  validateBudgetInput(req.body);
  const { monthlyAllowance, monthlyBudget, savingsTarget } = req.body;

  const update = {};
  if (monthlyAllowance !== undefined) update.monthlyAllowance = Number(monthlyAllowance);
  if (monthlyBudget !== undefined) update.monthlyBudget = Number(monthlyBudget);
  if (savingsTarget !== undefined) update.savingsTarget = Number(savingsTarget);

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id },
    { $set: update, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, budget });
}
