# Integration Guide - User Feed Management Feature

This guide explains how to integrate the User Feed Management feature into the Haritage app.

## Files Created

### Core Components & Screens
- `src/modules/feed/components/ConfirmDialog.tsx` - Reusable confirmation dialog
- `src/modules/feed/components/FeedActionMenu.tsx` - Bottom sheet action menu
- `src/modules/feed/components/ManageableFeedItem.tsx` - Feed item with management actions
- `src/modules/feed/screens/MyFeedsScreen.tsx` - View all user posts
- `src/modules/feed/screens/EditFeedScreen.tsx` - Edit post screen

### Services & Data
- `src/modules/feed/services/userFeedService.ts` - Feed management operations
- `src/modules/feed/data/mockUserFeedData.ts` - Mock data samples

### Routes
- `app/my-feeds.tsx` - My Posts screen route
- `app/edit-feed.tsx` - Edit Post screen route

### Documentation
- `docs/USER_FEED_MANAGEMENT.md` - Complete feature documentation
- `docs/FEED_MANAGEMENT_WIREFRAMES.md` - Wireframes and design specs

## Integration Steps

### 1. Update Navigation

The routes are already created. To navigate to them, use Expo Router:

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to My Posts screen
router.push('/my-feeds');

// Navigate to Edit screen with post ID
router.push({
  pathname: '/edit-feed',
  params: { id: postId }
});
```

### 2. Add Entry Point in Account/Profile Screen

Add a button or menu item in the AccountScreen to navigate to My Posts:

```typescript
// In AccountScreen or similar
<TouchableOpacity
  onPress={() => router.push('/my-feeds')}
  style={styles.menuItem}
>
  <Ionicons name="document-text-outline" size={24} color="#e4e6eb" />
  <Text style={styles.menuText}>My Posts</Text>
  <Ionicons name="chevron-forward" size={20} color="#818384" />
</TouchableOpacity>
```

### 3. Update MyFeedsScreen Edit Navigation

In `MyFeedsScreen.tsx`, update the `handleEdit` function to navigate properly:

```typescript
const handleEdit = useCallback(
  (id: string) => {
    router.push({
      pathname: '/edit-feed',
      params: { id }
    });
  },
  [router],
);
```

### 4. Initialize Mock Data

The mock data is automatically loaded when the service is first used. To pre-seed data, you can call:

```typescript
import { mockStore } from '@/shared/data/stores/mockDataStore';
import { mockUserFeedItems } from '@/modules/feed/data/mockUserFeedData';

// In app initialization
await mockStore.initialize();

// Optional: Seed with mock data if empty
const items = mockStore.getFeedItems();
if (items.length === 0) {
  for (const item of mockUserFeedItems) {
    mockStore.addFeedItem(item);
  }
  await mockStore.save();
}
```

### 5. Add to Home Screen (Optional)

You can add a quick access button in the HomeScreen header:

```typescript
// In HomeScreen header
<TouchableOpacity
  onPress={() => router.push('/my-feeds')}
  style={styles.headerButton}
>
  <Ionicons name="person-circle-outline" size={28} color="#e4e6eb" />
</TouchableOpacity>
```

### 6. Update User Context

Ensure the current user ID is available. The mock implementation uses:

```typescript
export const MOCK_CURRENT_USER_ID = 'user1';
```

For production, this should come from your auth state:

```typescript
import { useAuthStore } from '@/core/store';

const MyComponent = () => {
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  
  // Use currentUserId instead of MOCK_CURRENT_USER_ID
};
```

## Usage Examples

### Viewing User Posts

```typescript
import { MyFeedsScreen } from '@/modules/feed/screens/MyFeedsScreen';

// Use as a route or component
<MyFeedsScreen />
```

### Editing a Post

```typescript
import { EditFeedScreen } from '@/modules/feed/screens/EditFeedScreen';

// Pass post ID via route params
router.push({
  pathname: '/edit-feed',
  params: { id: 'post-id-here' }
});
```

### Using ManageableFeedItem

```typescript
import { ManageableFeedItem } from '@/modules/feed/components/ManageableFeedItem';

<ManageableFeedItem
  item={feedItem}
  isActive={false}
  currentUserId={currentUserId}
  onLike={(id) => console.log('Like', id)}
  onComment={(id) => console.log('Comment', id)}
  onShare={(id) => console.log('Share', id)}
  onEdit={(id) => router.push({ pathname: '/edit-feed', params: { id } })}
  onHide={(id) => handleHide(id)}
  onUnhide={(id) => handleUnhide(id)}
  onDelete={(id) => handleDelete(id)}
