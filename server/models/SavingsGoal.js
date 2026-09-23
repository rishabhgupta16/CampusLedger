import mongoose from 'mongoose';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name is too long'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0.01, 'Target amount must be greater than zero'],
    },
    savedAmount: {
      type: Number,
      required: true,
      min: [0, 'Saved amount cannot be negative'],
      default: 0,
    },
    // Free string, not a hard enum — same treatment as Transaction.category
    // and CategoryBudget.category elsewhere in this schema design. The
    // frontend's GOAL_CATEGORIES list (Tech/Trip/Fitness/Education/
    // Emergency Fund/Gadgets/Other) still drives the dropdown UI; the model
    // doesn't hard-restrict to exactly those values so the frontend list can
    // evolve without a backend migration.
    category: {
      type: String,
      trim: true,
      default: 'Other',
    },
    // Plain YYYY-MM-DD string (nullable), not a native Date — same reasoning
    // as Transaction.date/RecurringExpense.nextDueDate: preserves the
    // existing <input type="date"> contract and dateUtils.js's string-based
    // parsing (formatDate/daysUntil) exactly.
    targetDate: {
      type: String,
      default: null,
      validate: {
        validator: (value) =>
          value === null || value === '' || (DATE_REGEX.test(value) && !isNaN(new Date(value).getTime())),
        message: 'targetDate must be a valid date in YYYY-MM-DD format',
      },
    },
  },
  { timestamps: true }
);

savingsGoalSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
