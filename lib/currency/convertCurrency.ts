/**
 * Converts an amount from XAF to a target currency.
 * @param amount Amount in XAF (CFA Franc).
 * @param currency Target currency code (e.g., 'EUR', 'USD').
 * @param rates Currency rates relative to XAF.
 * @returns Converted amount.
 */
export function convertFromXAF(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === 'XAF' || !rates[currency]) return amount;
  return amount / rates[currency];
}
