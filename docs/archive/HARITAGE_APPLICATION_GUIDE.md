# Haritage Application Guide

A single source of truth for product, engineering, and AI assistants working on the Haritage Expo + React Native application. This guide blends high-level orientation with actionable implementation detail, so non-technical stakeholders, developers, and GitHub Copilot can collaborate confidently.

---

## 1. Product Snapshot (For Everyone)

- **What Haritage Is**: A minimalist media and social discovery app with a curated feed, immersive media viewing, and secure access.
- **Key Journeys**: Authenticate with phone + OTP, set up biometric app lock, browse the feed, open full-screen media, interact with content, receive notifications, manage account.
- **Supported Platforms**: iOS 13+, Android 8+, web (preview). The Expo toolchain drives development and testing across devices.
- **Design Tone**: Dark minimalist UI, high contrast, touch-friendly components, consistent spacing (16 px gutters), and accessible typography.

---

## 2. Architecture Overview (For Engineers & Copilot)

### 2.1 Layered System

```
┌───────────────────────────────────────────────┐
│ UI & Navigation                               │
│ (Expo Router pages in app/, feature screens)  │
└─────────────┬─────────────────────────────────┘
              │
┌─────────────▼─────────────────────────────────┐
│ Feature Modules (src/modules/*)               │
│ Components, hooks, services per feature      │
└─────────────┬─────────────────────────────────┘
              │
┌─────────────▼─────────────────────────────────┐
│ Shared Layer (src/shared)                     │
│ Cross-cutting components, data layer, utils   │
└─────────────┬─────────────────────────────────┘
              │
┌─────────────▼─────────────────────────────────┐
│ Core Layer (src/core)                         │
│ Global config, navigation, Zustand stores     │
└─────────────┬─────────────────────────────────┘
              │
┌─────────────▼─────────────────────────────────┐
│ Platform Services                             │
│ AsyncStorage, SecureStore, Expo SDK, APIs     │
└───────────────────────────────────────────────┘
```

### 2.2 Key Folders

- `app/`: Expo Router entry points (`_layout.tsx`, `(tabs)/index.tsx`, modal routes, `media-detail.tsx`).
- `src/core/`: Global wiring (config, navigation, Zustand store slices in `store/slices/*`).
- `src/modules/`: Feature code (auth, home, feed, notifications, ads, map, account) with internal subfolders for components, screens, services, hooks, and types.
- `src/shared/`: Reusable UI, hooks, utilities, and the data layer (`shared/data/*`) that exposes repositories and React hooks for consuming data.
- `assets/`: Images and static media.

### 2.3 State & Data Flow

1. **Zustand Stores**: `useAuthStore`, `useFeedStore`, `useNotificationStore`, `useAppLockStore` export state + actions from `src/core/store/`.
2. **Data Layer** (`src/shared/data/`): Repository pattern with mock implementations today, API-ready tomorrow. Hooks like `useFeedItems()` or `useCurrentUser()` access repositories through a service factory.
3. **UI Consumption**: Screens invoke hooks → hooks call repositories → repositories access mock data store or future API → stores update → UI re-renders.

### 2.4 Security Stack

- PIN hashing with SHA-256 and SecureStore storage.
- Biometric auth via Expo Local Authentication.
- Lock state tracked via `useAppLockStore` and enforced by `useAppLock` hook.

---

## 3. Screens, Features, and Components (For Everyone)

| Area                             | Primary Files                                                             | What Users Experience                                    | Notes                                             |
| -------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| **Authentication**               | `src/modules/auth/screens/AuthScreen.tsx`                                 | Phone OTP login leading to optional biometric setup      | Integrates app lock setup flow.                   |
| **Lock Screen**                  | `src/modules/auth/screens/LockScreen.tsx`                                 | PIN keypad + biometric unlock on resume                  | Cooldown after three failed attempts.             |
| **PIN Setup**                    | `src/modules/auth/screens/PINSetupScreen.tsx`                             | Three-step PIN + biometric enablement                    | Invoked after first login or via settings.        |
| **Home Feed**                    | `src/modules/home/screens/HomeScreen.tsx`                                 | Feed with header stats, filters, media cards             | Uses FAB for create-post navigation.              |
| **Media Detail**                 | `app/media-detail.tsx`, `src/modules/feed/screens/MediaDetailScreen.tsx`  | Full-screen, swipe-able viewer with metadata and actions | Handles images & video, includes nav buttons.     |
| **Notifications**                | `src/modules/notifications/components/NotificationCenter.tsx`             | List of notifications with mark-as-read                  | Powered by data layer hooks.                      |
| **Account**                      | `app/(tabs)/account.tsx`, `src/modules/account/screens/AccountScreen.tsx` | Profile summary, logout                                  | Pulls from `useCurrentUser()`.                    |
| **Explore / Map**                | `app/(tabs)/explore.tsx`, `app/(tabs)/map.tsx`                            | Placeholder routes for expansion                         | Follow module template when adding functionality. |
| **Floating Action Button (FAB)** | `HomeScreen.tsx` styles + `FAB_*` docs                                    | Smart-positioned compose button                          | Sits 80 px above tab bar, animated opacity.       |

