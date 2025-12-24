import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
    await new Promise(r => setTimeout(r, 500));
    const db = await readDB();
    return NextResponse.json(db.budgets);
}

export async function PUT(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const body = await request.json(); // { category, limit }
    const db = await readDB();

    const idx = db.budgets.findIndex((b: any) => b.category === body.category);
    if (idx !== -1) {
        db.budgets[idx].limit = body.limit;
        await writeDB(db);
    }

    return NextResponse.json({ success: true });
}
