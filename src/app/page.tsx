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

  const handleResetAllBudgets = async () => {
    const confirmReset = confirm('Are you sure you want to reset all budgets? This action cannot be undone.');
    if (!confirmReset) return;

    try {
      const response = await fetch('/api/budgets', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset budgets.');
      }

      // Refresh budgets
      setRefreshKey((prev) => prev + 1);
      alert('All budgets have been reset successfully!');
    } catch (error) {
      console.error('Error resetting budgets:', error);
      alert('Failed to reset budgets. Please try again.');
    }
  };

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
  const handleEdit = async (updatedTransaction: Transaction) => {
    try {
      const response = await fetch(`/api/transactions/${updatedTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          description: updatedTransaction.description,
          category: updatedTransaction.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction.');
      }

      // Update the transaction in the state
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === updatedTransaction._id ? updatedTransaction : transaction
        )
      );
      setRefreshKey((prev) => prev + 1); // Refresh the list
      alert('Transaction updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction. Please try again.');
    }
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

      // Remove the transaction from the state
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction._id?.toString() !== id)
      );
      setRefreshKey((prev) => prev + 1); // Refresh the list
      alert('Transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <h1 className="text-4xl my-10 md:text-6xl font-bold text-center md:mb-10 text-white">
        Personal Finance Visualizer📊
      </h1>

      {/* First Row: Dashboard Cards */}
      <div className="space-y-6 md:space-y-8">
        {/* Total Expenses Card (Top) */}
        <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700 w-full md:w-2/5 mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center md:text-center">
            Total Expenses
          </h2>
          <p className="text-2xl md:text-3xl text-teal-400 text-center md:text-center">
            {formatIndianCurrency(totalExpenses)}
          </p>
        </div>

        {/* Category Breakdown and Most Recent Transactions Cards (Below) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Category Breakdown Card */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Category Breakdown</h2>
            <ul className="space-y-2 md:space-y-3">
              {/* Header Row */}
              <li className="grid grid-cols-2 gap-4 font-semibold text-gray-400 pb-2 md:pb-4 border-b border-gray-700">
                <span>Category</span>
                <span className="text-right">Amount</span>
              </li>

              {/* Category Rows */}
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <li key={category} className="grid grid-cols-2 gap-4 items-center py-1 md:py-2">
                  <span className="truncate">{category}</span>
                  <div className="flex items-center justify-end gap-2 md:gap-3">
                    <span
                      className="text-right cursor-pointer text-teal-400 hover:underline"
                      onClick={() => fetchMonthlyBreakdown(category)}
                    >
                      {formatIndianCurrency(amount)}
                    </span>
                    {/* Info Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-gray-400 cursor-pointer hover:text-gray-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      onClick={() => fetchMonthlyBreakdown(category)}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>

            {/* Note */}
            <p className="text-sm text-gray-400 mt-4 md:mt-6">
              *Click on the amount to expand the details.
            </p>
          </div>

          {/* Popup Overlay */}
          {isPopupVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 md:p-6">
              <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700 w-full max-w-md">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                  Monthly Breakdown for {selectedCategory}
                </h2>
                <ul className="space-y-3 md:space-y-4">
                  {/* Header Row */}
                  <li className="grid grid-cols-2 gap-4 font-semibold text-gray-400 pb-2 md:pb-4 border-b border-gray-700">
                    <span>Month</span>
                    <span className="text-right">Amount</span>
                  </li>

                  {/* Monthly Breakdown Rows */}
                  {Object.entries(monthlyBreakdown).map(([month, amount]) => (
                    <li key={month} className="grid grid-cols-2 gap-4 items-center py-2 md:py-3">
                      <span className="truncate">{month}</span>
                      <span className="text-right text-teal-400">₹{amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {/* Go Back Button */}
                <button
                  className="mt-4 md:mt-6 w-full bg-blue-600 text-white py-2 md:py-3 rounded-md hover:bg-blue-700"
                  onClick={() => setIsPopupVisible(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Most Recent Transactions Card */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Most Recent Transactions</h2>
            <ul className="space-y-3 md:space-y-4">
              {/* Header Row */}
              <li className="grid grid-cols-3 gap-4 font-semibold text-gray-400 pb-2 md:pb-4 border-b border-gray-700">
                <span>Description</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Date</span>
              </li>

              {/* Transaction Rows */}
              {mostRecentTransactions.map((transaction) => (
                <li key={transaction._id?.toString()} className="grid grid-cols-3 gap-4 items-center py-2 md:py-2">
                  <span className="truncate">{transaction.description}</span>
                  <span className="text-right text-teal-400">{formatIndianCurrency(transaction.amount)}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10 mt-8">
        {/* Transaction Form */}
        <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Add Transactions</h2>
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
        <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Add Budget</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Transaction List */}
        <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Transactions List</h2>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Monthly Expenses Chart */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Monthly Expenses Graph</h2>
            <MonthlyExpensesChart transactions={transactions} />
          </div>

          {/* Category Pie Chart */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Expense Distribution by Category</h2>
            <CategoryPieChart transactions={transactions} />
          </div>

          {/* Budget vs Actual Chart */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Budget v/s Expenditure</h2>
            <BudgetVsActualChart transactions={transactions} budgets={budgets} />
            <button
              onClick={handleResetAllBudgets}
              className="mt-4 w-full bg-blue-600 text-white py-2 md:py-3 rounded-md hover:bg-blue-700 hover:cursor-pointer"
            >
              Reset All Budgets
            </button>
          </div>

          {/* Spending Insights */}
          <div className="p-6 md:p-8 rounded-2xl shadow-md border border-gray-700">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Spending Insights</h2>
            {budgets.map((budget) => {
              const actual = transactions
                .filter((t) => t.category === budget.category)
                .reduce((sum, t) => sum + t.amount, 0);

              if (actual > budget.amount) {
                return (
                  <p key={budget._id?.toString()} className="text-gray-400 font-bold">
                    Overspending in {budget.category}:{' '}
                    <span className="text-red-500">₹{(actual - budget.amount).toFixed(2)}</span> over budget.
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

function setError(_p0?: string) {
  throw new Error('Function not implemented.');
}