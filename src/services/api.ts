import { Transaction, Budget, Installment, RecurringBill, MonthlyTrend, KPIStat, AnalyticsStat, Task, TaskCategory } from "@/types";

export const api = {
    getTransactions: async (): Promise<Transaction[]> => {
        const res = await fetch('/api/transactions');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch transactions');
        }
        return res.json();
    },

    createTransaction: async (transaction: Transaction): Promise<Transaction> => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create transaction');
        }
        return res.json();
    },

    deleteTransaction: async (id: number): Promise<void> => {
        const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to delete transaction');
        }
    },

    getBudgets: async (): Promise<Budget[]> => {
        const res = await fetch('/api/budgets');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch budgets');
        }
        return res.json();
    },

    updateBudget: async (category: string, limit: number): Promise<void> => {
        const res = await fetch('/api/budgets', {
            method: 'PUT',
            body: JSON.stringify({ category, limit }),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update budget');
        }
    },

    getInstallments: async (): Promise<Installment[]> => {
        const res = await fetch('/api/installments');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch installments');
        }
        return res.json();
    },

    createInstallment: async (installment: Installment): Promise<Installment> => {
        const res = await fetch('/api/installments', {
            method: 'POST',
            body: JSON.stringify(installment),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create installment');
        }
        return res.json();
    },

    getMonthlyTrends: async (): Promise<MonthlyTrend[]> => {
        const res = await fetch('/api/stats?type=trends');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch monthly trends');
        }
        return res.json();
    },

    getRecurringBills: async (): Promise<RecurringBill[]> => {
        const res = await fetch('/api/stats?type=recurring');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch recurring bills');
        }
        return res.json();
    },

    getKPIs: async (): Promise<KPIStat[]> => {
        const res = await fetch('/api/stats?type=kpi');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch KPIs');
        }
        return res.json();
    },

    getAnalyticsStats: async (): Promise<AnalyticsStat[]> => {
        const res = await fetch('/api/stats?type=analytics');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch analytics stats');
        }
        return res.json();
    },

    getTasks: async (): Promise<Task[]> => {
        const res = await fetch('/api/tasks');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch tasks');
        }
        return res.json();
    },

    createTask: async (task: Task): Promise<Task> => {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create task');
        }
        return res.json();
    },

    updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
        const res = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update task');
        }
        return res.json();
    },

    deleteTask: async (id: number): Promise<void> => {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to delete task');
        }
    },

    getTaskCategories: async (): Promise<TaskCategory[]> => {
        const res = await fetch('/api/task-categories');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to fetch task categories');
        }
        return res.json();
    },

    createTaskCategory: async (category: Omit<TaskCategory, 'id'>): Promise<TaskCategory> => {
        const res = await fetch('/api/task-categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create task category');
        }
        return res.json();
    },

    updateTaskCategory: async (id: string, category: Partial<TaskCategory>): Promise<TaskCategory> => {
        const res = await fetch(`/api/task-categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update task category');
        }
        return res.json();
    },

    deleteTaskCategory: async (id: string): Promise<void> => {
        const res = await fetch(`/api/task-categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to delete task category');
        }
    },

    getSetupStatus: async (): Promise<{ initialized: boolean }> => {
        const res = await fetch('/api/setup');
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to check setup status');
        }
        return res.json();
    }
};
