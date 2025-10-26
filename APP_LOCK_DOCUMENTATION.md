# App Lock System - PIN + Biometric Authentication

Comprehensive security feature that locks the app on reopen with biometric unlock support.

## Overview

The App Lock System provides multi-layered security for Haritage with:

- 6-digit numeric PIN with SHA-256 hashing
- Biometric unlock support (Face ID, Touch ID, Android Fingerprint)
- Automatic lock on app background/foreground transitions
- Failed attempt tracking with 30-second cooldown
- Secure storage using platform Keychain/Keystore

## Architecture

### Store (`appLockSlice.ts`)

Zustand store managing app lock state:

```typescript
- isLocked: boolean
- pinSetupRequired: boolean
- pinHash: string | null
- isBiometricEnabled: boolean
- failedAttempts: number
- cooldownUntil: number | null
- lastAuthTimestamp: number | null
```

### Services

#### PIN Service (`pinService.ts`)

- `hashPin()` - SHA-256 hashing
- `validatePinFormat()` - Numeric regex validation
- `storePinHash()` - Secure storage via SecureStore
- `verifyPin()` - Compare against stored hash
- `deletePinHash()` - Cleanup on logout
- `isBiometricEnabled()` / `setBiometricEnabled()` - Preference management
- `clearAppLockData()` - Complete data cleanup

#### Biometric Service (`biometricService.ts`)

- `isBiometricAvailable()` - Check hardware + enrollment
- `getAvailableBiometrics()` - Get supported types
- `authenticate()` - Trigger biometric authentication
- `getBiometricTypeName()` - For UI display (Face ID, Touch ID, etc.)

### Hooks

#### useAppLock (`useAppLock.ts`)

Monitors AppState changes and automatically locks the app:

- Detects background → foreground transition
- Triggers lock if PIN is set up
- Configurable lock timeout (default: immediate)
- Tracks last authentication timestamp

### Components

#### LockScreen (`LockScreen.tsx`)

PIN entry screen with custom numeric keypad:

- 6 dots showing PIN progress
- 3×3 numeric keypad + 0, backspace, clear
- Biometric unlock button (auto-triggers on load if enabled)
- Failed attempt tracking with 30-second cooldown
- Visual feedback and error messages
- Vibration on incorrect PIN

**Props:**

```typescript
interface LockScreenProps {
  onUnlock: () => void; // Called when user unlocks
}
```

**Features:**

- Auto-verify when 6 digits entered
- 3 failed attempts trigger 30-second cooldown
- Biometric fallback with graceful error handling
- Accessible with proper labels and roles

#### PINSetupScreen (`PINSetupScreen.tsx`)

Multi-step PIN setup flow:

**Step 1: Create PIN**

- Enter 6-digit PIN
- Visual feedback with dots
- "Skip for Now" option

**Step 2: Confirm PIN**

- Re-enter PIN to verify
- Mismatch error handling
- Vibration feedback on error

**Step 3: Biometric (if available)**

- "Enable [Face ID/Touch ID]" button
- "Use PIN Only" option
- Skip option

**Props:**

```typescript
interface PINSetupScreenProps {
  onComplete: () => void; // Called after setup completes
}
```

## Configuration

Add to `CONFIG` in `src/core/config/index.ts`:

```typescript
APP_LOCK: {
  PIN_LENGTH: 6,
  MAX_ATTEMPTS: 3,
  COOLDOWN_SECONDS: 30,
  LOCK_TIMEOUT_MS: 0, // Immediate lock
},

STORAGE_KEYS: {
  PIN_HASH: 'haritage.pin_hash',
  PIN_SETUP_REQUIRED: 'haritage.pin_setup_required',
  APP_LOCK_ENABLED: 'haritage.app_lock_enabled',
  BIOMETRIC_ENABLED: 'haritage.biometric_enabled',
},
```

## Usage

### 1. Initialize App Lock in App Layout

```typescript
// app/_layout.tsx
import { useAppLock } from "@/modules/auth/hooks/useAppLock";

export default function RootLayout() {
  useAppLock(); // Monitor app state changes
  // ... rest of layout
}
```

### 2. Show Lock Screen When Needed

```typescript
import { LockScreen } from "@/modules/auth/screens/LockScreen";
import { useAppLockStore } from "@/core/store";

export function MyComponent() {
  const { isLocked, setLocked } = useAppLockStore();

  if (isLocked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  return <YourContent />;
}
```

### 3. Show PIN Setup After First Login

