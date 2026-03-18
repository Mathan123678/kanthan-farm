import { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, MapPin, Search, Loader2, X, Phone } from 'lucide-react';
import { api } from '../services/api';

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    state: '',
  });

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const data = await api.getBuyers();
      setBuyers(data);
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
      await api.createBuyer(formData);
      await fetchBuyers();
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', state: '' });
    } catch (err) {
      alert("Error saving buyer: " + err.message);
    }
  };

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.phone && b.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buyer Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer contacts and purchase history.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Add Buyer
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="Search buyers by name or phone..." 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button onClick={fetchBuyers} className="mt-2 font-bold underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map(buyer => (
            <div key={buyer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg border border-green-200">
                    {buyer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{buyer.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {buyer.state || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-lg font-bold text-green-600">₹{Number(buyer.total_purchases || 0).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1"><Phone size={14}/> Contact</p>
                  <p className="text-sm text-blue-600 font-medium">{buyer.phone || 'No phone provided'}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredBuyers.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 italic">
              No buyers found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Add Buyer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Buyer</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Buyer's full name"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 00000 00000"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Tamil Nadu, Kerala, etc."
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg mt-4"
              >
                Save Buyer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
