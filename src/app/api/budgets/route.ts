import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getCategoryConfig } from '@/config/categories';

export async function GET() {
    await new Promise(r => setTimeout(r, 500));
    const db = await readDB();
    return NextResponse.json(db.budgets);
}

export async function POST(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const body = await request.json(); // { category, limit, color? }
    const db = await readDB();

    // Check if budget already exists
    const existingIdx = db.budgets.findIndex((b: any) => b.category === body.category);
    if (existingIdx !== -1) {
        return NextResponse.json({ error: 'Budget already exists for this category' }, { status: 400 });
    }

    // Get category config for default color if not provided
    const categoryConfig = getCategoryConfig(body.category);
    const newBudget = {
        category: body.category,
        limit: body.limit || 500,
        color: body.color || categoryConfig?.color || '#6b7280'
    };

    db.budgets.push(newBudget);
    await writeDB(db);

    return NextResponse.json(newBudget);
}

export async function PUT(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const body = await request.json(); // { category, limit }
    const db = await readDB();

    const idx = db.budgets.findIndex((b: any) => b.category === body.category);
    if (idx !== -1) {
        db.budgets[idx].limit = body.limit;
        if (body.color) {
            db.budgets[idx].color = body.color;
        }
        await writeDB(db);
        return NextResponse.json(db.budgets[idx]);
    }

    // If budget doesn't exist, create it
    const categoryConfig = getCategoryConfig(body.category);
    const newBudget = {
        category: body.category,
        limit: body.limit,
        color: categoryConfig?.color || '#6b7280'
    };
    db.budgets.push(newBudget);
    await writeDB(db);

    return NextResponse.json(newBudget);
}
