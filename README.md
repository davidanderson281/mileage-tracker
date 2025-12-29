# Mileage Tracker

🚗 **Live Demo:** [https://mileage-tracker-ruby.vercel.app/](https://mileage-tracker-ruby.vercel.app/)

A modern React application for tracking weekly car mileage, built with Vite, Firebase Firestore, and Tailwind CSS. Track multiple vehicles, monitor weekly mileage against annual limits, and visualize your driving trends with interactive charts.

## Features

- 🚗 **Multi-Car Tracking**: Manage multiple vehicles with individual mileage limits
- 📅 **Weekly Sunday Readings**: Track odometer readings every Sunday
- 📊 **Smart Calculations**: Automatic weekly mileage differences and status alerts
- 🎯 **Expected vs Actual**: Compare actual mileage against prorated annual limits
- 📈 **Visual Trends**: Interactive line charts showing mileage trends over time
- 📦 **Bulk Import**: Import historical readings from tab-separated data
- ✅ **Status Indicators**: Color-coded alerts for weekly limits (≤96 mi = good, >96 mi = warning)
- 📱 **Pagination**: Clean table view with 10 readings per page
- 💼 **Contract Tracking**: Track delivery mileage, contract months, and end dates
- 🔄 **Real-time Sync**: Live updates with Firebase Firestore
- 📱 **Fully Responsive**: Beautiful UI that works on desktop and mobile
- 🗑️ **Easy Management**: Add and delete readings with confirmation

## Tech Stack

- **Frontend**: React 19 + Vite 7.3
- **Styling**: Tailwind CSS v3
- **Database**: Firebase Firestore
- **Charts**: Recharts
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/davidanderson281/mileage-tracker.git
cd mileage-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Choose "Start in test mode" for development
   - Select your region
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click on the web icon (</>)
   - Copy your config values

### 4. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

Alternatively, edit `src/firebase.js` directly with your configuration.

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## Deployment

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel, Netlify, or GitHub Pages

The app is ready to deploy to any static hosting service. Just run `npm run build` and upload the `dist/` folder.

## Usage

1. **Add a Trip**: Fill out the form with trip details
   - Date of the trip
   - Start odometer reading
   - End odometer reading
   - Purpose (Business, Personal, etc.)
   - Optional notes

2. **View Trips**: All trips are displayed in a table (desktop) or cards (mobile)
   - Sorted by date (newest first)
   - Shows calculated distance
   - Displays total distance for all trips

3. **Delete a Trip**: Click the "Delete" button on any trip

## Project Structure

```
mileage-tracker/
├── src/
│   ├── components/
│   │   ├── TripForm.jsx      # Form for adding new trips
│   │   └── TripList.jsx      # Display list of trips
│   ├── App.jsx               # Main application component
│   ├── firebase.js           # Firebase configuration
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Firestore Data Structure

```javascript
trips: {
  tripId: {
    date: "2025-12-29",
    startOdometer: 12345.6,
    endOdometer: 12400.8,
    distance: 55.2,
    purpose: "Business",
    notes: "Client meeting in downtown",
    timestamp: "2025-12-29T10:30:00.000Z"
  }
}
```

## Security Considerations

⚠️ **Important**: The default Firestore rules are set to test mode, which allows anyone to read/write. Before deploying to production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{trip} {
      allow read, write: if request.auth != null; // Only authenticated users
    }
  }
}
```

Consider adding Firebase Authentication for production use.

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
