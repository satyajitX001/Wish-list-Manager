# Wish List Manager

A React Native application that aggregates shopping cart items from multiple e-commerce platforms (Amazon, Flipkart, Myntra) into a single unified interface with comprehensive accounting features.

## Features

### 🔐 Authentication
- Phone OTP verification
- Google Sign-in support
- Persistent authentication state

### 🛍️ Marketplace
- Browse and add items from our platform
- View product details with pricing
- Add items to unified cart

### 🛒 Unified Cart (Aggregator)
- View all cart items from multiple platforms in one place
- Platform-wise grouping with color coding
- Quantity management
- Real-time total calculations
- Support for:
  - Our Platform
  - Amazon
  - Flipkart
  - Myntra

### 💰 Accounting
- Total spending tracking
- Platform-wise breakdown
- Visual spending distribution charts
- Average price calculations
- Item count analytics

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: Zustand
- **Authentication**: Firebase Auth
- **Storage**: AsyncStorage
- **Icons**: Lucide React Native
- **Language**: TypeScript

## Project Structure (Feature-First Approach)

```
src/
├── api/              # Firebase config & auth service
├── components/       # Shared UI components (Button, Input, Card)
├── features/         # Feature-based modules
│   ├── auth/         # Login & OTP screens
│   ├── marketplace/  # Product browsing
│   ├── aggregator/   # Unified cart
│   └── accounting/   # Analytics & tracking
├── navigation/       # Navigation setup
├── store/            # Zustand stores
├── theme/            # Design tokens (colors, spacing, typography)
└── utils/            # Helper functions (formatters, validators)
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication (Phone & Google)
   - Update `src/api/firebase.ts` with your Firebase config

3. Start the development server:
```bash
npm start
```

4. Run on platform:
```bash
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Phone Authentication
   - Google Sign-in
4. Copy your Firebase config and update `src/api/firebase.ts`

## State Management

The app uses Zustand for state management with two main stores:

### Auth Store (`useAuthStore`)
- User authentication state
- Persistent login with AsyncStorage
- User profile data

### Cart Store (`useCartStore`)
- External carts (Amazon, Flipkart, Myntra)
- Our platform items
- Quantity management
- Total calculations

## Future Enhancements

### Phase 1: External Cart Integration
- WebView-based cart scraping
- Cookie/session management
- Automated cart sync

### Phase 2: Backend Service
- Headless browser for cart fetching
- Secure credential storage
- Real-time sync

### Phase 3: Advanced Features
- Price tracking & alerts
- Wishlist management
- Order history
- Multi-currency support

## Security Considerations

⚠️ **Important**: This MVP uses placeholder authentication. For production:
- Never store plain-text passwords
- Use secure token management
- Implement proper OAuth flows
- Encrypt sensitive data
- Use HTTPS for all API calls

## Contributing

This project follows a feature-first architecture. When adding new features:
1. Create a new folder in `src/features/`
2. Include screens, components, and logic specific to that feature
3. Export through an `index.ts` barrel file
4. Update navigation as needed

## License

MIT

## Notes

- The external cart aggregation currently uses mock data
- Real implementation requires backend service or WebView injection
- Platform APIs (Amazon, Flipkart, Myntra) don't provide public cart access
- Consider legal implications of web scraping before implementation
