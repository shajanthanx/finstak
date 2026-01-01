import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: categories, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching task categories:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(categories?.map(c => toCamelCase(c)) || []);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const dbData = toSnakeCase(body);

        const { data: category, error } = await supabase
            .from('task_categories')
            .insert({
                ...(dbData as any),
                user_id: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task category:', error);
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(category));
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
