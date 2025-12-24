export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: number;
    name: string;
    category: string;
    date: string;
    amount: number;
    type: TransactionType;
    icon: string;
}

export interface Budget {
    category: string;
    limit: number;
    color: string;
}

export interface Card {
    id: number;
    bankName: string;
    type: 'debit' | 'credit';
    balance: number;
    limit?: number;
    number: string;
    expiry: string;
    holder: string;
    color: string;
    pin: string;
    isFrozen: boolean;
}

export interface Installment {
    id: number;
    name: string;
    provider: string;
    totalAmount: number;
    paidAmount: number;
    totalMonths: number;
    paidMonths: number;
    startDate: string;
    category: string;
}

export interface CategoryStat extends Budget {
    spent: number;
    remaining: number;
    percent: number;
    isOverBudget: boolean;
}

export interface RecurringBill {
    id: number;
    name: string;
    amount: number;
    due: string;
}

export interface MonthlyTrend {
    name: string;
    income: number;
    expense: number;
    savings: number;
}

export interface KPIStat {
    label: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon?: string;
}

export interface AnalyticsStat extends KPIStat { }
