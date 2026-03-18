import { useState, useEffect } from 'react';
import { Plus, Syringe, ClipboardPlus, Stethoscope, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function Health() {
  const [records, setRecords] = useState([]);
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    bird_id: '',
    vaccination_date: new Date().toISOString().split('T')[0],
    medicine: '',
    doctor: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsData, birdsData] = await Promise.all([
        api.getHealthRecords(),
        api.getBirds(),
      ]);
      setRecords(recordsData);
      setBirds(birdsData);
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
      const recordData = {
        ...formData,
        bird_id: parseInt(formData.bird_id),
      };
      await api.createHealthRecord(recordData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData({
        bird_id: '',
        vaccination_date: new Date().toISOString().split('T')[0],
        medicine: '',
        doctor: '',
        notes: '',
      });
    } catch (err) {
      alert("Error saving record: " + err.message);
    }
  };

  const getBirdName = (id) => {
    const bird = birds.find(b => b.bird_id === id);
    return bird ? bird.name : 'Unknown Bird';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health & Vaccination</h1>
          <p className="mt-1 text-sm text-gray-500">Track bird medical history and upcoming vaccinations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm font-medium hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 font-bold underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map(record => (
            <div key={record.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Syringe size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{getBirdName(record.bird_id)}</h3>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {new Date(record.vaccination_date).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Medicine:</span> 
                  <span className="font-medium text-gray-900">{record.medicine || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Doctor/Vet:</span> 
                  <span className="font-medium text-gray-900">{record.doctor || 'N/A'}</span>
                </div>
                {record.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-50 text-gray-600 text-xs italic">
                    "{record.notes}"
                  </div>
                )}
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 italic">
              No health records found. Add medical history for your birds.
            </div>
          )}
        </div>
      )}

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Health Record</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bird</label>
                <select
                  name="bird_id"
                  value={formData.bird_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="">Select a bird...</option>
                  {birds.map(bird => (
                    <option key={bird.bird_id} value={bird.bird_id}>{bird.name} ({bird.breed})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="vaccination_date"
                  value={formData.vaccination_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine/Vaccine</label>
                <input
                  type="text"
                  name="medicine"
                  placeholder="Ranikhet, vitamins, etc."
                  value={formData.medicine}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor/Vet Name</label>
                <input
                  type="text"
                  name="doctor"
                  placeholder="Dr. Ramesh"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
