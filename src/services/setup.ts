import { Budget } from '@/types';

export interface SetupStatus {
    initialized: boolean;
    missingCategories: string[];
    existingBudgets: number;
    requiredBudgets: number;
}

export interface SetupResult {
    success: boolean;
    initialized: number;
    budgets: Budget[];
}

export const setupService = {
    /**
     * Check if finance system is initialized
     */
    checkStatus: async (): Promise<SetupStatus> => {
        const res = await fetch('/api/setup');
        return res.json();
    },

    /**
     * Initialize finance system with default budgets
     */
    initialize: async (): Promise<SetupResult> => {
        const res = await fetch('/api/setup', {
            method: 'POST',
        });
        return res.json();
    },
};

