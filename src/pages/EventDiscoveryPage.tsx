import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import type { EventWithDistance } from '../types/index';
import { calculateDistance } from '../utils/distance';
import EventCard from '../components/EventCard';
import LocationPermissionModal from '../components/LocationPermissionModal';
import Navigation from '../components/Navigation';
import './EventDiscoveryPage.css';

export default function EventDiscoveryPage() {
  const { currentUser } = useAuth();
  const { location } = useLocation();
  const routerLocation = useRouterLocation();
  const [events, setEvents] = useState<EventWithDistance[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [viewedEventIds, setViewedEventIds] = useState<Set<string>>(new Set());

  // Reload viewed events and fetch events whenever we navigate to this page
  useEffect(() => {
    const loadAndFetch = async () => {
      if (!location) {
        setShowLocationModal(true);
        return;
      }
      
      if (!currentUser) return;
      
      setShowLocationModal(false);
      
      // Load interacted events first
      const { getUserInteractedEventIds } = await import('../services/eventService');
      const interactedIds = await getUserInteractedEventIds(currentUser.uid);
      const viewedIds = new Set(interactedIds);
      setViewedEventIds(viewedIds);
      
      // Then fetch events with the fresh viewed IDs
      fetchEventsWithViewedIds(viewedIds);
    };
    
    loadAndFetch();
  }, [currentUser, routerLocation.pathname, location]);

  const fetchEventsWithViewedIds = async (viewedIds: Set<string>) => {
    if (!currentUser || !location) return;

    try {
      setLoading(true);
      
      // Query for active events with future dates
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('isActive', '==', true),
        where('date', '>', Timestamp.now())
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedEvents: EventWithDistance[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Skip events with missing required fields
        if (!data.date || !data.createdAt || !data.name || !data.venue || !data.location) {
          console.warn(`Skipping event ${doc.id} - missing required fields`);
          return;
        }
        
        const event: EventWithDistance = {
          id: doc.id,
          name: data.name,
          venue: data.venue,
          description: data.description,
          date: data.date.toDate(),
          location: data.location,
          imageUrl: data.imageUrl,
          link: data.link,
          hostWebsite: data.hostWebsite,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive,
        };

        
        // Calculate distance
        if (location) {
          event.distance = calculateDistance(
            location.latitude,
            location.longitude,
            event.location.latitude,
            event.location.longitude
          );
        }
        
        // Filter out already viewed events using the passed-in viewedIds
        if (!viewedIds.has(event.id)) {
          fetchedEvents.push(event);
        }
      });
      
      // Sort by date (closest first)
      fetchedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async () => {
    if (currentIndex >= events.length || !currentUser) return;
    
    const currentEvent = events[currentIndex];
    console.log('SWIPE LEFT (Pass):', currentEvent.name, currentEvent.id);
    setViewedEventIds(prev => new Set(prev).add(currentEvent.id));
    
    try {
      // Record "no" interaction
      const { recordEventInteraction } = await import('../services/eventService');
      await recordEventInteraction(currentUser.uid, currentEvent.id, 'no');
      console.log('Recorded NO interaction for:', currentEvent.id);
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
    
    setCurrentIndex(currentIndex + 1);
  };

  const handleSwipeRight = async () => {
    if (currentIndex >= events.length || !currentUser) return;
    
    const currentEvent = events[currentIndex];
    console.log('SWIPE RIGHT (Interested):', currentEvent.name, currentEvent.id);
    setViewedEventIds(prev => new Set(prev).add(currentEvent.id));
    
    try {
      // Record "yes" interaction and save event
      const { recordEventInteraction, saveEvent } = await import('../services/eventService');
      await recordEventInteraction(currentUser.uid, currentEvent.id, 'yes');
      console.log('Recorded YES interaction for:', currentEvent.id);
      await saveEvent(currentUser.uid, currentEvent.id, currentEvent.distance);
      console.log('Saved event to savedEvents:', currentEvent.id);
    } catch (error) {
      console.error('Error saving event:', error);
    }
    
    setCurrentIndex(currentIndex + 1);
  };

  const currentEvent = events[currentIndex];

  return (
    <div className="discovery-container">
      <Navigation />
      
      <LocationPermissionModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
      />
      
      {loading ? (
        <div className="loading">Loading events...</div>
      ) : (
        <>
      
      <div className="discovery-header">
        <h1>Discover Events</h1>
        <p className="event-counter">
          {events.length - currentIndex} event{events.length - currentIndex !== 1 ? 's' : ''} remaining
        </p>
      </div>
      
      <div className="card-container">
        {currentEvent ? (
          <EventCard
            event={currentEvent}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        ) : (
          <div className="no-events">
            <h2>No More Events</h2>
            <p>You've seen all available events. Check back later for more!</p>
            <button 
              onClick={async () => {
                if (!currentUser) return;
                try {
                  // Delete all "no" interactions to bring rejected events back
                  const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
                  const { db } = await import('../firebase/config');
                  
                  const noInteractionsQuery = query(
                    collection(db, 'userEventInteractions'),
                    where('userId', '==', currentUser.uid),
                    where('action', '==', 'no')
                  );
                  
                  const snapshot = await getDocs(noInteractionsQuery);
                  
                  for (const docSnapshot of snapshot.docs) {
                    await deleteDoc(doc(db, 'userEventInteractions', docSnapshot.id));
                  }
                  
                  // Reload the page to fetch events again
                  window.location.reload();
                } catch (error) {
                  console.error('Error resetting rejected events:', error);
                }
              }}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Reset Rejected Events
            </button>
          </div>
        )}
      </div>
      
      {currentEvent && (
        <div className="action-buttons">
          <button onClick={handleSwipeLeft} className="btn-no">
            ✕ Pass
          </button>
          <button onClick={handleSwipeRight} className="btn-yes">
            ✓ Interested
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
