"use client";

import { useState } from 'react';
import { Transaction } from '@/models/Transaction';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  // Function to format amounts in Indian currency format
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle edit button click
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransactionId(transaction._id?.toString() || null);
    setEditedDescription(transaction.description);
    setEditedAmount(transaction.amount.toString());
    setEditedDate(new Date(transaction.date).toISOString().split('T')[0]); // Format as YYYY-MM-DD
    setEditedCategory(transaction.category);
  };

  // Handle save button click
  const handleSaveClick = (transaction: Transaction) => {
    const updatedTransaction = {
      ...transaction,
      description: editedDescription,
      amount: parseFloat(editedAmount),
      date: new Date(editedDate),
      category: editedCategory,
    };

    onEdit(updatedTransaction); // Pass updated transaction to parent
    setEditingTransactionId(null); // Exit edit mode
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    setEditingTransactionId(null); // Exit edit mode
  };

  return (
    <div>
      {transactions.map((transaction) => (
        <div key={transaction._id?.toString() || 'fallback-key'} className="flex justify-between items-center p-4 border-b border-gray-700">
          {editingTransactionId === transaction._id?.toString() ? (
            // Edit mode
            <div className="flex-1">
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-2 mb-2 border rounded bg-gray-900 text-white"
                placeholder="Description"
              />
              <input
                type="number"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                className="w-full p-2 mb-2 border rounded bg-gray-900 text-white"
                placeholder="Amount"
              />
              <input
                type="date"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
                className="w-full p-2 mb-2 border rounded bg-gray-900 text-white"
              />
              <select
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className="w-full p-2 mb-2 border rounded bg-gray-900 text-white"
              >
                <option value="">Select a category</option>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveClick(transaction)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display mode
            <>
              <div>
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm text-gray-400">
                  {formatIndianCurrency(transaction.amount)} {/* Formatted amount */}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(transaction.date).toLocaleDateString('en-GB')} {/* DD/MM/YYYY format */}
                </p>
                <p className="text-sm text-gray-400">{transaction.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(transaction)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(transaction._id?.toString() || '')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}