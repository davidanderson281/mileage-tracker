import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Migrate readings to include userId
 * @param {string} userId - The user ID to assign to readings without userId
 * @returns {Promise<{readingsUpdated: number}>}
 */
export async function migrateDataToUser(userId) {
  let readingsUpdated = 0;

  try {
    // Find all readings without userId
    const readingsSnapshot = await getDocs(collection(db, 'readings'));
    const readingsToUpdate = [];
    
    readingsSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (!data.userId) {
        readingsToUpdate.push(docSnapshot.id);
      }
    });

    console.log(`Found ${readingsToUpdate.length} readings without userId`);

    // Update readings
    for (const readingId of readingsToUpdate) {
      await updateDoc(doc(db, 'readings', readingId), {
        userId: userId
      });
      readingsUpdated++;
      console.log(`Updated reading ${readingId}`);
    }

    return { readingsUpdated };
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}
