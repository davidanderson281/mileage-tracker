export default function ReadingsList({ readings, car, onDeleteReading }) {
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
      const yearStart = new Date(readingDate.getFullYear(), 0, 1);
      const daysIntoYear = Math.floor((readingDate - yearStart) / (1000 * 60 * 60 * 24));
      const expectedMileage = (car.annualLimit / 365) * daysIntoYear;
      expectedDiff = reading.mileage - expectedMileage;
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Weekly Readings</h2>

      <div className="overflow-x-auto">
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
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Difference</th>
                </>
              )}
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Notes</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {readingsWithDiff.map((reading) => {
              const status = getWeeklyStatus(reading.weeklyDiff);
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
                      <td className={`py-3 px-2 text-sm font-semibold text-right ${
                        reading.expectedDiff !== null && reading.expectedDiff < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {reading.expectedDiff !== null ? (reading.expectedDiff > 0 ? '+' : '') + reading.expectedDiff.toFixed(0) : '-'}
                      </td>
                    </>
                  )}
                  <td className="py-3 px-2 text-sm text-gray-600 max-w-xs truncate">{reading.notes || '-'}</td>
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

      {/* Mobile-friendly card view */}
      <div className="md:hidden mt-4 space-y-3">
        {readingsWithDiff.map((reading) => {
          const status = getWeeklyStatus(reading.weeklyDiff);
          return (
            <div key={reading.id} className={`border border-gray-200 rounded-lg p-4 ${status.bg}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{formatDate(reading.date)}</p>
                  <p className="text-sm text-gray-600">{reading.notes || 'No notes'}</p>
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
                <div className="mt-2 text-sm text-gray-600">
                  <p>Expected: {(reading.mileage - reading.expectedDiff).toFixed(0)} | Diff: {reading.expectedDiff > 0 ? '+' : ''}{reading.expectedDiff.toFixed(0)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
