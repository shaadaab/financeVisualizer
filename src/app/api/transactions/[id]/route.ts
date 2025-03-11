import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/models/Transaction';
import { ObjectId } from 'mongodb';

// Define the type for the params object
type Params = {
    id: string;
};

export async function PUT(
    request: Request,
    { params }: { params: Promise<Params> } // Align with Next.js's expected type
) {
    const resolvedParams = await params; // Await the params promise
    const { id } = resolvedParams; // Access `params` after resolving the promise
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<Params> } // Align with Next.js's expected type
) {
    const resolvedParams = await params; // Await the params promise
    const { id } = resolvedParams; // Access `params` after resolving the promise

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Transaction>('transactions');

        // Convert id to ObjectId
        const objectId = new ObjectId(id);

        // Delete the transaction
        const result = await collection.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}