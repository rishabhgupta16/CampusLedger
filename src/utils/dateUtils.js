/**
 * Native Date utilities for student financial calculations
 */

/**
 * Formats a Date object as a YYYY-MM-DD string using its LOCAL calendar date
 * (year/month/day getters), never `toISOString()`. `toISOString()` first
 * converts to UTC, which silently shifts the date backward by one day for
 * any timezone ahead of UTC (including IST, this app's target audience)
 * during the hours between local midnight and the UTC offset (e.g.
 * 00:00-05:29 for IST) — exactly the failure mode this function exists to
 * avoid.
 */
export function formatDateToLocalISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentDateISO() {
  return formatDateToLocalISO(new Date());
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Calculates remaining days in the current month (inclusive of today)
 * Handles last day of month, leap years, etc.
 */
export function getRemainingDaysInMonth(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = referenceDate.getDate();

  // Remaining days including today
  const remaining = lastDayOfMonth - currentDay + 1;
  return Math.max(1, remaining);
}

/**
 * Checks if a given date string falls in the current month
 */
export function isDateInCurrentMonth(dateString, referenceDate = new Date()) {
  if (!dateString) return false;
  
  // Directly inspect YYYY-MM to avoid UTC/local timezone shifts
  const datePart = String(dateString).split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    if (!isNaN(year) && !isNaN(month)) {
      return (
        year === referenceDate.getFullYear() &&
        month === referenceDate.getMonth()
      );
    }
  }

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === referenceDate.getFullYear() &&
    d.getMonth() === referenceDate.getMonth()
  );
}

/**
 * Returns current month label, e.g. "September 2026"
 */
export function getCurrentMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Advances a YYYY-MM-DD date string forward by one billing cycle of the given frequency.
 */
export function advanceDateByFrequency(dateString, frequency = 'Monthly') {
  const base = dateString ? new Date(dateString) : new Date();
  const d = isNaN(base.getTime()) ? new Date() : base;

  switch (frequency) {
    case 'Weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'Yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'Monthly':
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Number of whole days from today until the given date (negative if in the past).
 */
export function daysUntil(dateString, referenceDate = new Date()) {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return null;

  const startOfToday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfTarget - startOfToday) / msPerDay);
}

/**
 * Shared "how urgent is this due date" classifier, used by both the Budget page's
 * recurring-expense list and the Dashboard's Upcoming Payments widget so the two
 * views never disagree on what counts as overdue/due-soon.
 */
export function getDueStatusBadge(dateString, referenceDate = new Date()) {
  const remaining = daysUntil(dateString, referenceDate);
  if (remaining === null) return { label: null, tone: 'neutral', remaining: null };

  if (remaining < 0) return { label: 'Overdue', tone: 'danger', remaining };
  if (remaining === 0) return { label: 'Due Today', tone: 'danger', remaining };
  if (remaining <= 5) return { label: `Due in ${remaining}d`, tone: 'warning', remaining };
  return { label: null, tone: 'neutral', remaining };
}
