# User Feed Management Feature - Design Documentation

## Overview
This feature allows users to view, edit, hide, and delete their own feed posts. The implementation follows a minimalist design approach consistent with the existing app theme.

## Component Architecture

### Screens

#### 1. MyFeedsScreen (`src/modules/feed/screens/MyFeedsScreen.tsx`)
- **Purpose**: Display all posts created by the current user
- **Features**:
  - Statistics dashboard showing total posts, likes, comments, and shares
  - Filter toggle to show/hide hidden posts
  - Pull-to-refresh functionality
  - Integration with ManageableFeedItem for each post
  
- **UI Elements**:
  - Header with back button and title
  - Stats container with 4 metrics
  - Filter toggle for hidden posts visibility
  - Scrollable feed list
  - Empty state when no posts exist

#### 2. EditFeedScreen (`src/modules/feed/screens/EditFeedScreen.tsx`)
- **Purpose**: Edit existing feed post content
- **Editable Fields**:
  - Title (optional, max 100 chars)
  - Content (required, max 5000 chars)
  - URL (optional)
  - Poll question and options (if poll exists)
  
- **UI Elements**:
  - Header with cancel/save buttons
  - Form fields with labels
  - Character counters
  - Poll options editor with add/remove functionality
  - Information note about media editing limitations

- **Validation**:
  - Content cannot be empty
  - Poll must have at least 2 options
  - Unsaved changes prompt on cancel

### Components

#### 3. ManageableFeedItem (`src/modules/feed/components/ManageableFeedItem.tsx`)
- **Purpose**: Wrapper around FeedItem that adds management actions
- **Features**:
  - Shows management button only for user's own posts
  - Displays hidden badge for hidden posts
  - Triggers action menu on manage button press
  - Handles edit, hide, unhide, and delete actions
  
- **UI Elements**:
  - Settings icon button (top-right overlay)
  - Hidden badge indicator (top-left overlay)
  - Action menu modal
  - Confirmation dialogs

#### 4. FeedActionMenu (`src/modules/feed/components/FeedActionMenu.tsx`)
- **Purpose**: Bottom sheet menu for feed actions
- **Actions**:
  - Edit Post (blue icon)
  - Hide/Unhide Post (yellow/green icon)
  - Delete Post (red icon, destructive)
  
- **UI Design**:
  - Slide-up animation
  - Transparent overlay backdrop
  - Rounded top corners
  - Icon + text for each action
  - Cancel button at bottom
  - Color-coded actions

#### 5. ConfirmDialog (`src/modules/feed/components/ConfirmDialog.tsx`)
- **Purpose**: Modal confirmation for destructive actions
- **Variants**:
  - Delete confirmation (red, trash icon)
  - Hide confirmation (yellow, eye-off icon)
  
- **UI Elements**:
  - Large icon at top
  - Title text
  - Message text
  - Cancel button (gray)
  - Confirm button (colored based on action)

### Services

#### 6. userFeedService (`src/modules/feed/services/userFeedService.ts`)
- **Methods**:
  - `getUserFeedItems(includeHidden)`: Get all user posts
  - `getUserFeedItem(id)`: Get single post by ID
  - `editFeedItem(params)`: Update post fields
  - `hideFeedItem(id)`: Soft delete (set isHidden = true)
  - `unhideFeedItem(id)`: Unhide post
  - `deleteFeedItem(id)`: Permanently remove post
  - `getUserFeedStats()`: Get aggregated statistics
  
- **Data Storage**: Uses mockStore for persistence

### Data

#### 7. Mock Data (`src/modules/feed/data/mockUserFeedData.ts`)
- **Content**: 9 diverse feed items covering:
  - Multiple images post
  - Video post
  - Text with poll (active)
  - Text with URL preview
  - Image with URL
  - Simple text post
  - Hidden post
  - Text with closed poll
  - Video with multiple media

## User Flows

### View My Posts Flow
1. User navigates to MyFeedsScreen
2. Screen loads user's posts from service
3. Statistics are calculated and displayed
4. Posts are shown with management buttons
5. User can toggle hidden posts visibility
6. User can pull to refresh

### Edit Post Flow
1. User clicks manage button on their post
2. Action menu appears with edit option
3. User selects "Edit Post"
4. EditFeedScreen loads with current data
5. User modifies fields
6. User clicks save or cancel
7. If cancel with changes, show confirmation
8. If save, validate and update post
9. Return to previous screen on success

### Hide Post Flow
1. User clicks manage button on their post
2. Action menu appears
3. User selects "Hide Post"
4. Confirmation dialog appears
5. User confirms or cancels
6. If confirmed, post is marked as hidden
7. Post updates with hidden badge
8. Success message shown

### Unhide Post Flow
1. User enables "Show Hidden" filter
2. Hidden posts become visible with badge
3. User clicks manage button
4. Action menu shows "Unhide Post"
5. User selects unhide
6. Post is immediately unhidden
7. Badge removed, success message shown

