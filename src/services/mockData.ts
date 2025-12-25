import { Transaction, Budget, Installment } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, DEFAULT_BUDGET_LIMITS, getCategoryIcon } from '@/config/categories';

export const monthlyTrendData = [
    { name: 'Jan', income: 4500, expense: 3200, savings: 1300 },
    { name: 'Feb', income: 5200, expense: 3800, savings: 1400 },
    { name: 'Mar', income: 4800, expense: 2900, savings: 1900 },
    { name: 'Apr', income: 5100, expense: 4100, savings: 1000 },
    { name: 'May', income: 5600, expense: 3600, savings: 2000 },
    { name: 'Jun', income: 5900, expense: 3950, savings: 1950 },
    { name: 'Jul', income: 6200, expense: 4300, savings: 1900 },
];

// Generate initial budgets from category config
export const initialBudgets: Budget[] = EXPENSE_CATEGORIES.map(cat => ({
    category: cat.value,
    limit: DEFAULT_BUDGET_LIMITS[cat.value] || 500,
    color: cat.color
}));

// Initial transactions using category config
export const initialTransactions: Transaction[] = [
    { id: 1, name: 'Whole Foods Market', category: 'Food', date: '2023-10-25', amount: 124.50, type: 'expense', icon: getCategoryIcon('Food') },
    { id: 2, name: 'Tech Solutions Inc.', category: 'Salary', date: '2023-10-24', amount: 3200.00, type: 'income', icon: getCategoryIcon('Salary') },
    { id: 3, name: 'Netflix Subscription', category: 'Entertainment', date: '2023-10-24', amount: 15.99, type: 'expense', icon: getCategoryIcon('Entertainment') },
    { id: 4, name: 'Uber Ride', category: 'Transport', date: '2023-10-23', amount: 24.20, type: 'expense', icon: getCategoryIcon('Transport') },
    { id: 5, name: 'Electric Bill', category: 'Utilities', date: '2023-10-21', amount: 145.00, type: 'expense', icon: getCategoryIcon('Utilities') },
    { id: 6, name: 'Trader Joes', category: 'Food', date: '2023-10-20', amount: 85.30, type: 'expense', icon: getCategoryIcon('Food') },
    { id: 7, name: 'Shell Station', category: 'Transport', date: '2023-10-19', amount: 45.00, type: 'expense', icon: getCategoryIcon('Transport') },
    { id: 8, name: 'Zara', category: 'Shopping', date: '2023-10-18', amount: 120.00, type: 'expense', icon: getCategoryIcon('Shopping') },
];

export const initialInstallments: Installment[] = [
    {
        id: 1,
        name: 'MacBook Pro M3',
        provider: 'Apple Card',
        totalAmount: 2400,
        paidAmount: 800,
        totalMonths: 12,
        paidMonths: 4,
        startDate: '2023-06-15',
        category: 'Tech'
    },
    {
        id: 2,
        name: 'Living Room Sofa',
        provider: 'Affirm',
        totalAmount: 1200,
        paidAmount: 1000,
        totalMonths: 6,
        paidMonths: 5,
        startDate: '2023-05-10',
        category: 'Home'
    },
    {
        id: 3,
        name: 'Vacation Flight',
        provider: 'Chase Plan',
        totalAmount: 900,
        paidAmount: 300,
        totalMonths: 3,
        paidMonths: 1,
        startDate: '2023-09-01',
        category: 'Travel'
    }
];

export const recurring = [
    { id: 1, name: 'Spotify Premium', amount: 12.99, due: '2 days' },
    { id: 2, name: 'Adobe Creative Cloud', amount: 54.99, due: '5 days' },
    { id: 3, name: 'Gym Membership', amount: 45.00, due: '1 week' },
];

export const initialTasks = [
    {
        id: 1,
        title: 'Review Project Goals',
        category: 'Work',
        priority: 'high',
        dueDate: '2023-10-28',
        completed: false,
        status: 'todo',
        subtasks: [
            { id: 101, title: 'Check emails', completed: true },
            { id: 102, title: 'Update Jira', completed: false }
        ],
        notes: ''
    },
    {
        id: 2,
        title: 'Grocery Shopping',
        category: 'Personal',
        priority: 'medium',
        dueDate: '2023-10-29',
        completed: true,
        status: 'done',
        subtasks: [],
        notes: 'Milk, Eggs, Bread'
    },
    {
        id: 3,
        title: 'Doctor Appointment',
        category: 'Health',
        priority: 'high',
        dueDate: '2023-11-01',
        completed: false,
        status: 'todo',
        subtasks: [],
        notes: ''
    },
    {
        id: 4,
        title: 'Call Mom',
        category: 'Family',
        priority: 'low',
        dueDate: '2023-10-30',
        completed: false,
        status: 'in-progress',
        subtasks: [],
        notes: ''
    },
    {
        id: 5,
        title: 'Finish Project Report',
        category: 'Work',
        priority: 'high',
        dueDate: '2023-10-27',
        completed: false,
        status: 'todo',
        subtasks: [
            { id: 501, title: 'Draft outline', completed: true },
            { id: 502, title: 'Gather data', completed: true },
            { id: 503, title: 'Write summary', completed: false }
        ],
        notes: ''
    },
];
