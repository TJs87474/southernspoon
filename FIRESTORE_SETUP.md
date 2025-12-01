# Firestore Setup Instructions

## 1. Set Up Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (southernspoon-4320d)
3. Click on "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Copy the contents of `firestore.rules` file from this project
6. Paste it into the Firebase Console rules editor
7. Click "Publish"

## 2. Create Firestore Indexes

Some queries require composite indexes. Firebase will prompt you to create them when needed, or you can create them manually:

1. Go to Firestore Database > Indexes tab
2. Click "Create Index"

### Recommended Indexes:

**For events collection:**
- Collection: `events`
- Fields: `isActive` (Ascending), `date` (Ascending)
- Query scope: Collection

**For savedEvents collection:**
- Collection: `savedEvents`
- Fields: `userId` (Ascending), `savedAt` (Descending)
- Query scope: Collection

**For userEventInteractions collection:**
- Collection: `userEventInteractions`
- Fields: `userId` (Ascending), `eventId` (Ascending)
- Query scope: Collection

## 3. Test Data (Optional)

You can add some test events to your Firestore database:

1. Go to Firestore Database > Data tab
2. Click "Start collection"
3. Collection ID: `events`
4. Add documents with the following structure:

```json
{
  "name": "Wine Tasting at Sunset Vineyard",
  "venue": "Sunset Vineyard",
  "description": "Join us for an evening of wine tasting featuring local wines",
  "date": "2024-12-15T18:00:00",
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "address": "123 Vineyard Lane, Los Angeles, CA"
  },
  "createdAt": "2024-11-25T10:00:00",
  "isActive": true
}
```

Add a few more events with different dates and locations to test the app!
