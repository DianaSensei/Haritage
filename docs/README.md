# Haritage Documentation Hub

A consolidated handbook for product stakeholders, engineers, and AI assistants working on the Haritage Expo + React Native application. This single source replaces prior markdown notes and stays aligned with the current codebase.

---

## 1. Product Snapshot

- **Vision**: Minimalist media discovery with secure access and immersive viewing.
- **Core Journeys**: Phone OTP login, biometric app lock setup, home feed exploration, media detail viewing, interacting with posts, receiving notifications, managing profile settings.
- **Supported Platforms**: iOS 13+, Android 8+, and web preview via Expo.
- **Design Language**: Dark UI, high contrast, tactile focus states, 16 px gutters, limited color palette anchored by `#0a66c2` accents.

---

## 2. Architecture Overview

### 2.1 Layered Stack

```
┌────────────────────────────────────────────────┐
│ UI & Navigation                               │
│ - Expo Router pages under app/                │
│ - Feature screens and shared UI components    │
└─────────────┬──────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────┐
│ Feature Modules (src/modules/*)                │
│ - Screens, hooks, services, types per feature  │
└─────────────┬──────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────┐
│ Shared Layer (src/shared)                      │
│ - Cross-cutting UI, hooks, data layer, utils   │
└─────────────┬──────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────┐
│ Core Layer (src/core)                          │
│ - Config, navigation shell, Zustand stores     │
└─────────────┬──────────────────────────────────┘
              │
┌─────────────▼──────────────────────────────────┐
│ Platform Services                              │
│ - AsyncStorage, SecureStore, Expo SDK, APIs    │
└────────────────────────────────────────────────┘
```

### 2.2 Directory Highlights

- `app/`: Expo Router entry points (`_layout.tsx`, `(tabs)/index.tsx`, modal routes, `create-post.tsx`, `media-detail.tsx`).
- `src/core/`: Global config (`config/index.ts`), navigation (`navigation/AppNavigator.tsx`), Zustand hooks and slices (`store/`).
- `src/modules/`: Feature packages (`auth`, `home`, `feed`, `notifications`, `account`, `map`, `ads`). Each contains `components`, `screens`, `services`, `hooks`, and optional `types` folders.
- `src/shared/`: Shared components, hooks, utilities, and the data layer (`shared/data/*`).
- `assets/`: Static imagery.
- `docs/`: This documentation hub.

### 2.3 Data & State Flow

1. UI components call hooks exported from `src/core/store` or `src/shared/data`.
2. Hooks talk to repositories (mock today, API-ready) via the data service factory.
3. Repositories load or mutate data through `mockDataStore` (+ AsyncStorage persistence) or future API clients.
4. Zustand stores broadcast state changes back to the UI.

### 2.4 Configuration Surface

Retrieve settings with `import { CONFIG } from "@/core/config";`. Key namespaces include `APP_LOCK`, `FEED`, `FEATURES`, `API`, and `STORAGE_KEYS`.

---

## 3. Application Surfaces

| Surface       | Key Files                                                                 | Experience                                           | Notes                                                          |
| ------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Auth flow     | `src/modules/auth/screens/AuthScreen.tsx`                                 | Phone OTP login, error handling, resend timers       | Uses `useLoginWithPhone` and `useVerifyOTP` hooks.             |
| Lock screen   | `src/modules/auth/screens/LockScreen.tsx`                                 | PIN keypad, biometric fallback, cooldown timer       | Driven by `useAppLockStore`.                                   |
| PIN setup     | `src/modules/auth/screens/PINSetupScreen.tsx`                             | Create PIN → Confirm PIN → Enable biometrics         | Triggered when `pinSetupRequired` is true.                     |
| Home feed     | `src/modules/home/screens/HomeScreen.tsx`                                 | Stats header, filter chips, infinite feed, FAB       | Feed items come from `useFeedItems`. FAB animates on scroll.   |
| Media detail  | `app/media-detail.tsx`, `src/modules/feed/screens/MediaDetailScreen.tsx`  | Full-screen media carousel with metadata and actions | Accepts `postId` and `mediaIndex` params.                      |
| Notifications | `src/modules/notifications/components/NotificationCenter.tsx`             | Tabular list, mark-as-read controls                  | Powered by `useNotifications` and `useMarkNotificationAsRead`. |
| Account       | `app/(tabs)/account.tsx`, `src/modules/account/screens/AccountScreen.tsx` | Profile summary, logout, auth state display          | Uses `useCurrentUser` and `useLogout`.                         |
| Explore & Map | `app/(tabs)/explore.tsx`, `app/(tabs)/map.tsx`                            | Placeholders for future experiences                  | Follow module template when extending.                         |
| Create Post   | `app/create-post.tsx` (screen content TBD)                                | Entry point from FAB                                 | Use feed service patterns when implemented.                    |

**Feed Content Model Reference**

- 12 mock posts with coverage for single/multi-image, video + thumbnail, URL previews, polls, and text-only content.
- Each post includes `id`, `type`, `media[]`, `content`, `author`, `stats` (likes, comments, saves), and optional `poll` or `linkPreview`.
- Update defaults in `src/shared/data/stores/mockDataStore.ts`.

