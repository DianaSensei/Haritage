# User Feed Management - Wireframes & Design Specs

## Screen Wireframes

### 1. My Posts Screen (MyFeedsScreen)

```
┌─────────────────────────────────────┐
│  ← Back    My Posts              ⋯  │ ← Header
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Posts   Likes   Comments  Shares │ ← Statistics
│  │   12      834      156       73  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  👁️ Show Hidden (2)                 │ ← Filter Toggle
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [Hidden Badge] 👤 Sarah  ⚙️  │  │ ← Feed Item
│  │  Golden Hour Over the Coast   │  │   with Manage
│  │  ┌─────────────────────────┐  │  │   Button
│  │  │                         │  │  │
│  │  │      [Image]            │  │  │
│  │  │                         │  │  │
│  │  └─────────────────────────┘  │  │
│  │  The sky exploded with...     │  │
│  │  👍 245  💬 28  ↗️ 15  ⋯       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  👤 Sarah Johnson      ⚙️     │  │
│  │  Morning Surf Session         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │      ▶️ [Video]          │  │  │
│  │  └─────────────────────────┘  │  │
│  │  Perfect waves this...        │  │
│  │  👍 189  💬 42  ↗️ 23  ⋯       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 2. Edit Post Screen (EditFeedScreen)

```
┌─────────────────────────────────────┐
│  Cancel    Edit Post         Save   │ ← Header
├─────────────────────────────────────┤
│                                     │
│  Title (Optional)                   │
│  ┌─────────────────────────────────┐│
│  │ Golden Hour Over the Coast      ││
│  └─────────────────────────────────┘│
│                                     │
│  Content *                          │
│  ┌─────────────────────────────────┐│
│  │ The sky exploded with color     ││
│  │ tonight—definitely worth the    ││
│  │ detour after work. Captured a   ││
│  │ few frames before the light     ││
│  │ faded.                          ││
│  └─────────────────────────────────┘│
│                       142 / 5000    │
│                                     │
│  URL (Optional)                     │
│  ┌─────────────────────────────────┐│
│  │ https://example.com/guide       ││
│  └─────────────────────────────────┘│
│                                     │
│  Poll                               │
│  ┌─────────────────────────────────┐│
│  │ Preferred landscape format      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Full Frame DSLR             ❌  ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Mirrorless                  ❌  ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ➕ Add Option                   ││
│  └─────────────────────────────────┘│
│                                     │
│  ℹ️ Media editing is not supported  │
│  yet. To change media, delete...   │
│                                     │
└─────────────────────────────────────┘
```

### 3. Feed Action Menu (Bottom Sheet)

```
┌─────────────────────────────────────┐
│                                     │
│              [Overlay]              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│          ───                        │ ← Handle
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │  ✏️  Edit Post                  ││ ← Blue
│  ├─────────────────────────────────┤│
│  │  👁️  Hide Post                  ││ ← Orange
│  ├─────────────────────────────────┤│
│  │  🗑️  Delete Post                ││ ← Red
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │          Cancel                 ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 4. Delete Confirmation Dialog

```
┌─────────────────────────────────────┐
│                                     │
│         [Dark Overlay]              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │          🗑️                 │   │ ← Icon
│  │                             │   │
│  │      Delete Post?           │   │ ← Title
│  │                             │   │
│  │  This action cannot be      │   │ ← Message
│  │  undone. Your post will be  │   │
│  │  permanently deleted.       │   │
│  │                             │   │
│  │  ┌───────┐      ┌─────────┐│   │
│  │  │Cancel │      │ Delete  ││   │ ← Buttons
│  │  └───────┘      └─────────┘│   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 5. Hide Confirmation Dialog

```
┌─────────────────────────────────────┐
│                                     │
│         [Dark Overlay]              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │          👁️❌              │   │ ← Icon
│  │                             │   │
│  │       Hide Post?            │   │ ← Title
│  │                             │   │
│  │  This post will be hidden   │   │ ← Message
│  │  from the public feed. You  │   │
│  │  can unhide it later from   │   │
│  │  your posts.                │   │
│  │                             │   │
│  │  ┌───────┐      ┌─────────┐│   │
│  │  │Cancel │      │  Hide   ││   │ ← Buttons
│  │  └───────┘      └─────────┘│   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 6. Empty State

```
┌─────────────────────────────────────┐
│  ← Back    My Posts              ⋯  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│             📄                      │ ← Icon
│                                     │
│         No Posts Yet                │ ← Title
│                                     │
│    Start sharing your moments       │ ← Message
│    with the community               │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Interaction Flow Diagrams

### Edit Flow
```
My Posts Screen
      │
      ├──► Tap ⚙️ button
      │
      ▼
Feed Action Menu
      │
      ├──► Tap "Edit Post"
      │
      ▼
