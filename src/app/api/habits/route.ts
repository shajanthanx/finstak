import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active habits (not archived)
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching habits:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(toCamelCase(data || []));
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Convert body to snake_case for DB
        const dbData = toSnakeCase(body) as any;

        // Ensure defaults if not provided (though DB has defaults too)
        const newHabit = {
            ...dbData,
            user_id: user.id,
            // If start_date isn't provided, specific logic might be needed, 
            // but DB default is CURRENT_DATE which is usually fine.
        };

        const { data, error } = await supabase
            .from('habits')
            .insert(newHabit)
            .select()
            .single();

        if (error) {
            console.error('Error creating habit:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(data));
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
