"use client";

import { useEffect, useState } from 'react';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import BudgetForm from '@/components/BudgetForm';
import { Transaction, Budget } from '@/models/Transaction';
import { formatIndianCurrency } from '@/lib/utils';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetMonth, setBudgetMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<Record<string, number>>({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const fetchMonthlyBreakdown = async (category: string) => {
    try {
      const response = await fetch(`/api/transactions/category/${category}/monthly-breakdown`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly breakdown.');
      }
      const data = await response.json();
      setMonthlyBreakdown(data);
      setSelectedCategory(category);
      setIsPopupVisible(true);
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
      alert('Failed to fetch monthly breakdown. Please try again.');
    }
  };
  // Fetch transactions from the API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions.');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch budgets from the API
  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) {
        throw new Error('Failed to fetch budgets.');
      }
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Fetch transactions and budgets on component mount and when refreshKey changes
  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, [refreshKey]);

  // Handle form submission (for both add and edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!amount || !date || !description || !category) {
      setError('All fields are required.');
      return;
    }

    // Convert date from DD/MM/YYYY to a Date object
    const [day, month, year] = date.split('/');
    const dateObj = new Date(`${year}-${month}-${day}`);

    try {
      let response;
      if (editingTransaction) {
        // Update existing transaction
        response = await fetch(`/api/transactions/${editingTransaction._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(amount), date: dateObj, description, category }),
        });
      } else {
        // Add new transaction
        response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(amount), date: dateObj, description, category }),
        });
      }

      if (!response.ok) {
        throw new Error(editingTransaction ? 'Failed to update transaction.' : 'Failed to add transaction.');
      }

      // Clear form and refresh transaction list
      setAmount('');
      setDate('');
      setDescription('');
      setCategory('');
      setEditingTransaction(null); // Reset editing state
      setRefreshKey((prev) => prev + 1); // Increment refreshKey to trigger a refresh
      alert(editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!');
    } catch (err) {
      console.error(err);
      alert(editingTransaction ? 'Failed to update transaction.' : 'Failed to add transaction.');
    }
  };

  // Handle edit transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setDate(new Date(transaction.date).toLocaleDateString('en-GB')); // Format as DD/MM/YYYY
    setDescription(transaction.description);
    setCategory(transaction.category);
  };

  // Handle delete transaction
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction.');
      }

      // Refresh transaction list
      setRefreshKey((prev) => prev + 1); // Increment refreshKey to trigger a refresh
      alert('Transaction deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Handle add budget
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: budgetCategory, amount: parseFloat(budgetAmount), month: budgetMonth }),
      });

      if (!response.ok) {
        throw new Error('Failed to add budget.');
      }

      // Clear form and refresh budgets
      setBudgetCategory('');
      setBudgetAmount('');
      setBudgetMonth('');
      setRefreshKey((prev) => prev + 1);
      alert('Budget added successfully!');
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget. Please try again.');
    }
  };

  // Calculate total expenses
  const totalExpenses = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  // Calculate category breakdown
  const categoryBreakdown = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0;
    }
    acc[transaction.category] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get most recent transactions (last 5)
  const mostRecentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">Personal Finance Visualizer</h1>

      {/* First Row: Dashboard Cards */}
      <div>
        {/* Total Expenses Card (Top) */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Total Expenses</h2>
          <p className="text-2xl">{formatIndianCurrency(totalExpenses)}</p>
        </div>

        {/* Category Breakdown and Most Recent Transactions Cards (Below) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown Card */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
            <ul>
              {/* Header Row */}
              <li className="grid grid-cols-2 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-700">
                <span>Category</span>
                <span className="text-right">Amount</span>
              </li>

              {/* Category Rows */}
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <li key={category} className="grid grid-cols-2 gap-4 items-center py-2">
                  <span className="truncate">{category}</span>
                  <span
                    className="text-right cursor-pointer hover:underline"
                    onClick={() => fetchMonthlyBreakdown(category)}
                  >
                    {formatIndianCurrency(amount)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Note */}
            <p className="text-sm text-gray-400 mt-4">
              *Click on the amount to expand the details.
            </p>
          </div>

          {/* Popup Overlay */}
          {isPopupVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Monthly Breakdown for {selectedCategory}</h2>
                <ul>
                  {/* Header Row */}
                  <li className="grid grid-cols-2 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-700">
                    <span>Month</span>
                    <span className="text-right">Amount</span>
                  </li>

                  {/* Monthly Breakdown Rows */}
                  {Object.entries(monthlyBreakdown).map(([month, amount]) => (
                    <li key={month} className="grid grid-cols-2 gap-4 items-center py-2">
                      <span className="truncate">{month}</span>
                      <span className="text-right">₹{amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Go Back Button */}
                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => setIsPopupVisible(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Most Recent Transactions Card */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Most Recent Transactions</h2>
            <ul>
              {/* Header Row */}
              <li className="grid grid-cols-3 gap-4 font-semibold text-gray-400 pb-2 border-b border-gray-700">
                <span>Description</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Date</span>
              </li>

              {/* Transaction Rows */}
              {mostRecentTransactions.map((transaction) => (
                <li key={transaction._id?.toString()} className="grid grid-cols-3 gap-4 items-center py-2">
                  <span className="truncate">{transaction.description}</span>
                  <span className="text-right">{formatIndianCurrency(transaction.amount)}</span>
                  <span className="text-sm text-gray-400 text-right">
                    {new Date(transaction.date).toLocaleDateString('en-GB')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Second Row: Transaction and Budget Forms (Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Transaction Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
          <TransactionForm
            onSubmit={handleSubmit}
            amount={amount}
            setAmount={setAmount}
            date={date}
            setDate={setDate}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            editingTransaction={editingTransaction}
          />
        </div>

        {/* Budget Form */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
          <BudgetForm
            onSubmit={handleAddBudget}
            category={budgetCategory}
            setCategory={setBudgetCategory}
            amount={budgetAmount}
            setAmount={setBudgetAmount}
            month={budgetMonth}
            setMonth={setBudgetMonth}
          />
        </div>
      </div>

      {/* Third Row: Transaction List and Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction List */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Monthly Expenses Chart */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <MonthlyExpensesChart transactions={transactions} />
          </div>

          {/* Category Pie Chart */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <CategoryPieChart transactions={transactions} />
          </div>

          {/* Budget vs Actual Chart */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <BudgetVsActualChart transactions={transactions} budgets={budgets} />
          </div>

          {/* Spending Insights */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
            {budgets.map((budget) => {
              const actual = transactions
                .filter((t) => t.category === budget.category)
                .reduce((sum, t) => sum + t.amount, 0);

              if (actual > budget.amount) {
                return (
                  <p key={budget._id?.toString()} className="text-red-500">
                    Overspending in {budget.category}: ₹{(actual - budget.amount).toFixed(2)} over budget.
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function setError(arg0: string) {
  throw new Error('Function not implemented.');
}
