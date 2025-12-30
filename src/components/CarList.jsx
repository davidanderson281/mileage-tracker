export default function CarList({ cars, onSelectCar, selectedCarId, onDeleteCar, onSetDefault }) {
  if (cars.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Your Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.id}
            onClick={() => onSelectCar(car.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCarId === car.id
                ? 'border-blue-500 bg-gray-700'
                : 'border-gray-600 bg-gray-750 hover:border-gray-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                  {car.isDefault && (
                    <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">Default</span>
                  )}
                </div>
                {car.registrationNumber && (
                  <p className="text-sm text-gray-400">{car.registrationNumber}</p>
                )}
                <p className="text-sm font-medium text-blue-400 mt-2">
                  Annual Limit: {car.annualLimit} miles
                </p>
                <p className="text-sm text-gray-400">
                  Delivery mileage: {car.deliveryMileage ?? 0} miles
                </p>
                <p className="text-sm text-gray-400">
                  Contract: {car.contractMonths ? `${car.contractMonths} mo` : 'n/a'}
                </p>
                <p className="text-sm text-gray-400">
                  Ends: {car.contractEndDate ? car.contractEndDate : 'n/a'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(car.id);
                  }}
                  className={`text-xs font-medium px-2 py-1 rounded transition ${
                    car.isDefault
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {car.isDefault ? 'Default' : 'Set Default'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCar(car.id);
                  }}
                  className="text-red-500 hover:text-red-400 text-xs font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
