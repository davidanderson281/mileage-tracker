import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Parse date string in DD/MM/YYYY format to ISO string
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

// Bulk import readings
export async function importReadings(carId, rawData, userId) {
  const lines = rawData.trim().split('\n');
  const readings = [];

  for (const line of lines) {
    const [dateStr, mileageStr] = line.split('\t');
    if (!dateStr || !mileageStr) continue;

    readings.push({
      carId,
      userId,
      date: parseDate(dateStr),
      mileage: parseInt(mileageStr, 10),
      timestamp: new Date().toISOString()
    });
  }

  // Add to Firestore
  let successCount = 0;
  let errorCount = 0;

  for (const reading of readings) {
    try {
      await addDoc(collection(db, 'readings'), reading);
      successCount++;
    } catch (err) {
      console.error('Error adding reading:', reading, err);
      errorCount++;
    }
  }

  return { successCount, errorCount, total: readings.length };
}
