
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Category } from '@/types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

async function getDB() {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function saveDB(data: any) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
    try {
        const db = await getDB();
        return NextResponse.json(db.categories || []);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const db = await getDB();

        const newCategory: Category = {
            id: Date.now().toString(),
            ...body,
        };

        if (!db.categories) {
            db.categories = [];
        }

        db.categories.push(newCategory);
        await saveDB(db);

        return NextResponse.json(newCategory);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const db = await getDB();

        if (!db.categories) {
            return NextResponse.json({ error: 'No categories found' }, { status: 404 });
        }

        const index = db.categories.findIndex((c: Category) => c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        db.categories[index] = { ...db.categories[index], ...updates };
        await saveDB(db);

        return NextResponse.json(db.categories[index]);
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}
