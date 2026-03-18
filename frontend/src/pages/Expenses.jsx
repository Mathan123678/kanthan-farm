import { useState, useEffect } from 'react';
import { Plus, Filter, Download, ArrowDownRight, ArrowUpRight, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    amount: '',
    description: '',
  });

  const categories = [
    'BirdPurchase', 'Food', 'Medicine', 'Transport', 'Labour', 'FarmMaintenance', 'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      await api.createExpense(expenseData);
      await fetchExpenses();
      setIsAddModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        amount: '',
        description: '',
      });
    } catch (err) {
      alert("Error saving expense: " + err.message);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  const highestCategory = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b, 'None'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Farm Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Record and monitor all outgoings for the farm.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm font-medium hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button onClick={fetchExpenses} className="mt-2 font-bold underline">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 items-center rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg"><ArrowDownRight size={20} /></div>
              <div><p className="text-sm text-gray-500">Total Expenses</p><p className="text-xl font-bold">₹{totalExpenses.toLocaleString()}</p></div>
            </div>
            <div className="bg-white p-4 items-center rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><ArrowUpRight size={20} /></div>
              <div><p className="text-sm text-gray-500">Highest Category</p><p className="text-xl font-bold">{highestCategory}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        ₹{Number(expense.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No expenses recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Farm Expense</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Details about the expense..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                Record Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
