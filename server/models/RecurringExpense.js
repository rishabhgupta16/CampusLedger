import mongoose from 'mongoose';

// Must exactly match the frontend's FREQUENCIES list
// (src/components/budget/RecurringExpenseForm.jsx) — no new values invented.
const FREQUENCIES = ['Weekly', 'Monthly', 'Yearly'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const recurringExpenseSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    frequency: {
      type: String,
      enum: FREQUENCIES,
      default: 'Monthly',
    },
    // Plain YYYY-MM-DD string, not a native Date — same reasoning as
    // Transaction.date: preserves the existing <input type="date"> contract
    // and dateUtils.js's string-based date parsing exactly.
    nextDueDate: {
      type: String,
      required: [true, 'Next due date is required'],
      validate: {
        validator: (value) => DATE_REGEX.test(value) && !isNaN(new Date(value).getTime()),
        message: 'nextDueDate must be a valid date in YYYY-MM-DD format',
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

recurringExpenseSchema.index({ user: 1, nextDueDate: 1 });

recurringExpenseSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);

export default RecurringExpense;
