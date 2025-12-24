import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function GET(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const db = await readDB();

    if (type === 'kpi') {
        // Calculate real KPIs from transactions
        const totalBalance = db.cards.reduce((acc: number, c: any) => acc + (c.type === 'debit' ? c.balance : -c.balance), 0);
        const income = db.transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
        const expense = db.transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);

        return NextResponse.json([
            { label: 'Total Balance', value: `$${totalBalance.toLocaleString()}`, trend: '+2.5%', isPositive: true },
            { label: 'Monthly Income', value: `$${income.toLocaleString()}`, trend: '+12%', isPositive: true },
            { label: 'Monthly Expenses', value: `$${expense.toLocaleString()}`, trend: '-5%', isPositive: true },
            { label: 'Active Installments', value: `${db.installments.length}`, trend: 'Plans', isPositive: true },
        ]);
    }

    if (type === 'trends') {
        return NextResponse.json(db.trends);
    }

    if (type === 'analytics') {
        return NextResponse.json([
            { label: 'Savings Rate', value: '32.4%', trend: '+4.2% from last month', isPositive: true, icon: 'Percent' },
            { label: 'Net Cash Flow', value: '+$1,900', trend: 'Income - Expenses', isPositive: true, icon: 'DollarSign' },
            { label: 'Avg. Daily Spend', value: '$142.50', trend: '+$12.00 vs average', isPositive: false, icon: 'Calendar' },
        ]);
    }

    if (type === 'recurring') {
        return NextResponse.json(db.recurring);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
