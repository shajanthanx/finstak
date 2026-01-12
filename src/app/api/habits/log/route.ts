import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { habit_id, date, completed_value } = toSnakeCase(body) as any;

        if (!habit_id || !date) {
            return NextResponse.json({ error: 'Missing habit_id or date' }, { status: 400 });
        }

        // Upsert log entry
        const { data, error } = await supabase
            .from('habit_logs')
            .upsert({
                user_id: user.id,
                habit_id,
                date,
                completed_value
            }, {
                onConflict: 'habit_id, date'
            })
            .select()
            .single();

        if (error) {
            console.error('Error logging habit:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(toCamelCase(data));
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
