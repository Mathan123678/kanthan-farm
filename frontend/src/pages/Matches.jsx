import { useState, useEffect } from 'react';
import { Plus, Swords, Calendar, User, Trophy, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    bird_id: '',
    match_date: new Date().toISOString().split('T')[0],
    opponent: '',
    result: 'Win',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesData, birdsData] = await Promise.all([
        api.getMatches(),
        api.getBirds(),
      ]);
      setMatches(matchesData);
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
      const matchData = {
        ...formData,
        bird_id: parseInt(formData.bird_id),
      };
      await api.createMatch(matchData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData({
        bird_id: '',
        match_date: new Date().toISOString().split('T')[0],
        opponent: '',
        result: 'Win',
        notes: '',
      });
    } catch (err) {
      alert("Error saving match: " + err.message);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Match Records</h1>
          <p className="mt-1 text-sm text-gray-500">Track cockfighting performance and competition history.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm font-medium hover:bg-green-700 w-full sm:w-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Record Match
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <div key={match.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
               {/* Result Ribbon */}
               <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-lg ${
                match.result === 'Win' ? 'bg-green-100 text-green-700' :
                match.result === 'Loss' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {match.result}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${
                  match.result === 'Win' ? 'bg-green-50 text-green-600' :
                  match.result === 'Loss' ? 'bg-red-50 text-red-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <Swords size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{getBirdName(match.bird_id)}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(match.match_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Opponent:</span> 
                  <span className="font-semibold text-gray-900">{match.opponent || 'N/A'}</span>
                </div>
                
                {match.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-gray-600 text-sm italic line-clamp-2">
                    "{match.notes}"
                  </div>
                )}
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              No match records found. Capture your first victory!
            </div>
          )}
        </div>
      )}

      {/* Add Match Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-7 rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Record Match
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Bird</label>
                <select
                  name="bird_id"
                  value={formData.bird_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                >
                  <option value="">Choose a bird...</option>
                  {birds.map(bird => (
                    <option key={bird.bird_id} value={bird.bird_id}>{bird.name} ({bird.breed})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Match Date</label>
                  <input
                    type="date"
                    name="match_date"
                    value={formData.match_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Result</label>
                  <select
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                  >
                    <option value="Win">Win</option>
                    <option value="Loss">Loss</option>
                    <option value="Draw">Draw</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Opponent (Owner/Farm)</label>
                <input
                  type="text"
                  name="opponent"
                  placeholder="e.g. SRM Farms"
                  value={formData.opponent}
                  onChange={handleInputChange}
                  required
                  className="w-full border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Record key moments or injuries..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none border transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 pt-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Match Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
