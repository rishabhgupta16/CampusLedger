/**
 * Student-Focused Category Constants
 * Includes standard categories and college + gym/fitness specific categories.
 */

export const STUDENT_PERSONAS = {
  GENERAL: 'college_student',
  FITNESS: 'college_gym',
};

export const EXPENSE_CATEGORIES = [
  { id: 'canteen_food', name: 'Canteen / Food', icon: 'Utensils', color: '#F97316', persona: 'all' },
  { id: 'tea_coffee', name: 'Tea / Coffee', icon: 'Coffee', color: '#8B5CF6', persona: 'all' },
  { id: 'travel', name: 'Travel / Transport', icon: 'Bus', color: '#3B82F6', persona: 'all' },
  { id: 'college', name: 'College Expenses', icon: 'GraduationCap', color: '#6366F1', persona: 'all' },
  { id: 'books_notes', name: 'Books & Notes', icon: 'BookOpen', color: '#0EA5E9', persona: 'all' },
  { id: 'hostel_pg', name: 'Hostel / PG Rent', icon: 'Home', color: '#EC4899', persona: 'all' },
  { id: 'gym', name: 'Gym Membership', icon: 'Dumbbell', color: '#10B981', persona: 'fitness' },
  { id: 'supplements', name: 'Supplements / Whey', icon: 'Zap', color: '#14B8A6', persona: 'fitness' },
  { id: 'diet_meals', name: 'Diet / Fitness Meals', icon: 'Apple', color: '#84CC16', persona: 'fitness' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#F43F5E', persona: 'all' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#A855F7', persona: 'all' },
  { id: 'outings', name: 'Outings & Trips', icon: 'Compass', color: '#EAB308', persona: 'all' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Tv', color: '#64748B', persona: 'all' },
  { id: 'recharge', name: 'Mobile / Wi-Fi Recharge', icon: 'Wifi', color: '#06B6D4', persona: 'all' },
  { id: 'medical', name: 'Medical & Health', icon: 'HeartPulse', color: '#EF4444', persona: 'all' },
  { id: 'personal_care', name: 'Personal Care', icon: 'Sparkles', color: '#D946EF', persona: 'all' },
  { id: 'other_expense', name: 'Other Expenses', icon: 'MoreHorizontal', color: '#94A3B8', persona: 'all' },
];

export const INCOME_CATEGORIES = [
  { id: 'allowance', name: 'Monthly Pocket Money / Allowance', icon: 'Wallet', color: '#10B981' },
  { id: 'part_time', name: 'Part-Time / Freelancing', icon: 'Briefcase', color: '#3B82F6' },
  { id: 'scholarship', name: 'Scholarship / Grant', icon: 'Award', color: '#8B5CF6' },
  { id: 'gifts', name: 'Gifts & Rewards', icon: 'Gift', color: '#F59E0B' },
  { id: 'other_income', name: 'Other Income', icon: 'PlusCircle', color: '#64748B' },
];

/**
 * Filter categories according to user persona
 */
export function getCategoriesByPersona(persona = STUDENT_PERSONAS.GENERAL) {
  if (persona === STUDENT_PERSONAS.FITNESS) {
    return EXPENSE_CATEGORIES;
  }
  return EXPENSE_CATEGORIES.filter((cat) => cat.persona === 'all');
}

/**
 * Lookup category details by name
 */
export function getCategoryDetails(name, type = 'expense') {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find((c) => c.name.toLowerCase() === (name || '').toLowerCase());
  if (found) return found;

  return {
    id: 'unknown',
    name: name || 'General',
    icon: type === 'income' ? 'Wallet' : 'MoreHorizontal',
    color: type === 'income' ? '#10B981' : '#64748B',
  };
}
