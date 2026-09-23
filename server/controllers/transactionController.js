import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

const VALID_TYPES = ['income', 'expense'];
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

/**
 * Validates transaction input. In `partial` mode (used by updateTransaction),
 * only fields that are actually present in the body are validated — this is
 * a targeted PUT that may only change one field (e.g. just the amount).
 */
function validateTransactionInput(body, { partial = false } = {}) {
  const { type, amount, category, date } = body;

  if (!partial || type !== undefined) {
    if (!VALID_TYPES.includes(type)) {
      throw badRequest('Type must be either "income" or "expense"');
    }
  }

  if (!partial || amount !== undefined) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw badRequest('Amount must be a number greater than zero');
    }
  }

  if (!partial || category !== undefined) {
    if (!category || !String(category).trim()) {
      throw badRequest('Category is required');
    }
  }

  if (!partial || date !== undefined) {
    if (!date || !DATE_REGEX.test(date) || isNaN(new Date(date).getTime())) {
      throw badRequest('A valid date (YYYY-MM-DD) is required');
    }
  }
}

function assertValidObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw badRequest('Invalid transaction id');
  }
}

/**
 * GET /api/transactions
 * Returns only the authenticated user's transactions.
 */
export async function getTransactions(req, res) {
  const transactions = await Transaction.find({ user: req.user._id }).sort({
    date: -1,
    createdAt: -1,
  });
  res.status(200).json({ success: true, transactions });
}

/**
 * POST /api/transactions
 * Creates a transaction owned by the authenticated user. Ownership always
 * comes from req.user._id — never from the request body.
 */
export async function createTransaction(req, res) {
  validateTransactionInput(req.body);
  const { type, amount, category, description, date } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount: Number(amount),
    category: String(category).trim(),
    description: description ? String(description).trim() : '',
    date,
  });

  res.status(201).json({ success: true, transaction });
}

/**
 * PUT /api/transactions/:id
 * Updates a transaction — only if it belongs to the authenticated user.
 */
export async function updateTransaction(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);
  validateTransactionInput(req.body, { partial: true });

  const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
  if (!transaction) {
    // Deliberately the same generic 404 whether the id doesn't exist at all
    // or it belongs to a different user — never confirm another user's data.
    throw notFound('Transaction not found');
  }

  const { type, amount, category, description, date } = req.body;
  if (type !== undefined) transaction.type = type;
  if (amount !== undefined) transaction.amount = Number(amount);
  if (category !== undefined) transaction.category = String(category).trim();
  if (description !== undefined) transaction.description = String(description).trim();
  if (date !== undefined) transaction.date = date;

  await transaction.save();

  res.status(200).json({ success: true, transaction });
}

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction — only if it belongs to the authenticated user.
 */
export async function deleteTransaction(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
  if (!transaction) {
    throw notFound('Transaction not found');
  }

  res.status(200).json({ success: true, transaction });
}
