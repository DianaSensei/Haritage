# Haritage - Complete System Summary

Comprehensive overview of the Haritage app architecture, including the newly implemented data layer.

## Project Overview

**Haritage** is a minimalist React Native + Expo application with:

- 🎬 Feed/media sharing platform
- 👥 User authentication (phone + OTP)
- 🔒 App lock (PIN + Biometric)
- 📱 Native tab navigation (iOS 18+ liquid glass)
- 🎨 Minimalist design philosophy
- 🧹 Clean architecture with data layer

## Core Architecture

### Layer Diagram

```
┌────────────────────────────────────────────────┐
│        UI Screens & Components                 │
│  (Home, Auth, Account, Map, Notifications)    │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│     Data Access Layer (Hooks)                 │
│  (useData: useFeedItems, useCurrentUser...)  │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│     Data Service Factory                      │
│  (getDataService, getRepository)              │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│     Repository Pattern                        │
│  (IUserRepository, IFeedRepository, etc)     │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│     Implementation Strategies                 │
│  ├─ MockRepository (Development)              │
│  └─ ApiRepository (Production - Future)       │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│     Data Stores                               │
│  ├─ MockDataStore (Memory)                    │
│  ├─ AsyncStorage (Persistence)                │
│  └─ SecureStore (Sensitive Data)              │
└────────────────────────────────────────────────┘
```

### State Management

**Zustand Stores** (`src/core/store/`):

- `useAuthStore()` - User authentication state
- `useFeedStore()` - Feed and media state
- `useNotificationStore()` - Notifications state
- `useAppLockStore()` - App lock and security state

## Project Structure

```
haritage/
├── app/                              # Expo Router routes
│   ├── _layout.tsx                  # Root layout + global providers
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab navigation layout
│   │   ├── index.tsx                # Home screen
│   │   ├── explore.tsx              # Explore screen
│   │   ├── map.tsx                  # Map screen
│   │   └── account.tsx              # Account screen
│   └── modal.tsx                    # Modal screen
│
├── src/
│   ├── core/                        # Core app setup
│   │   ├── config/
│   │   │   ├── index.ts            # Runtime config (CONFIG)
│   │   │   └── theme.ts            # Theme configuration
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx    # Auth/Main routing logic
│   │   └── store/
│   │       ├── index.tsx           # Store exports & StoreProvider
│   │       ├── providers/          # Store providers
│   │       └── slices/             # Zustand store implementations
│   │           ├── authSlice.ts
│   │           ├── feedSlice.ts
│   │           ├── notificationSlice.ts
│   │           └── appLockSlice.ts
│   │
│   ├── modules/                    # Feature modules
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── AuthScreen.tsx
│   │   │   │   ├── LockScreen.tsx
│   │   │   │   └── PINSetupScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── PhoneLoginForm.tsx
│   │   │   │   └── OTPVerificationForm.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useAppLock.ts
│   │   │   └── types/
│   │   │
│   │   ├── home/
│   │   │   ├── screens/
│   │   │   │   └── HomeScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── FeedHeader.tsx
│   │   │   │   └── UserInfoBlock.tsx
│   │   │   └── services/
│   │   │
│   │   ├── feed/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   │   ├── FeedItem.tsx
│   │   │   │   └── VideoPlayer.tsx
│   │   │   ├── services/
│   │   │   │   └── mediaService.ts
│   │   │   └── types/
│   │   │
│   │   ├── account/
│   │   │   ├── screens/
│   │   │   │   └── AccountScreen.tsx
│   │   │   └── components/
│   │   │
│   │   ├── map/
│   │   │   └── screens/
│   │   │       └── MapScreen.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   └── NotificationCenter.tsx
│   │   │   └── services/
│   │   │
│   │   └── ads/
│   │       ├── components/
│   │       │   └── AdBanner.tsx
│   │       └── services/
│   │
│   └── shared/                     # Shared utilities
│       ├── components/
│       │   ├── index.ts           # Barrel exports
│       │   ├── forms/
│       │   ├── layout/
│       │   └── ui/
│       ├── hooks/
│       │   └── index.ts
│       ├── services/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   └── errorHandler.ts
│       │   ├── auth/
│       │   ├── storage/
│       │   └── security/
│       │       ├── pinService.ts
│       │       └── biometricService.ts
│       ├── data/                 # NEW: Data layer
│       │   ├── index.ts
│       │   ├── dataService.ts
│       │   ├── hooks/
│       │   │   └── useData.ts
│       │   ├── repositories/
│       │   │   ├── IRepository.ts
│       │   │   └── MockRepository.ts
│       │   └── stores/
│       │       └── mockDataStore.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│
├── assets/
│   └── images/
│
├── scripts/
│   └── reset-project.js
│
└── Root Config Files
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    ├── eslint.config.js
    ├── babel.config.js
    ├── expo-env.d.ts
    └── index.js (Entry point)
```

