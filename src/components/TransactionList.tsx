"use client";

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
  return (
    <div>
      {transactions.map((transaction) => (
        <div key={transaction._id?.toString() || 'fallback-key'} className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <p className="font-semibold">{transaction.description}</p>
            <p className="text-sm text-gray-400">₹{transaction.amount.toFixed(2)}</p>
            <p className="text-sm text-gray-400">
              {new Date(transaction.date).toLocaleDateString('en-GB')} {/* DD/MM/YYYY format */}
            </p>
            <p className="text-sm text-gray-400">{transaction.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction)}
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
        </div>
      ))}
    </div>
  );
}