export default function TripList({ trips, onDeleteTrip }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No trips recorded yet. Add your first trip above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trip History</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Distance</p>
          <p className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(1)} mi</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Purpose</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Start</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">End</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Distance</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Notes</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm text-gray-900">{formatDate(trip.date)}</td>
                <td className="py-3 px-2 text-sm text-gray-900">{trip.purpose}</td>
                <td className="py-3 px-2 text-sm text-gray-600 text-right">{trip.startOdometer.toFixed(1)}</td>
                <td className="py-3 px-2 text-sm text-gray-600 text-right">{trip.endOdometer.toFixed(1)}</td>
                <td className="py-3 px-2 text-sm font-semibold text-blue-600 text-right">
                  {trip.distance.toFixed(1)} mi
                </td>
                <td className="py-3 px-2 text-sm text-gray-600 max-w-xs truncate">{trip.notes}</td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-friendly card view */}
      <div className="md:hidden mt-4 space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{trip.purpose}</p>
                <p className="text-sm text-gray-600">{formatDate(trip.date)}</p>
              </div>
              <button
                onClick={() => onDeleteTrip(trip.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm mt-3">
              <div>
                <p className="text-gray-600">Start</p>
                <p className="font-semibold">{trip.startOdometer.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-600">End</p>
                <p className="font-semibold">{trip.endOdometer.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-gray-600">Distance</p>
                <p className="font-semibold text-blue-600">{trip.distance.toFixed(1)} mi</p>
              </div>
            </div>
            {trip.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">{trip.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
