/**
 * Format số tiền theo chuẩn Mỹ (1,234.56)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

/**
 * Format số tiền compact (1K, 1.5M, 2B)
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Format số tiền với đơn vị tiền tệ
 */
export const formatCurrency = (
  value: number,
  currency: string = ""
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format phần trăm
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
};
