import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export interface DB {
    transactions: any[];
    budgets: any[];
    cards: any[];
    installments: any[];
    recurring: any[];
    trends: any[];
    tasks: any[];
}

export async function readDB(): Promise<DB> {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}

export async function writeDB(data: DB): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}
