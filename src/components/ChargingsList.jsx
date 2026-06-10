import { useState } from 'react';

const ITEMS_PER_PAGE = 10;

export default function ChargingsList({ charging, readings = [], car, onDeleteCharging, hideDashboardBanner = false, showDashboardBannerOnly = false }) {
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

  // Calculate statistics
  const stats = {
    totalEnergy: sortedCharging.reduce((sum, session) => sum + session.energy, 0),
    totalCost: sortedCharging.reduce((sum, session) => sum + (session.cost || 0), 0),
    homeEnergy: sortedCharging.filter(s => s.type === 'home').reduce((sum, s) => sum + s.energy, 0),
    publicEnergy: sortedCharging.filter(s => s.type === 'public').reduce((sum, s) => sum + s.energy, 0),
    homeCost: sortedCharging.filter(s => s.type === 'home').reduce((sum, s) => sum + (s.cost || 0), 0),
    publicCost: sortedCharging.filter(s => s.type === 'public').reduce((sum, s) => sum + (s.cost || 0), 0),
  };

  // Pagination
  const totalPages = Math.ceil(sortedCharging.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedCharging = sortedCharging.slice(startIdx, endIdx);

  // Helper to determine the current calendar week range (Mon-Sun)
  const getCurrentWeekRange = () => {
    const now = new Date();
    
    // Monday of current week
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Sunday of current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getCurrentWeekRange();

  // Weekly spent calculations
  const thisWeeksSessions = sortedCharging.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  });

  const spentThisWeek = thisWeeksSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
  const homeSpentThisWeek = thisWeeksSessions.filter(s => s.type === 'home').reduce((sum, s) => sum + (s.cost || 0), 0);
  const publicSpentThisWeek = thisWeeksSessions.filter(s => s.type === 'public').reduce((sum, s) => sum + (s.cost || 0), 0);
  const homeEnergyThisWeek = thisWeeksSessions.filter(s => s.type === 'home').reduce((sum, s) => sum + s.energy, 0);
  const publicEnergyThisWeek = thisWeeksSessions.filter(s => s.type === 'public').reduce((sum, s) => sum + s.energy, 0);

  // Formatting date range
  const formatDateShort = (d) => {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  const weekRangeStr = `${formatDateShort(startOfWeek)} - ${formatDateShort(endOfWeek)}`;

  // Lifetime metrics
  const deliveryMileage = car?.deliveryMileage ?? 0;
  const latestReading = readings && readings.length > 0 ? readings[0] : null;
  const totalMiles = latestReading ? Math.max(0, latestReading.mileage - deliveryMileage) : 0;
  const totalSpent = stats.totalCost;
  const costPerMile = totalMiles > 0 ? (totalSpent / totalMiles) : 0;
  const costPerMilePence = (costPerMile * 100).toFixed(1);
  const petrolCost = (totalMiles / 40) * 4.54609 * 1.55;

  const getTypeColor = (type) => {
    if (type === 'home') {
      return { bg: 'bg-green-900/40 text-green-200 border-green-700/50', label: '🏠 Home' };
    } else if (type === 'public') {
      return { bg: 'bg-purple-900/40 text-purple-200 border-purple-700/50', label: '⚡ Public' };
    } else {
      return { bg: 'bg-yellow-900/40 text-yellow-200 border-yellow-700/50', label: '🎁 Free' };
    }
  };

  const renderDashboardBanner = () => (
    <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-indigo-950/40 border border-blue-500/20 rounded-xl p-6 shadow-xl backdrop-blur-md">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📊 Charging & Mileage Dashboard
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* This Week's summary */}
        <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/60 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-1">Weekly Spend Summary</p>
            <p className="text-xxs text-gray-400 mb-4 uppercase tracking-wider font-semibold">Calendar week: {weekRangeStr}</p>
            <p className="text-lg text-white font-medium mb-4">
              You've spent <span className="text-green-400 font-bold">£{spentThisWeek.toFixed(2)}</span> on charging this week.
            </p>
          </div>
          <div className="text-xs text-gray-300 space-y-2 border-t border-gray-700/40 pt-3">
            <div className="flex justify-between">
              <span>🏠 Home Charging:</span>
              <span className="font-semibold text-green-300">£{homeSpentThisWeek.toFixed(2)} <span className="text-gray-400 font-normal">({homeEnergyThisWeek} kWh)</span></span>
            </div>
            <div className="flex justify-between">
              <span>⚡ Public Charging:</span>
              <span className="font-semibold text-purple-300">£{publicSpentThisWeek.toFixed(2)} <span className="text-gray-400 font-normal">({publicEnergyThisWeek} kWh)</span></span>
            </div>
          </div>
        </div>

        {/* Lifetime Summary */}
        <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/60 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-400 mb-1">Lifetime Summary</p>
            <p className="text-xxs text-gray-400 mb-4 uppercase tracking-wider font-semibold">Since getting the car</p>
            <p className="text-lg text-white font-medium mb-2">
              You've driven <span className="text-blue-400 font-bold">{totalMiles.toLocaleString()}</span> miles so far and spent <span className="text-green-400 font-bold">£{totalSpent.toFixed(2)}</span> on charging.
            </p>
            {totalMiles > 0 && (
              <p className="text-xs text-gray-300 mb-4">
                ⛽ Petrol equivalent cost: <span className="text-gray-100 font-semibold">£{petrolCost.toFixed(2)}</span>
                {petrolCost > totalSpent && (
                  <> (saving <span className="text-green-400 font-semibold">£{(petrolCost - totalSpent).toFixed(2)}</span>!)</>
                )}
              </p>
            )}
          </div>
          <div className="text-xs text-gray-300 space-y-2 border-t border-gray-700/40 pt-3 flex justify-between items-center">
            <span>Average efficiency cost:</span>
            {totalMiles > 0 ? (
              <span className="text-sm font-bold text-yellow-400 bg-yellow-950/40 px-2.5 py-1 border border-yellow-500/20 rounded-md">
                {costPerMilePence}p / mile
              </span>
            ) : (
              <span className="text-gray-500 italic">No mileage readings yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (showDashboardBannerOnly) {
    return renderDashboardBanner();
  }

  return (
    <div className="space-y-6">
      {!hideDashboardBanner && renderDashboardBanner()}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Energy</p>
          <p className="text-2xl font-bold text-white">{stats.totalEnergy.toFixed(1)} kWh</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Cost</p>
          <p className="text-2xl font-bold text-white">£{stats.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Home Charging</p>
          <p className="text-sm font-semibold text-green-400">£{stats.homeCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.homeEnergy.toFixed(1)} kWh</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Public Charging</p>
          <p className="text-sm font-semibold text-purple-400">£{stats.publicCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.publicEnergy.toFixed(1)} kWh</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">⚡ Charging History</h2>

        {sortedCharging.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No charging sessions recorded yet. Add your first session above!</p>
          </div>
        ) : (
          <>
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
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-300">Notes</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCharging.map((session) => {
                    const typeColor = getTypeColor(session.type);
                    const costPerUnit = session.cost ? (session.cost / session.energy).toFixed(2) : '-';
                    return (
                      <tr key={session.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-2 text-sm text-gray-100">{formatDate(session.date)}</td>
                        <td className="py-3 px-2 text-sm font-semibold text-gray-100 text-right">{session.energy.toFixed(1)}</td>
                        <td className="py-3 px-2 text-sm text-gray-300 text-right">
                          {session.cost ? `£${session.cost.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-2 text-sm text-center">
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${typeColor.bg}`}>
                            {typeColor.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-300 text-right">
                          {session.costPerKwh !== undefined ? `£${parseFloat(session.costPerKwh).toFixed(2)}` : (session.cost ? `£${costPerUnit}` : '-')}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-400">{session.notes || '-'}</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => onDeleteCharging(session.id)}
                            className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
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
                  <div key={session.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/80">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-100">{formatDate(session.date)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-xs font-medium ${typeColor.bg}`}>
                          {typeColor.label}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteCharging(session.id)}
                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-3 border-t border-gray-700/50 pt-2">
                      <div>
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-semibold">Energy</p>
                        <p className="font-semibold text-gray-100">{session.energy.toFixed(1)} kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-semibold">Cost</p>
                        <p className="font-semibold text-gray-100">
                          {session.cost ? `£${session.cost.toFixed(2)}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-semibold">Per kWh</p>
                        <p className="font-semibold text-gray-100">
                          {session.costPerKwh !== undefined ? `£${parseFloat(session.costPerKwh).toFixed(2)}` : (session.cost ? `£${costPerUnit}` : '-')}
                        </p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-3 text-sm border-t border-gray-700/50 pt-2">
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-semibold">Notes</p>
                        <p className="text-gray-300">{session.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm font-medium transition-colors"
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
                  className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Next →
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-400 mt-3">
              Page {currentPage} of {totalPages} • {paginatedCharging.length} of {sortedCharging.length} sessions
            </p>
          </>
        )}
      </div>
    </div>
  );
}

