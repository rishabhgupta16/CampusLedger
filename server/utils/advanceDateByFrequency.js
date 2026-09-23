/**
 * Server-side replica of src/utils/dateUtils.js's advanceDateByFrequency —
 * kept byte-for-byte behaviorally identical (same Date arithmetic, same
 * YYYY-MM-DD output) so mark-as-paid produces exactly the due-date
 * semantics the existing frontend already relies on. Duplicated rather than
 * imported because the frontend and backend are separate bundles with no
 * shared module boundary in this project's architecture — this is the one
 * function where that matters enough to note.
 */
/**
 * Local-date YYYY-MM-DD string, not toISOString() — toISOString() converts
 * to UTC first, which silently shifts the date backward by one day whenever
 * the server process's local timezone is ahead of UTC (e.g. IST) and the
 * current time falls between local midnight and the UTC offset. Byte-for-
 * byte the same fix as the frontend's formatDateToLocalISO (src/utils/
 * dateUtils.js) — kept in sync for the same reason the rest of this file is.
 */
export function formatDateToLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
