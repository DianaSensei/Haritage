import { create } from 'zustand';

interface AppLockState {
  // Lock state
  isLocked: boolean;
  pinSetupRequired: boolean;
  suppressLockUntil: number | null;
  
  // PIN management
  pinHash: string | null;
  isBiometricEnabled: boolean;
  
  // Attempt tracking
  failedAttempts: number;
  cooldownUntil: number | null;
  lastAuthTimestamp: number | null;
  
  // Actions
  setLocked: (locked: boolean) => void;
  setPinSetupRequired: (required: boolean) => void;
  setPinHash: (hash: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  setCooldown: (until: number | null) => void;
  setLastAuthTimestamp: (timestamp: number) => void;
  suppressNextLock: (durationMs?: number) => void;
  clearSuppressLock: () => void;
  resetAppLock: () => void;
}

export const useAppLockStore = create<AppLockState>((set) => ({
  // Initial state
  isLocked: false,
  pinSetupRequired: true,
  suppressLockUntil: null,
  pinHash: null,
  isBiometricEnabled: false,
  failedAttempts: 0,
  cooldownUntil: null,
  lastAuthTimestamp: null,

  // Actions
  setLocked: (locked: boolean) => set({ isLocked: locked }),
  
  setPinSetupRequired: (required: boolean) => set({ pinSetupRequired: required }),
  
  setPinHash: (hash: string | null) => set({ pinHash: hash }),
  
  setBiometricEnabled: (enabled: boolean) => set({ isBiometricEnabled: enabled }),
  
  incrementFailedAttempts: () =>
    set((state) => ({
      failedAttempts: state.failedAttempts + 1,
    })),
  
  resetFailedAttempts: () => set({ failedAttempts: 0 }),
  
  setCooldown: (until: number | null) => set({ cooldownUntil: until }),
  
  setLastAuthTimestamp: (timestamp: number) =>
    set({ lastAuthTimestamp: timestamp }),

  suppressNextLock: (durationMs = 1500) =>
    set({ suppressLockUntil: Date.now() + durationMs }),

  clearSuppressLock: () => set({ suppressLockUntil: null }),
  
  resetAppLock: () =>
    set({
      isLocked: false,
      pinSetupRequired: true,
      suppressLockUntil: null,
      pinHash: null,
      isBiometricEnabled: false,
      failedAttempts: 0,
      cooldownUntil: null,
      lastAuthTimestamp: null,
    }),
}));
