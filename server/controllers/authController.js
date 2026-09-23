import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Public. Creates a new user with a hashed password and returns a JWT.
 *
 * Note: responses pass the raw Mongoose document straight to res.json().
 * The password never reaches the client because User.js's schema-level
 * toJSON transform strips it at serialization time — no manual stripping
 * needed here, so there is exactly one place that decides "password never
 * leaves the server."
 */
export async function register(req, res) {
  const { name, email, password, college, persona } = req.body;

  if (!name || !name.trim()) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }
  // Trim before format-validating — a copy-pasted email with accidental
  // leading/trailing whitespace should be normalized, not rejected as
  // "invalid" (login already trims before its own checks; this keeps
  // register consistent with that).
  const trimmedEmail = typeof email === 'string' ? email.trim() : email;
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    const error = new Error('A valid email is required');
    error.statusCode = 400;
    throw error;
  }
  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with that email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    college: college?.trim() || '',
    persona: persona === 'college_gym' ? 'college_gym' : 'college_student',
  });

  res.status(201).json({
    success: true,
    user,
    token: generateToken(user._id),
  });
}

/**
 * POST /api/auth/login
 * Public. Verifies credentials and returns a JWT.
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // password has `select: false` on the schema, so it must be explicitly
  // re-selected here to compare it — it is still stripped from the
  // response below by the schema's toJSON transform.
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    user,
    token: generateToken(user._id),
  });
}

/**
 * GET /api/auth/me
 * Protected. Returns the currently authenticated user's safe profile.
 * req.user is populated by authMiddleware's protect().
 */
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}
