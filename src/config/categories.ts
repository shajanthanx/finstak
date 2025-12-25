/**
 * Unified Category Configuration
 * 
 * This file provides a single source of truth for all categories
 * used across Transactions, Budgets, and Installments.
 */

export interface CategoryConfig {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface InstallmentCategoryConfig {
  value: string;
  label: string;
  mapsTo: string; // Maps to expense category
}

export const EXPENSE_CATEGORIES: CategoryConfig[] = [
  { value: 'Food', label: 'Food & Dining', icon: '🍔', color: '#52525b' },
  { value: 'Transport', label: 'Transportation', icon: '🚗', color: '#a1a1aa' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#e4e4e7' },
  { value: 'Utilities', label: 'Utilities', icon: '⚡', color: '#fbbf24' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { value: 'Housing', label: 'Housing', icon: '🏠', color: '#18181b' },
  { value: 'Healthcare', label: 'Healthcare', icon: '🏥', color: '#ef4444' },
  { value: 'Education', label: 'Education', icon: '📚', color: '#3b82f6' },
  { value: 'Bills', label: 'Bills & Subscriptions', icon: '📄', color: '#10b981' },
  { value: 'Other', label: 'Other', icon: '📦', color: '#6b7280' },
];

export const INCOME_CATEGORIES: CategoryConfig[] = [
  { value: 'Salary', label: 'Salary', icon: '💼', color: '#059669' },
  { value: 'Freelance', label: 'Freelance', icon: '💻', color: '#0d9488' },
  { value: 'Investment', label: 'Investment', icon: '📈', color: '#14b8a6' },
  { value: 'Other Income', label: 'Other Income', icon: '💰', color: '#2dd4bf' },
];

export const INSTALLMENT_CATEGORIES: InstallmentCategoryConfig[] = [
  { value: 'Tech', label: 'Technology', mapsTo: 'Shopping' },
  { value: 'Home', label: 'Home & Furniture', mapsTo: 'Housing' },
  { value: 'Travel', label: 'Travel', mapsTo: 'Entertainment' },
  { value: 'Fashion', label: 'Fashion', mapsTo: 'Shopping' },
  { value: 'Other', label: 'Other', mapsTo: 'Other' },
];

/**
 * Default budget limits for each expense category
 * These are initial values that can be customized by users
 */
export const DEFAULT_BUDGET_LIMITS: Record<string, number> = {
  Food: 800,
  Transport: 300,
  Entertainment: 200,
  Utilities: 250,
  Shopping: 400,
  Housing: 2000,
  Healthcare: 500,
  Education: 300,
  Bills: 150,
  Other: 200,
};

/**
 * Get all transaction categories (expense + income)
 */
export function getAllTransactionCategories(): string[] {
  return [
    ...EXPENSE_CATEGORIES.map(c => c.value),
    ...INCOME_CATEGORIES.map(c => c.value),
  ];
}

/**
 * Get expense categories only
 */
export function getExpenseCategories(): string[] {
  return EXPENSE_CATEGORIES.map(c => c.value);
}

/**
 * Get income categories only
 */
export function getIncomeCategories(): string[] {
  return INCOME_CATEGORIES.map(c => c.value);
}

/**
 * Get installment categories
 */
export function getInstallmentCategories(): string[] {
  return INSTALLMENT_CATEGORIES.map(c => c.value);
}

/**
 * Map installment category to expense category
 */
export function mapInstallmentToExpenseCategory(installmentCategory: string): string {
  const mapping = INSTALLMENT_CATEGORIES.find(c => c.value === installmentCategory);
  return mapping?.mapsTo || 'Other';
}

/**
 * Get category config by value
 */
export function getCategoryConfig(categoryValue: string): CategoryConfig | undefined {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.value === categoryValue);
}

/**
 * Get category icon
 */
export function getCategoryIcon(categoryValue: string): string {
  const config = getCategoryConfig(categoryValue);
  return config?.icon || '📦';
}

/**
 * Get category color
 */
export function getCategoryColor(categoryValue: string): string {
  const config = getCategoryConfig(categoryValue);
  return config?.color || '#6b7280';
}

/**
 * Check if category is an expense category
 */
export function isExpenseCategory(category: string): boolean {
  return EXPENSE_CATEGORIES.some(c => c.value === category);
}

/**
 * Check if category is an income category
 */
export function isIncomeCategory(category: string): boolean {
  return INCOME_CATEGORIES.some(c => c.value === category);
}

/**
 * Validate if category exists
 */
export function isValidCategory(category: string): boolean {
  return getAllTransactionCategories().includes(category);
}

