# The Southern Spoon

A Tinder-style web application for discovering restaurant events. Swipe through curated restaurant events, save your favorites, and build your personalized event list.

## Features

- 🔐 User authentication (login/register)
- 🎴 Swipe-based event discovery interface
- 📍 Location-based distance calculation
- 💾 Personal saved events list with sorting
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: CSS3
- **Backend**: Firebase/Firestore
- **Authentication**: Firebase Authentication
- **Routing**: React Router
- **Testing**: Vitest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (see setup instructions below)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** with Email/Password provider
4. Create a **Firestore Database** in production mode
5. Go to Project Settings > General > Your apps
6. Register a web app and copy the configuration

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your Firebase configuration to `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Testing

Run tests:
```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI
```

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Location)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── utils/          # Utility functions
├── firebase/       # Firebase configuration
└── test/           # Test setup and utilities
```

## Firestore Security Rules

Make sure to set up proper security rules in Firebase Console. Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events are readable by authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Adjust based on admin requirements
    }
    
    // User interactions are private
    match /userEventInteractions/{interactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Saved events are private
    match /savedEvents/{savedEventId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## License

MIT