### Delete Post Flow
1. User clicks manage button
2. Action menu appears
3. User selects "Delete Post"
4. Confirmation dialog appears with warning
5. User confirms or cancels
6. If confirmed, post is permanently removed
7. Post removed from list
8. Success message shown

## Design Specifications

### Color Palette
- **Background**: `#1a1a1b` (main), `#272729` (cards)
- **Borders**: `#3a3b3c` (primary), `#343536` (secondary)
- **Text**: `#f0f0f3` (primary), `#e4e6eb` (secondary), `#818384` (tertiary)
- **Actions**:
  - Edit: `#0a66c2` (blue)
  - Hide: `#f39c12` (yellow/orange)
  - Unhide: `#27ae60` (green)
  - Delete: `#e74c3c` (red)

### Typography
- **Headers**: 18-20px, weight 700
- **Body**: 14-15px, weight 400-500
- **Labels**: 12-14px, weight 600
- **Stats**: 20px, weight 700

### Spacing
- **Card padding**: 16px horizontal, 14-16px vertical
- **Section gaps**: 12-24px
- **Button padding**: 14-16px vertical, 12-16px horizontal
- **Border radius**: 12-16px for cards, 8-12px for buttons

### Shadows
- **Cards**: `shadowOpacity: 0.25`, `shadowRadius: 4-6`
- **Buttons**: `shadowOpacity: 0.2`, `shadowRadius: 4`
- **Modals**: `shadowOpacity: 0.3`, `shadowRadius: 12`

## State Management

### Feed Store Integration
- Uses existing `useFeedStore` from `@/core/store/slices/feedSlice`
- Methods used:
  - `updateItem(id, updates)`: Update post after edit/hide
  - `removeItem(id)`: Remove post after delete
  
### Local State
- Each screen maintains loading, error, and form states
- Modal visibility states for action menus and dialogs
- Filter state for showing hidden posts

## Error Handling

### Service Errors
- Permission errors (not user's post)
- Not found errors
- Save/update failures
- All shown via Alert.alert()

### Validation Errors
- Empty content validation
- Poll options validation (min 2 options)
- Character limits enforced

### User Feedback
- Loading indicators during async operations
- Success messages after operations
- Error alerts with descriptive messages
- Confirmation dialogs for destructive actions

## Future Enhancements

### Not Implemented (Out of Scope)
1. **Media Editing**: Add/remove/reorder images and videos
2. **Navigation Integration**: Add to app navigation structure
3. **Real API Integration**: Replace mock service with real backend
4. **Analytics**: Track user actions and engagement
5. **Batch Operations**: Select and manage multiple posts
6. **Draft Saving**: Save edits as drafts
7. **Revision History**: View and restore previous versions
8. **Share Settings**: Public/private/friends visibility

## Testing Recommendations

### Manual Testing Checklist
- [ ] Load MyFeedsScreen and verify all posts display
- [ ] Verify statistics are calculated correctly
- [ ] Toggle show/hide hidden posts filter
- [ ] Open EditFeedScreen for each post type
- [ ] Edit various fields and save successfully
- [ ] Cancel edit with/without changes
- [ ] Hide a post and verify badge appears
- [ ] Unhide a post and verify badge removed
- [ ] Delete a post and verify it's removed
- [ ] Verify all confirmation dialogs work
- [ ] Test pull-to-refresh
- [ ] Test empty state display
- [ ] Verify proper error handling

### Screenshot Locations
1. MyFeedsScreen with posts
2. MyFeedsScreen empty state
3. Statistics dashboard
4. FeedActionMenu open
5. EditFeedScreen with form
6. ConfirmDialog for delete
7. ConfirmDialog for hide
8. Hidden post badge
9. Filter toggle states

## Integration Notes

### Required Steps for Full Integration
1. Add screens to app routing (Expo Router)
2. Add navigation links from HomeScreen or Profile
3. Update mockDataStore initialization
4. Test on iOS and Android devices
5. Add proper TypeScript types export
6. Consider adding to navigation menu
7. Update README with new features

### Dependencies
- `@expo/vector-icons`: Icons
- `expo-router`: Navigation
- `zustand`: State management
- `react-native-safe-area-context`: Safe area handling
- `@react-native-async-storage/async-storage`: Persistence

## File Structure
```
src/modules/feed/
├── components/
│   ├── ConfirmDialog.tsx
│   ├── FeedActionMenu.tsx
│   ├── FeedItem.tsx (existing)
│   ├── ManageableFeedItem.tsx
│   ├── ReactionBar.tsx (existing)
│   └── VideoPlayer.tsx (existing)
├── data/
│   └── mockUserFeedData.ts
├── screens/
│   ├── CreatePostScreen.tsx (existing)
│   ├── EditFeedScreen.tsx
│   ├── MediaDetailScreen.tsx (existing)
│   └── MyFeedsScreen.tsx
└── services/
    └── userFeedService.ts
```
