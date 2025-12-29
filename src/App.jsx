import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
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

  // Reset data when user logs out
  useEffect(() => {
    if (!currentUser) {
      setCars([]);
      setSelectedCarId(null);
      setReadings([]);
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  // Subscribe to cars collection
  useEffect(() => {
    const q = query(
      collection(db, 'cars'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const carsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
    if (!selectedCarId) {
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
        userId: currentUser.uid
      });
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
        const readingsQuery = query(collection(db, 'readings'), where('carId', '==', id));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 flex-1">
              🚗 Mileage Tracker
            </h1>
            <div className="flex-1 flex justify-end items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">{currentUser.displayName}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600">Track weekly mileage and stay within your annual limit</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <CarForm onAddCar={handleAddCar} />
            
            {cars.length > 0 && (
              <CarList 
                cars={cars} 
                selectedCarId={selectedCarId}
                onSelectCar={setSelectedCarId}
                onDeleteCar={handleDeleteCar}
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
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">Add your first car to get started!</p>
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