---

## 4. Data Layer Manual

### 4.1 Components

```
src/shared/data/
├── dataService.ts          // Singleton factory with DataSourceType switching
├── hooks/useData.ts        // All exported hooks (useFeedItems, useCurrentUser, ...)
├── repositories/
│   ├── IRepository.ts      // Interfaces for user/feed/notification repositories
│   └── MockRepository.ts   // Mock repository implementations
├── stores/mockDataStore.ts // In-memory store + AsyncStorage persistence
└── index.ts                // Barrel exports and convenience helpers
```

### 4.2 Available Hooks

- **User**: `useCurrentUser`, `useUser`, `useUsers`, `useLoginWithPhone`, `useVerifyOTP`, `useLogout`.
- **Feed**: `useFeedItems`, `useFeedItem`, `useUserFeedItems`, `useTrendingFeedItems`, `useCreateFeedItem`, `useLikeFeedItem`, `useSaveFeedItem`.
- **Notifications**: `useNotifications`, `useUnreadNotifications`, `useMarkNotificationAsRead`, `useMarkAllNotificationsAsRead`.

Each hook returns `{ data, loading, error, refetch }` (or action handlers for mutations). Handle loading and error states in the component, using cached data when possible.

### 4.3 Repository Contracts (Abbreviated)

- `IUserRepository`: Fetch single user, current user, user list, create/update/delete, login, verify OTP, logout.
- `IFeedRepository`: Fetch collections (general, user, trending), fetch item by id, create/update/delete, like/unlike, save/unsave.
- `INotificationRepository`: Fetch paginated lists, fetch unread, mark single or all as read, delete notifications.

### 4.4 Switching Data Sources

```ts
import { getDataService, DataSourceType } from "@/shared/data";

const dataService = getDataService();
dataService.switchDataSource(
  __DEV__ ? DataSourceType.MOCK : DataSourceType.API
);
```

Future API repositories should satisfy the same interfaces so UI code stays untouched.

### 4.5 Extending the Data Layer

1. **Define types** under `src/shared/types` or the target module.
2. **Update interfaces** in `repositories/IRepository.ts`.
3. **Implement mock behavior** inside `repositories/MockRepository.ts` (and `mockDataStore.ts` if storage changes are required).
4. **Expose hooks** in `hooks/useData.ts` and export via `shared/data/index.ts`.
5. **Consume hooks** within UI components, ensuring loading/error states are handled.

### 4.6 Mock Store Utilities

```ts
import { mockStore } from "@/shared/data";
await mockStore.initialize();
await mockStore.reset();
const feed = mockStore.getFeedItems();
```

Initialization is typically triggered in `app/_layout.tsx` via `useMockStoreInitialization`.

---

## 5. Security & App Lock

### 5.1 Store State (`src/core/store/slices/appLockSlice.ts`)

```
{
  isLocked: boolean,
  pinSetupRequired: boolean,
  pinHash: string | null,
  isBiometricEnabled: boolean,
  failedAttempts: number,
  cooldownUntil: number | null,
  lastAuthTimestamp: number | null
}
```

### 5.2 Services

- `pinService.ts`: Hashing (SHA-256 via Expo Crypto), format validation, SecureStore persistence, verification, biometric preference storage, data cleanup.
- `biometricService.ts`: Hardware availability checks, biometric type detection, authentication prompts.

### 5.3 Hook & Screen Integration

1. Call `useAppLock()` inside `app/_layout.tsx` to monitor app foreground/background transitions.
2. In navigators, render `LockScreen` when `useAppLockStore().isLocked` is true.
3. Present `PINSetupScreen` when `pinSetupRequired` is true post-login.
4. During logout, run `await pinService.clearAppLockData()` and `useAppLockStore.getState().resetAppLock()`.

### 5.4 Security Guarantees

- PIN never stored in plaintext; hashes reside in SecureStore (Keychain on iOS, Keystore on Android).
- Three failed attempts trigger a 30-second cooldown (`CONFIG.APP_LOCK.MAX_ATTEMPTS` and `.COOLDOWN_SECONDS`).
- Support for Face ID, Touch ID, and Android biometrics with graceful fallback.
- All input validated (`/^[0-9]{6}$/`).

### 5.5 Testing Checklist

- Complete PIN setup flow (create → confirm → biometric opt-in).
- Validate biometric unlock path, including unavailable hardware fallback.
- Confirm cooldown triggers after three failures and resets after timer.
- Ensure data clears on logout or disabling the feature from settings.

---

## 6. UI & Interaction Patterns

### 6.1 Floating Action Button (FAB)

- **Position**: `bottom: 80`, `right: 16` keeps 24 px clearance above the 56 px tab bar.
- **Touch Target**: 56x56 px circle with `borderRadius: 28`.
- **Styling**: Background `#0a66c2`, white `Ionicons add` glyph, shadow (`shadowOpacity: 0.4`, `shadowRadius: 8`, `elevation: 8`).
- **Animation**: `Animated.Value` handling opacity, toggled by `handleScroll` comparing current vs. last scroll positions. `scrollEventThrottle` set to 16 ms for 60 fps alignment.
- **Accessibility**: `accessibilityLabel="Create post"`, `accessibilityRole="button"`.

