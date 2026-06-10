import { useState } from 'react';

export default function ChargingForm({ carId, carName, existingCharging, onAddCharging }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: today,
    homeEnergy: '',
    homeCostPerKwh: '',
    publicEnergy: '',
    publicCostPerKwh: '',
    notes: ''
  });

  const [error, setError] = useState('');

  // Calculations for live preview
  const homeEnergyVal = parseFloat(formData.homeEnergy) || 0;
  const homeRateVal = parseFloat(formData.homeCostPerKwh) || 0;
  const calculatedHomeCost = Math.round(homeEnergyVal * homeRateVal * 100) / 100;

  const publicEnergyVal = parseFloat(formData.publicEnergy) || 0;
  const publicRateVal = parseFloat(formData.publicCostPerKwh) || 0;
  const calculatedPublicCost = Math.round(publicEnergyVal * publicRateVal * 100) / 100;

  const calculatedTotalCost = Math.round((calculatedHomeCost + calculatedPublicCost) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const homeEnergy = parseFloat(formData.homeEnergy) || 0;
    const publicEnergy = parseFloat(formData.publicEnergy) || 0;

    if (homeEnergy <= 0 && publicEnergy <= 0) {
      setError('Please enter a valid energy amount (kWh) for either Home or Public charging');
      return;
    }

    const homeCostPerKwh = formData.homeCostPerKwh ? parseFloat(formData.homeCostPerKwh) : 0;
    const publicCostPerKwh = formData.publicCostPerKwh ? parseFloat(formData.publicCostPerKwh) : 0;

    if (formData.homeCostPerKwh && (isNaN(homeCostPerKwh) || homeCostPerKwh < 0)) {
      setError('Please enter a valid Home cost per kWh');
      return;
    }

    if (formData.publicCostPerKwh && (isNaN(publicCostPerKwh) || publicCostPerKwh < 0)) {
      setError('Please enter a valid Public cost per kWh');
      return;
    }

    // Check for duplicate date
    if (homeEnergy > 0) {
      const duplicateHome = existingCharging.find(
        charging => charging.date === formData.date && charging.type === 'home'
      );
      if (duplicateHome) {
        setError(`A home charging session already exists for ${formData.date}. Please delete the existing entry first or choose a different date.`);
        return;
      }
    }

    if (publicEnergy > 0) {
      const duplicatePublic = existingCharging.find(
        charging => charging.date === formData.date && charging.type === 'public'
      );
      if (duplicatePublic) {
        setError(`A public charging session already exists for ${formData.date}. Please delete the existing entry first or choose a different date.`);
        return;
      }
    }

    const timestamp = new Date().toISOString();

    // Call onAddCharging for Home if details are provided
    if (homeEnergy > 0) {
      const homeCharging = {
        carId,
        date: formData.date,
        energy: homeEnergy,
        cost: calculatedHomeCost,
        costPerKwh: homeCostPerKwh,
        type: 'home',
        notes: formData.notes || null,
        timestamp
      };
      onAddCharging(homeCharging);
    }

    // Call onAddCharging for Public if details are provided
    if (publicEnergy > 0) {
      const publicCharging = {
        carId,
        date: formData.date,
        energy: publicEnergy,
        cost: calculatedPublicCost,
        costPerKwh: publicCostPerKwh,
        type: 'public',
        notes: formData.notes || null,
        timestamp
      };
      onAddCharging(publicCharging);
    }

    // Reset Form
    setFormData({
      date: today,
      homeEnergy: '',
      homeCostPerKwh: '',
      publicEnergy: '',
      publicCostPerKwh: '',
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

  const setPresetRate = (field, rate) => {
    setFormData(prev => ({
      ...prev,
      [field]: rate.toString()
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
      <h2 className="text-2xl font-bold text-white mb-1">⚡ Record Weekly Charging</h2>
      <p className="text-sm text-gray-400 mb-6">{carName}</p>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded mb-6">
          {error}
        </div>
      )}

      {/* Date Selection */}
      <div className="mb-6 max-w-xs">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Date / Week Ending
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Charging Section */}
        <div className="p-4 bg-gray-750/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            🏠 Home Charging
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Energy Added (kWh)
              </label>
              <input
                type="number"
                name="homeEnergy"
                value={formData.homeEnergy}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="e.g., 40.5"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Cost per kWh (£)
              </label>
              <input
                type="number"
                name="homeCostPerKwh"
                value={formData.homeCostPerKwh}
                onChange={handleChange}
                step="0.001"
                min="0"
                placeholder="e.g., 0.07"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xxs text-gray-500 uppercase tracking-wider font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => setPresetRate('homeCostPerKwh', 0.069)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-300 font-medium py-1 px-2.5 rounded-full transition-colors"
                >
                  6.9p (Intelligent Octopus Go - Oct 2026)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Public Charging Section */}
        <div className="p-4 bg-gray-750/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
            ⚡ Public Charging
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Energy Added (kWh)
              </label>
              <input
                type="number"
                name="publicEnergy"
                value={formData.publicEnergy}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="e.g., 25.0"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Cost per kWh (£)
              </label>
              <input
                type="number"
                name="publicCostPerKwh"
                value={formData.publicCostPerKwh}
                onChange={handleChange}
                step="0.001"
                min="0"
                placeholder="e.g., 0.50"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xxs text-gray-500 uppercase tracking-wider font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => setPresetRate('publicCostPerKwh', 0.50)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-300 font-medium py-1 px-2.5 rounded-full transition-colors"
                >
                  50p (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetRate('publicCostPerKwh', 0.75)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-300 font-medium py-1 px-2.5 rounded-full transition-colors"
                >
                  75p (Rapid)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetRate('publicCostPerKwh', 0.00)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-300 font-medium py-1 px-2.5 rounded-full transition-colors"
                >
                  Free (0p)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Notes */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Notes (Optional)
        </label>
        <input
          type="text"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="e.g., Weekly commute charging, holiday trip"
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Live Preview Summary */}
      <div className="mt-6 p-4 bg-gray-850 border border-gray-700 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="font-semibold text-white">Estimated Cost Summary</h4>
          <p className="text-xs text-gray-400">Calculated automatically as you type</p>
        </div>
        <div className="flex flex-wrap gap-4 text-center">
          <div className="px-3 py-1 bg-gray-700/50 rounded border border-gray-700">
            <p className="text-xxs text-gray-400 uppercase tracking-wider font-semibold">Home Cost</p>
            <p className="text-sm font-semibold text-green-400">£{calculatedHomeCost.toFixed(2)}</p>
          </div>
          <div className="px-3 py-1 bg-gray-700/50 rounded border border-gray-700">
            <p className="text-xxs text-gray-400 uppercase tracking-wider font-semibold">Public Cost</p>
            <p className="text-sm font-semibold text-purple-400">£{calculatedPublicCost.toFixed(2)}</p>
          </div>
          <div className="px-3 py-1 bg-blue-900/20 rounded border border-blue-500/30">
            <p className="text-xxs text-blue-300 uppercase tracking-wider font-semibold">Total Cost</p>
            <p className="text-sm font-bold text-white">£{calculatedTotalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors focus:ring-offset-gray-800"
      >
        Record Weekly Charging
      </button>
    </form>
  );
}

