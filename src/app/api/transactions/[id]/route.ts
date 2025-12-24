import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await new Promise(r => setTimeout(r, 500));
    const { id } = await params;
    const db = await readDB();
    db.transactions = db.transactions.filter((t: any) => t.id !== Number(id));
    await writeDB(db);
    return NextResponse.json({ success: true });
}
