# Design Document

## Overview

The Southern Spoon is a React-based web application that provides a Tinder-like interface for discovering restaurant events. The application uses a component-based architecture with React for the UI, CSS for styling, and HTML as the rendering foundation. The system consists of a frontend client that communicates with backend services for authentication, event management, and user data persistence.

## Architecture

### High-Level Architecture

The application follows a client-server architecture:

- **Frontend**: React single-page application (SPA) built with HTML/CSS/React
- **Backend**: Firebase/Firestore for database and Firebase Authentication for user management
- **Database**: Firestore NoSQL database for users, events, and user preferences
- **Authentication**: Firebase Authentication for user login and session management
- **Geolocation Service**: Browser-based geolocation API for distance calculations

### Technology Stack

- **Frontend Framework**: React 18+
- **Styling**: CSS3 with CSS Modules or styled-components
- **State Management**: React Context API for global state
- **Backend Services**: Firebase SDK (v9+)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Routing**: React Router
- **Build Tool**: Vite or Create React App

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginPage Component**
- Renders login form with email and password fields
- Handles form validation and submission
- Displays error messages for failed authentication
- Redirects to event discovery on successful login

**RegisterPage Component**
- Renders registration form with required user information
- Validates input fields (email format, password strength)
- Submits new user data to authentication service
- Auto-authenticates user after successful registration

#### 2. Event Discovery Components

**EventCard Component**
- Displays single event with name, distance, and date
- Implements swipe gesture detection (left/right)
- Provides yes/no buttons as alternative to swiping
- Animates card transitions

**EventDiscoveryPage Component**
- Manages event queue and current event state
- Fetches events from backend API
- Handles swipe actions and updates user preferences
- Shows "no more events" message when queue is empty

**SwipeControls Component**
- Renders yes/no action buttons
- Triggers same logic as swipe gestures
- Provides accessible alternative to touch gestures

#### 3. Saved List Components

**SavedListPage Component**
- Displays grid or list of saved events
- Implements sorting controls (by date, distance, name)
- Handles event removal from saved list
- Shows empty state when no events are saved

**SavedEventCard Component**
- Displays event details in saved list format
- Includes remove button
- Links to detailed event view (if applicable)

#### 4. Shared Components

**Navigation Component**
- Provides navigation between discovery and saved list pages
- Shows user profile access
- Includes logout functionality

**LocationPermissionModal Component**
- Requests geolocation permission on first use
- Provides fallback for manual location entry
- Explains why location access is needed

### Firebase/Firestore Integration

#### Firebase Authentication Methods

```javascript
// Register new user
createUserWithEmailAndPassword(auth, email, password)

// Login existing user
signInWithEmailAndPassword(auth, email, password)

// Logout user
signOut(auth)

// Get current user
onAuthStateChanged(auth, callback)
```

#### Firestore Collections Structure

**users** collection
```
users/{userId}
  - email: string
  - name: string
  - createdAt: timestamp
  - lastLocation: {
      latitude: number
      longitude: number
      updatedAt: timestamp
    }
```

**events** collection
```
events/{eventId}
  - name: string
  - venue: string
  - description: string
  - date: timestamp
  - location: {
      latitude: number
      longitude: number
      address: string
    }
  - createdAt: timestamp
  - isActive: boolean
```

**userEventInteractions** collection
```
userEventInteractions/{interactionId}
  - userId: string
  - eventId: string
  - action: 'yes' | 'no'
  - timestamp: timestamp
```

**savedEvents** collection
```
savedEvents/{savedEventId}
  - userId: string
  - eventId: string
  - savedAt: timestamp
  - distanceAtSave: number
```

#### Firestore Query Examples

```javascript
// Get events for discovery (not yet interacted with by user)
const eventsQuery = query(
  collection(db, 'events'),
  where('isActive', '==', true),
  where('date', '>', new Date()),
  limit(20)
);

// Get user's saved events
const savedQuery = query(
  collection(db, 'savedEvents'),
  where('userId', '==', userId),
  orderBy('savedAt', 'desc')
);

// Check if user already interacted with event
const interactionQuery = query(
  collection(db, 'userEventInteractions'),
  where('userId', '==', userId),
  where('eventId', '==', eventId)
);
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  lastLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
}
```

### Event Model

```typescript
interface Event {
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
  createdAt: Date;
  isActive: boolean;
}
```

### UserEventInteraction Model

