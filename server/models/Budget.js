import mongoose from 'mongoose';

// One Budget document per user. The field is named `monthlyBudget` here on
// the backend; the existing frontend has always called this
// `monthlySpendingBudget`. That naming difference is intentionally bridged
// in exactly one place — FinanceContext.jsx — rather than renamed throughout
// the app. See FinanceContext's setBudget()/the financial-settings fetch
// effect for the bridge.
const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    monthlyAllowance: {
      type: Number,
      required: true,
      min: [0, 'Monthly allowance cannot be negative'],
      default: 0,
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: [0, 'Monthly budget cannot be negative'],
      default: 0,
    },
    savingsTarget: {
      type: Number,
      required: true,
      min: [0, 'Savings target cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

budgetSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
