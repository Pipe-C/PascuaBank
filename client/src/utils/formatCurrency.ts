/**
 * Formats a numeric value into a localized currency string.
 * @param amount Numeric amount
 * @param currency ISO 4217 currency code (e.g. 'COP', 'USD'). Defaults to 'COP'.
 * @returns Formatted currency string according to es-CO locale.
 */
export function formatCurrency(amount: number, currency = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
