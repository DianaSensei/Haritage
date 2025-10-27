# Comment & Reaction UX Flow Diagrams

## User Story 1: Comment on a Feed Post

### Flow Diagram
```
┌─────────────┐
│ Feed Screen │
└──────┬──────┘
       │ User taps comment icon
       ▼
┌─────────────────────┐
│ Comments Modal      │
│ Opens (slide up)    │
└──────┬──────────────┘
       │ Load comments
       ▼
┌─────────────────────┐      ┌──────────────┐
│ Display Comments    │──No──│ Empty State  │
│ (if any exist)      │      │ "No comments"│
└──────┬──────────────┘      └──────────────┘
       │ Yes
       ▼
┌─────────────────────┐
│ User types comment  │
└──────┬──────────────┘
       │ Taps send
       ▼
┌─────────────────────┐
│ Add to comment list │
│ (top of thread)     │
└──────┬──────────────┘
       │ Update count
       ▼
┌─────────────────────┐
│ Clear input field   │
│ Show new comment    │
└─────────────────────┘
```

### States
1. **Initial State**: Feed with post showing comment icon + count
2. **Loading State**: Spinner while loading comments
3. **Empty State**: No comments message, encourage first comment
4. **Populated State**: List of comments displayed
5. **Input Active**: User typing in comment field
6. **Success State**: New comment appears, count updates

### User Actions
- Tap comment icon → Open modal
- Type in input → Enable send button
- Tap send → Add comment
- Tap close → Dismiss modal

---

## User Story 2: Reply to a Comment

### Flow Diagram
```
┌─────────────────────┐
│ Comment Thread      │
└──────┬──────────────┘
       │ User taps "Reply"
       ▼
┌─────────────────────┐
│ Reply Mode Active   │
│ Show "Replying to"  │
│ Focus input         │
└──────┬──────────────┘
       │ User types reply
       ▼
┌─────────────────────┐
│ Send Reply          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Add reply nested    │
│ under parent        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Increment reply     │
│ count on parent     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Exit reply mode     │
│ Clear input         │
└─────────────────────┘
```

### States
1. **Default**: Comments visible, no reply mode
2. **Reply Target Selected**: Header shows "Replying to [name]"
3. **Input Active**: User typing reply
4. **Success**: Reply nested under parent, count updated
5. **Cancelled**: User closes reply mode (tap X)

### User Actions
- Tap "Reply" → Enter reply mode
- Type reply → Enable send
- Tap send → Add nested reply
- Tap X → Cancel reply mode

---

## User Story 3: Upvote/Downvote a Comment

### Flow Diagram - Upvote
```
┌─────────────────────┐
│ Comment Displayed   │
│ [↑ 42] [↓ 2]       │
└──────┬──────────────┘
       │ User taps upvote
       ▼
    ┌──────┐
    │Check │
    │State │
    └──┬───┘
       │
   ┌───┴────┬──────────┬─────────┐
   │        │          │         │
   ▼        ▼          ▼         ▼
Currently  Currently  Currently  None
Upvoted   Downvoted  Neither

   │         │          │
   │         │          │
   ▼         ▼          ▼
Remove     Switch     Add
Upvote     to Up      Upvote
(-1)       (+1,-1)    (+1)
   │         │          │
   └─────────┴──────────┘
              │
              ▼
   ┌─────────────────────┐
   │ Update UI           │
   │ - Toggle button     │
   │ - Update count      │
   └──────┬──────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Update store        │
   │ Save to mock DB     │
   └─────────────────────┘
```

### States
1. **None**: No vote (gray buttons)
2. **Upvoted**: Upvote active (blue button, +1 count)
3. **Downvoted**: Downvote active (red button, +1 count)

### Transitions
- None → Upvote: +1 upvote, button blue
- None → Downvote: +1 downvote, button red
- Upvote → None: -1 upvote, button gray
- Downvote → None: -1 downvote, button gray
- Upvote → Downvote: -1 upvote, +1 downvote, swap colors
- Downvote → Upvote: -1 downvote, +1 upvote, swap colors

### User Actions
- Tap upvote → Toggle upvote state
- Tap downvote → Toggle downvote state
- Optimistic UI update (immediate)

---

## User Story 4: View Nested Replies

### Flow Diagram
```
┌─────────────────────┐
│ Comment with        │
│ Reply Count > 0     │
└──────┬──────────────┘
       │ Shows "Show X replies"
       ▼
┌─────────────────────┐
│ User taps to expand │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Fetch/Display       │
│ Nested Replies      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Indent visually     │
│ with border line    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Change to           │
│ "Hide X replies"    │
└──────┬──────────────┘
       │ User can tap again
       ▼
┌─────────────────────┐
│ Collapse replies    │
│ Hide nested items   │
└─────────────────────┘
```

### States
1. **Collapsed**: Shows "Show X replies" button
2. **Expanded**: Replies visible, shows "Hide X replies"
3. **Max Depth**: Deepest level (3), no more nesting

### User Actions
- Tap "Show replies" → Expand nested replies
- Tap "Hide replies" → Collapse nested replies
- See visual hierarchy (indentation + border)

---

## User Story 5: Delete Own Comment

