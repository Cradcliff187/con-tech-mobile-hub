/**
 * Markup and Margin Conversion Utilities
 * 
 * This module provides utility functions for converting between markup and margin percentages,
 * calculating prices, and handling financial calculations in construction estimates.
 */

/**
 * Common markup/margin conversion pairs for reference
 */
export const COMMON_CONVERSIONS = [
  { markup: 10, margin: 9.09 },
  { markup: 15, margin: 13.04 },
  { markup: 20, margin: 16.67 },
  { markup: 25, margin: 20.00 },
  { markup: 30, margin: 23.08 },
  { markup: 40, margin: 28.57 },
  { markup: 50, margin: 33.33 },
  { markup: 75, margin: 42.86 },
  { markup: 100, margin: 50.00 },
] as const;

/**
 * Maximum safe margin percentage to prevent division errors
 */
export const MAX_MARGIN_PERCENTAGE = 95;

/**
 * Currency formatting configuration
 */
export const CURRENCY_CONFIG = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

/**
 * Validates that a percentage value is within safe bounds
 * @param value - The percentage value to validate
 * @returns True if the value is valid, false otherwise
 */
export function validatePercentage(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Rounds a number to two decimal places for financial calculations
 * @param value - The number to round
 * @returns The rounded number
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number as currency using USD format
 * @param amount - The amount to format
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(0) // "$0.00"
 */
export function formatCurrency(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', CURRENCY_CONFIG).format(amount);
}

/**
 * Converts markup percentage to margin percentage
 * Formula: margin = markup / (100 + markup) * 100
 * 
 * @param markup - Markup percentage (e.g., 25 for 25%)
 * @returns Margin percentage
 * 
 * @example
 * markupToMargin(25) // 20.00 (25% markup = 20% margin)
 * markupToMargin(50) // 33.33 (50% markup = 33.33% margin)
 */
export function markupToMargin(markup: number): number {
  if (!validatePercentage(markup)) {
    return 0;
  }
  
  const margin = (markup / (100 + markup)) * 100;
  return roundToTwoDecimals(margin);
}

/**
 * Converts margin percentage to markup percentage
 * Formula: markup = margin / (100 - margin) * 100
 * 
 * @param margin - Margin percentage (e.g., 20 for 20%)
 * @returns Markup percentage
 * 
 * @example
 * marginToMarkup(20) // 25.00 (20% margin = 25% markup)
 * marginToMarkup(33.33) // 50.00 (33.33% margin = 50% markup)
 */
export function marginToMarkup(margin: number): number {
  if (!validatePercentage(margin) || margin >= MAX_MARGIN_PERCENTAGE) {
    return 0;
  }
  
  const markup = (margin / (100 - margin)) * 100;
  return roundToTwoDecimals(markup);
}

/**
 * Calculates final price from cost and markup percentage
 * Formula: price = cost * (1 + markup/100)
 * 
 * @param cost - Base cost amount
 * @param markup - Markup percentage (e.g., 25 for 25%)
 * @returns Final price including markup
 * 
 * @example
 * calculatePriceFromMarkup(1000, 25) // 1250.00
 * calculatePriceFromMarkup(500, 50) // 750.00
 */
export function calculatePriceFromMarkup(cost: number, markup: number): number {
  if (cost < 0 || !validatePercentage(markup)) {
    return 0;
  }
  
  const price = cost * (1 + markup / 100);
  return roundToTwoDecimals(price);
}

/**
 * Calculates final price from cost and target margin percentage
 * Formula: price = cost / (1 - margin/100)
 * 
 * @param cost - Base cost amount
 * @param margin - Target margin percentage (e.g., 20 for 20%)
 * @returns Final price that achieves the target margin
 * 
 * @example
 * calculatePriceFromMargin(1000, 20) // 1250.00
 * calculatePriceFromMargin(800, 25) // 1066.67
 */
export function calculatePriceFromMargin(cost: number, margin: number): number {
  if (cost < 0 || !validatePercentage(margin) || margin >= MAX_MARGIN_PERCENTAGE) {
    return 0;
  }
  
  const price = cost / (1 - margin / 100);
  return roundToTwoDecimals(price);
}

/**
 * Calculates markup percentage from cost and final price
 * Formula: markup = (price - cost) / cost * 100
 * 
 * @param cost - Base cost amount
 * @param price - Final selling price
 * @returns Markup percentage
 * 
 * @example
 * calculateMarkup(1000, 1250) // 25.00
 * calculateMarkup(800, 1200) // 50.00
 */
export function calculateMarkup(cost: number, price: number): number {
  if (cost <= 0 || price < 0) {
    return 0;
  }
  
  const markup = ((price - cost) / cost) * 100;
  return roundToTwoDecimals(markup);
}

/**
 * Calculates margin percentage from cost and final price
 * Formula: margin = (price - cost) / price * 100
 * 
 * @param cost - Base cost amount
 * @param price - Final selling price
 * @returns Margin percentage
 * 
 * @example
 * calculateMargin(1000, 1250) // 20.00
 * calculateMargin(800, 1200) // 33.33
 */
export function calculateMargin(cost: number, price: number): number {
  if (cost < 0 || price <= 0) {
    return 0;
  }
  
  const margin = ((price - cost) / price) * 100;
  return roundToTwoDecimals(margin);
}

/**
 * Calculates profit amount from cost and price
 * 
 * @param cost - Base cost amount
 * @param price - Final selling price
 * @returns Profit amount
 * 
 * @example
 * calculateProfit(1000, 1250) // 250.00
 * calculateProfit(800, 1200) // 400.00
 */
export function calculateProfit(cost: number, price: number): number {
  if (cost < 0 || price < 0) {
    return 0;
  }
  
  return roundToTwoDecimals(price - cost);
}

/**
 * Gets a formatted summary of markup/margin calculations
 * 
 * @param cost - Base cost amount
 * @param price - Final selling price
 * @returns Object with all calculated values
 */
export function getFinancialSummary(cost: number, price: number) {
  const profit = calculateProfit(cost, price);
  const markup = calculateMarkup(cost, price);
  const margin = calculateMargin(cost, price);
  
  return {
    cost: roundToTwoDecimals(cost),
    price: roundToTwoDecimals(price),
    profit,
    markup,
    margin,
    formattedCost: formatCurrency(cost),
    formattedPrice: formatCurrency(price),
    formattedProfit: formatCurrency(profit),
  };
}