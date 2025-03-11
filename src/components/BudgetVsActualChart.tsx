import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Transaction, Budget } from '@/models/Transaction';
import { TooltipProps } from 'recharts';

type TooltipData = {
    month: string;
    category: string;
    budget: number;
    actual: number;
};

type CustomTooltipProps = TooltipProps<number, string> & {
    payload?: { payload: TooltipData }[];
};
// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload; // Get the data for the hovered bar
        return (
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                <p className="font-semibold">{data.month}</p>
                <p className="text-sm text-gray-300">{data.category}</p>
                <p className="text-sm">Budget: ₹{data.budget.toFixed(2)}</p>
                <p className="text-sm">Actual: ₹{data.actual.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

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

    // Combine budget and actual spending with month
    const data = budgets.map((budget) => {
        const month = new Date(`${budget.month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
        return {
            category: budget.category,
            budget: budget.amount,
            actual: actualSpending[budget.category] || 0,
            month: month, // Add month to the data
        };
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} contentStyle={{ backgroundColor: '#2f2b75', border: 'none' }} />
                <Legend />
                <Bar dataKey="budget" fill="#55b54e" name="Budget" />
                <Bar dataKey="actual" fill="#d1130d" name="Actual Spending" />

            </BarChart>
        </ResponsiveContainer>
    );
}