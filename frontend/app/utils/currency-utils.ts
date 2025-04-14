/**
 * Returns a formatted canadian currency string base on the
 * passed language's corresponding locale.
 */
export function formatCurrency(number: number, lang: Language): string {
  return number.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
  });
}
