import { useAuthStore } from "../store/auth.store";

export const CURRENCIES = {
  INR: { symbol: "₹", locale: "en-IN", rate: 1 },
  USD: { symbol: "$", locale: "en-US", rate: 0.012 },
  EUR: { symbol: "€", locale: "de-DE", rate: 0.011 },
  GBP: { symbol: "£", locale: "en-GB", rate: 0.0096 },
  JPY: { symbol: "¥", locale: "ja-JP", rate: 1.77 },
  AUD: { symbol: "A$", locale: "en-AU", rate: 0.018 },
  CAD: { symbol: "C$", locale: "en-CA", rate: 0.017 },
  SGD: { symbol: "S$", locale: "en-SG", rate: 0.016 },
};

/**
 * Format an INR amount into the user's preferred currency.
 * @param {number} amountInr - Amount in Indian Rupees
 * @param {object} [opts]    - Intl.NumberFormat options overrides
 */
export function formatPrice(amountInr, opts = {}) {
  const user = useAuthStore.getState().user;
  const currency = user?.settings?.currency || "INR";
  
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const converted = amountInr * config.rate;
  
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 0,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
    ...opts,
  }).format(converted);
}
