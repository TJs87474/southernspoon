import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { EventWithDistance } from '../types/index';
import { formatDistance } from '../utils/distance';
import Navigation from '../components/Navigation';
import './SavedListPage.css';

type SortOption = 'date' | 'distance' | 'name';

interface SavedEventCardProps {
  event: EventWithDistance;
  onRemove: () => void;
}

function SavedEventCard({ event, onRemove }: SavedEventCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop';

  return (
    <div className={`saved-event-card ${isFlipped ? 'flipped' : ''}`}>
      <div className="saved-card-inner">
        {/* Front of card */}
        <div className="saved-card-face saved-card-front">
          <div 
            className="saved-card-image"
            style={{ backgroundImage: `url(${event.imageUrl || defaultImage})` }}
          >
            <div className="saved-image-overlay" />
          </div>
          
          <div className="saved-card-info">
            <h3 className="saved-event-name">{event.name}</h3>
            <p className="saved-event-venue">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {event.venue}
            </p>
            
            <div className="saved-event-meta">
              <span className="saved-meta-item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {formatDate(event.date)}
              </span>
              <span className="saved-meta-item">
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {formatTime(event.date)}
              </span>
              {event.distance !== undefined && (
                <span className="saved-meta-item">
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  {formatDistance(event.distance)}
                </span>
              )}
            </div>
            
            <div className="saved-card-actions">
              <button 
                className="saved-more-info-btn"
                onClick={() => setIsFlipped(true)}
              >
                More Info →
              </button>
              <button
                onClick={onRemove}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="saved-card-face saved-card-back">
          <div className="saved-back-content">
            <div className="saved-back-top">
              <button 
                className="saved-back-btn"
                onClick={() => setIsFlipped(false)}
              >
                ← Back
              </button>
              
              <h3 className="saved-back-title">{event.name}</h3>
              
              <div className="saved-back-section">
                <h4>About This Event</h4>
                <p className="saved-back-description">
                  {event.description || 'No description available for this event.'}
                </p>
              </div>
              
              <div className="saved-back-section">
                <h4>Location</h4>
                <p>{event.venue}</p>
                <p className="saved-address">{event.location.address}</p>
              </div>
              
              <div className="saved-back-actions">
                {event.link && (
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="saved-event-link"
                  >
                    View Event Details →
                  </a>
                )}
                
                {event.hostWebsite && (
                  <a 
                    href={event.hostWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="saved-event-link saved-host-link"
                  >
                    Visit Host Website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavedListPage() {
  const { currentUser } = useAuth();
  const [savedEvents, setSavedEvents] = useState<EventWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    if (currentUser) {
      fetchSavedEvents();
    }
  }, [currentUser]);

  useEffect(() => {
    sortEvents();
  }, [sortBy]);

  const fetchSavedEvents = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Get saved event IDs
      const savedQuery = query(
        collection(db, 'savedEvents'),
        where('userId', '==', currentUser.uid)
      );
      
      const savedSnapshot = await getDocs(savedQuery);
      const eventIds = savedSnapshot.docs.map(doc => ({
        savedEventId: doc.id,
        eventId: doc.data().eventId,
        distanceAtSave: doc.data().distanceAtSave,
      }));
      
      if (eventIds.length === 0) {
        setSavedEvents([]);
        setLoading(false);
        return;
      }
      
      // Fetch actual event details
      const events: EventWithDistance[] = [];
      const seenEventIds = new Set<string>(); // Track to prevent duplicates
      
      for (const { savedEventId, eventId, distanceAtSave } of eventIds) {
        // Skip if we've already added this event (prevents duplicates)
        if (seenEventIds.has(eventId)) {
          continue;
        }
        seenEventIds.add(eventId);
        
        const eventDoc = await getDocs(query(collection(db, 'events'), where('__name__', '==', eventId)));
        
        if (!eventDoc.empty) {
          const data = eventDoc.docs[0].data();
          events.push({
            id: eventId,
            savedEventId,
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
            distance: distanceAtSave,
          });
        }
      }
      
      setSavedEvents(events);
    } catch (error) {
      console.error('Error fetching saved events:', error);
    } finally {
      setLoading(false);
    }
  };


  const sortEvents = () => {
    const sorted = [...savedEvents].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setSavedEvents(sorted);
  };

  const handleRemoveEvent = async (eventId: string, savedEventId?: string) => {
    if (!currentUser || !savedEventId) {
      console.error('Missing currentUser or savedEventId:', { currentUser: !!currentUser, savedEventId });
      return;
    }

    try {
      console.log('Removing event:', { eventId, savedEventId });
      
      // Delete from saved events
      await deleteDoc(doc(db, 'savedEvents', savedEventId));
      console.log('Deleted saved event document');
      
      // Delete the interaction record so event goes back into rotation
      const interactionQuery = query(
        collection(db, 'userEventInteractions'),
        where('userId', '==', currentUser.uid),
        where('eventId', '==', eventId)
      );
      const interactionSnapshot = await getDocs(interactionQuery);
      console.log('Found interaction records:', interactionSnapshot.docs.length);
      
      // Delete all interaction records for this event
      for (const interactionDoc of interactionSnapshot.docs) {
        await deleteDoc(doc(db, 'userEventInteractions', interactionDoc.id));
        console.log('Deleted interaction:', interactionDoc.id);
      }
      
      // Update local state
      setSavedEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      console.log('Updated local state');
    } catch (error) {
      console.error('Error removing event:', error);
    }
  };

  if (loading) {
    return (
      <div className="saved-list-container">
        <div className="loading">Loading saved events...</div>
      </div>
    );
  }

  return (
    <div className="saved-list-container">
      <Navigation />
      
      <div className="saved-list-header">
        <h1>My Saved Events</h1>
        <p className="event-count">
          {savedEvents.length} event{savedEvents.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {savedEvents.length > 0 && (
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="date">Date</option>
            <option value="distance">Distance</option>
            <option value="name">Name</option>
          </select>
        </div>
      )}

      {savedEvents.length === 0 ? (
        <div className="empty-state">
          <h2>No Saved Events</h2>
          <p>Events you're interested in will appear here.</p>
          <a href="/discover" className="btn-primary">Discover Events</a>
        </div>
      ) : (
        <div className="events-grid">
          {savedEvents.map((event) => (
            <SavedEventCard
              key={event.savedEventId || event.id}
              event={event}
              onRemove={() => handleRemoveEvent(event.id, event.savedEventId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