**Feature Reference Highlights**

- Feed supports images, video, polls, URL previews, text posts (see `MEDIA_DETAIL_IMPLEMENTATION.md`).
- Mock dataset includes 12 varied posts to test multiple content types (IDs 1-12).
- Engagement interactions use hooks (`useLikeFeedItem`, `useSaveFeedItem`) that mutate the mock store.

---

## 4. Data Layer Deep Dive (For Engineers & Copilot)

### 4.1 Structure

```
src/shared/data/
├── dataService.ts          // Singleton factory returning repositories
├── hooks/useData.ts        // Hook implementations (useFeedItems, etc.)
├── repositories/
│   ├── IRepository.ts      // Interfaces for user, feed, notification repos
│   └── MockRepository.ts   // Mock repo implementations
├── stores/mockDataStore.ts // In-memory + AsyncStorage persistence
└── index.ts                // Barrel exports + helpers
```

### 4.2 Usage Pattern

```tsx
import { useFeedItems } from "@/shared/data";

export function HomeFeed() {
  const { data, loading, error, refetch } = useFeedItems({
    page: 1,
    limit: 10,
  });
  const items = data?.data ?? [];

  if (loading && items.length === 0) return <LoadingScreen />;
  if (error && items.length === 0)
    return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <FeedItem item={item} />}
    />
  );
}
```

### 4.3 Switching Data Sources

```ts
import { getDataService, DataSourceType } from "@/shared/data";

globalThis.haritageDataSource ??= getDataService();
globalThis.haritageDataSource.switchDataSource(
  __DEV__ ? DataSourceType.MOCK : DataSourceType.API
);
```

(API repositories can be implemented later without changing consumers.)

### 4.4 Mock Store Utilities

```ts
import { mockStore } from "@/shared/data";

await mockStore.initialize();
console.log(mockStore.getFeedItems());
await mockStore.reset();
```

### 4.5 Repository Interfaces

- `IUserRepository`: Auth/login, user CRUD.
- `IFeedRepository`: Feed CRUD plus like/save interactions.
- `INotificationRepository`: Notification listing and state.

See `DATA_LAYER_DOCUMENTATION.md` for method signatures and `DATA_LAYER_INTEGRATION.md` for migration recipes.

---

## 5. Security & App Lock (For Everyone)

### 5.1 Core Concepts

- **PIN**: 6 digits, hashed with SHA-256, stored in SecureStore.
- **Biometrics**: Face ID, Touch ID, Android Fingerprint via `expo-local-authentication`.
- **Lock Lifecycle**: App backgrounds → `useAppLock` detects resume → `isLocked` flips true → `LockScreen` rendered until unlock.
- **Failed Attempts**: 3 failures trigger 30-second cooldown tracked in store.

### 5.2 Key Files

- Store: `src/core/store/slices/appLockSlice.ts`.
- Services: `src/shared/services/security/pinService.ts`, `biometricService.ts`.
- Hooks: `src/modules/auth/hooks/useAppLock.ts`.
- Screens: `LockScreen.tsx`, `PINSetupScreen.tsx`.

### 5.3 Required Config (`src/core/config/index.ts`)

```ts
APP_LOCK: {
  PIN_LENGTH: 6,
  MAX_ATTEMPTS: 3,
  COOLDOWN_SECONDS: 30,
  LOCK_TIMEOUT_MS: 0,
},
STORAGE_KEYS: {
  PIN_HASH: "haritage.pin_hash",
  PIN_SETUP_REQUIRED: "haritage.pin_setup_required",
  APP_LOCK_ENABLED: "haritage.app_lock_enabled",
  BIOMETRIC_ENABLED: "haritage.biometric_enabled",
},
```

