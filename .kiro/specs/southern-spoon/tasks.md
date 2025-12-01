# Implementation Plan

- [x] 1. Set up project structure and Firebase configuration
  - Initialize React project with Vite
  - Install dependencies (React Router, Firebase SDK, fast-check for testing)
  - Create Firebase project and obtain configuration
  - Set up Firebase SDK initialization in the app
  - Create directory structure (components, contexts, utils, hooks)
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement authentication system
  - [x] 2.1 Create authentication context and hooks
    - Build AuthContext with Firebase Authentication integration
    - Implement useAuth hook for accessing auth state
    - Handle auth state persistence
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.2 Build login and registration components
    - Create LoginPage component with form validation
    - Create RegisterPage component with form validation
    - Implement error message display for auth failures
    - Add loading states during authentication
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.3 Write property test for authentication
    - **Property 1: Successful authentication grants access**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 2.4 Write property test for invalid credentials
    - **Property 2: Invalid credentials are rejected**
    - **Validates: Requirements 1.3**
  
  - [x] 2.5 Write property test for session persistence
    - **Property 3: Session persistence until logout**
    - **Validates: Requirements 1.4**

- [x] 3. Create Firestore data models and utilities
  - [x] 3.1 Set up Firestore collections and security rules
    - Define Firestore security rules for users, events, interactions, savedEvents
    - Create Firestore indexes for common queries
    - _Requirements: 6.1_
  
  - [x] 3.2 Implement distance calculation utility
    - Write haversine formula function for distance calculation
    - Add unit conversion (meters to miles/km)
    - _Requirements: 2.2, 2.4, 5.4_
  
  - [x] 3.3 Write property test for distance calculation
    - **Property 5: Distance calculation accuracy**
    - **Validates: Requirements 2.2, 2.4, 5.4**

- [x] 4. Implement geolocation functionality
  - [x] 4.1 Create location context and hooks
    - Build LocationContext for managing user location
    - Implement useLocation hook with browser geolocation API
    - Handle location permission requests
    - _Requirements: 5.1, 5.2_
  
  - [x] 4.2 Build location permission modal
    - Create LocationPermissionModal component
    - Implement fallback for manual location entry
    - Handle permission denied scenario
    - _Requirements: 5.1, 5.3_
  
  - [x] 4.3 Write property test for location retrieval
    - **Property 11: Location permission granted retrieves coordinates**
    - **Validates: Requirements 5.2**

- [x] 5. Build event discovery interface
  - [x] 5.1 Create EventCard component
    - Design and implement event card UI with name, distance, date
    - Add swipe gesture detection (touch and mouse events)
    - Implement card animations for swipe actions
    - Add yes/no buttons as alternative to swiping
    - _Requirements: 2.1, 3.1, 3.2_
  
  - [x] 5.2 Implement EventDiscoveryPage component
    - Build event queue management logic
    - Fetch events from Firestore (active, future-dated, not yet interacted)
    - Filter out events user has already swiped on
    - Handle swipe actions (yes/no)
    - Display "no more events" empty state
    - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3_
  
  - [x] 5.3 Create event interaction service
    - Write functions to record swipe actions in Firestore
    - Add event to savedEvents collection on yes swipe
    - Record interaction in userEventInteractions collection
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 5.4 Write property test for event card display
    - **Property 4: Event cards display required information**
    - **Validates: Requirements 2.1**
  
  - [x] 5.5 Write property test for swipe yes functionality
    - **Property 6: Swipe yes adds to saved list**
    - **Validates: Requirements 3.1, 4.1**
  
  - [x] 5.6 Write property test for swipe no functionality
    - **Property 7: Swipe no excludes from saved list**
    - **Validates: Requirements 3.2**
  
  - [x] 5.7 Write property test for event uniqueness
    - **Property 8: Events are not repeated**
    - **Validates: Requirements 3.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Build saved events list interface
  - [x] 7.1 Create SavedListPage component
    - Fetch user's saved events from Firestore
    - Display events in grid or list layout
    - Implement sorting controls (by date, distance, name)
    - Handle empty state when no events saved
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 7.2 Create SavedEventCard component
    - Design saved event card with event details
    - Add remove button functionality
    - Handle event deletion from saved list
    - _Requirements: 4.1, 4.4_
  
  - [x] 7.3 Implement sorting functionality
    - Write sorting logic for date, distance, and name
    - Update Firestore queries based on sort selection
    - _Requirements: 4.3_
  
  - [x] 7.4 Write property test for saved list sorting
    - **Property 9: Saved list sorting correctness**
    - **Validates: Requirements 4.3**
  
  - [x] 7.5 Write property test for event removal
    - **Property 10: Event removal from saved list**
    - **Validates: Requirements 4.4**

- [ ] 8. Implement event management (admin functionality)
  - [ ] 8.1 Create event creation form
    - Build form for adding new events
    - Implement validation for required fields
    - Write event data to Firestore
    - _Requirements: 6.1_
  
  - [ ] 8.2 Implement event lifecycle logic
    - Filter expired events from discovery queries
    - Handle event updates and propagation
    - Implement soft delete for events (mark inactive)
    - Preserve deleted events in saved lists with status indicator
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ] 8.3 Write property test for event validation
    - **Property 12: Event validation on creation**
    - **Validates: Requirements 6.1**
  
  - [ ] 8.4 Write property test for expired events
    - **Property 13: Expired events are excluded**
    - **Validates: Requirements 6.2**
  
  - [ ] 8.5 Write property test for event updates
    - **Property 14: Event updates propagate correctly**
    - **Validates: Requirements 6.3**
  
  - [ ] 8.6 Write property test for event deletion
    - **Property 15: Deleted events preserved in saved lists**
    - **Validates: Requirements 6.4**

- [ ] 9. Create navigation and routing
  - [ ] 9.1 Set up React Router
    - Configure routes for login, register, discovery, saved list
    - Implement protected routes requiring authentication
    - Add navigation component with links
    - _Requirements: 1.2, 4.1_
  
  - [ ] 9.2 Build Navigation component
    - Create navigation bar with route links
    - Add logout functionality
    - Show current user information
    - _Requirements: 1.4_

- [ ] 10. Styling and responsive design
  - [ ] 10.1 Create global styles and theme
    - Set up CSS variables for consistent theming
    - Create base styles for typography and layout
    - Implement responsive breakpoints
  
  - [ ] 10.2 Style authentication pages
    - Design login and registration forms
    - Add visual feedback for validation errors
    - Ensure mobile responsiveness
  
  - [ ] 10.3 Style event discovery interface
    - Design swipeable event cards with animations
    - Create smooth transition effects
    - Ensure touch-friendly UI elements
  
  - [ ] 10.4 Style saved list interface
    - Design saved event cards
    - Create sorting controls UI
    - Implement responsive grid/list layout

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Testing and polish
  - [ ] 12.1 Write integration tests
    - Test complete user flows (register → discover → save → list)
    - Test authentication flow end-to-end
    - Test event interaction flows
  
  - [ ] 12.2 Error handling improvements
    - Add error boundaries for React components
    - Improve error messages throughout the app
    - Add loading states for all async operations
  
  - [ ] 12.3 Performance optimization
    - Implement code splitting for routes
    - Optimize component re-renders
    - Add image lazy loading if applicable