/>
```

### Using Standalone Components

#### ConfirmDialog

```typescript
import { ConfirmDialog } from '@/modules/feed/components/ConfirmDialog';

const [showDialog, setShowDialog] = useState(false);

<ConfirmDialog
  visible={showDialog}
  title="Delete Item?"
  message="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  confirmColor="#e74c3c"
  icon="trash-outline"
  onConfirm={() => {
    setShowDialog(false);
    performDelete();
  }}
  onCancel={() => setShowDialog(false)}
/>
```

#### FeedActionMenu

```typescript
import { FeedActionMenu } from '@/modules/feed/components/FeedActionMenu';

const [showMenu, setShowMenu] = useState(false);

const actions = [
  { id: 'edit', label: 'Edit', icon: 'create-outline', color: '#0a66c2' },
  { id: 'delete', label: 'Delete', icon: 'trash-outline', color: '#e74c3c', destructive: true },
];

<FeedActionMenu
  visible={showMenu}
  actions={actions}
  onActionPress={(actionId) => {
    console.log('Action:', actionId);
  }}
  onClose={() => setShowMenu(false)}
/>
```

## Testing the Feature

### Manual Testing

1. **Navigate to My Posts**
   ```typescript
   router.push('/my-feeds');
   ```

2. **View Statistics**
   - Check that statistics show correct counts
   - Verify all posts are displayed

3. **Toggle Hidden Posts**
   - Click the filter toggle
   - Verify hidden posts appear/disappear

4. **Edit a Post**
   - Click the settings icon on a post
   - Select "Edit Post"
   - Modify content and save
   - Verify changes persist

5. **Hide a Post**
   - Click settings icon
   - Select "Hide Post"
   - Confirm in dialog
   - Verify post shows hidden badge

6. **Delete a Post**
   - Click settings icon
   - Select "Delete Post"
   - Confirm in dialog
   - Verify post is removed

### Automated Testing (Future)

```typescript
// Example test structure
describe('MyFeedsScreen', () => {
  it('should load user posts', async () => {
    // Test implementation
  });
  
  it('should edit post successfully', async () => {
    // Test implementation
  });
  
  it('should hide post with confirmation', async () => {
    // Test implementation
  });
  
  it('should delete post with confirmation', async () => {
    // Test implementation
  });
});
```

## API Integration (Future)

When connecting to a real backend, update the `userFeedService`:

```typescript
// Replace mock implementation with API calls
class UserFeedService {
  async getUserFeedItems(includeHidden = false): Promise<FeedItem[]> {
    const response = await fetch(`/api/users/me/posts?hidden=${includeHidden}`);
    return response.json();
  }

  async editFeedItem(params: EditFeedItemParams): Promise<FeedItem | null> {
    const response = await fetch(`/api/posts/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
    return response.json();
  }

  // ... other methods
}
```

## Configuration

Update `src/core/config/index.ts` to add feed management settings:

```typescript
export const CONFIG = {
  // ... existing config
  
  FEED_MANAGEMENT: {
    MAX_POLL_OPTIONS: 6,
    MIN_POLL_OPTIONS: 2,
    MAX_TITLE_LENGTH: 100,
    MAX_CONTENT_LENGTH: 5000,
    MAX_POLL_QUESTION_LENGTH: 200,
    MAX_POLL_OPTION_LENGTH: 100,
  },
};
```

## Troubleshooting

### Posts Not Loading
- Check that `mockStore.initialize()` is called
- Verify `MOCK_CURRENT_USER_ID` matches test data
- Check AsyncStorage permissions

### Navigation Not Working
- Ensure routes are created in `app/` directory
- Verify Expo Router is properly configured
- Check that `useRouter()` hook is available

### Styles Not Matching
- Verify dark theme colors are consistent
- Check that all style values match design specs
- Ensure fonts and spacing are correct

### State Not Updating
- Verify Zustand store is properly configured
- Check that `updateItem` and `removeItem` are called
- Ensure components are re-rendering on state changes

## Next Steps

1. **Add to Main Navigation**: Integrate into tab bar or drawer
2. **Real API**: Replace mock service with real API calls
3. **Media Editing**: Implement image/video upload and editing
4. **Analytics**: Track user interactions
5. **Permissions**: Add proper authorization checks
6. **Offline Support**: Handle offline scenarios
7. **Accessibility**: Add screen reader labels
8. **Localization**: Support multiple languages

## Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native Documentation](https://reactnative.dev/)
- [Design System](./FEED_MANAGEMENT_WIREFRAMES.md)
- [Feature Documentation](./USER_FEED_MANAGEMENT.md)

## Support

For questions or issues:
1. Check the documentation files
2. Review the code comments
3. Test with the provided mock data
4. Create an issue in the repository
