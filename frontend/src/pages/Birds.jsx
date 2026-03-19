import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, MoreVertical, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { api } from "../services/api";

export default function Birds() {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchBirds();
  }, []);

  const fetchBirds = async () => {
    try {
      setLoading(true);
      const data = await api.getBirds();
      setBirds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weight: "",
    age: "",
    color: "",
    health_status: "Good",
    buy_price: "",
    buy_date: new Date().toISOString().split("T")[0],
    photo: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setFormData({ ...formData, photo: preview });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const birdData = {
        ...formData,
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        buy_price: parseFloat(formData.buy_price) || 0,
        match_ready: false,
        status: "Growing",
      };
      await api.createBird(birdData);
      await fetchBirds();
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        breed: "",
        weight: "",
        age: "",
        color: "",
        health_status: "Good",
        buy_price: "",
        buy_date: new Date().toISOString().split("T")[0],
        photo: "",
      });
      setImagePreview(null);
    } catch (err) {
      alert("Error saving bird: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bird?")) return;
    try {
      await api.deleteBird(id);
      await fetchBirds();
    } catch (err) {
      alert("Error deleting bird: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bird Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage your roosters and track their details.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Bird
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search birds..."
            className="w-full pl-10 py-2 border rounded-lg"
          />
        </div>
        <button className="px-4 py-2 border rounded-lg">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* BIRD TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading birds...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error: {error}</p>
            <button onClick={fetchBirds} className="mt-2 text-green-600 font-medium">Retry</button>
          </div>
        ) : birds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No birds found. Add your first bird!</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                  Bird
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                  Weight / Age
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {birds.map((bird) => (
                <tr key={bird.bird_id} className="hover:bg-gray-50 transition-colors border-t">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                      {bird.photo ? (
                        <img src={bird.photo} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold">{bird.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{bird.name}</div>
                      <div className="text-sm text-gray-500">{bird.breed}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {bird.weight} kg / {bird.age} months
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bird.status === 'ReadyForMatch' ? 'bg-green-100 text-green-700' :
                      bird.status === 'Sold' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {bird.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bird.bird_id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD BIRD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add New Bird</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                placeholder="Bird Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="breed"
                placeholder="Breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="weight"
                  type="number"
                  step="0.01"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <input
                  name="age"
                  type="number"
                  placeholder="Age (months)"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <input
                name="color"
                placeholder="Color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="buy_price"
                type="number"
                placeholder="Buy Price"
                value={formData.buy_price}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                required
              />
              <input
                name="buy_date"
                type="date"
                value={formData.buy_date}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                required
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bird Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded"
                />
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold mt-4"
              >
                Save Bird
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}