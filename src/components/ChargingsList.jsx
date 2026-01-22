import { useState } from 'react';

const ITEMS_PER_PAGE = 10;

export default function ChargingsList({ charging, car, onDeleteCharging }) {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort charging by date (newest first)
  const sortedCharging = [...charging].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (charging.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
        <p className="text-gray-400 text-lg">No charging sessions recorded yet. Add your first session above!</p>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalEnergy: sortedCharging.reduce((sum, session) => sum + session.energy, 0),
    totalCost: sortedCharging.reduce((sum, session) => sum + (session.cost || 0), 0),
    homeEnergy: sortedCharging.filter(s => s.type === 'home').reduce((sum, s) => sum + s.energy, 0),
    publicEnergy: sortedCharging.filter(s => s.type === 'public').reduce((sum, s) => sum + s.energy, 0),
    homeCost: sortedCharging.filter(s => s.type === 'home').reduce((sum, s) => sum + (s.cost || 0), 0),
    publicCost: sortedCharging.filter(s => s.type === 'public').reduce((sum, s) => sum + (s.cost || 0), 0),
  };

  const costPerKwh = stats.totalCost > 0 ? (stats.totalCost / stats.totalEnergy).toFixed(2) : 0;

  // Pagination
  const totalPages = Math.ceil(sortedCharging.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedCharging = sortedCharging.slice(startIdx, endIdx);

  const getTypeColor = (type) => {
    return type === 'home' 
      ? { bg: 'bg-green-900', text: 'text-green-200', label: '🏠 Home' }
      : { bg: 'bg-purple-900', text: 'text-purple-200', label: '⚡ Public' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Energy</p>
          <p className="text-2xl font-bold text-white">{stats.totalEnergy} kWh</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Cost</p>
          <p className="text-2xl font-bold text-white">£{stats.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Home Charging</p>
          <p className="text-lg font-bold text-green-400">£{stats.homeCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Public Charging</p>
          <p className="text-lg font-bold text-purple-400">£{stats.publicCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">⚡ Charging History</h2>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-300">Date</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300">Energy (kWh)</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300">Cost</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-300">Type</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-300">Cost/kWh</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCharging.map((session) => {
                const typeColor = getTypeColor(session.type);
                const costPerUnit = session.cost ? (session.cost / session.energy).toFixed(2) : '-';
                return (
                  <tr key={session.id} className={`border-b border-gray-700 hover:bg-gray-700`}>
                    <td className="py-3 px-2 text-sm text-gray-100">{formatDate(session.date)}</td>
                    <td className="py-3 px-2 text-sm font-semibold text-gray-100 text-right">{session.energy}</td>
                    <td className="py-3 px-2 text-sm text-gray-300 text-right">
                      {session.cost ? `£${session.cost.toFixed(2)}` : '-'}
                    </td>
                    <td className={`py-3 px-2 text-sm text-center font-medium ${typeColor.bg} ${typeColor.text}`}>
                      {typeColor.label}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300 text-right">£{costPerUnit}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onDeleteCharging(session.id)}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paginatedCharging.map((session) => {
            const typeColor = getTypeColor(session.type);
            const costPerUnit = session.cost ? (session.cost / session.energy).toFixed(2) : '-';
            return (
              <div key={session.id} className={`border border-gray-700 rounded-lg p-4 bg-gray-800`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-100">{formatDate(session.date)}</p>
                    <p className={`text-sm font-medium ${typeColor.text}`}>{typeColor.label}</p>
                  </div>
                  <button
                    onClick={() => onDeleteCharging(session.id)}
                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                  <div>
                    <p className="text-gray-400">Energy</p>
                    <p className="font-semibold text-gray-100">{session.energy} kWh</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Cost</p>
                    <p className="font-semibold text-gray-100">
                      {session.cost ? `£${session.cost.toFixed(2)}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Per kWh</p>
                    <p className="font-semibold text-gray-100">£{costPerUnit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm font-medium"
          >
            ← Previous
          </button>

          <div className="flex gap-1 flex-wrap justify-center max-w-full">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const showOnMobile = page === 1 ||
                                   page === totalPages ||
                                   Math.abs(page - currentPage) <= 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md font-medium transition text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!showOnMobile ? 'hidden sm:inline-block' : ''}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm font-medium"
          >
            Next →
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-3">
          Page {currentPage} of {totalPages} • {paginatedCharging.length} of {sortedCharging.length} sessions
        </p>
      </div>
    </div>
  );
}
