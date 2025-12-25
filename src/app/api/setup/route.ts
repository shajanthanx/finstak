import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Initialize finance system with default categories and budgets
 * This creates categories and budgets for all expense categories if they don't exist
 */
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Call database function to initialize default categories
        const { error: categoriesError } = await supabase.rpc('initialize_default_categories', {
            p_user_id: user.id
        });

        if (categoriesError) {
            console.error('Error initializing categories:', categoriesError);
        }

        // Call database function to initialize default budgets
        const { error: budgetsError } = await supabase.rpc('initialize_default_budgets', {
            p_user_id: user.id
        });

        if (budgetsError) {
            console.error('Error initializing budgets:', budgetsError);
            return NextResponse.json({ error: budgetsError.message }, { status: 500 });
        }

        // Fetch created budgets
        const { data: budgetsData } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id);

        const budgets = budgetsData?.map(b => ({
            category: b.category,
            limit: b.budget_limit,
            color: b.color
        })) || [];

        return NextResponse.json({
            success: true,
            initialized: budgets.length,
            budgets: budgets
        });
    } catch (err) {
        console.error('Error in setup:', err);
        return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
    }
}

/**
 * Check if system is initialized
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if any categories exist for the user
    const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error checking setup status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // System is initialized if there is at least one category
    const initialized = (count || 0) > 0;

    return NextResponse.json({
        initialized: initialized,
        missingCategories: initialized ? [] : ['Setup required'],
        existingBudgets: 0, // Not used anymore for setup logic
        requiredBudgets: 0   // Not used anymore for setup logic
    });
}
