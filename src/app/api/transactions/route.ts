import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
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

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                ...(toSnakeCase(body) as any),
                user_id: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(data));
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