```typescript
// After successful authentication
import { PINSetupScreen } from "@/modules/auth/screens/PINSetupScreen";
import { useAppLockStore } from "@/core/store";

const { pinSetupRequired } = useAppLockStore();

if (pinSetupRequired) {
  return (
    <PINSetupScreen
      onComplete={() => {
        // Continue to main app
      }}
    />
  );
}
```

### 4. Cleanup on Logout

```typescript
import { pinService } from "@/shared/services/security/pinService";
import { useAppLockStore } from "@/core/store";

const handleLogout = async () => {
  // Clear all app lock data
  await pinService.clearAppLockData();
  useAppLockStore.getState().resetAppLock();
  // ... proceed with logout
};
```

## Security Features

### PIN Storage

- **Never stored in plaintext**
- SHA-256 hashing applied
- Stored in platform Secure Enclave:
  - iOS: Keychain
  - Android: Keystore

### Input Validation

- Numeric-only regex: `/^\d{6}$/`
- Prevents injection attacks
- Length validation (exactly 6 digits)

### Session Management

- Timestamps track last authentication
- Configurable lock timeout
- Prevents stale session exploitation

### Attempt Limiting

- Max 3 failed attempts
- 30-second cooldown after max attempts
- Cooldown timer displayed to user
- Vibration feedback on errors

### Data Cleanup

- All PIN and biometric data cleared on logout
- No residual security data left behind
- Clean state for next user

## Flow Diagrams

### Login Flow

```
Login → Success → Show PIN Setup → Create PIN → Confirm →
Biometric Setup → Main App → useAppLock Hook Active
```

### Lock/Unlock Flow

```
App Background → Save Timestamp → App Foreground →
Check PIN Set Up → Lock App → Show LockScreen →
PIN/Biometric → Verify → Unlock → Main App
```

### Failed Attempts Flow

```
Attempt 1 (Fail) → Show Error → Attempt 2 (Fail) →
Show Error → Attempt 3 (Fail) → Cooldown 30s →
Locked Out → Countdown Timer → Re-enable
```

## Platform Support

### iOS

- ✅ Face ID (requires NSFaceIDUsageDescription in Info.plist)
- ✅ Touch ID
- ✅ Keychain storage
- ✅ Biometric type detection

### Android

- ✅ Fingerprint
- ✅ Biometric (newer devices)
- ✅ Keystore storage
- ✅ Graceful fallback

## Testing

### Manual Testing Checklist

- [ ] PIN creation flow works end-to-end
- [ ] PIN confirmation validates correctly
- [ ] Biometric setup shows when available
- [ ] Biometric unlock triggers on lock screen open
- [ ] Failed attempt counter increments
- [ ] 30-second cooldown activates after 3 failures
- [ ] App locks when returning from background
- [ ] Unlock proceeds to main app
- [ ] Logout clears all PIN/biometric data
- [ ] Skip option works during setup
- [ ] Clear button clears current entry

### Unit Testing Examples

```typescript
// Test PIN validation
expect(pinService.validatePinFormat("123456")).toBe(true);
expect(pinService.validatePinFormat("12345")).toBe(false);
expect(pinService.validatePinFormat("12345a")).toBe(false);

// Test hashing
const pin = "123456";
const hash1 = await pinService.hashPin(pin);
const hash2 = await pinService.hashPin(pin);
expect(hash1).toBe(hash2); // Same hash for same input

// Test verification
await pinService.storePinHash(hash1);
expect(await pinService.verifyPin("123456")).toBe(true);
expect(await pinService.verifyPin("654321")).toBe(false);
```

## Troubleshooting

### Biometric Not Showing

- Check device has biometric hardware
- Check biometric is enrolled in device settings
- Verify biometric permission granted in app settings

### PIN Not Persisting

- Check SecureStore availability
- Verify storage permissions on Android
- Check app hasn't been force-closed/cleared

### Cooldown Not Triggering

- Verify `CONFIG.APP_LOCK.MAX_ATTEMPTS` is 3
- Check `CONFIG.APP_LOCK.COOLDOWN_SECONDS` is set to 30
- Ensure cooldown timer interval is running

## Performance Considerations

- Lock screen renders efficiently with minimal dependencies
- Biometric authentication runs off main thread
- PIN hashing uses native crypto (Crypto module)
- AppState listener cleaned up on unmount
- No background processes when app locked

## Future Enhancements

- [ ] Pattern unlock option
- [ ] Configurable PIN length
- [ ] Fingerprint spoofing detection
- [ ] Suspicious activity alerts
- [ ] Account recovery via email/phone
- [ ] Device binding (lock to specific device)
- [ ] PIN history to prevent reuse
