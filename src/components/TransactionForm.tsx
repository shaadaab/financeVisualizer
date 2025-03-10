"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transaction } from '@/models/Transaction';
import { useState } from 'react';

export default function TransactionForm({
    onSubmit,
    amount,
    setAmount,
    date,
    setDate,
    description,
    setDescription,
    category,
    setCategory,
    editingTransaction,
}: {
    onSubmit: (e: React.FormEvent) => void;
    amount: string;
    setAmount: (value: string) => void;
    date: string;
    setDate: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    editingTransaction: Transaction | null;
}) {
    const [error, setError] = useState('');

    // Convert date from DD/MM/YYYY to YYYY-MM-DD for the input field
    const formatDateForInput = (date: string) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    // Convert date from YYYY-MM-DD to DD/MM/YYYY for display
    const formatDateForDisplay = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!amount || !date || !description || !category) {
            setError('All fields are required.');
            return;
        }


        try {
            await onSubmit(e); // Call the onSubmit handler from props
            // Clear form and error state
            setAmount('');
            setDate('');
            setDescription('');
            setCategory('');
            setError('');
            alert(editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!');
        } catch (err) {
            setError('Failed to add transaction. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Amount</Label>
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                />
            </div>
            <div>
                <Label>Date (DD/MM/YYYY)</Label>
                <Input
                    type="date"
                    value={formatDateForInput(date)} // Convert to YYYY-MM-DD for the input field
                    onChange={(e) => setDate(formatDateForDisplay(e.target.value))} // Convert back to DD/MM/YYYY
                    required
                />
            </div>
            <div>
                <Label>Description</Label>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    required
                />
            </div>
            <div>
                <Label>Category</Label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-gray-100"
                >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Rent">Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                </select>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
        </form>
    );
}