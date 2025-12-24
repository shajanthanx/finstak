import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
    await new Promise(r => setTimeout(r, 500));
    const db = await readDB();
    return NextResponse.json(db.installments);
}

export async function POST(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const body = await request.json();
    const db = await readDB();
    const newItem = { ...body, id: Date.now() };
    db.installments.push(newItem);
    await writeDB(db);
    return NextResponse.json(newItem);
}
