export const costEvolution = (current: number, previous: number): string => {
  if (previous === current) return '0.00%';

  const evolution = ((current - previous) / previous) * 100;
  const sign = evolution > 0 ? '+' : '';

  return `${sign}${evolution.toFixed(2)}%`;
};
