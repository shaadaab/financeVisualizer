"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Transaction } from '@/models/Transaction';

// Define colors for each category
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#7b38b5'];

export default function CategoryPieChart({ transactions }: { transactions: Transaction[] }) {
    // Group transactions by category
    const categoryData = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
        }
        acc[transaction.category] += transaction.amount;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array for Recharts
    const data = Object.keys(categoryData).map((category) => ({
        category,
        amount: categoryData[category],
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                >
                    {/* Map colors to each category */}
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend iconType="square" /> 
            </PieChart>
        </ResponsiveContainer>
    );
}