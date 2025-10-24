// Store exports
// Store provider component
import React from 'react';
import { useAuthStore } from './slices/authSlice';
import { useFeedStore } from './slices/feedSlice';
import { useLockStore } from './slices/lockSlice';
import { useNotificationStore } from './slices/notificationSlice';

export { useAuthStore } from './slices/authSlice';
export { useFeedStore } from './slices/feedSlice';
export { useLockStore } from './slices/lockSlice';
export { useNotificationStore } from './slices/notificationSlice';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize stores
  useAuthStore();
  useFeedStore();
  useLockStore();
  useNotificationStore();
  
  return <>{children}</>;
};
