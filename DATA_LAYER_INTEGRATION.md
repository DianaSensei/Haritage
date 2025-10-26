# Data Layer Integration Guide - Quick Start

Step-by-step guide to integrate the new data layer into existing components.

## 1. Initialize Mock Store in App

### File: `app/_layout.tsx`

Add store initialization to your root layout:

```typescript
import { useMockStoreInitialization } from '@/shared/data';

export default function RootLayout() {
  const { initialized, error } = useMockStoreInitialization();

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    // ... existing layout
  );
}
```

## 2. Refactor HomeScreen

### File: `src/modules/home/screens/HomeScreen.tsx`

#### Before:

```typescript
import { FlatList, View } from "react-native";
import { useState, useEffect } from "react";

export const HomeScreen: React.FC = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded mock data
    const mockData = [
      {
        id: "1",
        title: "Golden Hour",
        type: "image",
        likes: 124,
        saved: false,
      },
    ];
    setFeedItems(mockData);
    setLoading(false);
  }, []);

  return (
    <FlatList
      data={feedItems}
      renderItem={({ item }) => <FeedItem item={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};
```

#### After:

```typescript
import { FlatList, View } from "react-native";
import { useFeedItems } from "@/shared/data";
import { FeedItem } from "../components/FeedItem";

export const HomeScreen: React.FC = () => {
  const {
    data: response,
    loading,
    error,
    refetch,
  } = useFeedItems({ page: 1, limit: 10 });

  const feedItems = response?.data ?? [];

  if (loading && feedItems.length === 0) {
    return <LoadingScreen />;
  }

  if (error && feedItems.length === 0) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  return (
    <FlatList
      data={feedItems}
      renderItem={({ item }) => <FeedItem item={item} />}
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        // TODO: Implement pagination
      }}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyFeed />}
    />
  );
};
```

## 3. Update FeedItem Component

### File: `src/modules/feed/components/FeedItem.tsx`

#### Before:

```typescript
interface Props {
  item: FeedItem;
}

export const FeedItem: React.FC<Props> = ({ item }) => {
  const [liked, setLiked] = useState(item.liked);

  const handleLike = () => {
    // Just toggle UI, no persistence
    setLiked(!liked);
  };

  return (
    <TouchableOpacity onPress={handleLike}>
      <Icon name={liked ? "heart-filled" : "heart"} />
    </TouchableOpacity>
  );
};
```

#### After:

```typescript
interface Props {
  item: FeedItem;
}

export const FeedItem: React.FC<Props> = ({ item }) => {
  const { like, loading: liking } = useLikeFeedItem(item.id);
  const { save, loading: saving } = useSaveFeedItem(item.id);

  const handleLike = async () => {
    await like();
    // UI automatically updates via hook
  };

  const handleSave = async () => {
    await save();
    // UI automatically updates via hook
  };

  return (
    <View>
      <TouchableOpacity onPress={handleLike} disabled={liking}>
        <Icon name={item.liked ? "heart-filled" : "heart"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} disabled={saving}>
        <Icon name={item.saved ? "bookmark-filled" : "bookmark"} />
      </TouchableOpacity>
    </View>
  );
};
```

**Important**: Add import at the top:

```typescript
import { useLikeFeedItem, useSaveFeedItem } from "@/shared/data";
```

## 4. Update AuthScreen

### File: `src/modules/auth/screens/AuthScreen.tsx`

#### Login Form Integration:

