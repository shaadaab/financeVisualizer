import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/models/Transaction';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(); // Use your database name if specified
        const collection = db.collection<Transaction>('transactions');

        // Fetch all transactions
        const transactions = await collection.find().toArray();

        // Return the transactions
        return NextResponse.json(transactions, { status: 200 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { amount, date, description, category } = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db(); // Use your database name if specified
        const collection = db.collection<Transaction>('transactions');

        // Insert the new transaction into the database
        const result = await collection.insertOne({
            amount,
            date: new Date(date),
            description,
            category,
        });

        // Return the inserted transaction
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error inserting transaction:', error);
        return NextResponse.json(
            { error: 'Failed to add transaction' },
            { status: 500 }
        );
    }
}