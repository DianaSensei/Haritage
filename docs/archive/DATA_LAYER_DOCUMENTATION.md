# Data Layer Architecture - Haritage

Comprehensive data layer architecture for clean separation of concerns, single responsibility, reusability, and simplicity.

## Overview

The data layer provides:

- ✅ **Clean Separation**: UI components don't know about data sources
- ✅ **Single Responsibility**: Each class has one reason to change
- ✅ **Easy Testing**: Mock repository for testing without API
- ✅ **Runtime Switching**: Switch between mock and API implementations
- ✅ **Local Development**: Built-in mock data with persistence
- ✅ **Reusable Hooks**: React hooks for easy component integration
- ✅ **Type Safe**: Full TypeScript support

## Architecture Layers

```
┌─────────────────────────────────────┐
│      UI Components & Screens        │
│  (Use hooks from data layer)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Data Hooks (useData.ts)         │
│  (useCurrentUser, useFeedItems...)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Service Factory              │
│  (getDataService, getRepository)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Repository Implementations         │
│  ├─ MockDataRepository              │
│  ├─ MockUserRepository              │
│  ├─ MockFeedRepository              │
│  └─ MockNotificationRepository      │
│  (Future: ApiDataRepository)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Store                        │
│  ├─ MockDataStore (Memory)          │
│  └─ AsyncStorage (Persistence)      │
└─────────────────────────────────────┘
```

## File Structure

```
src/shared/data/
├── index.ts                          # Main exports
├── dataService.ts                    # Data service factory
├── repositories/
│   ├── IRepository.ts               # Repository interfaces
│   └── MockRepository.ts            # Mock implementations
├── stores/
│   └── mockDataStore.ts             # Mock data store
└── hooks/
    └── useData.ts                   # React hooks
```

## Repository Interfaces

### IUserRepository

```typescript
interface IUserRepository {
  // Read
  getUserById(id: string): Promise<RepositoryResult<User>>;
  getCurrentUser(): Promise<RepositoryResult<User>>;
  getUsers(
    options?: QueryOptions
  ): Promise<RepositoryResult<PaginatedResponse<User>>>;

  // Write
  createUser(userData: Partial<User>): Promise<RepositoryResult<User>>;
  updateUser(
    id: string,
    userData: Partial<User>
  ): Promise<RepositoryResult<User>>;
  deleteUser(id: string): Promise<RepositoryResult<void>>;

  // Auth
  loginWithPhone(phoneNumber: string): Promise<RepositoryResult<User>>;
  verifyOTP(phoneNumber: string, otp: string): Promise<RepositoryResult<User>>;
  logout(): Promise<RepositoryResult<void>>;
}
```

### IFeedRepository

```typescript
interface IFeedRepository {
  // Read
  getFeedItems(
    options?: QueryOptions
  ): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;
  getFeedItemById(id: string): Promise<RepositoryResult<FeedItem>>;
  getUserFeedItems(
    userId: string,
    options?: QueryOptions
  ): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;
  getTrendingFeedItems(
    options?: QueryOptions
  ): Promise<RepositoryResult<PaginatedResponse<FeedItem>>>;

  // Write
  createFeedItem(
    item: Omit<FeedItem, "id" | "createdAt">
  ): Promise<RepositoryResult<FeedItem>>;
  updateFeedItem(
    id: string,
    item: Partial<FeedItem>
  ): Promise<RepositoryResult<FeedItem>>;
  deleteFeedItem(id: string): Promise<RepositoryResult<void>>;

  // Interactions
  likeFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  unlikeFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  saveFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
  unsaveFeedItem(id: string): Promise<RepositoryResult<FeedItem>>;
}
```

### INotificationRepository

```typescript
interface INotificationRepository {
  // Read
  getNotifications(
    options?: QueryOptions
  ): Promise<RepositoryResult<PaginatedResponse<Notification>>>;
  getUnreadNotifications(): Promise<RepositoryResult<Notification[]>>;
  getNotificationById(id: string): Promise<RepositoryResult<Notification>>;

  // Write
  createNotification(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<RepositoryResult<Notification>>;
  markNotificationAsRead(id: string): Promise<RepositoryResult<Notification>>;
  markAllNotificationsAsRead(): Promise<RepositoryResult<void>>;
  deleteNotification(id: string): Promise<RepositoryResult<void>>;
}
```

## Data Service Factory

### Initialize with Default (Mock)

