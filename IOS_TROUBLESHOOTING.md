# iOS Simulator Troubleshooting Guide

## Error: "Operation timed out" when opening iOS simulator

### Quick Fixes (Try in order)

#### Fix 1: Install Expo Go Manually on Simulator
1. Open the iOS Simulator (if not already open)
2. In the simulator, open Safari
3. Go to: https://expo.dev/go
4. Download and install Expo Go
5. Then press `i` again in the terminal

OR use this command:
```bash
# Install Expo Go on the simulator
npx expo install --ios
```

#### Fix 2: Restart Everything
```bash
# 1. Stop the current Expo server (Ctrl+C in terminal)
# 2. Close the iOS Simulator completely
# 3. Clear Expo cache
npx expo start --clear

# 4. When it starts, press 'i' to open iOS simulator
```

#### Fix 3: Use Development Build Instead
Since you're getting timeout issues with Expo Go, try using a development build:

```bash
# Stop current server (Ctrl+C)
# Then run:
npx expo run:ios
```

This will:
- Build the app natively
- Install it directly on the simulator
- No need for Expo Go app

#### Fix 4: Check Simulator Status
```bash
# List all simulators
xcrun simctl list devices

# Boot a specific simulator first
xcrun simctl boot "iPhone 16"

# Then try starting Expo again
npx expo start
# Press 'i'
```

#### Fix 5: Reset Simulator
If nothing works, reset the simulator:
1. Open Simulator app
2. Go to: Device → Erase All Content and Settings
3. Restart Expo: `npx expo start`
4. Press `i`

### Recommended Solution for This Project

Since you have a custom native app with navigation and Firebase, I recommend using **Development Build**:

```bash
# Stop current server
# Ctrl+C in terminal

# Build and run on iOS
npx expo run:ios
```

This will:
✅ Build the app with all native dependencies
✅ Install directly on simulator (no Expo Go needed)
✅ Faster reload times
✅ Better debugging
✅ Works with all native modules

### Alternative: Use Web for Quick Testing

While fixing iOS, you can test on web:
```bash
# In the Expo terminal, press 'w'
# Or run:
npx expo start --web
```

### Why This Happens

The timeout occurs because:
1. Expo Go app isn't installed on the simulator
2. Network connection issues between Expo and simulator
3. Simulator is too slow to respond
4. Port conflicts

### Prevention

For future projects:
1. Use `npx expo run:ios` for development builds
2. Keep Expo Go installed on simulator
3. Use `--clear` flag when starting if issues occur
