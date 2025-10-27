# Feed Commenting and Reactions Feature

## Overview
This document describes the implementation of the commenting and reactions system for the Haritage feed. The feature allows users to comment on feed posts, reply to comments, and react with upvotes/downvotes on both posts and comments.

## Architecture

### Data Model

#### Comment Type
```typescript
interface Comment {
  id: string;
  postId: string;
  parentCommentId?: string; // For nested replies
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  isUpvoted: boolean;
  isDownvoted: boolean;
  replyCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management

**Comment Store** (`src/core/store/slices/commentSlice.ts`)
- Manages all comments grouped by post ID
- Provides actions for CRUD operations on comments
- Handles nested comment structure (replies)

Key Actions:
- `setComments(postId, comments)` - Load comments for a post
- `addComment(comment)` - Add a new comment/reply
- `updateComment(commentId, updates)` - Update comment properties (e.g., votes)
- `deleteComment(commentId)` - Mark comment as deleted
- `getCommentsForPost(postId)` - Get top-level comments
- `getRepliesForComment(postId, parentCommentId)` - Get replies to a comment

### UI Components

#### 1. CommentItem (`src/modules/feed/components/CommentItem.tsx`)
Displays a single comment with:
- Author avatar and name
- Timestamp (relative, e.g., "2h ago")
- Comment content
- Upvote/Downvote buttons with counts
- Reply button
- Nested replies (up to 3 visual levels: top comment → reply → nested reply)
- Toggle to show/hide replies

**Props:**
```typescript
interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  depth?: number; // Current nesting level (0, 1, or 2)
}
```

**Features:**
- Minimalist dark theme design
- Optimistic UI updates for reactions
- Visual indication for deleted comments
- Nested comment threading with visual indentation
- Collapsible reply sections

#### 2. CommentInput (`src/modules/feed/components/CommentInput.tsx`)
Text input for adding comments/replies:
- Multi-line text input
- Character limit (500 chars)
- Send button (disabled when empty)
- Auto-focus support for replies

**Props:**
```typescript
interface CommentInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
}
```

#### 3. CommentsScreen (`src/modules/feed/screens/CommentsScreen.tsx`)
Full-screen modal displaying comment thread:
- Header with comment count and close button
- Scrollable comment list
- Comment input at bottom
- Reply mode indicator
- Loading states
- Empty state when no comments

**Props:**
```typescript
interface CommentsScreenProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}
```

## User Flows

### 1. View Comments
1. User taps comment icon on a feed post
2. CommentsScreen modal slides up
3. Comments load from mock store
4. User can scroll through comment tree
5. User can tap close to dismiss modal

### 2. Add Comment
1. User types in CommentInput field
2. Send button becomes enabled
3. User taps send button
4. New comment appears at top of list
5. Comment count updates on post
6. Input field clears

### 3. Reply to Comment
1. User taps "Reply" on a comment
2. Comment input shows "Replying to [author]" header
3. User types reply
4. Reply appears nested under parent comment
5. Parent comment's reply count increments

### 4. React to Comment
1. User taps upvote/downvote button
2. Vote count updates immediately (optimistic)
3. Button state changes to active
4. Previous vote is removed if switching
5. Can tap again to remove vote

### 5. View Nested Replies
1. User sees comment with replies count
2. User taps "Show X replies"
3. Replies expand with visual indentation
4. User can tap "Hide X replies" to collapse

## Mock Data Scenarios

The mock data includes various test cases:

1. **Standard Comment** - Comment with upvotes/downvotes
2. **Comment with Nested Replies** - Multi-level reply thread
3. **Deleted Comment** - Shows "[deleted]" with preserved structure
4. **Recently Added Comment** - Shows "Just now"
5. **Highly Voted Comment** - Comment with significant engagement

Example mock data structure in `mockDataStore.ts`:
```typescript
comments: [
  {
    id: 'comment1',
    postId: '1',
    content: 'Absolutely stunning! The colors are incredible.',
    upvotes: 42,
    downvotes: 2,
    replyCount: 2,
    // ... replies as separate comments with parentCommentId
  }
]
```

## Design Specifications

### Visual Design
- **Theme**: Minimalist dark theme
- **Colors**:
  - Background: `#272729`
  - Cards: `#1f1f20`
  - Borders: `#343536`
  - Primary text: `#e4e6eb`
  - Secondary text: `#818384`
  - Accent (upvote): `#0a66c2`
  - Danger (downvote): `#ff4d4f`