```typescript
interface UserEventInteraction {
  id: string;
  userId: string;
  eventId: string;
  action: 'yes' | 'no';
  timestamp: Date;
}
```

### SavedEvent Model

```typescript
interface SavedEvent {
  id: string;
  userId: string;
  eventId: string;
  savedAt: Date;
  event: Event; // Populated event data
  distanceAtSave?: number; // Distance in miles/km when saved
}
```

## C
orrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Successful authentication grants access
*For any* valid user credentials, when a user registers or logs in with those credentials, the system should authenticate the user and grant access to the event discovery interface.
**Validates: Requirements 1.1, 1.2**

### Property 2: Invalid credentials are rejected
*For any* invalid credential combination (malformed email, incorrect password, non-existent user), the system should reject the authentication attempt and display an error message.
**Validates: Requirements 1.3**

### Property 3: Session persistence until logout
*For any* authenticated user session, the session should remain valid and allow access to protected resources until the user explicitly logs out or the session expires.
**Validates: Requirements 1.4**

### Property 4: Event cards display required information
*For any* event shown in the discovery interface, the rendered event card should contain the event name, calculated distance from user, and event date.
**Validates: Requirements 2.1**

### Property 5: Distance calculation accuracy
*For any* user location and event location, when the system calculates distance, the result should match the expected distance using the haversine formula (within acceptable rounding tolerance), and this distance should be displayed on all event cards.
**Validates: Requirements 2.2, 2.4, 5.4**

### Property 6: Swipe yes adds to saved list
*For any* event that a user swipes yes on, that event should appear in the user's saved list, and the saved list should contain exactly all events the user has swiped yes on.
**Validates: Requirements 3.1, 4.1**

### Property 7: Swipe no excludes from saved list
*For any* event that a user swipes no on, that event should not appear in the user's saved list.
**Validates: Requirements 3.2**

### Property 8: Events are not repeated
*For any* event that a user has swiped on (yes or no), that event should not appear again in the user's discovery queue.
**Validates: Requirements 3.3**

### Property 9: Saved list sorting correctness
*For any* set of saved events and any sorting criterion (date, distance, name), when the user applies that sort, the resulting list should be correctly ordered according to that criterion.
**Validates: Requirements 4.3**

### Property 10: Event removal from saved list
*For any* event in a user's saved list, when the user removes that event, the event should no longer appear in the saved list.
**Validates: Requirements 4.4**

### Property 11: Location permission granted retrieves coordinates
*For any* user who grants location permission, the system should successfully retrieve the user's current latitude and longitude coordinates.
**Validates: Requirements 5.2**

### Property 12: Event validation on creation
*For any* event data submitted by an administrator, the system should validate required fields (name, venue, date, location) and only store events that pass validation, rejecting invalid events with appropriate error messages.
**Validates: Requirements 6.1**

### Property 13: Expired events are excluded
*For any* event whose date has passed, that event should not appear in any user's discovery queue.
**Validates: Requirements 6.2**

### Property 14: Event updates propagate correctly
*For any* event that is updated, users who have not yet viewed the event should see the updated information, while users who already interacted with it should see their original interaction preserved.
**Validates: Requirements 6.3**

### Property 15: Deleted events preserved in saved lists
*For any* event that is deleted by an administrator, the event should be removed from the discovery queue but should remain in users' saved lists with a status indicator showing it is no longer active.
**Validates: Requirements 6.4**

## Error Handling

### Frontend Error Handling

**Network Errors**
- Display user-friendly error messages when API calls fail
- Implement retry logic for transient failures
- Provide offline state indicators

**Validation Errors**
- Show inline validation errors on form fields
- Prevent form submission until validation passes
- Display clear error messages from backend validation

**Geolocation Errors**
- Handle permission denied gracefully with fallback options
- Show error messages for geolocation unavailable
- Provide manual location entry as alternative

**State Errors**
- Handle empty states (no events, no saved events)
- Manage loading states during async operations
- Recover gracefully from unexpected state transitions

### Firebase Error Handling

**Firebase Authentication Errors**
- Handle Firebase auth error codes (auth/user-not-found, auth/wrong-password, etc.)
- Provide user-friendly error messages for common auth errors
- Log authentication failures for security monitoring

**Firestore Errors**
- Handle permission denied errors with appropriate user feedback
- Implement retry logic for transient network failures
- Handle offline scenarios with Firebase offline persistence
- Log Firestore errors for debugging

