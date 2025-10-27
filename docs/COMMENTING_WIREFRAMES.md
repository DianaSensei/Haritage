# Comments UI Wireframes & Design Specs

## Screen: CommentsScreen Modal

### Layout Structure
```
┌─────────────────────────────────────┐
│  ┌─ Header ──────────────────────┐  │
│  │ Comments (28)            [X]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─ Scrollable Comment List ─────┐ │
│  │                                │ │
│  │  ┌─ CommentItem ─────────┐    │ │
│  │  │ [@] Mike Chen  •  2h   │    │ │
│  │  │ Absolutely stunning!   │    │ │
│  │  │ [↑42] [↓2] [Reply]     │    │ │
│  │  │                        │    │ │
│  │  │   ┌─ Nested Reply ──┐  │    │ │
│  │  │   │ [@] Sarah  •1h  │  │    │ │
│  │  │   │ Thanks! ...     │  │    │ │
│  │  │   │ [↑18] [↓0]      │  │    │ │
│  │  │   └─────────────────┘  │    │ │
│  │  │                        │    │ │
│  │  │ [v Show 2 replies]     │    │ │
│  │  └────────────────────────┘    │ │
│  │                                │ │
│  │  ┌─ CommentItem ─────────┐    │ │
│  │  │ [@] Alex   •  30m      │    │ │
│  │  │ Great composition!     │    │ │
│  │  │ [↑15] [↓0] [Reply]     │    │ │
│  │  └────────────────────────┘    │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ Comment Input ───────────────┐  │
│  │ ┌──────────────────┐  ┌───┐  │  │
│  │ │ Add a comment... │  │ ➤ │  │  │
│  │ └──────────────────┘  └───┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Component: CommentItem

### Default State
```
┌─────────────────────────────────────┐
│ [@] Sarah Johnson      • 2h ago     │
│                                     │
│ The sky exploded with color        │
│ tonight—definitely worth the       │
│ detour after work.                 │
│                                     │
│ [↑ 42]  [↓ 2]  [↩ Reply]           │
└─────────────────────────────────────┘
```

### With Active Upvote
```
┌─────────────────────────────────────┐
│ [@] Sarah Johnson      • 2h ago     │
│                                     │
│ Amazing shot! Love the colors.     │
│                                     │
│ [🔼 43]  [↓ 2]  [↩ Reply]           │
│  ^^^^^ (highlighted blue)           │
└─────────────────────────────────────┘
```

### Deleted Comment
```
┌─────────────────────────────────────┐
│ [@] [Deleted User]     • 5h ago     │
│                                     │
│ [deleted]                          │
│ (italic, gray text)                │
│                                     │
│ [↑ 3]  [↓ 12]                      │
└─────────────────────────────────────┘
```

### Nested Reply (depth 1)
```
    ┌─────────────────────────────┐
  │ │ [@] Mike Chen    • 1h ago   │
  │ │                             │
  │ │ Thanks! Shot on Canon R6.  │
  │ │                             │
  │ │ [↑ 18]  [↓ 0]  [↩ Reply]   │
    └─────────────────────────────┘
    (24px left margin + 2px border)
```

### With Collapsed Replies
```
┌─────────────────────────────────────┐
│ [@] Sarah Johnson      • 2h ago     │
│                                     │
│ Great composition!                 │
│                                     │
│ [↑ 42]  [↓ 2]  [↩ Reply]           │
│                                     │
│    [˅ Show 3 replies]              │
│    (clickable, gray text)          │
└─────────────────────────────────────┘
```

### With Expanded Replies
```
┌─────────────────────────────────────┐
│ [@] Sarah Johnson      • 2h ago     │
│                                     │
│ Great composition!                 │
│                                     │
│ [↑ 42]  [↓ 2]  [↩ Reply]           │
│                                     │
│    [˄ Hide 3 replies]              │
│                                     │
    ┌─────────────────────────────┐
  │ │ [@] Mike    • 1h30m ago     │
  │ │ Thanks for sharing!         │
  │ │ [↑ 12]  [↓ 0]  [↩ Reply]   │
    └─────────────────────────────┘
│                                     │
    ┌─────────────────────────────┐
  │ │ [@] Alex    • 1h ago        │
  │ │ Incredible work!            │
  │ │ [↑ 8]  [↓ 0]  [↩ Reply]    │
    └─────────────────────────────┘
│                                     │
└─────────────────────────────────────┘
```

## Component: CommentInput

### Default State
```
┌─────────────────────────────────────┐
│ ┌───────────────────────┐  ┌─────┐ │
│ │                       │  │     │ │
│ │ Add a comment...      │  │  ➤  │ │
│ │ (placeholder, gray)   │  │     │ │
│ └───────────────────────┘  └─────┘ │
│   (rounded input box)     (send)   │
└─────────────────────────────────────┘
```

### With Text Entered
```
┌─────────────────────────────────────┐
│ ┌───────────────────────┐  ┌─────┐ │
│ │                       │  │     │ │
│ │ This is amazing! I... │  │  ➤  │ │
│ │ (white text)          │  │ (🔵)│ │
│ └───────────────────────┘  └─────┘ │
│                            (active) │
└─────────────────────────────────────┘
```

### Reply Mode
```
┌─────────────────────────────────────┐
│ Replying to Mike Chen          [x]  │
│ (italic, small, gray)               │
├─────────────────────────────────────┤
│ ┌───────────────────────┐  ┌─────┐ │
│ │                       │  │     │ │
│ │ Reply to Mike...      │  │  ➤  │ │
│ │ (placeholder)         │  │     │ │
│ └───────────────────────┘  └─────┘ │
└─────────────────────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────┐
│  Comments (0)                  [X]  │
├─────────────────────────────────────┤
│                                     │
│             💬                      │
│        (chat bubble icon)           │
│                                     │
│         No comments yet             │
│    (bold, gray, centered)           │
│                                     │
│   Be the first to share your       │
│         thoughts                    │
│    (smaller, lighter gray)          │
│                                     │
├─────────────────────────────────────┤
│ ┌───────────────────────┐  ┌─────┐ │
│ │ Add a comment...      │  │  ➤  │ │
│ └───────────────────────┘  └─────┘ │
└─────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────┐
│  Comments                      [X]  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│              ⟳                      │
│         (spinner icon)              │
│                                     │
│        Loading comments...          │
│          (gray text)                │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Interaction States

