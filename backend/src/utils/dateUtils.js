/**
 * Range key -> { days, groupBy } config.
 * `groupBy` controls the aggregation bucket size used for timeseries charts
 * so we never return e.g. 365 daily points for a 12-month range.
 */
const RANGE_CONFIG = {
  "7d": { days: 7, groupBy: "day" },
  "30d": { days: 30, groupBy: "day" },
  "90d": { days: 90, groupBy: "week" },
  "12m": { days: 365, groupBy: "month" },
};

export const RANGE_VALUES = Object.keys(RANGE_CONFIG);

/**
 * Resolves a range key (e.g. "30d") into concrete date boundaries for the
 * current period and the immediately preceding period of equal length
 * (used for period-over-period % change calculations), plus a suggested
 * aggregation bucket size for timeseries charts.
 */
export function resolveDateRange(range = "30d") {
  const config = RANGE_CONFIG[range] ?? RANGE_CONFIG["30d"];
  const { days, groupBy } = config;

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const prevEndDate = new Date(startDate.getTime());
  const prevStartDate = new Date(
    startDate.getTime() - days * 24 * 60 * 60 * 1000,
  );

  return { startDate, endDate, prevStartDate, prevEndDate, days, groupBy };
}

/** Percentage change from `previous` to `current`, rounded to 1 decimal. */
export function pctChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
