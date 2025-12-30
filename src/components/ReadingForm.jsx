import { useState } from 'react';
import ImportReadingsModal from './ImportReadingsModal';

export default function ReadingForm({ carId, carName, onAddReading }) {
  const [showImportModal, setShowImportModal] = useState(false);
  const today = new Date();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - today.getDay());
  
  const [formData, setFormData] = useState({
    date: lastSunday.toISOString().split('T')[0],
    mileage: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const mileage = parseInt(formData.mileage, 10);
    if (isNaN(mileage) || mileage < 0) {
      setError('Please enter a valid mileage value');
      return;
    }

    const reading = {
      carId,
      date: formData.date,
      mileage,
      timestamp: new Date().toISOString()
    };

    onAddReading(reading);
    
    // Reset form to next Sunday
    const nextSunday = new Date(lastSunday);
    nextSunday.setDate(lastSunday.getDate() + 7);
    
    setFormData({
      date: nextSunday.toISOString().split('T')[0],
      mileage: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!carId) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <p className="text-center text-gray-400">Please select a car first to record readings</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-1">📊 Record Weekly Reading</h2>
      <p className="text-sm text-gray-400 mb-4">{carName}</p>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Sunday Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Current Mileage
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            step="1"
            placeholder="e.g., 45234"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors focus:ring-offset-gray-800"
      >
        Record Reading
      </button>
      <button
        type="button"
        onClick={() => setShowImportModal(true)}
        className="mt-4 ml-2 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors focus:ring-offset-gray-800"
      >
        📥 Import Historical Data
      </button>

      {showImportModal && (
        <ImportReadingsModal
          carId={carId}
          carName={carName}
          onClose={() => setShowImportModal(false)}
          onSuccess={onAddReading}
        />
      )}
    </form>
  );
}
