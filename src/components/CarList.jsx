export default function CarList({ cars, onSelectCar, selectedCarId, onDeleteCar }) {
  if (cars.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.id}
            onClick={() => onSelectCar(car.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCarId === car.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{car.name}</h3>
                {car.registrationNumber && (
                  <p className="text-sm text-gray-600">{car.registrationNumber}</p>
                )}
                <p className="text-sm font-medium text-blue-600 mt-2">
                  Annual Limit: {car.annualLimit} miles
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCar(car.id);
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
