# App Lock Integration Guide

Quick start guide for integrating PIN + Biometric authentication into your Haritage app.

## 1. Add Hook to Root Layout

**File: `app/_layout.tsx`**

```typescript
import { useAppLock } from "@/modules/auth/hooks/useAppLock";

export default function RootLayout() {
  useAppLock(); // Initialize app lock monitoring

  // ... rest of your layout code

  return <StoreProvider>{/* Your app structure */}</StoreProvider>;
}
```

## 2. Show Lock Screen in Navigator

**File: `src/core/navigation/AppNavigator.tsx`** (or equivalent)

```typescript
import { LockScreen } from "@/modules/auth/screens/LockScreen";
import { useAppLockStore } from "@/core/store";

export function AppNavigator() {
  const { isLocked, setLocked } = useAppLockStore();

  // Show lock screen when app is locked
  if (isLocked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  // ... rest of navigation
}
```

## 3. Trigger PIN Setup After Login

**File: `src/modules/auth/screens/AuthScreen.tsx`** (or your login screen)

```typescript
import { PINSetupScreen } from "@/modules/auth/screens/PINSetupScreen";
import { useAppLockStore } from "@/core/store";

export const AuthScreen: React.FC = () => {
  const { pinSetupRequired, setPinSetupRequired } = useAppLockStore();

  const handleLoginSuccess = async () => {
    // ... your login logic
    // After successful login, PIN setup will be required
    // App will show PINSetupScreen automatically
  };

  if (pinSetupRequired) {
    return (
      <PINSetupScreen
        onComplete={() => {
          setPinSetupRequired(false);
          // Continue to main app
        }}
      />
    );
  }

  // ... rest of auth screen
};
```

## 4. Cleanup on Logout

**File: `src/modules/auth/hooks/useAuth.ts`** (or equivalent)

```typescript
import { pinService } from "@/shared/services/security/pinService";
import { useAppLockStore } from "@/core/store";

export const useAuth = () => {
  const logout = async () => {
    try {
      // Clear all app lock data
      await pinService.clearAppLockData();
      useAppLockStore.getState().resetAppLock();

      // ... rest of logout logic (clear auth tokens, etc.)
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { logout /* ... other auth methods */ };
};
```

## 5. Enable/Disable App Lock from Settings

```typescript
import { pinService } from "@/shared/services/security/pinService";
import { useAppLockStore } from "@/core/store";

const handleToggleAppLock = async (enabled: boolean) => {
  try {
    if (enabled) {
      // Show PIN setup if not already done
      const isPinSet = await pinService.isPinSetUp();
      if (!isPinSet) {
        // Trigger PIN setup
        useAppLockStore.getState().setPinSetupRequired(true);
      }
    } else {
      // Disable app lock - clear all data
      await pinService.clearAppLockData();
      useAppLockStore.getState().resetAppLock();
    }
  } catch (error) {
    console.error("Error toggling app lock:", error);
  }
};
```

## File Structure Created

```
src/
├── core/
│   ├── config/index.ts (Updated with APP_LOCK config)
│   └── store/
│       ├── index.tsx (Updated with useAppLockStore export)
│       └── slices/
│           └── appLockSlice.ts (NEW)
├── modules/
│   └── auth/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useAppLock.ts (NEW)
│       └── screens/
│           ├── AuthScreen.tsx
│           ├── LockScreen.tsx (NEW)
│           └── PINSetupScreen.tsx (NEW)
└── shared/
    └── services/
        └── security/
            ├── pinService.ts (NEW)
            └── biometricService.ts (NEW)
```

## Configuration Updated

**File: `src/core/config/index.ts`**

Added:

```typescript
APP_LOCK: {
  PIN_LENGTH: 6,
  MAX_ATTEMPTS: 3,
  COOLDOWN_SECONDS: 30,
  LOCK_TIMEOUT_MS: 0,
},

STORAGE_KEYS: {
  PIN_HASH: 'haritage.pin_hash',
  PIN_SETUP_REQUIRED: 'haritage.pin_setup_required',
  APP_LOCK_ENABLED: 'haritage.app_lock_enabled',
  BIOMETRIC_ENABLED: 'haritage.biometric_enabled',
},
```

## API Reference

### useAppLockStore

