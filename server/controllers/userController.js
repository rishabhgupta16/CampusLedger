import User from '../models/User.js';

const ALLOWED_PERSONAS = ['college_student', 'college_gym'];

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

/**
 * GET /api/users/profile
 */
export async function getProfile(req, res) {
  res.status(200).json({ success: true, user: req.user });
}

/**
 * PUT /api/users/profile
 * Only a fixed allow-list of fields is ever read off req.body — email,
 * password, and _id are never inspected here, so they can never reach the
 * update regardless of what a client sends.
 */
export async function updateProfile(req, res) {
  const update = {};

  if (req.body.name !== undefined) {
    const trimmed = String(req.body.name).trim();
    if (trimmed.length < 2) {
      throw badRequest('Name must be at least 2 characters');
    }
    update.name = trimmed;
  }

  if (req.body.college !== undefined) {
    update.college = String(req.body.college).trim();
  }

  if (req.body.persona !== undefined) {
    if (!ALLOWED_PERSONAS.includes(req.body.persona)) {
      throw badRequest('Persona must be "college_student" or "college_gym"');
    }
    update.persona = req.body.persona;
  }

  if (req.body.preferredCategories !== undefined) {
    if (!Array.isArray(req.body.preferredCategories)) {
      throw badRequest('preferredCategories must be an array');
    }
    update.preferredCategories = req.body.preferredCategories.map((c) => String(c));
  }

  if (req.body.onboardingCompleted !== undefined) {
    update.onboardingCompleted = Boolean(req.body.onboardingCompleted);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: update },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, user });
}
