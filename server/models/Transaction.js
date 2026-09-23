import mongoose from 'mongoose';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
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
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description is too long'],
      default: '',
    },
    // Kept as a plain YYYY-MM-DD string (not a native Date) to exactly match
    // the existing frontend contract: <input type="date"> values, and
    // dateUtils.js/calculations.js's string-based date parsing all expect
    // this shape already. Storing a native Date here would serialize to a
    // full ISO timestamp and silently break the edit-transaction form and
    // date-based calculations.
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: (value) => DATE_REGEX.test(value) && !isNaN(new Date(value).getTime()),
        message: 'Date must be a valid date in YYYY-MM-DD format',
      },
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

// Normalize the JSON shape to exactly what the frontend already produces
// itself (id/type/amount/category/description/date/createdAt/updatedAt) —
// hides Mongo-specific fields (_id, __v, user) the frontend never had.
transactionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
