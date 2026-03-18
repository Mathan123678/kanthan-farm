import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, MoreVertical, IndianRupee, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    bird_id: '',
    buyer_name: '',
    buyer_state: '',
    selling_price: '',
    transport_cost: '0',
    other_expenses: '0',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, birdsData] = await Promise.all([
        api.getSales(),
        api.getBirds(),
      ]);
      setSales(salesData);
      // Only show birds that are not sold
      setBirds(birdsData.filter(b => b.status !== 'Sold'));
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
    if (!formData.bird_id) {
      alert("Please select a bird");
      return;
    }
    try {
      const saleData = {
        ...formData,
        bird_id: parseInt(formData.bird_id),
        selling_price: parseFloat(formData.selling_price),
        transport_cost: parseFloat(formData.transport_cost) || 0,
        other_expenses: parseFloat(formData.other_expenses) || 0,
        selling_date: new Date().toISOString(),
      };
      await api.createSale(saleData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData({
        bird_id: '',
        buyer_name: '',
        buyer_state: '',
        selling_price: '',
        transport_cost: '0',
        other_expenses: '0',
        notes: '',
      });
    } catch (err) {
      alert("Error recording sale: " + err.message);
    }
  };

  const totals = sales.reduce((acc, sale) => ({
    revenue: acc.revenue + Number(sale.selling_price || 0),
    profit: acc.profit + Number(sale.profit || 0),
  }), { revenue: 0, profit: 0 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales</h1>
          <p className="mt-1 text-sm text-gray-500">Track birds sold, buyers, and profit.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Record Sale
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
          {error}
          <button onClick={fetchData} className="ml-4 underline">Retry</button>
        </div>
      ) : (
        <>
          {/* Grid Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><IndianRupee className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totals.revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><IndianRupee className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">₹{totals.profit.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><IndianRupee className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Sale Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{sales.length ? (totals.revenue / sales.length).toFixed(0).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Sales List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bird Detail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Detail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financials</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.bird_name}</div>
                        <div className="text-sm text-gray-500">ID: {sale.bird_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.buyer_name}</div>
                        <div className="text-sm text-gray-500">{sale.buyer_state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">Price: ₹{sale.selling_price}</div>
                        <div className="text-xs text-gray-500">Profit: ₹{sale.profit} | Trans: ₹{sale.transport_cost}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.selling_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No sales recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Sale Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Record a Sale (Mark Bird as Sold)</h3>
                  <p className="text-sm text-gray-500 mt-1">Select a bird to mark it as Sold and record the financials.</p>
                  <div className="mt-6 grid gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Select Bird</label>
                      <select 
                        name="bird_id"
                        value={formData.bird_id}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3"
                      >
                        <option value="">Select a growing/ready bird...</option>
                        {birds.map(bird => (
                          <option key={bird.bird_id} value={bird.bird_id}>
                            {bird.name} ({bird.breed} - {bird.status})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                      <input 
                        type="text" 
                        name="buyer_name"
                        value={formData.buyer_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3" 
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Buyer State/Region</label>
                      <input 
                        type="text" 
                        name="buyer_state"
                        value={formData.buyer_state}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3" 
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                      <input 
                        type="number" 
                        name="selling_price"
                        value={formData.selling_price}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3" 
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Transport/Other Cost (₹)</label>
                      <input 
                        type="number" 
                        name="transport_cost"
                        value={formData.transport_cost}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3" 
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:w-auto sm:text-sm transition-colors">
                    Confirm Sale
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
