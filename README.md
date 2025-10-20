# Haritage - Cross-Platform Mobile App

A modern, modular cross-platform mobile application built with React Native and Expo, focusing on performance, maintainability, and scalability.

## 🚀 Features

### 🔐 Authentication
- **Phone OTP Authentication**: Secure login using phone number and OTP verification
- **Biometric Authentication**: Face ID/Touch ID support for quick access after initial login
- **Secure Storage**: Encrypted token storage using Expo SecureStore

### 🏠 Home Page
- **User Information Block**: Display user profile with quick actions
- **Dynamic Feed**: Auto-playing video feed with infinite scroll
- **Advertisement Integration**: Native ad banners with interaction tracking
- **Notification Center**: Real-time notifications with unread count badge

### 📱 Video Feed
- **Auto-Play Videos**: Seamless video playback with smart buffering
- **Interactive Controls**: Like, comment, and share functionality
- **Performance Optimized**: Efficient memory management and lazy loading

### 🔔 Notifications
- **Real-time Updates**: Push notifications with badge counts
- **Notification Center**: Full-screen modal with notification history
- **Smart Management**: Mark as read, dismiss, and clear all functionality

## 🏗️ Architecture

### Modular Design
The app follows a modular architecture pattern for better maintainability:

```
src/
├── modules/          # Feature modules (auth, home, feed, notifications, ads)
├── shared/           # Shared components, hooks, utilities, and types
└── core/             # Core application logic (navigation, store, config)
```

### State Management
- **Zustand**: Lightweight state management for global state
- **Persistent Storage**: Automatic state persistence with AsyncStorage
- **Type Safety**: Full TypeScript integration

### Performance Optimizations
- **Code Splitting**: Modular imports for better bundle size
- **Lazy Loading**: Components loaded on demand
- **Memory Management**: Efficient video player and image handling
- **Optimized Rendering**: React.memo and useMemo for performance

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Video Player**: Expo AV
- **Authentication**: Expo Local Authentication + SecureStore
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage + SecureStore
- **Language**: TypeScript

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "~54.0.13",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "expo-router": "~6.0.11",
  "zustand": "^4.4.7",
  "expo-av": "~14.0.7",
  "expo-local-authentication": "~14.0.1",
  "expo-notifications": "~0.28.16",
  "expo-secure-store": "~13.0.2",
  "@react-native-async-storage/async-storage": "1.21.0"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Haritage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0+
- **Features**: Face ID, Touch ID, Push Notifications
- **Permissions**: Camera, Microphone, Photo Library, Biometric

### Android
- **Minimum Version**: Android 8.0 (API 26)
- **Features**: Fingerprint, Push Notifications
- **Permissions**: Camera, Microphone, Storage, Biometric

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_APP_NAME=Haritage
```

### App Configuration
Key configuration is managed in `src/core/config/index.ts`:

```typescript
export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL,
  AUTH: {
    OTP_EXPIRY_MINUTES: 5,
    BIOMETRIC_TIMEOUT: 30000,
  },
  VIDEO: {
    AUTO_PLAY: true,
    MUTED_BY_DEFAULT: true,
  },
  // ... more configuration
};
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📦 Building for Production

### iOS
```bash
# Build for iOS
expo build:ios

# Or use EAS Build
eas build --platform ios
```

### Android
```bash
# Build for Android
expo build:android

# Or use EAS Build
eas build --platform android
```

## 🚀 Deployment

### App Store (iOS)
1. Build the app using EAS Build
2. Submit to App Store Connect
3. Configure app metadata and screenshots
4. Submit for review

### Google Play Store (Android)
1. Build the app using EAS Build
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

## 📊 Performance Monitoring

The app includes performance monitoring for:
- **Video Playback**: Frame rate and buffering metrics
- **Memory Usage**: Component memory consumption
- **Network Requests**: API call performance
- **User Interactions**: Touch response times

## 🔒 Security

### Data Protection
- **Encrypted Storage**: Sensitive data encrypted with SecureStore
- **Token Management**: Secure JWT token handling
- **Biometric Security**: Hardware-backed authentication
- **Network Security**: HTTPS-only API communication

### Privacy
- **Minimal Permissions**: Only request necessary permissions
- **Data Minimization**: Collect only required user data
- **Transparent Usage**: Clear permission descriptions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for architecture details

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication system
- ✅ Basic feed functionality
- ✅ Notification system
- ✅ Modular architecture

### Phase 2 (Next)
- [ ] Advanced video features
- [ ] Social interactions
- [ ] Content creation tools
- [ ] Analytics integration

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Live streaming
- [ ] Advanced monetization
- [ ] Cross-platform sync

---

Built with ❤️ using React Native and Expo