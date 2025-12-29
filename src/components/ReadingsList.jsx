import { useState } from 'react';
import MileageChart from './MileageChart';

const ITEMS_PER_PAGE = 10;

export default function ReadingsList({ readings, car, onDeleteReading }) {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort readings by date (newest first)
  const sortedReadings = [...readings].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate weekly differences and annual tracking
  const readingsWithDiff = sortedReadings.map((reading, index) => {
    let weeklyDiff = null;
    let expectedDiff = null;

    // Weekly difference (from previous week)
    if (index < sortedReadings.length - 1) {
      weeklyDiff = reading.mileage - sortedReadings[index + 1].mileage;
    }

    // Expected vs Actual (based on annual limit)
    if (car?.annualLimit) {
      const readingDate = new Date(reading.date);
      const delivery = car.deliveryMileage ?? 0;
      const msPerDay = 1000 * 60 * 60 * 24;

      const hasContract = car.contractEndDate && car.contractMonths > 0;

      if (hasContract) {
        const endDate = new Date(car.contractEndDate);
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - car.contractMonths);

        const totalDays = Math.max((endDate - startDate) / msPerDay, 1);
        const elapsedDays = Math.min(Math.max((readingDate - startDate) / msPerDay, 0), totalDays);

        const totalContractMiles = car.annualLimit * (car.contractMonths / 12);
        const expectedMileage = delivery + (totalContractMiles * (elapsedDays / totalDays));
        expectedDiff = reading.mileage - expectedMileage;
      } else {
        const yearStart = new Date(readingDate.getFullYear(), 0, 1);
        const daysIntoYear = Math.floor((readingDate - yearStart) / msPerDay);
        const expectedMileage = delivery + (car.annualLimit / 365) * daysIntoYear;
        expectedDiff = reading.mileage - expectedMileage;
      }
    }

    return { ...reading, weeklyDiff, expectedDiff };
  });

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No readings recorded yet. Add your first reading above!</p>
      </div>
    );
  }

  const getWeeklyStatus = (weeklyDiff) => {
    if (!weeklyDiff) return { bg: 'bg-gray-50', text: 'text-gray-600', label: '-' };
    return weeklyDiff > 96 
      ? { bg: 'bg-red-50', text: 'text-red-700', label: '⚠️ Over limit' }
      : { bg: 'bg-green-50', text: 'text-green-700', label: '✅ Good' };
  };

  const getOnTrackStatus = (expectedDiff) => {
    if (expectedDiff === null) return { text: 'text-gray-600', label: '-' };
    // Negative means under expected (good), positive means over expected (bad)
    const absDiff = Math.abs(expectedDiff).toFixed(0);
    return expectedDiff <= 0
      ? { text: 'text-green-700', label: `✅ On Track (${absDiff} mi)` }
      : { text: 'text-red-700', label: `⚠️ Over (${absDiff} mi)` };
  };

  // Pagination
  const totalPages = Math.ceil(readingsWithDiff.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedReadings = readingsWithDiff.slice(startIdx, endIdx);

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Weekly Readings</h2>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Mileage</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Weekly Diff</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                {car?.annualLimit && (
                  <>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Expected</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">On Track</th>
                  </>
                )}
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedReadings.map((reading) => {
                const status = getWeeklyStatus(reading.weeklyDiff);
                const onTrackStatus = getOnTrackStatus(reading.expectedDiff);
                return (
                  <tr key={reading.id} className={`border-b border-gray-100 ${status.bg}`}>
                    <td className="py-3 px-2 text-sm text-gray-900">{formatDate(reading.date)}</td>
                    <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">{reading.mileage.toFixed(1)}</td>
                    <td className={`py-3 px-2 text-sm font-semibold text-right ${status.text}`}>
                      {reading.weeklyDiff ? reading.weeklyDiff.toFixed(1) : '-'}
                    </td>
                    <td className={`py-3 px-2 text-sm text-center font-medium ${status.text}`}>
                      {status.label}
                    </td>
                    {car?.annualLimit && (
                      <>
                        <td className="py-3 px-2 text-sm text-gray-600 text-right">
                          {reading.expectedDiff !== null ? (reading.mileage - reading.expectedDiff).toFixed(0) : '-'}
                        </td>
                        <td className={`py-3 px-2 text-sm text-center font-medium ${onTrackStatus.text}`}>
                          {onTrackStatus.label}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onDeleteReading(reading.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
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
          {paginatedReadings.map((reading) => {
            const status = getWeeklyStatus(reading.weeklyDiff);
            const onTrackStatus = getOnTrackStatus(reading.expectedDiff);
            return (
              <div key={reading.id} className={`border border-gray-200 rounded-lg p-4 ${status.bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{formatDate(reading.date)}</p>
                  </div>
                  <button
                    onClick={() => onDeleteReading(reading.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">Mileage</p>
                    <p className="font-semibold text-gray-900">{reading.mileage.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Weekly Diff</p>
                    <p className={`font-semibold ${status.text}`}>
                      {reading.weeklyDiff ? reading.weeklyDiff.toFixed(1) : '-'}
                    </p>
                  </div>
                </div>
                <div className={`mt-2 text-sm font-medium text-center py-1 rounded ${status.text}`}>
                  {status.label}
                </div>
                {car?.annualLimit && reading.expectedDiff !== null && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">Expected: {(reading.mileage - reading.expectedDiff).toFixed(0)}</p>
                    <p className={`font-medium ${onTrackStatus.text}`}>{onTrackStatus.label}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 text-sm font-medium"
          >
            ← Previous
          </button>
          
          <div className="flex gap-1 flex-wrap justify-center max-w-full">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // On mobile, show only current page, first, last, and adjacent pages
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
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 text-sm font-medium"
          >
            Next →
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-3">
          Page {currentPage} of {totalPages} • {paginatedReadings.length} of {readingsWithDiff.length} readings
        </p>
      </div>

      {/* Chart */}
      <MileageChart readings={readingsWithDiff} car={car} />
    </div>
  );
}