### Vote Button States

#### Upvote - Default
```
┌──────┐
│ ↑ 42 │ (gray icon, gray text)
└──────┘
```

#### Upvote - Active
```
┌──────┐
│ ▲ 43 │ (solid icon, blue bg, white text)
└──────┘
```

#### Downvote - Default
```
┌──────┐
│ ↓ 2  │ (gray icon, gray text)
└──────┘
```

#### Downvote - Active
```
┌──────┐
│ ▼ 3  │ (solid icon, red bg, white text)
└──────┘
```

### Reply Button
```
┌─────────┐
│ ↩ Reply │ (gray icon and text)
└─────────┘
```

## Color Palette

### Backgrounds
- Modal: `#272729`
- Cards: `#1f1f20`
- Input: `#1f1f20`
- Header: `#1f1f20`

### Borders
- Default: `#343536`
- Nested: `#343536` (2px)

### Text
- Primary: `#e4e6eb`
- Secondary: `#818384`
- Placeholder: `#818384`
- Deleted: `#818384` (italic)

### Interactive
- Upvote Active: `#2536b8` (blue)
- Downvote Active: `#30171a` (dark red)
- Downvote Icon: `#ff4d4f` (red)
- Link/Accent: `#0a66c2` (blue)

### Vote Text
- Active Upvote: `#f4f5f7` (white)
- Active Downvote: `#ff4d4f` (red)
- Default: `#8c919d` (gray)

## Typography Scale

### Headers
- Modal Title: 18px, weight 600
- Comment Count: 18px, weight 600

### Body
- Author Name: 13px, weight 600
- Comment Text: 13px, line-height 18px
- Timestamp: 11px
- Vote Count: 11px, weight 500
- Button Text: 12px, weight 500

### Helper Text
- Replying To: 12px, italic
- Empty State: 16px (title), 14px (subtitle)
- Show/Hide Replies: 12px, weight 500

## Spacing & Sizing

### Avatar
- Default: 36×36px, border-radius 18px
- Nested: 28×28px, border-radius 14px
- Border: 1px `#343536`

### Padding
- Comment Vertical: 12px
- Comment Horizontal: (via parent container)
- Input Container: 16px horizontal, 12px vertical
- Nested Left: 24px + 12px (margin + padding)

### Gaps
- Header items: 12px
- Vote buttons: 8px
- Action buttons: 8px
- Comment sections: 8px
- Body elements: 8px

### Borders
- Modal border: none
- Section borders: 1px `#343536`
- Nested border-left: 2px `#343536`

### Corner Radius
- Modal: 14px (top corners)
- Input: 20px
- Buttons: 8px (vote), 20px (send)
- Cards: 12px

## Animation Specs

### Modal Slide Up
- Duration: 300ms
- Easing: ease-out
- Transform: translateY(100%) → translateY(0)

### Reply Expand/Collapse
- Duration: 200ms
- Easing: ease-in-out
- Height: 0 → auto (or reverse)

### Vote Button
- Duration: 150ms
- Easing: ease-in-out
- Transform: scale(0.95) → scale(1) on press

### Send Button Enable
- Duration: 200ms
- Easing: ease-in-out
- Opacity: 0.5 → 1
- Color: gray → blue

## Accessibility

### Touch Targets
- Minimum: 44×44px
- Vote buttons: 40×40px (with padding)
- Send button: 40×40px
- Close button: 44×44px
- Reply button: 40×24px minimum

### Focus States
- Visible focus ring on keyboard navigation
- 2px blue outline on focused elements
- Tab order: close → input → send → comments

### Screen Reader
- Comment count announced
- Author names announced
- Timestamps announced
- Vote counts announced
- Button states announced (pressed/unpressed)

## Responsive Behavior

### Keyboard Visible
- Modal shrinks to fit available space
- Input stays at bottom
- Comment list scrollable above input

### Small Screens
- Nested depth reduced to 2 levels
- Font sizes adjusted (min 12px)
- Avatar sizes reduced proportionally

### Large Screens (Tablet)
- Modal max-width: 600px
- Centered on screen
- Font sizes unchanged

## Edge Cases

### Very Long Comment
- Wraps to multiple lines
- No truncation by default
- Scrollable if exceeds view

### Many Nested Replies
- Max depth: 3 levels
- "View more" collapses deeper threads
- Visual indication of depth limit

### Deleted Comment with Replies
- Shows "[deleted]" content
- Preserves reply structure
- Cannot vote or reply

### Rapid Vote Toggling
- Debounced updates (100ms)
- Optimistic UI updates
- Last action wins

### Network Offline
- Comment saved locally
- Queued for upload
- Visual indicator of pending state
