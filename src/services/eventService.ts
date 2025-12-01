import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Record a user's interaction with an event (yes or no swipe)
 */
export async function recordEventInteraction(
  userId: string,
  eventId: string,
  action: 'yes' | 'no'
): Promise<void> {
  try {
    await addDoc(collection(db, 'userEventInteractions'), {
      userId,
      eventId,
      action,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording event interaction:', error);
    throw error;
  }
}

/**
 * Save an event to the user's saved list
 */
export async function saveEvent(
  userId: string,
  eventId: string,
  distance?: number
): Promise<void> {
  try {
    await addDoc(collection(db, 'savedEvents'), {
      userId,
      eventId,
      savedAt: Timestamp.now(),
      distanceAtSave: distance,
    });
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
}

/**
 * Check if user has already interacted with an event
 */
export async function hasUserInteractedWithEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'userEventInteractions'),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking event interaction:', error);
    return false;
  }
}

/**
 * Get all event IDs the user has interacted with
 */
export async function getUserInteractedEventIds(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'userEventInteractions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().eventId);
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return [];
  }
}