```typescript
import { useLoginWithPhone, useVerifyOTP } from "@/shared/data";
import { useAppLock } from "@/modules/auth/hooks/useAppLock";

export const AuthScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const {
    login,
    loading: loginLoading,
    error: loginError,
  } = useLoginWithPhone(phoneNumber);
  const { verify, loading: verifyLoading, error: verifyError } = useVerifyOTP();
  const { setupAppLock } = useAppLock();

  const handlePhoneSubmit = async () => {
    try {
      await login();
      setStep("otp");
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleOtpSubmit = async () => {
    try {
      const result = await verify(phoneNumber, otp);

      // Show PIN setup if first login
      if (result.data) {
        setupAppLock(); // Trigger PIN setup
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <View>
      {step === "phone" ? (
        <>
          <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />
          <Button
            onPress={handlePhoneSubmit}
            loading={loginLoading}
            disabled={!phoneNumber}
          >
            Send OTP
          </Button>
          {loginError && <ErrorText>{loginError}</ErrorText>}
        </>
      ) : (
        <>
          <OTPInput value={otp} onChangeText={setOtp} />
          <Button
            onPress={handleOtpSubmit}
            loading={verifyLoading}
            disabled={otp.length < 6}
          >
            Verify
          </Button>
          {verifyError && <ErrorText>{verifyError}</ErrorText>}
        </>
      )}
    </View>
  );
};
```

## 5. Update NotificationCenter

### File: `src/modules/notifications/components/NotificationCenter.tsx`

#### Before:

```typescript
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const mockNotifications = [{ id: "1", title: "Welcome", read: false }];
    setNotifications(mockNotifications);
  }, []);

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => <NotificationItem item={item} />}
    />
  );
};
```

#### After:

```typescript
import { useNotifications, useMarkNotificationAsRead } from "@/shared/data";

export const NotificationCenter: React.FC = () => {
  const {
    data: response,
    loading,
    error,
    refetch,
  } = useNotifications({ page: 1, limit: 20 });

  const { mark } = useMarkNotificationAsRead();

  const notifications = response?.data ?? [];

  const handleMarkAsRead = async (notificationId: string) => {
    await mark(notificationId);
  };

  if (loading && notifications.length === 0) {
    return <LoadingScreen />;
  }

  if (error && notifications.length === 0) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem
          item={item}
          onMarkAsRead={() => handleMarkAsRead(item.id)}
        />
      )}
      refreshing={loading}
      onRefresh={refetch}
    />
  );
};
```

## 6. Update Account/Profile Screen

### File: `src/modules/account/screens/AccountScreen.tsx`

```typescript
import { useCurrentUser, useLogout } from "@/shared/data";

export const AccountScreen: React.FC = () => {
  const { data: currentUser, loading, error } = useCurrentUser();
  const { logout, loading: loggingOut } = useLogout();

  const handleLogout = async () => {
    await logout();
    // Navigation handled by auth store
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <View>
      <UserInfo user={currentUser} />
      <Button onPress={handleLogout} loading={loggingOut}>
        Logout
      </Button>
    </View>
  );
};
```

## 7. Data Layer Configuration

### Optional: Configure Data Source at App Startup

File: `app/index.tsx` or `app/_layout.tsx`

```typescript
import { getDataService, DataSourceType } from "@/shared/data";

// Set at app initialization
const isDevelopment = process.env.NODE_ENV === "development";
const dataSourceType = isDevelopment ? DataSourceType.MOCK : DataSourceType.API;

getDataService().switchDataSource(dataSourceType);
```

## 8. Adding New Components Using Data Layer

### Template for New Components:

```typescript
import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useFeedItems } from "@/shared/data"; // Import hook
import { FeedItem } from "./FeedItem";
import { LoadingScreen } from "../screens/LoadingScreen";
import { ErrorScreen } from "../screens/ErrorScreen";

interface Props {
  category?: string;
}

export const FeedList: React.FC<Props> = ({ category }) => {
  // Use data layer hook
  const {
    data: response,
    loading,
    error,
    refetch,
  } = useFeedItems({
    page: 1,
    limit: 10,
    search: category,
  });

  const feedItems = response?.data ?? [];

  // Handle loading state
  if (loading && feedItems.length === 0) {
    return <LoadingScreen />;
  }

  // Handle error state
  if (error && feedItems.length === 0) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  // Render
  return (
    <FlatList
      data={feedItems}
      renderItem={({ item }) => <FeedItem item={item} />}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={refetch}
      ListEmptyComponent={<EmptyState />}
    />
  );
};
```

