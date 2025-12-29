import { useState } from 'react';

export default function TripForm({ onAddTrip }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startOdometer: '',
    endOdometer: '',
    purpose: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trip = {
      ...formData,
      startOdometer: parseFloat(formData.startOdometer),
      endOdometer: parseFloat(formData.endOdometer),
      distance: parseFloat(formData.endOdometer) - parseFloat(formData.startOdometer),
      timestamp: new Date().toISOString()
    };

    onAddTrip(trip);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startOdometer: '',
      endOdometer: '',
      purpose: '',
      notes: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Trip</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
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
            Purpose
          </label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            placeholder="Business, Personal, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Odometer
          </label>
          <input
            type="number"
            name="startOdometer"
            value={formData.startOdometer}
            onChange={handleChange}
            required
            step="0.1"
            placeholder="12345.6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Odometer
          </label>
          <input
            type="number"
            name="endOdometer"
            value={formData.endOdometer}
            onChange={handleChange}
            required
            step="0.1"
            placeholder="12400.8"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Optional trip details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Add Trip
      </button>
    </form>
  );
}
