import React, { useState, useEffect } from "react";
import { CircleDollarSign, Receipt, Users, Loader2 } from "lucide-react";
import rooster from "../assets/icons8-rooster-50.png";
import { api } from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Birds",
      value: summary?.totalBirds || 0,
      icon: "rooster",
    },
    {
      title: "Total Sales",
      value: `₹${Number(summary?.totalSales || 0).toLocaleString()}`,
      icon: CircleDollarSign,
    },
    {
      title: "Total Profit",
      value: `₹${Number(summary?.totalProfit || 0).toLocaleString()}`,
      icon: CircleDollarSign,
    },
    {
      title: "Matches Played",
      value: summary?.matchesPlayed || 0,
      icon: "rooster", // Using rooster icon as a placeholder for matches
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
        <p>{error}</p>
        <button onClick={fetchSummary} className="mt-2 font-bold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Summary</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="bg-green-50 p-3 rounded-full">
                {Icon === "rooster" ? (
                  <img src={rooster} className="w-8 h-8" alt="Rooster" />
                ) : (
                  <Icon className="w-8 h-8 text-green-600" />
                )}
              </div>

              <div>
                <p className="text-gray-500 text-sm font-medium">{item.title}</p>
                <h2 className="text-2xl font-bold text-gray-900">{item.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Inventory Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Birds Ready for Match</span>
              <span className="font-bold text-green-600">{summary?.birdsReadyForMatch}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Birds Sold</span>
              <span className="font-bold text-blue-600">{summary?.birdsSold}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Investment</span>
              <span className="font-bold text-red-600">₹{Number(summary?.totalInvestment || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wins</span>
              <span className="font-bold text-green-600">{summary?.wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Losses</span>
              <span className="font-bold text-red-600">{summary?.losses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-bold text-blue-600">
                {summary?.matchesPlayed ? ((summary.wins / summary.matchesPlayed) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;