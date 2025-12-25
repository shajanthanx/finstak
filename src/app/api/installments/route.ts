import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Transform snake_case to camelCase for frontend
    const installments = data?.map(inst => ({
        id: inst.id,
        name: inst.name,
        provider: inst.provider,
        totalAmount: inst.total_amount,
        paidAmount: inst.paid_amount,
        totalMonths: inst.total_months,
        paidMonths: inst.paid_months,
        startDate: inst.start_date,
        category: inst.category
    })) || [];

    return NextResponse.json(installments);
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
                user_id: user.id,
                name: body.name,
                provider: body.provider,
                total_amount: body.totalAmount,
                paid_amount: body.paidAmount || 0,
                total_months: body.totalMonths,
                paid_months: body.paidMonths || 0,
                start_date: body.startDate,
                category: body.category
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating installment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform for frontend
        return NextResponse.json({
            id: data.id,
            name: data.name,
            provider: data.provider,
            totalAmount: data.total_amount,
            paidAmount: data.paid_amount,
            totalMonths: data.total_months,
            paidMonths: data.paid_months,
            startDate: data.start_date,
            category: data.category
        });
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
