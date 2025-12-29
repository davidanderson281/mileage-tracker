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
    
    const mileage = parseFloat(formData.mileage);
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-center text-gray-500">Please select a car first to record readings</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">📊 Record Weekly Reading</h2>
      <p className="text-sm text-gray-600 mb-4">{carName}</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sunday Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Mileage
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            step="0.1"
            placeholder="e.g., 45234.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Record Reading
      </button>
      <button
        type="button"
        onClick={() => setShowImportModal(true)}
        className="mt-4 ml-2 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
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
