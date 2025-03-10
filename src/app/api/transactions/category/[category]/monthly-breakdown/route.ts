import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/models/Transaction';

export async function GET(request: Request, context: { params: { category: string } }) {
    // Await params before destructuring
    const { category } = await context.params;

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<Transaction>('transactions');

        // Fetch transactions for the specified category
        const transactions = await collection.find({ category }).toArray();

        // Group transactions by month
        const monthlyBreakdown = transactions.reduce((acc, transaction) => {
            const month = new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += transaction.amount;
            return acc;
        }, {} as Record<string, number>);

        console.log('Monthly Breakdown Data:', monthlyBreakdown); // Debugging
        return NextResponse.json(monthlyBreakdown, { status: 200 });
    } catch (error) {
        console.error('Error fetching monthly breakdown:', error);
        return NextResponse.json({ error: 'Failed to fetch monthly breakdown' }, { status: 500 });
    }
}
