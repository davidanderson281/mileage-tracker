import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import TripForm from './components/TripForm';
import TripList from './components/TripList';

function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to trips collection
    const q = query(collection(db, 'trips'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please check your Firebase configuration.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddTrip = async (trip) => {
    try {
      await addDoc(collection(db, 'trips'), trip);
    } catch (err) {
      console.error('Error adding trip:', err);
      alert('Failed to add trip. Please check your Firebase configuration.');
    }
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteDoc(doc(db, 'trips', id));
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('Failed to delete trip.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🚗 Mileage Tracker
          </h1>
          <p className="text-gray-600">Track your car trips and mileage</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <TripForm onAddTrip={handleAddTrip} />

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Loading trips...</p>
          </div>
        ) : (
          <TripList trips={trips} onDeleteTrip={handleDeleteTrip} />
        )}
      </div>
    </div>
  );
}

export default App;
