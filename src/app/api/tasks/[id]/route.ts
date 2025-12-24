import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await new Promise(r => setTimeout(r, 500));
    const { id: idStr } = await params;
    const body = await request.json();
    const db = await readDB();
    const id = parseInt(idStr);
    const index = db.tasks.findIndex((t: any) => t.id === id);

    if (index !== -1) {
        db.tasks[index] = { ...db.tasks[index], ...body };
        await writeDB(db);
        return NextResponse.json(db.tasks[index]);
    }

    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await new Promise(r => setTimeout(r, 500));
    const { id: idStr } = await params;
    const db = await readDB();
    const id = parseInt(idStr);
    db.tasks = db.tasks.filter((t: any) => t.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
}
