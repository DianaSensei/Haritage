import { create } from 'zustand';

interface LockState {
  isLocked: boolean;
  needsPinSetup: boolean;
  setLocked: (locked: boolean) => void;
  setNeedsPinSetup: (needs: boolean) => void;
}

export const useLockStore = create<LockState>((set) => ({
  isLocked: false,
  needsPinSetup: false,
  setLocked: (locked) => set({ isLocked: locked }),
  setNeedsPinSetup: (needs) => set({ needsPinSetup: needs }),
}));