```typescript
import { getDataService, getRepository } from "@/shared/data";

// Get service instance
const dataService = getDataService();

// Get repositories
const userRepo = dataService.getRepository().user;
const feedRepo = dataService.getRepository().feed;
const notificationRepo = dataService.getRepository().notification;
```

### Switch Data Source at Runtime

```typescript
import { getDataService, DataSourceType } from "@/shared/data";

// Switch to API (when implemented)
getDataService().switchDataSource(DataSourceType.API);

// Switch back to mock
getDataService().switchDataSource(DataSourceType.MOCK);
```

### Convenience Functions

```typescript
import {
  userRepository,
  feedRepository,
  notificationRepository,
} from "@/shared/data";

// Direct access to repositories
const users = await userRepository().getUsers();
const feedItems = await feedRepository().getFeedItems();
const notifications = await notificationRepository().getNotifications();
```

## React Hooks

### User Hooks

```typescript
// Get current logged-in user
const { data: user, loading, error, refetch } = useCurrentUser();

// Get specific user
const { data: user } = useUser(userId);

// Get list of users with pagination
const { data: response } = useUsers({ page: 1, limit: 10 });

// Login with phone
const { login, loading, error } = useLoginWithPhone(phoneNumber);
await login();

// Verify OTP
const { verify, loading, error } = useVerifyOTP();
await verify(phoneNumber, otp);

// Logout
const { logout, loading, error } = useLogout();
await logout();
```

### Feed Hooks

```typescript
// Get feed items
const { data: response, loading, error, refetch } = useFeedItems({ page: 1, limit: 10 });

// Get specific feed item
const { data: feedItem } = useFeedItem(feedId);

// Get user's feed items
const { data: response } = useUserFeedItems(userId, { page: 1 });

// Get trending items
const { data: response } = useTrendingFeedItems({ page: 1 });

// Create new feed item
const { create, loading, error } = useCreateFeedItem();
await create({ type: 'image', content: '...', author: {...} });

// Like feed item
const { like, loading, error } = useLikeFeedItem(feedItemId);
await like();

// Save feed item
const { save, loading, error } = useSaveFeedItem(feedItemId);
await save();
```

### Notification Hooks

```typescript
// Get notifications
const {
  data: response,
  loading,
  error,
  refetch,
} = useNotifications({ page: 1 });

// Get unread notifications
const { data: unreadNotifications } = useUnreadNotifications();

// Mark as read
const { mark, loading, error } = useMarkNotificationAsRead(notificationId);
await mark();
```

### Store Initialization

```typescript
// Initialize mock store from AsyncStorage
const { initialized, error } = useMockStoreInitialization();

if (!initialized) {
  return <LoadingScreen />;
}

return <App />;
```

## Component Integration Example

### Before (Hardcoded Data)

```tsx
export const HomeScreen: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Hardcoded mock data - not reusable
    const mockData = [
      { id: '1', type: 'image', title: '...', ... },
      { id: '2', type: 'video', title: '...', ... },
    ];
    setFeedItems(mockData);
  }, []);

  return (
    <FlatList
      data={feedItems}
      renderItem={({item}) => <FeedItem item={item} />}
    />
  );
};
```

### After (Using Data Layer)

```tsx
import { useFeedItems } from "@/shared/data";

export const HomeScreen: React.FC = () => {
  const {
    data: response,
    loading,
    error,
    refetch,
  } = useFeedItems({
    page: 1,
    limit: 10,
  });

  const feedItems = response?.data ?? [];

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <FlatList
      data={feedItems}
      renderItem={({ item }) => <FeedItem item={item} />}
      onEndReached={() => {
        /* fetch next page */
      }}
      refreshing={loading}
      onRefresh={refetch}
    />
  );
};
```

## Mock Data Store

### Features

- In-memory storage for development
- Persists to AsyncStorage automatically
- All CRUD operations
- Easy data reset for testing

### Usage

```typescript
import { mockStore } from "@/shared/data";

// Initialize from AsyncStorage
await mockStore.initialize();

// Get data
const users = mockStore.getUsers();
const feedItems = mockStore.getFeedItems();

// Modify data
mockStore.addUser(newUser);
mockStore.updateFeedItem(feedId, { likes: 100 });
mockStore.deleteNotification(notificationId);

// Save to AsyncStorage
await mockStore.save();

// Reset to defaults
await mockStore.reset();
```

### Default Mock Data

The store comes with pre-populated data:

