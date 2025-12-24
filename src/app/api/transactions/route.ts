import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
    await new Promise(r => setTimeout(r, 500)); // Latency sim
    const db = await readDB();
    return NextResponse.json(db.transactions);
}

export async function POST(request: Request) {
    await new Promise(r => setTimeout(r, 500));
    const body = await request.json();
    const db = await readDB();
    const newItem = { ...body, id: Date.now() };
    db.transactions.unshift(newItem); // Add to top
    await writeDB(db);
    return NextResponse.json(newItem);
}
