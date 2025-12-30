import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import CarForm from './components/CarForm';
import CarList from './components/CarList';
import ReadingForm from './components/ReadingForm';
import ReadingsList from './components/ReadingsList';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  // Subscribe to cars collection
  useEffect(() => {
    if (!currentUser) {
      setCars([]);
      setSelectedCarId(null);
      setReadings([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'cars'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const carsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort: default car first, then by createdAt desc
        carsData.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        setCars(carsData);
        if (carsData.length > 0 && !selectedCarId) {
          setSelectedCarId(carsData[0].id);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars. Please check your Firebase configuration.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to readings for selected car
  useEffect(() => {
    if (!currentUser || !selectedCarId) {
      setReadings([]);
      return;
    }

    const q = query(
      collection(db, 'readings'),
      where('carId', '==', selectedCarId),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const readingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort client-side by date desc to avoid Firestore composite index requirement
        readingsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setReadings(readingsData);
      },
      (err) => {
        console.error('Error fetching readings:', err);
        setReadings([]);
      }
    );

    return () => unsubscribe();
  }, [selectedCarId, currentUser]);

  const handleAddCar = async (car) => {
    try {
      await addDoc(collection(db, 'cars'), {
        ...car,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        isDefault: cars.length === 0 // Set as default if first car
      });
      setShowAddCarModal(false);
    } catch (err) {
      console.error('Error adding car:', err);
      alert('Failed to add car. Please check your Firebase configuration.');
    }
  };

  const handleAddReading = async (reading) => {
    try {
      await addDoc(collection(db, 'readings'), {
        ...reading,
        userId: currentUser.uid
      });
    } catch (err) {
      console.error('Error adding reading:', err);
      alert('Failed to add reading.');
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm('Are you sure? This will delete the car and all its readings.')) {
      try {
        // Delete all readings for this car
        const readingsQuery = query(
          collection(db, 'readings'), 
          where('carId', '==', id),
          where('userId', '==', currentUser.uid)
        );
        const readingsSnapshot = await getDocs(readingsQuery);
        for (const readingDoc of readingsSnapshot.docs) {
          await deleteDoc(readingDoc.ref);
        }
        // Delete the car
        await deleteDoc(doc(db, 'cars', id));
        if (selectedCarId === id) {
          setSelectedCarId(null);
        }
      } catch (err) {
        console.error('Error deleting car:', err);
        alert('Failed to delete car.');
      }
    }
  };

  const handleSetDefaultCar = async (carId) => {
    try {
      // Unset current default
      const currentDefault = cars.find(car => car.isDefault);
      if (currentDefault) {
        await updateDoc(doc(db, 'cars', currentDefault.id), { isDefault: false });
      }
      // Set new default
      await updateDoc(doc(db, 'cars', carId), { isDefault: true });
    } catch (err) {
      console.error('Error setting default car:', err);
      alert('Failed to set default car.');
    }
  };

  const handleDeleteReading = async (id) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      try {
        await deleteDoc(doc(db, 'readings', id));
      } catch (err) {
        console.error('Error deleting reading:', err);
        alert('Failed to delete reading.');
      }
    }
  };

  const selectedCar = cars.find(car => car.id === selectedCarId);

  // Show login screen if not authenticated
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex-1">
              🚗 Mileage Tracker
            </h1>
            <div className="flex-1 flex justify-end items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-300">{currentUser.displayName}</p>
                <p className="text-xs text-gray-400">{currentUser.email}</p>
              </div>
              <button
                onClick={() => setShowAddCarModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                + Add Car
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-400">Track weekly mileage and stay within your annual limit</p>
        </header>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {cars.length > 0 && (
              <CarList 
                cars={cars} 
                selectedCarId={selectedCarId}
                onSelectCar={setSelectedCarId}
                onDeleteCar={handleDeleteCar}
                onSetDefault={handleSetDefaultCar}
              />
            )}

            {selectedCar && (
              <>
                <ReadingForm 
                  carId={selectedCarId}
                  carName={selectedCar.name}
                  onAddReading={handleAddReading}
                />
                <ReadingsList 
                  readings={readings} 
                  car={selectedCar}
                  onDeleteReading={handleDeleteReading}
                />
              </>
            )}

            {cars.length === 0 && (
              <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
                <p className="text-gray-400 text-lg">Click "Add Car" to get started!</p>
              </div>
            )}

            {/* Add Car Modal */}
            {showAddCarModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 my-8">
                  <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">Add New Car</h2>
                    <button
                      onClick={() => setShowAddCarModal(false)}
                      className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6">
                    <CarForm onAddCar={handleAddCar} isDarkMode={true} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
