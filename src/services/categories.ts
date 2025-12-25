import { Category } from '@/types';

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    create: async (category: Omit<Category, 'id'>): Promise<Category> => {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    },

    update: async (id: string, updates: Partial<Category>): Promise<Category> => {
        const res = await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        // Implement when API supports it
        throw new Error('Not implemented');
    }
};
