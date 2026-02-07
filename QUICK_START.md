# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Installation
The project is already set up with all dependencies installed. Verify by running:
```bash
npm list --depth=0
```

### Step 2: Start the Development Server
The server should already be running. If not, start it with:
```bash
npm start
```

You should see:
```
Starting Metro Bundler
Waiting on http://localhost:8081
```

### Step 3: Run on Your Device

#### Option A: Use Expo Go (Easiest)
1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in your terminal

#### Option B: Use iOS Simulator (Mac only)
```bash
npm run ios
```

#### Option C: Use Android Emulator
```bash
npm run android
```

### Step 4: Test the App

#### Test Login Flow:
1. Enter any 10-digit phone number (e.g., `9876543210`)
2. Click "Continue with Phone"
3. Enter any 6-digit OTP (e.g., `123456`)
4. You're in! 🎉

#### Test Marketplace:
1. Tap the **Marketplace** tab (shopping bag icon)
2. Browse products
3. Tap "Add to Cart" on any item

#### Test Unified Cart:
1. Tap the **Cart** tab (shopping cart icon)
2. Tap "Sync External Carts" button at the top
3. Watch mock data load from Amazon, Flipkart, and Myntra
4. Adjust quantities with + / - buttons

#### Test Accounting:
1. Tap the **Accounting** tab (dollar sign icon)
2. View your spending analytics
3. See platform-wise breakdown

## 🔥 Quick Tips

### Hot Reload
- Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Select "Reload" to refresh the app

### Debug Menu
- Shake device to open developer menu
- Enable "Fast Refresh" for instant updates

### Clear Cache
If you encounter issues:
```bash
npm start -- --clear
```

## 📱 App Features at a Glance

| Feature | What It Does |
|---------|-------------|
| **Authentication** | Login with phone OTP or Google |
| **Marketplace** | Browse and add items to cart |
| **Unified Cart** | See all your carts in one place |
| **Sync Carts** | Load items from Amazon, Flipkart, Myntra |
| **Accounting** | Track spending across platforms |

## 🎨 UI Highlights

- **Dark Mode**: Beautiful dark theme throughout
- **Platform Colors**: 
  - 🟠 Amazon (Orange)
  - 🔵 Flipkart (Blue)
  - 🔴 Myntra (Pink)
  - 🟣 Our Platform (Purple)
- **Smooth Animations**: Tap interactions feel native
- **Responsive**: Works on all screen sizes

## ⚙️ Configuration (Optional)

### Firebase Setup
To enable real authentication:
1. See `FIREBASE_SETUP.md` for detailed instructions
2. Update `src/api/firebase.ts` with your Firebase config

### Customize Theme
Edit colors in `src/theme/colors.ts`:
```typescript
export const colors = {
  primary: '#6366f1',  // Change this!
  // ... more colors
};
```

## 🐛 Troubleshooting

### Metro Bundler Won't Start
```bash
# Kill existing processes
npx kill-port 8081
npm start
```

### TypeScript Errors
```bash
# Restart TypeScript server in your IDE
# Or run:
npx tsc --noEmit
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### App Won't Load on Device
1. Make sure your phone and computer are on the same WiFi
2. Try restarting the Expo Go app
3. Scan the QR code again

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Firebase Setup**: See `FIREBASE_SETUP.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org

## 🎯 Next Actions

1. ✅ App is running
2. ✅ Test all features
3. 🔲 Configure Firebase (optional)
4. 🔲 Customize theme
5. 🔲 Add your own features

## 💡 Pro Tips

- **Fast Development**: Use Fast Refresh for instant updates
- **Debug Easily**: Use React Native Debugger or Flipper
- **Test on Real Device**: Always test on actual devices, not just simulators
- **Version Control**: Commit your changes regularly

---

**Happy Coding! 🚀**

Need help? Check the documentation files or open an issue.
