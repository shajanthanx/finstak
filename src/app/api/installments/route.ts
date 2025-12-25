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
        .from('installments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching installments:', error);
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
            .from('installments')
            .insert({
                ...(toSnakeCase(body) as any),
                user_id: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating installment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(data));
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
