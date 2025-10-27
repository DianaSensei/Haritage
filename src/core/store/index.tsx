// Store exports
// Store provider component
import React from 'react';
import { useAppLockStore } from './slices/appLockSlice';
import { useAuthStore } from './slices/authSlice';
import { useCommentStore } from './slices/commentSlice';
import { useFeedStore } from './slices/feedSlice';
import { useNotificationStore } from './slices/notificationSlice';

export { useAppLockStore } from './slices/appLockSlice';
export { useAuthStore } from './slices/authSlice';
export { useCommentStore } from './slices/commentSlice';
export { useFeedStore } from './slices/feedSlice';
export { useNotificationStore } from './slices/notificationSlice';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize stores
  useAuthStore();
  useAppLockStore();
  useFeedStore();
  useNotificationStore();
  useCommentStore();
  
  return <>{children}</>;
};