### 5.4 Integration Checklist

1. Call `useAppLock()` inside `app/_layout.tsx`.
2. Gate navigators by `isLocked` (render `LockScreen`) in `AppNavigator` or parent component.
3. Trigger `PINSetupScreen` when `pinSetupRequired` is true after login.
4. On logout, call `pinService.clearAppLockData()` and `useAppLockStore.getState().resetAppLock()`.

---

## 6. UI Patterns & Components (For Designers, Engineers, Copilot)

### 6.1 Floating Action Button (FAB)

- **Positioning**: `bottom: 80`, `right: 16` to clear the 56 px tab bar plus 24 px padding.
- **Animation**: `Animated.Value` controlling opacity; scroll event handler toggles animation at 200 ms.
- **Touch Target**: 56x56 px for accessibility; z-index 999 so it sits above feed content but below modals.
- **Files**: `HomeScreen.tsx` (logic + styles), `FAB_*` docs for diagrams and future enhancements.

### 6.2 Media Detail Experience

- **Component**: `MediaDetailScreen.tsx` uses horizontal `Animated.ScrollView` with optional nav buttons.
- **Data Source**: Route params `postId`, `mediaIndex`, fetched through feed repository.
- **Info Panel**: Author metadata, engagement stats, action buttons.
- **Error Handling**: Graceful fallback when post or media missing.

### 6.3 Shared UI Library

- Resides in `src/shared/components/{ui,layout,forms}`.
- Favor these shared pieces before creating new primitives to maintain consistency.

---

## 7. How-To Guides (For Engineers & Copilot)

### 7.1 Create a New Screen

1. **Plan Placement**: Decide route (e.g., tab, stack, modal). For Expo Router, add a new file under `app/` or nested segments.
2. **Module Folder**: If the screen belongs to a module, add it under `src/modules/<feature>/screens/`.
3. **State/Data**: Use existing hooks (`useFeedItems`, `useCurrentUser`, etc.). If new data is required:
   - Define repository interface additions in `IRepository.ts`.
   - Implement mock operations in `MockRepository.ts`.
   - Expose a hook via `useData.ts`.
4. **UI**: Compose with shared components; keep logic under ~300 lines; add minimal comments for complex blocks.
5. **Navigation**: Export screen via `app/<route>.tsx` that simply re-exports module screen to keep Expo Router tidy.
6. **Testing**: Run `yarn lint`; manually smoke test via Expo Go or dev builds.

### 7.2 Build a Reusable Component

1. Create under `src/shared/components/<group>/`. Group options: `ui`, `layout`, `forms`.
2. Keep props typed; export the prop types for reuse.
3. Style with `StyleSheet.create`, plain React Native components, and tokens from theme if available.
4. Document any non-obvious behavior with a short block comment.
5. Update barrel export (`src/shared/components/index.ts`) if appropriate.

### 7.3 Add or Update Config

1. Modify `src/core/config/index.ts`. Use structured sections (APP_LOCK, FEED, FEATURES, STORAGE_KEYS, API).
2. Reference new keys via `import { CONFIG } from "@/core/config";`.
3. Avoid hardcoded constants scattered through code; centralize in config or `src/shared/utils/constants.ts` if cross-cutting.

### 7.4 Extend Mock Data or Repositories

1. Update `mockDataStore.ts` to seed additional entities or adjust defaults.
2. Modify repository logic in `MockRepository.ts` to support new operations (filters, interactions).
3. Add hook wrappers in `useData.ts` to expose new repository methods.
4. Update relevant screens to consume the new hook, ensuring loading/error states handled.
5. If data changes should persist between runs, confirm `mockStore.save()` is invoked (usually handled automatically).

### 7.5 Wiring New Data Sources (Future API)

1. Implement `Api<Feature>Repository` classes that satisfy interface contracts.
2. Extend `dataService.ts` to instantiate API repositories when `DataSourceType.API` selected.
3. Keep hooks untouched—consumers benefit from inversion of control.

---

## 8. Running the App (For Everyone)

### 8.1 Prerequisites

- Node.js 18+
- Yarn (preferred) or npm
- Expo CLI (`npm install -g expo-cli`) or use `npx expo` commands.
- iOS Simulator (Xcode > Open Developer Tools > Simulator) and/or Android Emulator (Android Studio) if targeting emulators.

### 8.2 Common Commands (`package.json` scripts)

