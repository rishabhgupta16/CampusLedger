import mongoose from 'mongoose';
import RecurringExpense from '../models/RecurringExpense.js';
import Transaction from '../models/Transaction.js';
import { advanceDateByFrequency, formatDateToLocalISO } from '../utils/advanceDateByFrequency.js';

const FREQUENCIES = ['Weekly', 'Monthly', 'Yearly'];
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
    throw badRequest('Invalid recurring expense id');
  }
}

function validateRecurringInput(body, { partial = false } = {}) {
  const { name, amount, category, frequency, nextDueDate } = body;

  if (!partial || name !== undefined) {
    if (!name || !String(name).trim()) throw badRequest('Name is required');
  }
  if (!partial || amount !== undefined) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw badRequest('Amount must be a number greater than zero');
    }
  }
  if (!partial || category !== undefined) {
    if (!category || !String(category).trim()) throw badRequest('Category is required');
  }
  if (!partial || frequency !== undefined) {
    if (!FREQUENCIES.includes(frequency)) {
      throw badRequest(`Frequency must be one of: ${FREQUENCIES.join(', ')}`);
    }
  }
  if (!partial || nextDueDate !== undefined) {
    if (!nextDueDate || !DATE_REGEX.test(nextDueDate) || isNaN(new Date(nextDueDate).getTime())) {
      throw badRequest('nextDueDate must be a valid date in YYYY-MM-DD format');
    }
  }
}

/**
 * GET /api/recurring
 */
export async function getRecurringExpenses(req, res) {
  const recurringExpenses = await RecurringExpense.find({ user: req.user._id }).sort({ nextDueDate: 1 });
  res.status(200).json({ success: true, recurringExpenses });
}

/**
 * POST /api/recurring
 */
export async function createRecurringExpense(req, res) {
  validateRecurringInput(req.body);
  const { name, amount, category, frequency, nextDueDate } = req.body;

  const recurringExpense = await RecurringExpense.create({
    user: req.user._id,
    name: String(name).trim(),
    amount: Number(amount),
    category: String(category).trim(),
    frequency,
    nextDueDate,
  });

  res.status(201).json({ success: true, recurringExpense });
}

/**
 * PUT /api/recurring/:id
 */
export async function updateRecurringExpense(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);
  validateRecurringInput(req.body, { partial: true });

  const recurringExpense = await RecurringExpense.findOne({ _id: id, user: req.user._id });
  if (!recurringExpense) {
    throw notFound('Recurring expense not found');
  }

  const { name, amount, category, frequency, nextDueDate, active } = req.body;
  if (name !== undefined) recurringExpense.name = String(name).trim();
  if (amount !== undefined) recurringExpense.amount = Number(amount);
  if (category !== undefined) recurringExpense.category = String(category).trim();
  if (frequency !== undefined) recurringExpense.frequency = frequency;
  if (nextDueDate !== undefined) recurringExpense.nextDueDate = nextDueDate;
  if (active !== undefined) recurringExpense.active = Boolean(active);

  await recurringExpense.save();

  res.status(200).json({ success: true, recurringExpense });
}

/**
 * DELETE /api/recurring/:id
 */
export async function deleteRecurringExpense(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const recurringExpense = await RecurringExpense.findOneAndDelete({ _id: id, user: req.user._id });
  if (!recurringExpense) {
    throw notFound('Recurring expense not found');
  }

  res.status(200).json({ success: true, recurringExpense });
}

/**
 * POST /api/recurring/:id/pay
 *
 * The backend owns the whole "mark as paid" operation: verify ownership,
 * create exactly one expense Transaction from the recurring expense's
 * current amount/category/name, advance nextDueDate by its frequency, save
 * both, and return both. A single well-formed request can only ever create
 * one Transaction (one Transaction.create() call, no loop, no retry) — a
 * double-click on the frontend would issue a second HTTP request, not a
 * second write from this one.
 *
 * As of Phase B9: both writes (create Transaction, save RecurringExpense)
 * are wrapped in a Mongo multi-document session/transaction — confirmed live
 * against this Atlas cluster that session.withTransaction() is supported
 * (Atlas clusters are always replica sets, even on the free tier). Either
 * both writes commit or neither does; a failure partway through leaves
 * neither a stray transaction nor a silently-unadvanced due date.
 */
export async function markRecurringExpensePaid(req, res) {
  const { id } = req.params;
  assertValidObjectId(id);

  const session = await mongoose.startSession();
  let recurringExpense;
  let transaction;

  try {
    await session.withTransaction(async () => {
      recurringExpense = await RecurringExpense.findOne({ _id: id, user: req.user._id }).session(session);
      if (!recurringExpense) {
        throw notFound('Recurring expense not found');
      }

      // Local-date "today" (see formatDateToLocalISO's doc comment) — kept
      // in sync with the frontend's own "today" calculation (src/utils/
      // dateUtils.js's getCurrentDateISO/formatDateToLocalISO, used for the
      // equivalent quick-add "today" date), fixed in both places together
      // as of Phase B9 after finding toISOString() silently shifted the
      // date back one day during the local-midnight-to-UTC-offset window
      // (e.g. IST 00:00-05:29).
      const paymentDate = formatDateToLocalISO();

      const created = await Transaction.create(
        [
          {
            user: req.user._id,
            type: 'expense',
            amount: recurringExpense.amount,
            category: recurringExpense.category,
            description: `${recurringExpense.name} (recurring)`,
            date: paymentDate,
          },
        ],
        { session }
      );
      transaction = created[0];

      recurringExpense.nextDueDate = advanceDateByFrequency(recurringExpense.nextDueDate, recurringExpense.frequency);
      await recurringExpense.save({ session });
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({ success: true, recurringExpense, transaction });
}