### Typography
- Author name: 13px, weight 600
- Comment text: 13px, line height 18px
- Timestamp: 11px
- Button text: 12px

### Spacing
- Comment padding: 12px vertical
- Avatar size: 36px (28px for nested)
- Nested indent: 24px + 12px padding
- Border for nesting: 2px left border

### Interactions
- Comment cards are not tappable (no card-level interaction)
- Individual buttons (vote, reply) have touch targets
- Smooth animations for expanding/collapsing replies
- Optimistic UI updates for better perceived performance

## Error States

### Failed to Load Comments
- Loading spinner while fetching
- Error state if load fails
- Retry mechanism

### Failed to Post Comment
- Show alert to user
- Comment not added to list
- Input text preserved for retry

### Network Issues
- Graceful degradation
- Local state updates first (optimistic)
- Sync with backend when connection restored

## Accessibility

- Semantic button roles
- Screen reader labels
- Sufficient color contrast (WCAG AA)
- Touch target sizes (minimum 44x44pt)
- Keyboard navigation support

## Performance Optimizations

1. **React.memo** on CommentItem to prevent unnecessary re-renders
2. **FlatList** virtualization for long comment threads
3. **Optimistic updates** for instant feedback
4. **Lazy loading** of nested replies
5. **Debouncing** on typing in input field

## Future Enhancements

1. **Rich Text** - Support for mentions, links, emojis
2. **Edit Comments** - Allow users to edit their own comments
3. **Comment Moderation** - Report/block functionality
4. **Reactions** - Beyond upvote/downvote (e.g., emojis)
5. **Sort Options** - Best, newest, oldest
6. **Pagination** - Load more comments on scroll
7. **Media in Comments** - Support for images/GIFs
8. **Notifications** - Alert when someone replies to your comment
9. **Threading Improvements** - Better visualization for deep threads
10. **Search Comments** - Find specific comments in thread

## Integration Points

### HomeScreen
- Added `commentsModalVisible` state
- Added `selectedPostId` state
- `handleComment` opens CommentsScreen modal
- CommentsScreen component rendered conditionally

### FeedItem
- Already has `onComment` callback prop
- Displays comment count from FeedItem data
- Comment icon in ReactionBar

### Store Integration
- CommentStore initialized in StoreProvider
- Exported from `src/core/store/index.tsx`
- Used in CommentsScreen and CommentItem

## Testing Scenarios

1. ✅ Open comments modal from feed
2. ✅ View existing comments
3. ✅ Add new comment
4. ✅ Reply to comment
5. ✅ Upvote/downvote comment
6. ✅ Toggle vote (upvote -> none -> downvote)
7. ✅ Expand/collapse replies
8. ✅ Cancel reply mode
9. ✅ View deleted comment
10. ✅ Close comments modal

## Code Organization

```
src/
├── shared/
│   ├── types/
│   │   └── index.ts (Comment type)
│   └── data/
│       └── stores/
│           └── mockDataStore.ts (Mock comments data)
├── core/
│   └── store/
│       ├── index.tsx (Export commentStore)
│       └── slices/
│           └── commentSlice.ts (Comment state management)
└── modules/
    └── feed/
        ├── components/
        │   ├── CommentItem.tsx
        │   └── CommentInput.tsx
        └── screens/
            └── CommentsScreen.tsx
```

## Maintenance Notes

- All comment logic is centralized in commentSlice
- UI components are pure and delegate logic to store
- Mock data can be replaced with API calls without changing UI
- Follow existing patterns for new comment features
