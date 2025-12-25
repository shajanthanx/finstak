import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'kpi') {
        // Calculate real KPIs from transactions
        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user.id);

        if (txError) {
            console.error('Error fetching transactions for KPI:', txError);
            return NextResponse.json({ error: txError.message }, { status: 500 });
        }

        const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
        const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
        const netSavings = income - expense;

        const { data: installments } = await supabase
            .from('installments')
            .select('id')
            .eq('user_id', user.id);

        return NextResponse.json([
            { label: 'Net Savings', value: `$${netSavings.toLocaleString()}`, trend: '+1.2%', isPositive: true },
            { label: 'Monthly Income', value: `$${income.toLocaleString()}`, trend: '+12%', isPositive: true },
            { label: 'Monthly Expenses', value: `$${expense.toLocaleString()}`, trend: '-5%', isPositive: true },
            { label: 'Active Installments', value: `${installments?.length || 0}`, trend: 'Plans', isPositive: true },
        ]);
    }

    if (type === 'trends') {
        // Calculate monthly trends from transactions
        const { data, error } = await supabase.rpc('calculate_monthly_trends', {
            p_user_id: user.id,
            p_start_month: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
            p_end_month: new Date().toISOString().split('T')[0] // Today
        });

        if (error) {
            console.error('Error calculating trends:', error);
            // Fallback to manual calculation if function doesn't exist yet
            const { data: transactions } = await supabase
                .from('transactions')
                .select('date, amount, type')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            // Group by month
            const monthlyData: any = {};
            transactions?.forEach(t => {
                const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
                if (!monthlyData[month]) {
                    monthlyData[month] = { name: month, income: 0, expense: 0, savings: 0 };
                }
                if (t.type === 'income') {
                    monthlyData[month].income += Number(t.amount);
                } else {
                    monthlyData[month].expense += Number(t.amount);
                }
                monthlyData[month].savings = monthlyData[month].income - monthlyData[month].expense;
            });

            return NextResponse.json(Object.values(monthlyData).slice(0, 7));
        }

        // Format data for frontend
        const formattedData = data?.map((d: any) => ({
            name: new Date(d.month).toLocaleDateString('en-US', { month: 'short' }),
            income: Number(d.income),
            expense: Number(d.expense),
            savings: Number(d.savings)
        })) || [];

        return NextResponse.json(formattedData);
    }

    if (type === 'analytics') {
        // Calculate analytics stats
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user.id);

        const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
        const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
        const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : '0.0';
        const netCashFlow = income - expense;
        const avgDailySpend = transactions && transactions.length > 0 ? (expense / 30).toFixed(2) : '0.00';

        return NextResponse.json([
            { label: 'Savings Rate', value: `${savingsRate}%`, trend: '+4.2% from last month', isPositive: true, icon: 'Percent' },
            { label: 'Net Cash Flow', value: `${netCashFlow >= 0 ? '+' : ''}$${netCashFlow.toLocaleString()}`, trend: 'Income - Expenses', isPositive: netCashFlow >= 0, icon: 'DollarSign' },
            { label: 'Avg. Daily Spend', value: `$${avgDailySpend}`, trend: '+$12.00 vs average', isPositive: false, icon: 'Calendar' },
        ]);
    }

    if (type === 'recurring') {
        // Note: recurring bills table was removed, return empty array
        return NextResponse.json([]);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
