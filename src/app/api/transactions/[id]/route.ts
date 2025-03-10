import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/models/Transaction';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const { amount, date, description, category } = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Transaction>('transactions');

        // Convert id to ObjectId
        const objectId = new ObjectId(id);

        // Update the transaction
        const result = await collection.updateOne(
            { _id: objectId }, // Filter by transaction ID
            { $set: { amount: parseFloat(amount), date: new Date(date), description, category } } // Update fields
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}