```typescript
const {
  // State
  isLocked,
  pinSetupRequired,
  pinHash,
  isBiometricEnabled,
  failedAttempts,
  cooldownUntil,
  lastAuthTimestamp,

  // Actions
  setLocked,
  setPinSetupRequired,
  setPinHash,
  setBiometricEnabled,
  incrementFailedAttempts,
  resetFailedAttempts,
  setCooldown,
  setLastAuthTimestamp,
  resetAppLock,
} = useAppLockStore();
```

### pinService

```typescript
// Hashing
await pinService.hashPin(pin: string): Promise<string>

// Validation
pinService.validatePinFormat(pin: string): boolean

// Storage
await pinService.storePinHash(hash: string): Promise<void>
await pinService.getPinHash(): Promise<string | null>

// Verification
await pinService.verifyPin(pin: string): Promise<boolean>

// Management
await pinService.deletePinHash(): Promise<void>
await pinService.isPinSetUp(): Promise<boolean>
await pinService.setBiometricEnabled(enabled: boolean): Promise<void>
await pinService.isBiometricEnabled(): Promise<boolean>
await pinService.clearAppLockData(): Promise<void>
```

### biometricService

```typescript
// Availability
await biometricService.isBiometricAvailable(): Promise<boolean>
await biometricService.getAvailableBiometrics(): Promise<AuthenticationType[]>

// Authentication
await biometricService.authenticate(): Promise<boolean>

// Display
await biometricService.getBiometricTypeName(): Promise<string>
```

### useAppLock Hook

```typescript
const { isLocked, lastAuthTimestamp } = useAppLock();
```

## Testing the Feature

### Test PIN Creation

1. Launch app after login
2. PIN setup screen appears
3. Enter 6 digits
4. Confirm button shows
5. Click Next
6. Re-enter same 6 digits
7. Biometric screen appears (or complete if not available)

### Test Biometric

1. On biometric screen, click "Enable [Face ID/Touch ID]"
2. Biometric prompt should appear
3. Complete biometric authentication
4. Setup completes

### Test Lock/Unlock

1. App is now in main view
2. Press home button (background app)
3. Return to app
4. Lock screen appears with PIN keypad
5. Enter PIN
6. Unlock successful, back to main view

### Test Failed Attempts

1. Lock screen shown
2. Enter wrong PIN (different from setup)
3. Error appears
4. Repeat 2 more times
5. After 3 failures, cooldown timer shown for 30 seconds
6. Try again after 30 seconds

### Test Biometric Unlock

1. Lock screen shown
2. If biometric enabled, button shows "Unlock with Face ID" etc
3. Click button or wait (auto-triggers)
4. Complete biometric
5. Unlock successful

## Troubleshooting

### PIN Setup Screen Not Showing

- Check `pinSetupRequired` is true after login
- Verify PINSetupScreen component is imported correctly
- Check navigation/routing logic

### Lock Screen Not Showing

- Verify `useAppLock()` hook is called in root layout
- Check `isLocked` state in store
- Ensure LockScreen is rendered when `isLocked` is true

### Biometric Not Working

- Verify device has biometric hardware
- Check biometric is enrolled in device settings
- Test `biometricService.isBiometricAvailable()` returns true
- Check permissions (Face ID, Fingerprint) in app settings

### PIN Not Persisting

- Verify SecureStore is working (test with other apps)
- Check app storage permissions (Android)
- Verify `pinService.storePinHash()` succeeds

### Cooldown Not Working

- Verify `CONFIG.APP_LOCK.MAX_ATTEMPTS` is set to 3
- Check `CONFIG.APP_LOCK.COOLDOWN_SECONDS` is set to 30
- Ensure cooldown timer continues during app use

## Performance Tips

- Lock screen renders efficiently with minimal dependencies
- Biometric runs off main thread (native)
- PIN hashing is fast (~10-50ms for SHA-256)
- No blocking operations in app lock logic
- AppState listener properly cleaned up

## Security Best Practices

✅ Never log PIN values
✅ Use SHA-256 hashing (not MD5 or plaintext)
✅ Store hash in SecureStore only
✅ Implement attempt limiting and cooldowns
✅ Clear data on logout
✅ Use platform biometric APIs correctly
✅ Validate all user input
✅ Implement proper error handling

## Next Steps

After integration, consider:

1. Add app lock toggle to Settings screen
2. Add "Change PIN" functionality
3. Add "Reset PIN via Email" recovery option
4. Log security events for suspicious activity
5. Add analytics for adoption metrics
6. Test on real iOS and Android devices