```
yarn start        # Expo dev server with QR code
yarn ios          # Launch iOS simulator
yarn android      # Launch Android emulator
yarn web          # Web preview
yarn lint         # Lint project
yarn reset-project# Clean caches & reinstall
```

### 8.3 Expo Go (Fast Iteration)

- **Emulator**:
  1. Start Metro: `yarn start`.
  2. Press `i` for iOS simulator or `a` for Android emulator from the Expo CLI prompt.
- **Physical Device**:
  1. Install Expo Go from App Store / Google Play.
  2. Run `yarn start` and scan the QR code in the terminal or Expo Dev Tools.
  3. Ensure device and dev machine share the same network or use Tunnel mode.

### 8.4 Development Builds (access native modules, biometric tests)

- **Prerequisites**: Install `eas-cli` (`npm install -g eas-cli`) and configure an Expo account.

**iOS (Simulator or Physical)**

```
# Ensure dependencies are installed
yarn install

# Create dev build (simulator)
expo run:ios --scheme HaritageDev

# Or build a dev client for physical devices
EAS_NO_VCS=1 eas build --profile development --platform ios
# Install the .ipa via TestFlight or Xcode.

# Start in dev-client mode
yarn start --dev-client
```

**Android (Emulator or Physical)**

```
# Build native project once (optional but recommended)
expo run:android --variant devDebug

# Or use EAS for a reusable dev client
EAS_NO_VCS=1 eas build --profile development --platform android
# Install the resulting .apk or .aab on device/emulator.

# Launch Metro in dev-client mode
yarn start --dev-client
```

**Using the Dev Client**

1. Launch the Haritage dev build on device/emulator.
2. It will connect to Metro using the URL shown when running `yarn start --dev-client`.
3. Allows testing biometric flows, SecureStore, and other native-only features.

### 8.5 Troubleshooting Runs

- If Metro cache misbehaves: `yarn reset-project` (runs `expo start -c`, clears caches).
- For iOS build hiccups: delete `ios/build`, run `pod install` inside `ios`, then retry `expo run:ios`.
- For Android Gradle issues: clean via Android Studio or delete `android/.gradle` and rerun `expo run:android`.

---

## 9. Testing & QA (For Engineers & QA)

- **Manual**: Use the checklists in `APP_LOCK_DOCUMENTATION.md` and `MEDIA_DETAIL_IMPLEMENTATION.md` for lock screen and media viewer validation.
- **Automated**: No dedicated test runner configured; add Jest/React Testing Library when needed. Mock store utilities simplify unit tests (see `DATA_LAYER_INTEGRATION.md` examples).
- **Smoke Tests**: After major changes, run `yarn start` and validate authentication, feed scrolling, FAB behavior, media detail navigation, notifications, and logout on both iOS and Android builds.

---

## 10. Reference Index (For Copilot)

- Routes: `app/_layout.tsx`, `app/(tabs)/*`, `app/media-detail.tsx`, `app/create-post.tsx`.
- Stores: `src/core/store/index.tsx`, `src/core/store/slices/*`.
- Config: `src/core/config/index.ts`.
- Data Layer: `src/shared/data/*`.
- Auth: `src/modules/auth/*` including security services.
- Feed/Home: `src/modules/home/screens/HomeScreen.tsx`, `src/modules/feed/components/FeedItem.tsx`, `.../MediaDetailScreen.tsx`.
- Notifications: `src/modules/notifications/components/*`.
- Shared UI: `src/shared/components/*`.

---

## 11. Glossary (For Non-Technical Readers)

- **Expo**: Tooling that speeds up React Native development and testing.
- **Zustand**: Lightweight library that stores application state (like "who is logged in").
- **Repository Pattern**: A layer that hides whether data comes from mock files or a real API.
- **Expo Go**: A mobile app that loads development builds instantly via QR code.
- **Dev Client**: A custom build of the app that exposes native modules not available in Expo Go.
- **SecureStore**: Encrypted storage on the device for sensitive data (tokens, PIN hashes).

---

## 12. Next Steps & Ownership

- **Product Owners**: Use this guide to understand capabilities and plan new experiences.
- **Engineers**: Follow module patterns, rely on the data layer, and keep config centralized.
- **GitHub Copilot & Other AI Tools**: Reference the path table in Section 10 to route edits correctly and respect existing architecture.

Need help? Check the individual deep-dive documents for more context, or run `yarn start` and explore the app flows directly.
