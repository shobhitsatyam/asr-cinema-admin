/**
 * Formats a number to Indian Rupee (INR) currency format (e.g. ₹48,650)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Returns a human-friendly date string
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncate long text
 */
export function truncate(text: string, length = 40): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
