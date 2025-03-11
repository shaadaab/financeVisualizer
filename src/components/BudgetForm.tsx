"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function BudgetForm({
    onSubmit,
    category,
    setCategory,
    amount,
    setAmount,
    month,
    setMonth,
}: {
    onSubmit: (e: React.FormEvent) => void;
    category: string;
    setCategory: (value: string) => void;
    amount: string;
    setAmount: (value: string) => void;
    month: string;
    setMonth: (value: string) => void;
}) {
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!category || !amount || !month) {
            setError('All fields are required.');
            return;
        }

        try {
            await onSubmit(e);
            setCategory('');
            setAmount('');
            setMonth('');
            setError('');
        } catch (err) {
            setError('Failed to add budget. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="mb-2">Category</Label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-900 text-gray-100"
                >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Rent">Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                </select>
            </div>
            <div>
                <Label className="mb-2">Amount</Label>
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter budget amount"
                    required
                />
            </div>
            <div>
                <Label className="mb-2">Month</Label>
                <Input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit"  className="bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer">Add Budget</Button>
        </form>
    );
}