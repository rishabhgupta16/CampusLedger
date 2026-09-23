/**
 * Formats a number into Indian Rupee (INR) currency format using native Intl.NumberFormat
 * Example: 80 -> "₹80", 1250 -> "₹1,250", 125000 -> "₹1,25,000"
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFractionFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount = 0, showDecimals = false) {
  const numericAmount = Number(amount) || 0;
  if (showDecimals && numericAmount % 1 !== 0) {
    return inrFractionFormatter.format(numericAmount);
  }
  return inrFormatter.format(numericAmount);
}

/**
 * Format raw number with Indian numbering system (without ₹ symbol)
 * Example: 125000 -> "1,25,000"
 */
export function formatIndianNumber(value = 0) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN').format(num);
}
