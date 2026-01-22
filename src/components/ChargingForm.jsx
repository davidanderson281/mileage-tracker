import { useState } from 'react';

export default function ChargingForm({ carId, carName, existingCharging, onAddCharging }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: today,
    energy: '',
    cost: '',
    type: 'home'
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const energy = parseInt(formData.energy, 10);
    if (isNaN(energy) || energy <= 0) {
      setError('Please enter a valid energy amount (must be greater than 0)');
      return;
    }

    const cost = formData.cost ? parseFloat(formData.cost) : null;
    if (formData.cost && (isNaN(cost) || cost < 0)) {
      setError('Please enter a valid cost');
      return;
    }

    // Check for duplicate date
    const duplicateDate = existingCharging.find(
      charging => charging.date === formData.date && charging.type === formData.type
    );
    if (duplicateDate) {
      setError(`A ${formData.type} charging session already exists for ${formData.date}. Please delete the existing entry first or choose a different date.`);
      return;
    }

    const charging = {
      carId,
      date: formData.date,
      energy,
      cost: cost,
      type: formData.type,
      timestamp: new Date().toISOString()
    };

    onAddCharging(charging);

    setFormData({
      date: today,
      energy: '',
      cost: '',
      type: 'home'
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
        <p className="text-center text-gray-400">Please select a car first to record charging</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-1">⚡ Record Charging Session</h2>
      <p className="text-sm text-gray-400 mb-4">{carName}</p>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Date
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
            Energy (kWh)
          </label>
          <input
            type="number"
            name="energy"
            value={formData.energy}
            onChange={handleChange}
            required
            step="1"
            min="1"
            placeholder="e.g., 45"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Charging Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="home">Home</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Cost ($) - Optional
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 12.50"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors focus:ring-offset-gray-800"
      >
        Record Charging
      </button>
    </form>
  );
}