### Flow Diagram (Future Enhancement)
```
┌─────────────────────┐
│ User's Own Comment  │
└──────┬──────────────┘
       │ Long press or tap ⋯
       ▼
┌─────────────────────┐
│ Show Action Menu    │
│ • Edit              │
│ • Delete            │
│ • Cancel            │
└──────┬──────────────┘
       │ User taps Delete
       ▼
┌─────────────────────┐
│ Confirmation Dialog │
│ "Delete comment?"   │
│ [Cancel] [Delete]   │
└──────┬──────────────┘
       │ Confirm
       ▼
┌─────────────────────┐
│ Mark as [deleted]   │
│ Preserve structure  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Keep nested replies │
│ Show deleted state  │
└─────────────────────┘
```

---

## Error Scenarios

### 1. Failed to Load Comments

```
┌─────────────────────┐
│ Comments Modal      │
│ Opens               │
└──────┬──────────────┘
       │ Request fails
       ▼
┌─────────────────────┐
│ Error State         │
│ ⚠ Failed to load   │
│ [Retry]             │
└──────┬──────────────┘
       │ User taps Retry
       ▼
┌─────────────────────┐
│ Try loading again   │
└─────────────────────┘
```

### 2. Failed to Post Comment

```
┌─────────────────────┐
│ User sends comment  │
└──────┬──────────────┘
       │ Request fails
       ▼
┌─────────────────────┐
│ Show error alert    │
│ "Failed to post"    │
│ Input text saved    │
└──────┬──────────────┘
       │ User can retry
       ▼
┌─────────────────────┐
│ Text still in input │
│ Can edit & resend   │
└─────────────────────┘
```

### 3. Network Offline

```
┌─────────────────────┐
│ Offline detected    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Show offline banner │
│ Queue actions       │
└──────┬──────────────┘
       │ Network restored
       ▼
┌─────────────────────┐
│ Sync queued actions │
│ Update UI           │
└─────────────────────┘
```

---

## Interaction Patterns

### 1. Optimistic Updates

**Pattern**: Update UI immediately, sync later

```
User Action → UI Update → API Call → Success/Rollback
    │            │            │
    └────────────┴────────────┘
         Feels instant
```

**Used For**:
- Vote toggling
- Adding comments
- Expanding replies

### 2. Confirmation Dialogs

**Pattern**: Ask before destructive actions

```
User Action → Confirm Dialog → Execute/Cancel
                   │
              ┌────┴────┐
              │         │
           Cancel    Proceed
```

**Used For**:
- Deleting comments (future)
- Reporting (future)

### 3. Progressive Disclosure

**Pattern**: Show details on demand

```
Summary View → Expand Action → Detail View
    │                            │
    └────────────────────────────┘
         Only when needed
```

**Used For**:
- Nested replies (collapsed by default)
- Long comments (read more)
- Reply mode (on-demand)

---

## Navigation Flow

### Entry Points to Comments
1. Feed post → Comment icon → Comments modal
2. Notification → Comment mention → Specific comment (future)
3. Profile → My comments → Comment thread (future)

### Exit Points from Comments
1. Close button → Dismiss modal → Return to feed
2. Back gesture → Dismiss modal → Return to feed
3. Background tap → Dismiss modal → Return to feed

---

## State Persistence

### What Persists
- Comments in mockDataStore
- Vote states
- Reply structure
- Deleted state

### What Doesn't Persist
- Modal open/closed state
- Reply mode (resets on close)
- Scroll position (resets)
- Input text (clears on send)

---

## Performance Considerations

### 1. Virtualization
- Use FlatList for long comment threads
- Only render visible comments
- Recycle component instances

### 2. Memoization
- Memo on CommentItem to prevent re-renders
- useMemo for expensive computations
- useCallback for event handlers

### 3. Debouncing
- Vote actions (100ms)
- Input changes (future search)

### 4. Lazy Loading
- Paginate comments (future)
- Load replies on expand
- Load older comments on scroll

---

## Accessibility Flow

### Screen Reader Navigation
```
Modal Opens
  │
  ├─→ Announce: "Comments, 28 items"
  │
  ├─→ Focus on Close button
  │
  ├─→ Tab to first comment
  │   ├─→ Read author name
  │   ├─→ Read comment text
  │   ├─→ Read vote counts
  │   └─→ Tab through buttons
  │
  └─→ Tab to comment input
      └─→ Announce: "Add a comment"
```

### Keyboard Navigation
- Tab: Move between interactive elements
- Enter: Activate buttons
- Escape: Close modal
- Arrow keys: Scroll comments list

---

## Animation Timeline

### Modal Open (300ms)
```
0ms    ─┐
        │ translateY(100% → 0%)
        │ opacity(0 → 1)
300ms  ─┘
```

### Reply Expand (200ms)
```
0ms    ─┐
        │ height(0 → auto)
        │ opacity(0 → 1)
200ms  ─┘
```

### Vote Button Press (150ms)
```
0ms    ─┐
        │ scale(1 → 0.95 → 1)
        │ background(gray → blue)
150ms  ─┘
```

---

## Future Enhancements Flow

### Mention User
```
Type @ → Dropdown → Select user → Insert @username → Send
```

### Add GIF
```
Tap GIF icon → Search → Select → Preview → Send
```

### Sort Comments
```
Tap sort icon → Menu (Best/Newest/Oldest) → Reload with sort
```

### Load More
```
Scroll to bottom → Spinner → Load next page → Append
```