**Data Validation Errors**
- Validate all input data before writing to Firestore
- Use Firestore Security Rules for server-side validation
- Sanitize user input to prevent injection attacks

**Business Logic Errors**
- Handle edge cases (duplicate swipes, deleted events)
- Use Firestore transactions for operations requiring atomicity
- Implement optimistic updates with rollback on failure

## Testing Strategy

### Unit Testing

**Component Testing**
- Test React components in isolation using React Testing Library
- Verify component rendering with different props
- Test user interactions (clicks, swipes, form submissions)
- Mock API calls and external dependencies

**Utility Function Testing**
- Test distance calculation functions with known coordinates
- Test date formatting and validation functions
- Test sorting algorithms with various data sets

**Firebase Integration Testing**
- Test Firestore queries with various data scenarios
- Test Firebase Authentication flows
- Use Firebase Emulator Suite for local testing
- Test Firestore Security Rules

### Property-Based Testing

The application will use **fast-check** (for JavaScript/TypeScript) as the property-based testing library.

**Configuration**
- Each property-based test should run a minimum of 100 iterations
- Tests should use appropriate generators for domain-specific data
- Each test must be tagged with a comment referencing the correctness property

**Test Tag Format**
Each property-based test must include a comment in this exact format:
```javascript
// Feature: southern-spoon, Property X: [property description]
```

**Property Test Coverage**
- Authentication flows (Properties 1-3)
- Event display and distance calculation (Properties 4-5)
- Swipe functionality and saved list management (Properties 6-10)
- Location services (Property 11)
- Event management and lifecycle (Properties 12-15)

**Generator Strategy**
- Create generators for User, Event, Location coordinates
- Generate edge cases (empty strings, boundary dates, extreme coordinates)
- Use shrinking to find minimal failing examples

### Integration Testing

- Test complete user flows (registration → discovery → saving → list management)
- Test authentication flow with real token generation
- Test database operations with test database
- Verify frontend-backend integration

### End-to-End Testing

- Test critical user journeys in a browser environment
- Verify swipe gestures work correctly
- Test responsive design on different screen sizes
- Verify geolocation permission flows

## Performance Considerations

### Frontend Performance

**Code Splitting**
- Lazy load routes to reduce initial bundle size
- Split vendor code from application code
- Use dynamic imports for heavy components

**Rendering Optimization**
- Use React.memo for expensive components
- Implement virtual scrolling for long saved lists
- Optimize re-renders with proper key usage

**Asset Optimization**
- Compress and optimize images
- Use appropriate image formats (WebP with fallbacks)
- Implement lazy loading for images

### Firebase Performance

**Firestore Optimization**
- Create composite indexes for complex queries
- Use pagination with Firestore query cursors
- Implement data denormalization where appropriate for read performance
- Use Firestore's built-in caching

**Query Optimization**
- Limit query results to necessary data
- Use where clauses to filter at database level
- Avoid reading entire collections
- Leverage Firestore's real-time listeners efficiently

## Security Considerations

**Authentication Security**
- Firebase Authentication handles password hashing automatically
- Use Firebase ID tokens for secure authentication
- Implement HTTPS for all communications (enforced by Firebase)
- Configure Firebase Authentication settings for security (email verification, password requirements)

**Data Security**
- Validate and sanitize all user inputs
- Implement Firestore Security Rules to protect data access
- Protect against XSS attacks with proper input sanitization
- Use Firebase's built-in security features
- Configure CORS appropriately in Firebase Hosting

**Privacy**
- Store only necessary user location data
- Implement proper data retention policies
- Provide users control over their data
- Comply with privacy regulations (GDPR, CCPA)

## Deployment Considerations

**Frontend Deployment**
- Build optimized production bundle
- Deploy to CDN or static hosting (Vercel, Netlify)
- Configure environment variables for API endpoints
- Set up CI/CD pipeline for automated deployments

**Firebase Configuration**
- Set up Firebase project in Firebase Console
- Configure Firebase Authentication providers
- Set up Firestore database with appropriate security rules
- Configure Firebase Hosting for frontend deployment
- Set up Firebase environment configuration
- Enable Firebase Analytics and monitoring

## Future Enhancements

- Push notifications for upcoming saved events
- Social features (share events with friends)
- Event recommendations based on user preferences
- Integration with calendar applications
- Advanced filtering options (cuisine type, price range)
- User reviews and ratings for events