## Key Features

### 1. Authentication

- **Phone Login**: User enters phone number
- **OTP Verification**: Verify with OTP code
- **State Management**: `useAuthStore()` tracks auth state
- **Integration**: `src/modules/auth/`
- **Data Layer**: `useLoginWithPhone()`, `useVerifyOTP()`, `useLogout()` hooks

### 2. App Lock Security

- **PIN Setup**: 6-digit PIN during first login
- **Biometric**: Face ID, Touch ID, Fingerprint support
- **Secure Storage**: PIN stored as SHA-256 hash
- **Integration**: `src/modules/auth/{LockScreen, PINSetupScreen}`
- **Store**: `useAppLockStore()` for lock state
- **Config**: `CONFIG.APP_LOCK` settings

### 3. Feed Management

- **Display**: Home screen with feed items
- **Interactions**: Like, save, comment (extensible)
- **Data Layer**: `useFeedItems()`, `useLikeFeedItem()`, `useSaveFeedItem()`
- **Mock Data**: Pre-populated with sample items
- **Pagination**: Support for page-based loading

### 4. User Management

- **Profile**: View and edit user profile
- **Logout**: Securely logout and clear data
- **Data Layer**: `useCurrentUser()`, `useUser()`, `useUsers()` hooks

### 5. Notifications

- **Real-time**: Mock notifications with read status
- **UI**: NotificationCenter component
- **Data Layer**: `useNotifications()`, `useMarkNotificationAsRead()`

### 6. Data Layer (NEW)

- **Mock Development**: Full mock data support
- **Repository Pattern**: Clean data abstraction
- **Easy API Integration**: Single switch to production API
- **Persistence**: AsyncStorage for mock data
- **Type Safe**: Full TypeScript support
- **React Hooks**: Simple component integration

## Development Workflow

### Start Development

```bash
yarn start        # Start Expo development server
yarn ios         # Run on iOS simulator
yarn android     # Run on Android emulator
yarn web         # Run on web
```

### Development Commands

```bash
yarn lint                # Run ESLint
yarn reset-project       # Reset project to fresh state
yarn prebuild:ios       # Prebuild iOS app
yarn prebuild:android   # Prebuild Android app
yarn build:ios          # Build iOS production
yarn build:android      # Build Android production
```

### Data Layer Usage Pattern

**Step 1: Use Hook in Component**

```typescript
const { data: feedItems, loading, error } = useFeedItems();
```

**Step 2: Renders with Mock Data**

- Mock data comes from `MockDataStore`
- Automatically persisted to AsyncStorage
- No backend needed for development

**Step 3: Switch to API Later**

```typescript
getDataService().switchDataSource(DataSourceType.API);
```

**Step 4: Components Don't Change**

- Same hooks, same interfaces
- Only data source changes internally

## File Organization Principles

### Core (`src/core/`)

- App configuration and constants
- Global state management stores
- Navigation/routing logic
- Theme and styling setup

### Modules (`src/modules/`)

- Feature-specific code (auth, feed, etc)
- Own screens, components, services
- Module-specific types and hooks
- Keep modules loosely coupled

### Shared (`src/shared/`)

- Reusable components and utilities
- Global services (API client, error handler)
- Type definitions used across app
- **Data Layer** for centralized data access

## Configuration

### Runtime Config (`src/core/config/index.ts`)

```typescript
export const CONFIG = {
  // Storage keys
  STORAGE_KEYS: {
    FEED_ITEMS: "feed_items",
    USERS: "users",
    PIN_HASH: "pin_hash",
    // ... more keys
  },

  // Feature flags
  FEATURES: {
    ENABLE_NOTIFICATIONS: true,
    ENABLE_APP_LOCK: true,
    ENABLE_ADS: false,
  },

  // API endpoints
  API: {
    BASE_URL: "https://api.haritage.app",
    TIMEOUT_MS: 30000,
  },

  // App lock settings
  APP_LOCK: {
    PIN_LENGTH: 6,
    MAX_ATTEMPTS: 3,
    COOLDOWN_SECONDS: 30,
    LOCK_TIMEOUT_MS: 0,
  },

  // Feed settings
  FEED: {
    ITEMS_PER_PAGE: 10,
    REFRESH_INTERVAL_MS: 60000,
  },
};
```

## Dependencies

### Core Dependencies

- `react-native` - Native development
- `expo` - React Native framework
- `expo-router` - Navigation
- `zustand` - State management
- `typescript` - Type safety

### Security

