# Comment System - Developer Quick Reference

## TL;DR
Comments and reactions are implemented using Zustand store, mock data, and React components. Open comments via `handleComment(postId)` in HomeScreen.

## File Locations

### Core Files
```
src/shared/types/index.ts                    - Comment type definition
src/core/store/slices/commentSlice.ts        - Comment state management
src/shared/data/stores/mockDataStore.ts      - Mock comment data
```

### UI Components
```
src/modules/feed/components/CommentItem.tsx   - Individual comment display
src/modules/feed/components/CommentInput.tsx  - Comment input field
src/modules/feed/screens/CommentsScreen.tsx   - Comments modal
```

### Integration
```
src/modules/home/screens/HomeScreen.tsx       - Modal integration
```

## Quick Usage

### Open Comments Modal
```typescript
// In your component
const [modalVisible, setModalVisible] = useState(false);
const [postId, setPostId] = useState('');

const handleComment = (id: string) => {
  setPostId(id);
  setModalVisible(true);
};

// In JSX
<CommentsScreen
  visible={modalVisible}
  postId={postId}
  onClose={() => setModalVisible(false)}
/>
```

### Access Comment Store
```typescript
import { useCommentStore } from '@/core/store';

const comments = useCommentStore((state) => state.getCommentsForPost(postId));
const addComment = useCommentStore((state) => state.addComment);
const updateComment = useCommentStore((state) => state.updateComment);
```

### Create New Comment
```typescript
const newComment: Comment = {
  id: `comment-${Date.now()}`,
  postId: 'post-id',
  parentCommentId: undefined, // or parent ID for reply
  author: {
    id: currentUser.id,
    name: currentUser.name,
    avatar: currentUser.avatar,
  },
  content: 'Comment text',
  upvotes: 0,
  downvotes: 0,
  isUpvoted: false,
  isDownvoted: false,
  replyCount: 0,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

addComment(newComment);
```

### Update Comment Votes
```typescript
// Toggle upvote
updateComment(commentId, {
  upvotes: newUpvoteCount,
  isUpvoted: true,
  isDownvoted: false,
});
```

### Get Mock Comments
```typescript
import { mockStore } from '@/shared/data/stores/mockDataStore';

// All comments for a post
const comments = mockStore.getCommentsForPost(postId);

// Specific comment
const comment = mockStore.getCommentById(commentId);

// Add comment to mock store
mockStore.addComment(newComment);
await mockStore.save(); // Persist to AsyncStorage
```

## Component Props

### CommentItem
```typescript
interface CommentItemProps {
  comment: Comment;           // Comment data
  onReply?: (id: string) => void;  // Reply callback
  depth?: number;             // Nesting level (0-2)
}
```

### CommentInput
```typescript
interface CommentInputProps {
  placeholder?: string;       // Input placeholder
  onSubmit: (text: string) => void;  // Send callback
  autoFocus?: boolean;        // Auto-focus input
}
```

### CommentsScreen
```typescript
interface CommentsScreenProps {
  visible: boolean;           // Modal visibility
  postId: string;             // Post to show comments for
  onClose: () => void;        // Close callback
}
```

## Common Patterns

### Load Comments on Modal Open
```typescript
useEffect(() => {
  if (visible && postId) {
    const mockComments = mockStore.getCommentsForPost(postId);
    commentStore.setComments(postId, mockComments);
  }
}, [visible, postId]);
```

### Handle Reply Mode
```typescript
const [replyingTo, setReplyingTo] = useState<string | null>(null);

const handleReply = (commentId: string) => {
  setReplyingTo(commentId);
};

const handleSubmit = (text: string) => {
  const comment = {
    // ... comment data
    parentCommentId: replyingTo || undefined,
  };
  addComment(comment);
  setReplyingTo(null); // Exit reply mode
};
```

### Optimistic Vote Update
```typescript
// Update UI immediately
setVoteState('upvote');
setUpvotes(prev => prev + 1);

// Update store
updateComment(commentId, {
  upvotes: newCount,
  isUpvoted: true,
});

// No need to wait for API in mock setup
```

## Styling

### Theme Colors
```typescript
const colors = {
  background: '#272729',
  card: '#1f1f20',
  border: '#343536',
  text: '#e4e6eb',
  textSecondary: '#818384',
  upvote: '#2536b8',
  downvote: '#ff4d4f',
  accent: '#0a66c2',
};
```

