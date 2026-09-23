import mongoose from 'mongoose';
import CategoryBudget from '../models/CategoryBudget.js';

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

function conflict(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

function assertValidObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw badRequest('Invalid category budget id');
  }
}

function validateLimit(limit) {
  const numeric = Number(limit);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw badRequest('Limit must be a non-negative number');
  }
  return numeric;
}

/**
 * GET /api/category-budgets
 */
export async function getCategoryBudgets(req, res) {
  const categoryBudgets = await CategoryBudget.find({ user: req.user._id }).sort({ category: 1 });
  res.status(200).json({ success: true, categoryBudgets });
}

/**
 * POST /api/category-budgets
 */
export async function createCategoryBudget(req, res) {
  const { category, limit } = req.body;
  if (!category || !String(category).trim()) {
    throw badRequest('Category is required');
  }
  const validatedLimit = validateLimit(limit);

  try {
    const categoryBudget = await CategoryBudget.create({
      user: req.user._id,
      category: String(category).trim(),
      limit: validatedLimit,
    });
    res.status(201).json({ success: true, categoryBudget });
  } catch (error) {
    if (error.code === 11000) {
      throw conflict(`A budget for "${category}" already exists`);
    }
    throw error;
  }
}

/**
 * PUT /api/category-budgets/:id
 */
export async function updateCategoryBudget(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const update = {};
  if (req.body.category !== undefined) {
    if (!String(req.body.category).trim()) {
      throw badRequest('Category cannot be empty');
    }
    update.category = String(req.body.category).trim();
  }
  if (req.body.limit !== undefined) {
    update.limit = validateLimit(req.body.limit);
  }

  let categoryBudget;
  try {
    categoryBudget = await CategoryBudget.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw conflict(`A budget for "${update.category}" already exists`);
    }
    throw error;
  }

  if (!categoryBudget) {
    throw notFound('Category budget not found');
  }

  res.status(200).json({ success: true, categoryBudget });
}

/**
 * DELETE /api/category-budgets/:id
 */
export async function deleteCategoryBudget(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const categoryBudget = await CategoryBudget.findOneAndDelete({ _id: id, user: req.user._id });
  if (!categoryBudget) {
    throw notFound('Category budget not found');
  }

  res.status(200).json({ success: true, categoryBudget });
}