### 6.2 Media Detail Experience

- Full-screen `Animated.ScrollView` carousel with optional previous/next buttons for single-handed control.
- Media index indicator (`current / total`) anchored at bottom center.
- Info sheet includes author avatar (48 px with accent border), timestamp, post title/content, engagement stats, and action buttons (like, comment, share, save).
- Video playback delegated to the shared `VideoPlayer` component.

### 6.3 Shared UI Library

- Location: `src/shared/components/{ui,layout,forms}`.
- Prefer reusing shared primitives before rolling custom ones.
- Keep component files concise (<300 lines) with minimal, meaningful comments preceding complex blocks.

---

## 7. Development Playbook

### 7.1 Environment Setup

- Node.js 18+
- Yarn (preferred) or npm
- Expo CLI (`npx expo` or `npm install -g expo-cli`)
- Xcode with Simulator for iOS, Android Studio for emulators

### 7.2 Package Scripts

```
yarn start         # Expo dev server with QR code
yarn ios           # Launch iOS simulator
yarn android       # Launch Android emulator
yarn web           # Web preview
yarn lint          # ESLint check
yarn reset-project # Clear caches and reinstall
```

### 7.3 Running via Expo Go

- **Simulator**: `yarn start`, then press `i` (iOS) or `a` (Android) in the Expo CLI prompt.
- **Physical Device**: Install Expo Go, scan the Metro QR code, ensure same network or use Tunnel mode.

### 7.4 Development Builds (Dev Client)

- Install `eas-cli` and log in with an Expo account.
- **iOS**
  1. `yarn install`
  2. `expo run:ios --scheme HaritageDev` (simulator) or `EAS_NO_VCS=1 eas build --profile development --platform ios`
  3. `yarn start --dev-client`
- **Android**
  1. `expo run:android --variant devDebug` or `EAS_NO_VCS=1 eas build --profile development --platform android`
  2. `yarn start --dev-client`
- Launch the dev client app and it will connect to Metro for native feature testing (biometrics, SecureStore, etc.).

### 7.5 Component & Screen Recipes

- **New screen**: Place UI under the relevant module, expose route via `app/` re-export. Use data hooks, keep logic simple, test via Expo.
- **Reusable component**: Add under `src/shared/components`, export prop types, use `StyleSheet.create`, document complex logic briefly.
- **Config changes**: Update `src/core/config/index.ts`, import via `CONFIG`, avoid scattered literals.
- **Mock data updates**: Adjust `mockDataStore.ts`, extend repository logic, surface new hooks. Ensure `mockStore.save()` (already handled) persists changes.

### 7.6 Troubleshooting

- Metro issues: `yarn reset-project` (calls `expo start -c`).
- iOS build hiccups: delete `ios/build`, run `cd ios && pod install`, retry `expo run:ios`.
- Android Gradle issues: clean via Android Studio or remove `android/.gradle`, rerun `expo run:android`.

---

## 8. Testing & QA

- **Manual Smoke**: Verify login, PIN setup, biometric unlock, home feed scrolling, FAB behavior, media detail navigation, notifications list, logout on both iOS and Android.
- **Checklists**: Follow security steps in Section 5.5 and media viewer coverage in Section 6.2.
- **Automated**: No test runner yet; when adding Jest or Detox, leverage `mockStore.reset()` for deterministic data.
- **Linting**: `yarn lint` should be clean before committing.

---

## 9. Reference Index

- Routes: `app/_layout.tsx`, `app/(tabs)/*.tsx`, `app/create-post.tsx`, `app/media-detail.tsx`.
- Stores: `src/core/store/index.tsx`, `src/core/store/slices/*`.
- Config: `src/core/config/index.ts`.
- Data Layer: `src/shared/data/*`.
- Auth: `src/modules/auth/*`.
- Feed: `src/modules/home/screens/HomeScreen.tsx`, `src/modules/feed/components/FeedItem.tsx`, `src/modules/feed/screens/MediaDetailScreen.tsx`.
- Notifications: `src/modules/notifications/components/*`.
- Shared UI: `src/shared/components/*`.

---

## 10. Glossary

- **Expo**: Tooling for building and bundling React Native apps.
- **Zustand**: Lightweight state container that exposes hooks for global state.
- **Repository Pattern**: Abstraction layer that hides data source differences (mock vs API).
- **Expo Go**: Mobile client for loading dev builds without recompiling native code.
- **Dev Client**: Custom native build with app-specific code that still connects to Metro.
- **SecureStore**: Encrypted storage for secrets (PIN hashes, tokens).

---

## 11. Ownership & Next Steps

- **Product**: Use this hub to understand feature coverage and identify roadmap gaps.
- **Engineering**: Follow module patterns, rely on the data layer, keep configs centralized, and extend documentation in-place when features evolve.
- **AI Assistants**: Reference the paths in Section 9 before generating or editing code.

For deeper historical context, consult the repository history. This document supersedes all prior markdown notes in the project root.
