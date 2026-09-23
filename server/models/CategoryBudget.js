import mongoose from 'mongoose';

const categoryBudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Limit is required'],
      min: [0, 'Limit cannot be negative'],
    },
  },
  { timestamps: true }
);

// One budget per category per user.
categoryBudgetSchema.index({ user: 1, category: 1 }, { unique: true });

categoryBudgetSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

const CategoryBudget = mongoose.model('CategoryBudget', categoryBudgetSchema);

export default CategoryBudget;