### Common Styles
```typescript
// Comment container
{
  paddingVertical: 12,
  marginLeft: isNested ? 24 : 0,
  borderLeftWidth: isNested ? 2 : 0,
  borderLeftColor: '#343536',
  paddingLeft: isNested ? 12 : 0,
}

// Vote button active
{
  backgroundColor: '#2536b8',
  color: '#f4f5f7',
}

// Avatar
{
  width: isNested ? 28 : 36,
  height: isNested ? 28 : 36,
  borderRadius: isNested ? 14 : 18,
}
```

## Gotchas & Tips

### 1. Max Nesting Depth
```typescript
const MAX_DEPTH = 3;
const canReply = depth < MAX_DEPTH;
```

### 2. Memo Equality Check
```typescript
// Custom equality for performance
const areEqual = (prev, next) => {
  return (
    prev.comment.id === next.comment.id &&
    prev.comment.upvotes === next.comment.upvotes &&
    prev.comment.downvotes === next.comment.downvotes
    // ... other fields
  );
};

export const CommentItem = memo(CommentItemComponent, areEqual);
```

### 3. Reply Count Update
```typescript
// When adding reply, update parent's replyCount
if (parentCommentId) {
  const parent = mockStore.getCommentById(parentCommentId);
  if (parent) {
    updateComment(parentCommentId, {
      replyCount: parent.replyCount + 1,
    });
  }
}
```

### 4. Deleted Comment Handling
```typescript
// Soft delete (preserve structure)
deleteComment(commentId);
// Sets: isDeleted = true, content = '[deleted]'

// Check before allowing actions
if (comment.isDeleted) {
  // Don't show reply button
  // Gray out text
  // Show italic style
}
```

### 5. Timestamp Formatting
```typescript
const formatTimeAgo = (date: Date) => {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};
```

## Debugging

### Check Comment Store State
```typescript
// In React DevTools or console
import { useCommentStore } from '@/core/store';

// Get current state
console.log(useCommentStore.getState());

// Get comments for specific post
console.log(useCommentStore.getState().getCommentsForPost('1'));
```

### Inspect Mock Data
```typescript
import { mockStore } from '@/shared/data/stores/mockDataStore';

// See all comments
console.log(mockStore.getComments());

// See comment by ID
console.log(mockStore.getCommentById('comment1'));
```

### Toggle Reply Visibility Debug
```typescript
const [showReplies, setShowReplies] = useState(false);

console.log(`Replies visible: ${showReplies}`);
console.log(`Reply count: ${replies.length}`);
```

## Testing

### Unit Test Template
```typescript
describe('CommentItem', () => {
  it('displays comment content', () => {
    const comment = { /* ... */ };
    render(<CommentItem comment={comment} />);
    expect(screen.getByText(comment.content)).toBeInTheDocument();
  });

  it('calls onReply when reply button clicked', () => {
    const onReply = jest.fn();
    render(<CommentItem comment={comment} onReply={onReply} />);
    fireEvent.click(screen.getByText('Reply'));
    expect(onReply).toHaveBeenCalledWith(comment.id);
  });
});
```

### Integration Test
```typescript
describe('Comments Flow', () => {
  it('allows adding a comment', async () => {
    render(<CommentsScreen visible postId="1" onClose={() => {}} />);
    
    const input = screen.getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'Test comment');
    
    fireEvent.press(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });
});
```

## Migration to API

### Replace Mock Calls
```typescript
// Before (Mock)
const comments = mockStore.getCommentsForPost(postId);
commentStore.setComments(postId, comments);

// After (API)
import { commentService } from '@/modules/feed/services/commentService';

const loadComments = async () => {
  setIsLoading(true);
  try {
    const comments = await commentService.getComments(postId);
    commentStore.setComments(postId, comments);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Add API Service
```typescript
// src/modules/feed/services/commentService.ts
export const commentService = {
  async getComments(postId: string): Promise<Comment[]> {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },
  
  async addComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    const response = await apiClient.post('/comments', comment);
    return response.data;
  },
  
  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment> {
    const response = await apiClient.patch(`/comments/${id}`, updates);
    return response.data;
  },
};
```

## Performance Tips

1. **Use React.memo** for CommentItem
2. **FlatList** for virtualization
3. **Lazy load** nested replies
4. **Debounce** vote actions
5. **Optimistic updates** for instant feedback

## Resources

- Feature Docs: `docs/COMMENTING_FEATURE.md`
- Wireframes: `docs/COMMENTING_WIREFRAMES.md`
- UX Flows: `docs/COMMENTING_UX_FLOWS.md`
- Implementation: `docs/COMMENTING_IMPLEMENTATION_SUMMARY.md`