## 9. Testing with Mock Data

### Using Mock Store in Tests:

```typescript
import { mockStore } from "@/shared/data";

describe("HomeScreen", () => {
  beforeEach(async () => {
    // Reset mock data before each test
    await mockStore.reset();
    await mockStore.initialize();
  });

  it("should display feed items", async () => {
    const { getByTestId } = render(<HomeScreen />);

    // Wait for data to load
    await waitFor(() => {
      const feedList = getByTestId("feed-list");
      expect(feedList.props.data.length).toBeGreaterThan(0);
    });
  });

  it("should like feed item", async () => {
    // Modify mock data
    const feedItems = mockStore.getFeedItems();
    const initialLikes = feedItems[0].likes;

    // Trigger like
    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId("like-btn"));

    // Verify mock data updated
    await waitFor(() => {
      const updatedFeedItems = mockStore.getFeedItems();
      expect(updatedFeedItems[0].likes).toBe(initialLikes + 1);
    });
  });
});
```

## 10. Debugging

### Inspect Mock Data:

```typescript
import { mockStore } from "@/shared/data";

// Log all users
console.log("Users:", mockStore.getUsers());

// Log all feed items
console.log("Feed:", mockStore.getFeedItems());

// Log all notifications
console.log("Notifications:", mockStore.getNotifications());

// Log current user
console.log("Current User ID:", mockStore.getCurrentUserId());
```

### Check Data Service Status:

```typescript
import { getDataService } from "@/shared/data";

const service = getDataService();
console.log("Current Data Source:", service.dataSourceType); // 'mock' or 'api'
console.log("Repositories:", service.getRepository()); // All available repositories
```

## Checklist

- [ ] Install mock store initialization in app root
- [ ] Refactor HomeScreen to use `useFeedItems`
- [ ] Update FeedItem component with `useLikeFeedItem`, `useSaveFeedItem`
- [ ] Update AuthScreen with `useLoginWithPhone`, `useVerifyOTP`
- [ ] Update NotificationCenter with `useNotifications`, `useMarkNotificationAsRead`
- [ ] Update AccountScreen with `useCurrentUser`, `useLogout`
- [ ] Remove hardcoded mock data from all components
- [ ] Test all flows with mock data
- [ ] Run `yarn lint` to verify no errors
- [ ] Test on iOS and Android simulators

## Common Issues & Solutions

### Issue: "Hook called multiple times with different arguments"

**Solution**: Ensure hook dependencies are stable and don't change between renders.

```typescript
// ❌ Wrong - creates new object every render
const { data } = useFeedItems({ page: 1, limit: 10 });

// ✅ Right - use useMemo for objects
const options = useMemo(() => ({ page: 1, limit: 10 }), []);
const { data } = useFeedItems(options);
```

### Issue: "Cannot read property 'data' of undefined"

**Solution**: Always check if response exists before accessing.

```typescript
// ❌ Wrong
const feedItems = response.data;

// ✅ Right
const feedItems = response?.data ?? [];
```

### Issue: "Mock data not persisting"

**Solution**: Ensure `mockStore.initialize()` is called before components render.

```typescript
// In root layout
const { initialized } = useMockStoreInitialization();

if (!initialized) {
  return <LoadingScreen />;
}

return <App />;
```

## Next Steps

1. ✅ Complete the integration steps above
2. ⏳ Implement API repositories when backend is ready
3. ⏳ Add API integration tests
4. ⏳ Add caching layer for performance
5. ⏳ Add offline sync capability

## Need Help?

Refer to:

- `DATA_LAYER_DOCUMENTATION.md` - Complete architecture guide
- `src/shared/data/index.ts` - All available exports
- `src/shared/data/hooks/useData.ts` - Hook implementations
