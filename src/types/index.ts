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

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    budgetingEnabled: boolean;
}

export interface Budget {
    category: string;
    limit: number;
    color: string;
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

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
}

export interface TaskCategory {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export interface Task {
    id: number;
    title: string;
    category: string;
    categoryId?: string;
    priority: TaskPriority;
    dueDate: string;
    completed: boolean;
    status: TaskStatus;
    subtasks: Subtask[];
    notes: string;
}

export interface Habit {
    id: number;
    title: string;
    description?: string;
    icon: string;
    color: string;
    startDate: string;
    archivedAt?: string;
    frequency: string;
    goalTarget: number;
}

export interface HabitLog {
    id: number;
    habitId: number;
    date: string;
    completedValue: number;
}

export interface DailyHabitStat {
    date: string;
    totalHabits: number;
    completedHabits: number;
    percentage: number;
}

export interface HabitStatsResponse {
    dailyStats: DailyHabitStat[];
    logs: Record<number, Record<string, number>>;
    habits: Habit[];
}