Edit Post Screen
      │
      ├──► Modify fields
      │
      ├──► Tap "Save"
      │     │
      │     ├──► Validate
      │     │
      │     ├──► Update post
      │     │
      │     └──► Show success
      │
      └──► Tap "Cancel"
            │
            ├──► Has changes?
            │     │
            │     ├── Yes ──► Show confirmation
            │     │              │
            │     │              ├── Discard ──► Back
            │     │              │
            │     │              └── Keep Editing ──► Stay
            │     │
            │     └── No ──► Back
```

### Hide Flow
```
My Posts Screen
      │
      ├──► Tap ⚙️ button
      │
      ▼
Feed Action Menu
      │
      ├──► Tap "Hide Post"
      │
      ▼
Hide Confirmation
      │
      ├──► Tap "Hide"
      │     │
      │     ├──► Mark as hidden
      │     │
      │     ├──► Update UI
      │     │
      │     └──► Show success
      │
      └──► Tap "Cancel" ──► Dismiss
```

### Delete Flow
```
My Posts Screen
      │
      ├──► Tap ⚙️ button
      │
      ▼
Feed Action Menu
      │
      ├──► Tap "Delete Post"
      │
      ▼
Delete Confirmation
      │
      ├──► Tap "Delete"
      │     │
      │     ├──► Remove post
      │     │
      │     ├──► Update UI
      │     │
      │     └──► Show success
      │
      └──► Tap "Cancel" ──► Dismiss
```

## Component Breakdown

### ManageableFeedItem
```
┌─────────────────────────────────────┐
│  [Badge?]           [⚙️ Button]     │ ← Overlays
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      FeedItem Component     │   │ ← Existing
│  │      (unchanged)            │   │   Component
│  │                             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Overlays**:
- Hidden Badge (top-left): Shown when `isHidden = true`
- Manage Button (top-right): Shown when `author.id = currentUserId`

### ConfirmDialog Components
- **Modal Overlay**: Semi-transparent black, 70% opacity
- **Dialog Card**: Dark gray (#272729), rounded corners
- **Icon**: 48px, colored based on action type
- **Title**: 20px, bold, white
- **Message**: 14px, gray, centered
- **Buttons**: Equal width, side-by-side
  - Cancel: Gray background
  - Confirm: Colored based on action

### FeedActionMenu Components
- **Modal Overlay**: Semi-transparent black, 60% opacity
- **Menu Container**: Slide up from bottom
- **Handle**: Small gray bar at top
- **Action Items**: Icon + text, colored borders
- **Cancel Button**: Separate, at bottom

## Design Tokens

### Colors
```typescript
const colors = {
  // Backgrounds
  background: '#1a1a1b',
  card: '#272729',
  cardDark: '#1f1f20',
  
  // Borders
  border: '#3a3b3c',
  borderLight: '#343536',
  borderDark: '#4a4b4c',
  
  // Text
  textPrimary: '#f0f0f3',
  textSecondary: '#e4e6eb',
  textTertiary: '#b1b2b6',
  textMuted: '#818384',
  
  // Actions
  edit: '#0a66c2',
  hide: '#f39c12',
  unhide: '#27ae60',
  delete: '#e74c3c',
};
```

### Typography
```typescript
const typography = {
  headerLarge: { fontSize: 20, fontWeight: '700' },
  header: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyBold: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  tiny: { fontSize: 12, fontWeight: '400' },
};
```

### Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};
```

### Border Radius
```typescript
const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  round: 999,
};
```

## Accessibility Notes

### Screen Readers
- All interactive elements have accessible labels
- Action buttons describe their function
- Confirmation dialogs read full message
- Statistics have proper labels

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter key activates primary actions
- Escape key dismisses modals

### Touch Targets
- Minimum 44x44pt touch targets
- Adequate spacing between actions
- Clear visual feedback on press

### Color Contrast
- All text meets WCAG AA standards
- Icons have sufficient contrast
- Destructive actions clearly marked

## Animation Specifications

### Modal Animations
- **Action Menu**: Slide up 300ms, ease-out
- **Dialogs**: Fade in 200ms, ease-in-out
- **Overlays**: Fade in 200ms, linear

### Transitions
- **Badge appearance**: Fade in 150ms
- **Button press**: Scale 0.95, 100ms
- **List updates**: Fade out 200ms

## Responsive Design

### Phone (Portrait)
- Single column layout
- Full width cards
- Stack statistics vertically on small screens

### Phone (Landscape)
- Maintain single column for consistency
- Adjust modal heights for landscape

### Tablet
- Consider two-column layout for posts
- Wider max-width for dialogs (600px)
- More horizontal padding

## Mock Data Samples

See `src/modules/feed/data/mockUserFeedData.ts` for complete samples including:
1. Post with multiple images + URL
2. Post with video
3. Text post with active poll
4. Text post with URL preview
5. Post with single image + URL
6. Simple text post
7. Hidden post
8. Post with closed poll
9. Post with video + multiple images

Each sample includes realistic engagement metrics and timestamps.
