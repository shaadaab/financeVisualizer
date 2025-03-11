# Personal Finance Visualizer

The Personal Finance Visualizer is a simple web application designed to help users track and visualize their personal finances. Built with Next.js, React, shadcn/ui, Recharts, and MongoDB, this application provides an intuitive interface for managing transactions, categorizing expenses, and analyzing spending patterns.

## Features

### Stage 1: Basic Transaction Tracking
- **Add/Edit/Delete Transactions**: Easily add, edit, or delete transactions with details like amount, date, and description.
- **Transaction List View**: View all transactions in a clean, organized list.
- **Monthly Expenses Bar Chart**: Visualize monthly expenses using a bar chart powered by Recharts.
- **Basic Form Validation**: Ensure data integrity with form validation for transaction inputs.

### Stage 2: Categories
- **Predefined Categories**: Assign transactions to predefined categories (e.g., Food, Rent, Entertainment).
- **Category-Wise Pie Chart**: Analyze spending distribution across categories with a pie chart.
- **Dashboard**: View a summary of your finances, including:
  - Total expenses
  - Category breakdown
  - Most recent transactions

### Stage 3: Budgeting
- **Set Monthly Budgets**: Define monthly budgets for each category.
- **Budget vs Actual Comparison Chart**: Compare your actual spending against your budget using a chart.
- **Spending Insights**: Gain simple insights into your spending habits and trends.

## Tech Stack

- **Frontend**: Next.js, React, shadcn/ui
- **Data Visualization**: Recharts
- **Database**: MongoDB
- **Styling**: Tailwind CSS (via shadcn/ui)
- **Form Handling**: React Hook Form
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/personal-finance-visualizer.git
cd personal-finance-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`.
