import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { EXPENSE_CATEGORIES, DEFAULT_BUDGET_LIMITS, getCategoryConfig } from '@/config/categories';

/**
 * Initialize finance system with default budgets
 * This creates budgets for all expense categories if they don't exist
 */
export async function POST(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const db = await readDB();
    
    // Get existing budget categories
    const existingCategories = new Set(db.budgets.map((b: any) => b.category));
    
    // Create budgets for all expense categories that don't exist
    const newBudgets = EXPENSE_CATEGORIES
        .filter(cat => !existingCategories.has(cat.value))
        .map(cat => ({
            category: cat.value,
            limit: DEFAULT_BUDGET_LIMITS[cat.value] || 500,
            color: cat.color
        }));
    
    // Add new budgets to database
    if (newBudgets.length > 0) {
        db.budgets.push(...newBudgets);
        await writeDB(db);
    }
    
    return NextResponse.json({ 
        success: true, 
        initialized: newBudgets.length,
        budgets: db.budgets 
    });
}

/**
 * Check if system is initialized
 */
export async function GET() {
    await new Promise(r => setTimeout(r, 300));
    const db = await readDB();
    
    const existingCategories = new Set(db.budgets.map((b: any) => b.category));
    const requiredCategories = EXPENSE_CATEGORIES.map(cat => cat.value);
    const missingCategories = requiredCategories.filter(cat => !existingCategories.has(cat));
    
    return NextResponse.json({
        initialized: missingCategories.length === 0,
        missingCategories,
        existingBudgets: db.budgets.length,
        requiredBudgets: requiredCategories.length
    });
}

