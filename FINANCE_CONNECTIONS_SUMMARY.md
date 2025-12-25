# Finance Pages - Quick Reference Guide

## 📊 Finance Pages Overview

| Page | Route | Purpose | Key Features |
|------|-------|---------|--------------|
| **Analytics** | `/analytics` | Financial dashboard & insights | KPIs, charts, trends, budget status |
| **Transactions** | `/transactions` | Manage income/expenses | Add, search, filter, delete transactions |
| **Budget** | `/budget` | Track spending limits | View/edit budgets, track vs actual |
| **Installments** | `/installments` | Payment plans | Track installment progress, monthly payments |

---

## 🔗 Current Connections

### ✅ Working Connections

1. **Transactions → Budget**
   - Budget page calculates spent amount from transactions
   - Uses category name matching
   - Shows over/under budget status

2. **Transactions → Analytics**
   - Analytics calculates KPIs from transactions
   - Shows spending by category
   - Displays income vs expenses

3. **Budgets → Analytics**
   - Analytics shows budget vs actual spending
   - Category breakdown table

---

## ❌ Missing Connections (Need to Fix)

### 1. Installments ↔ Transactions
**Problem**: Installment payments are not tracked as transactions
**Impact**: 
- Monthly installment payments don't show in expense tracking
- Budget calculations miss installment commitments
- Analytics doesn't reflect true spending

**Solution Needed**:
- Add "Mark Payment" button in Installments page
- Auto-create transaction when payment is made
- Link installment category to transaction category

### 2. Recurring Bills ↔ Transactions
**Problem**: Recurring bills are separate from transactions
**Impact**:
- Bills don't create transactions automatically
- No tracking of bill payments
- Budget doesn't account for recurring bills

**Solution Needed**:
- Add category to recurring bills
- Add "Pay Bill" action that creates transaction
- Link to budget categories

### 3. Installments ↔ Budgets
**Problem**: Installment monthly payments not included in budget
**Impact**:
- Budget shows incorrect available amount
- Monthly commitments not visible in budget view

**Solution Needed**:
- Include installment monthly payments in budget calculations
- Show installment commitments in budget page

### 4. Category Mismatch
**Problem**: Different categories used in different pages
**Impact**:
- Transactions use: Food, Transport, Entertainment, Utilities, Shopping, Housing, Income, Other
- Budgets use: Food, Transport, Entertainment, Utilities, Shopping, Housing (missing Income, Other)
- Installments use: Tech, Home, Travel, Fashion, Other (completely different)

**Solution Needed**:
- Create unified category system
- Map installment categories to expense categories
- Ensure all pages use same categories

---

## 📋 Predefined Values Required

### Categories (Currently Inconsistent)

#### Transactions Categories (hardcoded in page):
- Food
- Transport
- Entertainment
- Utilities
- Shopping
- Housing
- Income
- Other

#### Budget Categories (in db.json):
- Food
- Transport
- Entertainment
- Utilities
- Shopping
- Housing
- ❌ Missing: Income, Other

#### Installment Categories (hardcoded in page):
- Tech
- Home
- Travel
- Fashion
- Other
- ❌ Don't match transaction/budget categories

### Recommended Unified Categories

**Expense Categories:**
1. Food & Dining
2. Transportation
3. Entertainment
4. Utilities
5. Shopping
6. Housing
7. Healthcare (NEW)
8. Education (NEW)
9. Bills & Subscriptions (NEW)
10. Other

**Income Categories:**
1. Salary
2. Freelance
3. Investment
4. Other Income

**Installment Categories (with mapping):**
- Tech → Shopping
- Home → Housing
- Travel → Entertainment
- Fashion → Shopping
- Other → Other

### Default Budget Limits

Should be set for each expense category:
- Food: $800
- Transport: $300
- Entertainment: $200
- Utilities: $250
- Shopping: $400
- Housing: $2000
- Healthcare: $500 (NEW)
- Education: $300 (NEW)
- Bills: $150 (NEW)
- Other: $200

---

## 🎯 Integration Checklist

### Phase 1: Category Standardization
- [ ] Create `src/config/categories.ts` with unified categories
- [ ] Update Transactions page to use shared categories
- [ ] Update Budget page to use shared categories
- [ ] Update Installments page to use shared categories
- [ ] Add category mapping for installments

### Phase 2: Installments Integration
- [ ] Add "Mark Payment" feature in Installments
- [ ] Create transaction when payment is marked
- [ ] Link installment category to transaction category
- [ ] Include installment monthly payments in budget calculations
- [ ] Show installments in analytics

### Phase 3: Recurring Bills Integration
- [ ] Add category field to RecurringBill type
- [ ] Add "Pay Bill" action
- [ ] Create transaction when bill is paid
- [ ] Link to budget categories
- [ ] Update UpcomingBills component

### Phase 4: Budget Initialization
- [ ] Auto-create budgets for all expense categories
- [ ] Set default limits from configuration
- [ ] Allow users to add/remove budget categories
- [ ] Handle categories without budgets gracefully

---

## 🔄 Data Flow (Current vs Ideal)

### Current Flow:
```
Transactions ──→ Budgets ──→ Analytics
     │
     └──────────→ Analytics

Installments (ISOLATED)
Recurring Bills (ISOLATED)
```

### Ideal Flow:
```
Transactions ──→ Budgets ──→ Analytics
     ↑              ↑            ↑
     │              │            │
Installments ──────┘            │
     │                          │
Recurring Bills ────────────────┘
```

---

## 📝 Quick Fixes Needed

1. **Immediate**: Create category configuration file
2. **Immediate**: Update all pages to use shared categories
3. **Short-term**: Add installment payment tracking
4. **Short-term**: Add recurring bill payment tracking
5. **Long-term**: Full integration with budget calculations

---

## 🚨 Critical Issues

1. **Category Mismatch**: Transactions can use categories that don't have budgets
2. **Missing Data**: Installment payments not tracked
3. **Incomplete Budgets**: Some transaction categories missing from budgets
4. **Isolated Modules**: Installments and recurring bills not connected

---

## 💡 Recommendations

1. **Use a single source of truth** for categories (config file)
2. **Auto-initialize budgets** for all expense categories
3. **Link all financial activities** to transactions
4. **Show unified view** in analytics of all financial commitments
5. **Validate categories** when creating transactions/budgets

