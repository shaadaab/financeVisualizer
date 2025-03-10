import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Budget } from '@/models/Transaction';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Budget>('budgets');

        const budgets = await collection.find().toArray();
        return NextResponse.json(budgets, { status: 200 });
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { category, amount, month } = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Budget>('budgets');

        // Insert the new budget
        const result = await collection.insertOne({ category, amount, month });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error adding budget:', error);
        return NextResponse.json({ error: 'Failed to add budget' }, { status: 500 });
    }
}