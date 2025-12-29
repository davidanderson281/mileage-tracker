import { useState } from 'react';

export default function CarForm({ onAddCar }) {
  const [formData, setFormData] = useState({
    name: '',
    annualLimit: '',
    deliveryMileage: '',
    contractEndDate: '',
    contractMonths: '',
    registrationNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const car = {
      name: formData.name,
      annualLimit: parseFloat(formData.annualLimit),
      deliveryMileage: parseFloat(formData.deliveryMileage || 0),
      contractEndDate: formData.contractEndDate,
      contractMonths: parseInt(formData.contractMonths || 0, 10),
      registrationNumber: formData.registrationNumber,
      createdAt: new Date().toISOString()
    };

    onAddCar(car);
    
    setFormData({
      name: '',
      annualLimit: '',
      deliveryMileage: '',
      contractEndDate: '',
      contractMonths: '',
      registrationNumber: ''
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🚗 Add New Car</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Car Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Work Car, Family Car"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Mileage Limit
          </label>
          <input
            type="number"
            name="annualLimit"
            value={formData.annualLimit}
            onChange={handleChange}
            required
            step="1"
            placeholder="e.g., 5000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Mileage
          </label>
          <input
            type="number"
            name="deliveryMileage"
            value={formData.deliveryMileage}
            onChange={handleChange}
            required
            step="1"
            placeholder="e.g., 120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Length (months)
          </label>
          <input
            type="number"
            name="contractMonths"
            value={formData.contractMonths}
            onChange={handleChange}
            required
            step="1"
            placeholder="e.g., 36"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract End Date
          </label>
          <input
            type="date"
            name="contractEndDate"
            value={formData.contractEndDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number (Optional)
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="e.g., ABC123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        Add Car
      </button>
    </form>
  );
}
