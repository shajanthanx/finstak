import { Transaction, Budget, Card, Installment, RecurringBill, MonthlyTrend, KPIStat, AnalyticsStat } from "@/types";

export const api = {
    getTransactions: async (): Promise<Transaction[]> => {
        const res = await fetch('/api/transactions');
        return res.json();
    },

    createTransaction: async (transaction: Transaction): Promise<Transaction> => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
        return res.json();
    },

    deleteTransaction: async (id: number): Promise<void> => {
        await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    },

    getBudgets: async (): Promise<Budget[]> => {
        const res = await fetch('/api/budgets');
        return res.json();
    },

    updateBudget: async (category: string, limit: number): Promise<void> => {
        await fetch('/api/budgets', {
            method: 'PUT',
            body: JSON.stringify({ category, limit }),
        });
    },

    getCards: async (): Promise<Card[]> => {
        const res = await fetch('/api/cards');
        return res.json();
    },

    createCard: async (card: Card): Promise<Card> => {
        const res = await fetch('/api/cards', {
            method: 'POST',
            body: JSON.stringify(card),
        });
        return res.json();
    },

    deleteCard: async (id: number): Promise<void> => {
        await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    },

    getInstallments: async (): Promise<Installment[]> => {
        const res = await fetch('/api/installments');
        return res.json();
    },

    createInstallment: async (installment: Installment): Promise<Installment> => {
        const res = await fetch('/api/installments', {
            method: 'POST',
            body: JSON.stringify(installment),
        });
        return res.json();
    },

    getMonthlyTrends: async (): Promise<MonthlyTrend[]> => {
        const res = await fetch('/api/stats?type=trends');
        return res.json();
    },

    getRecurringBills: async (): Promise<RecurringBill[]> => {
        const res = await fetch('/api/stats?type=recurring');
        return res.json();
    },

    getKPIs: async (): Promise<KPIStat[]> => {
        const res = await fetch('/api/stats?type=kpi');
        return res.json();
    },

    getAnalyticsStats: async (): Promise<AnalyticsStat[]> => {
        const res = await fetch('/api/stats?type=analytics');
        return res.json();
    }
};
