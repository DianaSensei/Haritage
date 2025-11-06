// Store exports
// Store provider component
import React from 'react';
import { useAppLockStore } from './slices/appLockSlice';
import { useAuthStore } from './slices/authSlice';
import { useBookingStore } from './slices/bookingSlice';
import { useCartStore } from './slices/cartSlice';
import { useCommentStore } from './slices/commentSlice';
import { useFeedStore } from './slices/feedSlice';
import { useLanguageStore } from './slices/languageSlice';
import { useNotificationStore } from './slices/notificationSlice';
import { useThemeStore } from './slices/themeSlice';

export { useAppLockStore } from './slices/appLockSlice';
export { useAuthStore } from './slices/authSlice';
export { useBookingStore } from './slices/bookingSlice';
export { useCartStore } from './slices/cartSlice';
export { useCommentStore } from './slices/commentSlice';
export { useFeedStore } from './slices/feedSlice';
export { useLanguageStore } from './slices/languageSlice';
export { useNotificationStore } from './slices/notificationSlice';
export { useThemeStore } from './slices/themeSlice';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize stores
  useAuthStore();
  useAppLockStore();
  useFeedStore();
  useNotificationStore();
  useCommentStore();
  useThemeStore();
  useLanguageStore();
  useCartStore();
  useBookingStore();
  
  return <>{children}</>;
};
