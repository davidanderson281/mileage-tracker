# Deployment Guide

## 1️⃣ Push to GitHub

After creating your repository on GitHub, run these commands:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mileage-tracker.git
git branch -M main
git push -u origin main
```

## 2️⃣ Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - What's your project's name? **mileage-tracker**
   - In which directory is your code located? **./**
   - Want to override settings? **N**

4. Add environment variables:
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

For each, select "Production" and paste the value from your `.env` file.

5. Redeploy with environment variables:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your `mileage-tracker` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables (from your `.env` file):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click "Deploy"

## 3️⃣ Update Firebase Security Rules

Once deployed, update your Firestore rules to allow access from your Vercel domain:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null; // Require authentication
      // OR for testing (less secure):
      allow read, write: if true;
    }
  }
}
```

## 🎉 You're Live!

Your app will be available at: `https://mileage-tracker-YOUR_USERNAME.vercel.app`

Vercel automatically deploys on every push to `main` branch.
