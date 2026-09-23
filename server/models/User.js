import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [128, 'Password is too long'],
      // Excluded from query results by default (register/login controllers
      // opt back in with .select('+password') only when they need to hash
      // or compare it).
      select: false,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    // Aligned with the existing frontend's canonical STUDENT_PERSONAS values
    // (src/constants/categories.js) — the frontend is the source of truth
    // for this vocabulary, not the other way around.
    persona: {
      type: String,
      enum: ['college_student', 'college_gym'],
      default: 'college_student',
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash the password whenever it's set/changed — never store plaintext.
// Async middleware signals completion by resolving its returned promise
// (no `next` callback needed/passed for async pre-hooks in Mongoose 9+).
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Defense in depth: even if a query explicitly re-selects the password
// (e.g. login's .select('+password')), it is stripped here at JSON
// serialization time so it can never leak out through an API response.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
