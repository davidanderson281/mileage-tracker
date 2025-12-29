import { useState } from 'react';
import { importReadings } from '../utils/importReadings';
import { useAuth } from '../contexts/AuthContext';

export default function ImportReadingsModal({ carId, carName, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [rawData, setRawData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    if (!rawData.trim()) {
      setError('Please paste your data');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importReadings(carId, rawData, currentUser.uid);
      setResult(res);
      if (res.errorCount === 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Import Historical Readings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Car: <span className="font-semibold">{carName}</span></p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your data (Date TAB Mileage format)
          </label>
          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="09/06/2024	2175&#10;16/06/2024	2238&#10;..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className={`border px-4 py-3 rounded mb-4 ${
            result.errorCount === 0
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-yellow-100 border-yellow-400 text-yellow-700'
          }`}>
            <p className="font-semibold">Import Complete!</p>
            <p>✅ Successfully added: {result.successCount}</p>
            {result.errorCount > 0 && (
              <p>❌ Failed: {result.errorCount}</p>
            )}
            <p>📊 Total: {result.total}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading || !rawData.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
