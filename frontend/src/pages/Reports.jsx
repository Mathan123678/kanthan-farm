import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, expensesRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMonthlyStats(),
        api.getExpenses(),
      ]);
      setSummary(summaryRes);
      setMonthlyData(monthlyRes);
      setExpenses(expensesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: monthlyData.map(d => new Date(d.month).toLocaleDateString('default', { month: 'short' })),
    datasets: [
      {
        label: 'Monthly Profit (₹)',
        data: monthlyData.map(d => Number(d.total_profit)),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Monthly Sales (₹)',
        data: monthlyData.map(d => Number(d.total_sales)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const expenseBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const donutData = {
    labels: Object.keys(expenseBreakdown),
    datasets: [{
      data: Object.values(expenseBreakdown),
      backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#6b7280'],
      borderWidth: 0,
    }]
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-green-600" /></div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Visual overview of your farm's performance and financials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Trends</h3>
          <div className="h-64">
            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4 self-start">Expense Breakdown</h3>
          <div className="h-64 w-full flex justify-center">
            {expenses.length > 0 ? (
              <Doughnut data={donutData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            ) : (
              <div className="flex items-center text-gray-400">No expense data yet</div>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-500 font-medium">Total Birds</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalBirds || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <p className="text-sm text-green-600 font-medium">Birds Sold</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{summary?.birdsSold || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm text-blue-600 font-medium">Match Wins</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{summary?.wins || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
            <p className="text-sm text-purple-600 font-medium">Net Profit</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">₹{Number(summary?.totalProfit || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
