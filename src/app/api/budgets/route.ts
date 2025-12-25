import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCategoryConfig } from '@/config/categories';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('category');

    if (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform budget_limit to limit for frontend compatibility
    const budgets = data?.map(b => ({
        category: b.category,
        limit: b.budget_limit,
        color: b.color
    })) || [];

    return NextResponse.json(budgets);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Get category config for default color if not provided
        const categoryConfig = getCategoryConfig(body.category);

        const { data, error } = await supabase
            .from('budgets')
            .insert({
                user_id: user.id,
                category: body.category,
                budget_limit: body.limit || 500,
                color: body.color || categoryConfig?.color || '#6b7280'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating budget:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform for frontend
        return NextResponse.json({
            category: data.category,
            limit: data.budget_limit,
            color: data.color
        });
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Try to update existing budget
        const { data: existingBudget } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id)
            .eq('category', body.category)
            .single();

        if (existingBudget) {
            // Update existing budget
            const updateData: any = { budget_limit: body.limit };
            if (body.color) {
                updateData.color = body.color;
            }

            const { data, error } = await supabase
                .from('budgets')
                .update(updateData)
                .eq('user_id', user.id)
                .eq('category', body.category)
                .select()
                .single();

            if (error) {
                console.error('Error updating budget:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // Transform for frontend
            return NextResponse.json({
                category: data.category,
                limit: data.budget_limit,
                color: data.color
            });
        } else {
            // Create new budget if it doesn't exist
            const categoryConfig = getCategoryConfig(body.category);

            const { data, error } = await supabase
                .from('budgets')
                .insert({
                    user_id: user.id,
                    category: body.category,
                    budget_limit: body.limit,
                    color: body.color || categoryConfig?.color || '#6b7280'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating budget:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // Transform for frontend
            return NextResponse.json({
                category: data.category,
                limit: data.budget_limit,
                color: data.color
            });
        }
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
