// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  lastLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
}

// Event types
export interface Event {
  id: string;
  name: string;
  venue: string;
  description: string;
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  imageUrl?: string;
  link?: string;
  hostWebsite?: string;
  createdAt: Date;
  isActive: boolean;
}

// User event interaction types
export interface UserEventInteraction {
  id: string;
  userId: string;
  eventId: string;
  action: 'yes' | 'no';
  timestamp: Date;
}

// Saved event types
export interface SavedEvent {
  id: string;
  userId: string;
  eventId: string;
  savedAt: Date;
  distanceAtSave?: number;
}

// Event with distance (for display)
export interface EventWithDistance extends Event {
  distance?: number;
  savedEventId?: string;
}
