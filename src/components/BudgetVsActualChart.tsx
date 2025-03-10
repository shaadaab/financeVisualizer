"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Budget } from '@/models/Transaction';

export default function BudgetVsActualChart({
    transactions,
    budgets,
}: {
    transactions: Transaction[];
    budgets: Budget[];
}) {
    // Calculate actual spending per category
    const actualSpending = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) acc[transaction.category] = 0;
        acc[transaction.category] += transaction.amount;
        return acc;
    }, {} as Record<string, number>);

    // Combine budget and actual spending
    const data = budgets.map((budget) => ({
        category: budget.category,
        budget: budget.amount,
        actual: actualSpending[budget.category] || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#8884d8" />
                <Bar dataKey="actual" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    );
}