import { useAuthStore } from "../store/auth.store";
import { formatPrice } from "../utils/currency";

export function useCurrency() {
  const user = useAuthStore((s) => s.user);
  const currency = user?.settings?.currency || "INR";

  return { currency, formatPrice };
}
