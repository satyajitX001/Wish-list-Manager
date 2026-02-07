# Firebase Configuration Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "wish-list-manager"
4. Follow the setup wizard

## Step 2: Register Your App

### For iOS:
1. Click the iOS icon in Firebase Console
2. Enter iOS bundle ID (from app.json)
3. Download `GoogleService-Info.plist`
4. Place it in the root directory

### For Android:
1. Click the Android icon in Firebase Console
2. Enter Android package name (from app.json)
3. Download `google-services.json`
4. Place it in the root directory

### For Web:
1. Click the Web icon in Firebase Console
2. Register app
3. Copy the Firebase config object

## Step 3: Get Firebase Config

From your Firebase project settings, copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Update App Configuration

Replace the placeholder config in `src/api/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Enable Authentication Methods

### Phone Authentication:
1. Go to Authentication > Sign-in method
2. Enable "Phone" provider
3. Add test phone numbers (optional for development)

### Google Sign-in:
1. Enable "Google" provider
2. Add support email
3. Download OAuth client configuration

For Google Sign-in to work, you'll need to install additional package:
```bash
npm install @react-native-google-signin/google-signin
```

## Step 6: Configure App for Firebase

Update `app.json` to include Firebase plugins:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ]
  }
}
```

## Testing Authentication

### Test Phone Numbers (Development):
1. Go to Authentication > Sign-in method > Phone
2. Add test phone numbers with verification codes
3. Example: +91 1234567890 with code 123456

### Test Google Sign-in:
1. Use a real Google account
2. Make sure OAuth client is properly configured

## Security Rules

For production, set up proper security rules in Firebase Console.

## Troubleshooting

### Issue: "Auth domain not whitelisted"
- Add your domain to authorized domains in Firebase Console

### Issue: "Invalid API key"
- Double-check your Firebase config
- Ensure API key restrictions allow your app

### Issue: "Phone auth not working"
- Enable Phone authentication in Firebase Console
- For iOS: Enable push notifications
- For Android: Add SHA-1 fingerprint

## Environment Variables (Optional)

For better security, use environment variables:

1. Install expo-constants:
```bash
npx expo install expo-constants
```

2. Create `app.config.js`:
```javascript
export default {
  expo: {
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      // ... other config
    }
  }
}
```

3. Access in code:
```typescript
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.firebaseApiKey;
```