- 2 users (Sarah Johnson, Mike Chen)
- 1 sample feed item (Golden Hour photo)
- 1 notification (Welcome message)

## Best Practices

### ✅ DO

```typescript
// Use data layer hooks in components
const { data, loading, error } = useFeedItems();

// Pass repository methods as callbacks
const { like, loading } = useLikeFeedItem(feedId);
onLikePress={() => like()};

// Handle loading and error states
if (loading) return <Loader />;
if (error) return <Error message={error} />;

// Use refetch for manual refreshes
<TouchableOpacity onPress={refetch}>
  <Text>Refresh</Text>
</TouchableOpacity>
```

### ❌ DON'T

```typescript
// Don't hardcode mock data in components
const feedItems = [{id: '1', ...}, {id: '2', ...}];

// Don't call repository methods directly in components
import { userRepository } from '@/shared/data';
userRepository().getUsers(); // Use hook instead!

// Don't mix data source logic in UI
if (isOffline) {
  // fetch from mock
} else {
  // fetch from API
}
```

## Adding New Repository

### 1. Define Interface (IRepository.ts)

```typescript
export interface INewRepository {
  getItems(options?: QueryOptions): Promise<RepositoryResult<Item[]>>;
  createItem(item: Item): Promise<RepositoryResult<Item>>;
  updateItem(id: string, item: Partial<Item>): Promise<RepositoryResult<Item>>;
  deleteItem(id: string): Promise<RepositoryResult<void>>;
}
```

### 2. Implement Mock (MockRepository.ts)

```typescript
export class MockNewRepository implements INewRepository {
  async getItems(options?: QueryOptions) {
    try {
      let items = mockStore.getItems();
      // Apply filters, pagination, sorting
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  // ... implement other methods
}
```

### 3. Add to Data Repository (IRepository.ts & MockRepository.ts)

```typescript
export interface IDataRepository {
  user: IUserRepository;
  feed: IFeedRepository;
  notification: INotificationRepository;
  newEntity: INewRepository; // ADD THIS
}

export class MockDataRepository implements IDataRepository {
  user: IUserRepository;
  feed: IFeedRepository;
  notification: INotificationRepository;
  newEntity: INewRepository; // ADD THIS

  constructor() {
    this.user = new MockUserRepository();
    this.feed = new MockFeedRepository();
    this.notification = new MockNotificationRepository();
    this.newEntity = new MockNewRepository(); // ADD THIS
  }
}
```

### 4. Create Hook (useData.ts)

```typescript
export function useNewItems(options?: QueryOptions) {
  return useAsyncData(
    () => newEntityRepository().getItems(options),
    [options?.page]
  );
}
```

### 5. Add to Exports (index.ts)

```typescript
export function newEntityRepository() {
  return getRepository().newEntity;
}
```

## Switching to API Implementation

When ready to implement API:

### 1. Create API Repository (ApiRepository.ts)

```typescript
export class ApiUserRepository implements IUserRepository {
  async getUserById(id: string): Promise<RepositoryResult<User>> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  // ... implement other methods
}
```

### 2. Register in Factory (dataService.ts)

```typescript
private initializeRepository(): IDataRepository {
  switch (this.dataSourceType) {
    case DataSourceType.API:
      return new ApiDataRepository();
    case DataSourceType.MOCK:
    default:
      return new MockDataRepository();
  }
}
```

### 3. No Component Changes Needed!

All components continue to use the same hooks without modification.

## Development Workflow

1. **Local Development**: Use MOCK data source (default)
2. **Feature Development**: Implement features with mock data
3. **API Ready**: Switch to API data source
4. **Testing**: Easy to test with mock data
5. **Switch Anytime**: Runtime switching for debugging

```typescript
// In app initialization
import { getDataService, DataSourceType } from "@/shared/data";

const isDevelopment = process.env.NODE_ENV === "development";
getDataService().switchDataSource(
  isDevelopment ? DataSourceType.MOCK : DataSourceType.API
);
```

## Performance Considerations

- Mock data is cached in memory
- AsyncStorage persistence is async
- Hooks memoize fetch functions
- No unnecessary re-renders

## Future Enhancements

- [ ] API data repository implementation
- [ ] GraphQL support
- [ ] Request caching layer
- [ ] Offline sync queue
- [ ] Real-time updates with WebSocket
- [ ] Automatic retry logic
- [ ] Request deduplication
- [ ] Cache invalidation strategies
