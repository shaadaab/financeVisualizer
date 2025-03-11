import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('transactions');
        const transactions = await collection.find({}).toArray();
        return NextResponse.json(transactions, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { amount, date, description, category } = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('transactions');
        const result = await collection.insertOne({ amount, date, description, category });
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}