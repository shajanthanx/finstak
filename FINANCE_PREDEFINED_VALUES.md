# Predefined Values for Finance System

## Overview
This document lists all predefined values that need to be set for the finance system to work properly.

---

## 1. Transaction Categories

### Expense Categories
These categories are used for expense transactions and should have corresponding budgets:

| Category | Label | Icon | Default Budget | Color |
|----------|-------|------|----------------|-------|
| Food | Food & Dining | 🍔 | $800 | #52525b |
| Transport | Transportation | 🚗 | $300 | #a1a1aa |
| Entertainment | Entertainment | 🎬 | $200 | #e4e4e7 |
| Utilities | Utilities | ⚡ | $250 | #fbbf24 |
| Shopping | Shopping | 🛍️ | $400 | #8b5cf6 |
| Housing | Housing | 🏠 | $2000 | #18181b |
| Healthcare | Healthcare | 🏥 | $500 | #ef4444 |
| Education | Education | 📚 | $300 | #3b82f6 |
| Bills | Bills & Subscriptions | 📄 | $150 | #10b981 |
| Other | Other | 📦 | $200 | #6b7280 |

### Income Categories
These categories are used for income transactions (no budgets needed):

| Category | Label | Icon | Color |
|----------|-------|------|-------|
| Salary | Salary | 💼 | #059669 |
| Freelance | Freelance | 💻 | #0d9488 |
| Investment | Investment | 📈 | #14b8a6 |
| Other Income | Other Income | 💰 | #2dd4bf |

---

## 2. Budget Categories

**IMPORTANT**: Budget categories must match expense categories exactly.

### Required Budgets (Auto-initialize)
All expense categories should have a budget entry with default limits:

```json
{
  "budgets": [
    { "category": "Food", "limit": 800, "color": "#52525b" },
    { "category": "Transport", "limit": 300, "color": "#a1a1aa" },
    { "category": "Entertainment", "limit": 200, "color": "#e4e4e7" },
    { "category": "Utilities", "limit": 250, "color": "#fbbf24" },
    { "category": "Shopping", "limit": 400, "color": "#8b5cf6" },
    { "category": "Housing", "limit": 2000, "color": "#18181b" },
    { "category": "Healthcare", "limit": 500, "color": "#ef4444" },
    { "category": "Education", "limit": 300, "color": "#3b82f6" },
    { "category": "Bills", "limit": 150, "color": "#10b981" },
    { "category": "Other", "limit": 200, "color": "#6b7280" }
  ]
}
```

**Note**: Income categories should NOT have budgets.

---

## 3. Installment Categories

Installment categories are different from transaction categories but should map to expense categories:

| Installment Category | Maps To Expense Category | Use Case |
|---------------------|-------------------------|----------|
| Tech | Shopping | Technology purchases |
| Home | Housing | Home & furniture |
| Travel | Entertainment | Travel expenses |
| Fashion | Shopping | Clothing & fashion |
| Other | Other | Miscellaneous |

**Mapping Logic**: When an installment payment is made, it should create a transaction with the mapped expense category.

---

## 4. Transaction Type Icons

Icons used for transactions based on type:

| Type | Default Icon | Usage |
|------|-------------|-------|
| Income | 💰 | All income transactions |
| Expense | 💳 | All expense transactions |

**Note**: Category-specific icons can override default icons.

---

## 5. Default Values

### New Transaction Defaults
- **Type**: `expense`
- **Category**: `Food` (first expense category)
- **Date**: Current date
- **Amount**: `0` (empty)

### New Budget Defaults
- **Limit**: From `DEFAULT_BUDGET_LIMITS` config
- **Color**: From category config

### New Installment Defaults
- **Category**: `Tech`
- **Total Months**: `12`
- **Paid Amount**: `0`
- **Paid Months**: `0`
- **Start Date**: Current date

---

## 6. Validation Rules

### Transaction Validation
- ✅ Category must exist in category list
- ✅ Amount must be positive number
- ✅ Date must be valid date
- ✅ Type must be 'income' or 'expense'
- ✅ Name/description is required

### Budget Validation
- ✅ Category must be an expense category (not income)
- ✅ Limit must be positive number
- ✅ Category must be unique per user

### Installment Validation
- ✅ Total amount must be positive
- ✅ Paid amount cannot exceed total amount
- ✅ Total months must be positive integer
- ✅ Paid months cannot exceed total months
- ✅ Category must exist in installment categories

---

## 7. Category Mapping Rules

### Installment → Transaction
When marking an installment payment:
1. Get installment category (e.g., "Tech")
2. Map to expense category using `mapInstallmentToExpenseCategory()` (e.g., "Shopping")
3. Create transaction with:
   - Type: `expense`
   - Category: Mapped category ("Shopping")
   - Amount: Monthly payment amount
   - Date: Payment date

### Recurring Bill → Transaction
When paying a recurring bill:
1. Get bill category (should be set)
2. Create transaction with:
   - Type: `expense`
   - Category: Bill category
   - Amount: Bill amount
   - Date: Payment date

---

## 8. Initialization Checklist

When setting up the finance system, ensure:

- [ ] All expense categories have budget entries
- [ ] Default budget limits are set
- [ ] Category colors are assigned
- [ ] Category icons are assigned
- [ ] Installment category mappings are configured
- [ ] Transaction type icons are set
- [ ] Validation rules are implemented

---

## 9. Database Schema Requirements

### Transactions Table
- `category`: Must reference valid category from config
- `type`: Must be 'income' or 'expense'
- `amount`: Must be positive number

### Budgets Table
- `category`: Must be expense category only
- `limit`: Must be positive number
- Unique constraint on (user_id, category)

### Installments Table
- `category`: Must be valid installment category
- `totalAmount`: Must be positive
- `paidAmount`: Must be <= totalAmount

---

## 10. Configuration File Location

All predefined values are centralized in:
- **File**: `src/config/categories.ts`
- **Exports**:
  - `EXPENSE_CATEGORIES`
  - `INCOME_CATEGORIES`
  - `INSTALLMENT_CATEGORIES`
  - `DEFAULT_BUDGET_LIMITS`
  - Helper functions for category operations

---

## Summary

**Critical Predefined Values**:
1. ✅ 10 Expense Categories (with budgets)
2. ✅ 4 Income Categories (no budgets)
3. ✅ 5 Installment Categories (with mappings)
4. ✅ Default budget limits for each expense category
5. ✅ Category icons and colors
6. ✅ Transaction type icons

**All values are now centralized in `src/config/categories.ts`**