- `expo-local-authentication` - Biometric auth
- `expo-crypto` - Encryption (SHA-256)
- `expo-secure-store` - Secure storage

### UI

- `react-native-gesture-handler` - Gestures
- `react-navigation` - Navigation library
- `expo-blur` - Blur effects (iOS 18+ glass)

### Storage

- `@react-native-async-storage/async-storage` - Local storage

### Development

- `eslint` - Code linting
- `@types/react-native` - TypeScript types
- `typescript` - TypeScript compiler

## Best Practices

### ✅ DO

- Use absolute imports with `@/` alias
- Import types from `shared/types`
- Use data layer hooks instead of direct repository calls
- Keep components focused on UI
- Delegate business logic to services/hooks
- Use Zustand stores for global state
- Update UI through store hooks
- Handle loading and error states
- Use mock data during development
- Keep components simple and reusable

### ❌ DON'T

- Hardcode mock data in components
- Call repository methods directly in components
- Mix data and presentation logic
- Create new global state libraries
- Use deeply nested prop drilling
- Ignore TypeScript type checking
- Create components wider than 300 lines
- Import from specific files instead of barrel exports
- Commit hardcoded API endpoints
- Repeat code across multiple files

## Data Flow Example

### User Logs In → Sees Feed → Likes Item

```
1. AuthScreen → useLoginWithPhone() hook
   ↓
2. Hook calls userRepository().loginWithPhone()
   ↓
3. MockUserRepository updates mockStore
   ↓
4. mockStore persists to AsyncStorage
   ↓
5. useAuthStore() updates to isAuthenticated: true
   ↓
6. Navigation switches to HomeScreen
   ↓
7. HomeScreen uses useFeedItems() hook
   ↓
8. Hook calls feedRepository().getFeedItems()
   ↓
9. MockFeedRepository fetches from mockStore
   ↓
10. Data renders in FlatList
    ↓
11. User taps like button
    ↓
12. FeedItem calls useLikeFeedItem().like()
    ↓
13. Hook calls feedRepository().likeFeedItem()
    ↓
14. MockRepository updates mockStore
    ↓
15. Component re-renders with updated likes count
```

## Debugging Tips

### View Mock Data

```typescript
import { mockStore } from "@/shared/data";

console.log("All users:", mockStore.getUsers());
console.log("All feed items:", mockStore.getFeedItems());
console.log("Current user ID:", mockStore.getCurrentUserId());
```

### Check Data Service

```typescript
import { getDataService } from "@/shared/data";

const service = getDataService();
console.log("Data Source:", service.dataSourceType);
console.log("Repositories:", service.getRepository());
```

### Enable Redux DevTools (if added)

Monitor state changes in real-time using Redux DevTools

### Log API Calls

Add logging middleware to `src/shared/services/api/client.ts`

## Next Steps

### Immediate (Next Sprint)

- [ ] Refactor HomeScreen to use `useFeedItems`
- [ ] Refactor components to use data layer hooks
- [ ] Test all flows on device
- [ ] Collect feedback on data layer design

### Short Term (1-2 Months)

- [ ] Implement API repository
- [ ] Add request caching layer
- [ ] Add offline sync capability
- [ ] Add error retry logic

### Long Term (3+ Months)

- [ ] GraphQL support (if needed)
- [ ] Real-time updates with WebSocket
- [ ] Advanced analytics
- [ ] Push notifications

## Troubleshooting

### App Won't Start

```bash
yarn reset-project
yarn start
```

### Type Errors After Update

```bash
tsc --noEmit
```

### Mock Data Not Loading

- Check that `useMockStoreInitialization()` is in root layout
- Verify AsyncStorage permissions
- Check console for initialization errors

### API Repository Not Switching

- Verify `DataSourceType.API` is set
- Check that ApiDataRepository is implemented
- Look for errors in data service factory

## Resources

### Documentation

- `DATA_LAYER_DOCUMENTATION.md` - Complete data layer guide
- `DATA_LAYER_INTEGRATION.md` - Integration steps
- `APP_LOCK_DOCUMENTATION.md` - App lock feature guide
- `APP_LOCK_INTEGRATION.md` - Lock screen integration
- `README.md` - Project setup guide

### Code References

- `src/core/config/index.ts` - Config and constants
- `src/core/store/slices/` - State management patterns
- `src/shared/data/` - Data layer implementation
- `src/modules/*/services/` - Service patterns

## Contributors

This architecture is designed to be:

- **Intuitive** - Easy to understand for new developers
- **Scalable** - Grows with project complexity
- **Maintainable** - Single responsibility principle
- **Testable** - Mock data enables easy testing
- **Extensible** - Easy to add new features

## License

See LICENSE file in repository root.
