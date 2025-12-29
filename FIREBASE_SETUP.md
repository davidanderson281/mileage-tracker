# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "mileage-tracker")
4. Accept the terms and click **Create project**
5. Wait for the project to be created (usually takes a minute)

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left menu
2. Select **"Firestore Database"**
3. Click **"Create Database"**
4. Choose **"Start in test mode"** (for development)
   - ⚠️ Don't use test mode in production!
5. Select your region (closest to you)
6. Click **Enable**

Your database is now ready!

## Step 3: Create Collections

Firestore will automatically create collections when you add data. Your app will create:
- `cars` - stores your car information
- `readings` - stores weekly mileage readings

## Step 4: Get Your Firebase Config

1. Click the **Settings icon** (⚙️) at the top left
2. Select **"Project Settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** (</>)
5. Copy your Firebase config - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
};
```

## Step 5: Update Your App with Firebase Config

### Option A: Using Environment Variables (Recommended)

1. In your project folder, create a `.env` file:
   ```bash
   cd /Users/davidanderson/Development/React/mileage-tracker
   cp .env.example .env
   ```

2. Open `.env` and add your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyD...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
   ```

3. Update `src/firebase.js`:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

### Option B: Direct Update (Easier for Testing)

1. Open `src/firebase.js`
2. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",  // Your actual API key
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcd1234"
   };
   ```

## Step 6: Test Your Setup

1. Save the file
2. Go back to your browser at `http://localhost:5173`
3. Try adding a car:
   - Click **Add New Car**
   - Enter a name (e.g., "My Car")
   - Enter annual limit (e.g., 5000)
   - Click **Add Car**

If it works, you should see your car appear! 🎉

## Step 7: Add Firestore Security Rules (Important!)

⚠️ Test mode allows anyone to read/write. For production, update your rules:

1. In Firebase Console, go to **Firestore Database**
2. Click the **Rules** tab
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow only authenticated users
    match /cars/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /readings/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

## Troubleshooting

### "Failed to load cars" error
- Check your Firebase config in `src/firebase.js`
- Make sure Firestore is enabled
- Check browser console (F12) for error messages

### Data not appearing
- Refresh the page
- Check Firebase Console to see if data was saved
- Make sure you're using the right `projectId`

### Can't write data
- Check Firestore rules in Firebase Console
- Make sure you're in "test mode" for development

## Next Steps

Once Firebase is set up:
1. ✅ Add your first car
2. ✅ Record a Sunday reading
3. ✅ Watch the app track your mileage!

Need help? Check the [Firebase docs](https://firebase.google.com/docs/firestore)
