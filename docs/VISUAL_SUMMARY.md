# User Feed Management - Visual Summary

## Component Previews

### 1. My Posts Screen

**Top Section:**
```
┌─────────────────────────────────────────────┐
│  ←  My Posts                             ⋯  │ Dark header (#272729)
├─────────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐   │
│ │   Posts    Likes   Comments   Shares  │   │ Stats card
│ │     12      834       156       73    │   │ (#272729, rounded)
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ 👁️ Show Hidden (2)                    │   │ Filter toggle
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Feed Items:**
```
┌─────────────────────────────────────────────┐
│ [👁️❌ HIDDEN]              [⚙️ Manage]      │ Overlays on item
│ ┌───────────────────────────────────────┐   │
│ │ 👤 Sarah Johnson                      │   │
│ │ Golden Hour Over the Coast            │   │ Feed item
│ │ ┌─────────────────────────────────┐   │   │ (#272729)
│ │ │                                 │   │   │
│ │ │        [Beautiful Image]        │   │   │
│ │ │                                 │   │   │
│ │ └─────────────────────────────────┘   │   │
│ │ The sky exploded with color...        │   │
│ │                                       │   │
│ │ 👍 245   💬 28   ↗️ 15   💾           │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 2. Edit Post Screen

```
┌─────────────────────────────────────────────┐
│  Cancel       Edit Post              Save   │ Header
├─────────────────────────────────────────────┤
│                                             │
│ Title (Optional)                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Golden Hour Over the Coast              │ │ Text input
│ └─────────────────────────────────────────┘ │ (#272729)
│                                             │
│ Content *                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ The sky exploded with color tonight...  │ │ Multiline
│ │                                         │ │ text area
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                              142 / 5000     │ Counter
│                                             │
│ URL (Optional)                              │
│ ┌─────────────────────────────────────────┐ │
│ │ https://example.com/guide               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Poll                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Preferred landscape format              │ │ Poll question
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌──────────────────────────────────── ❌ ┐ │
│ │ Full Frame DSLR                         │ │ Poll options
│ └─────────────────────────────────────────┘ │ with remove
│ ┌──────────────────────────────────── ❌ ┐ │
│ │ Mirrorless                              │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ ➕ Add Option                           │ │ Add button
│ └─────────────────────────────────────────┘ │ (dashed border)
└─────────────────────────────────────────────┘
```

### 3. Action Menu (Bottom Sheet)

```
                ┌───┐
         [Dark Overlay]
                │   │
                ▼   ▼
┌─────────────────────────────────────────────┐
│              ──                             │ Handle
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ✏️  Edit Post                           │ │ Blue (#0a66c2)
│ ├─────────────────────────────────────────┤ │
│ │ 👁️❌  Hide Post                         │ │ Orange (#f39c12)
│ ├─────────────────────────────────────────┤ │
│ │ 🗑️  Delete Post                         │ │ Red (#e74c3c)
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │              Cancel                     │ │ Gray
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 4. Delete Confirmation Dialog

```
         ┌─────────────────────────┐
         │                         │
         │          🗑️             │ Icon (48px)
         │                         │ Red (#e74c3c)
         │     Delete Post?        │ Title
         │                         │
         │  This action cannot be  │ Message
         │  undone. Your post will │
         │  be permanently deleted.│
         │                         │
         │  ┌────────┐ ┌─────────┐│
         │  │ Cancel │ │ Delete  ││ Buttons
         │  └────────┘ └─────────┘│
         │    Gray       Red      │
         └─────────────────────────┘
```

### 5. Hide Confirmation Dialog

```
         ┌─────────────────────────┐
         │                         │
         │         👁️❌            │ Icon (48px)
         │                         │ Orange (#f39c12)
         │       Hide Post?        │ Title
         │                         │
         │  This post will be      │ Message
         │  hidden from the public │
         │  feed. You can unhide   │
         │  it later from your     │
         │  posts.                 │
         │                         │
         │  ┌────────┐ ┌─────────┐│
         │  │ Cancel │ │  Hide   ││ Buttons
         │  └────────┘ └─────────┘│
         │    Gray      Orange    │
         └─────────────────────────┘
```

## Color Palette Reference

### Backgrounds
- **Main Background**: `#1a1a1b` (Very dark gray)
- **Card Background**: `#272729` (Dark gray)
- **Card Dark**: `#1f1f20` (Darker gray)

### Borders
- **Primary Border**: `#3a3b3c` (Medium gray)
- **Secondary Border**: `#343536` (Slightly darker)
- **Light Border**: `#4a4b4c` (Lighter gray)

### Text
- **Primary Text**: `#f0f0f3` (Almost white)
- **Secondary Text**: `#e4e6eb` (Light gray)
- **Tertiary Text**: `#b1b2b6` (Medium light gray)
- **Muted Text**: `#818384` (Medium gray)

### Actions
- **Edit (Blue)**: `#0a66c2`
- **Hide (Orange)**: `#f39c12`
- **Unhide (Green)**: `#27ae60`
- **Delete (Red)**: `#e74c3c`

## Typography Scale

```
20px/700 - Header Large (Screen titles)
18px/700 - Header (Section titles)
16px/600 - Title (Card titles)
15px/500 - Body Bold (Emphasized text)
15px/400 - Body (Regular text)
14px/600 - Label (Input labels)
13px/500 - Small (Secondary info)
12px/500 - Caption (Stats, counters)
```

## Spacing System

```
4px   - xs  (Tiny gaps)
8px   - sm  (Small gaps)
12px  - md  (Medium gaps)
16px  - lg  (Large gaps, standard padding)
20px  - xl  (Extra large gaps)
24px  - xxl (Section spacing)
```

## Border Radius

```
8px   - sm  (Small elements)
12px  - md  (Buttons, inputs)
14px  - lg  (Cards)
16px  - xl  (Large cards)
20px  - xxl (Modals)
999px - round (Circular)
```

## Interactive States

### Button Press
```
Active Opacity: 0.7 - 0.8
Scale: 0.95 (for dramatic effect)
Duration: 100ms
```

### Modal Animations
```
Action Menu:
  - Slide up from bottom
  - Duration: 300ms
  - Easing: ease-out

Dialogs:
  - Fade in
  - Duration: 200ms
  - Easing: ease-in-out

Overlays:
  - Fade in
  - Duration: 200ms
  - Easing: linear
```

## Shadow System

### Cards
```
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.25
shadowRadius: 6
elevation: 4 (Android)
```

### Buttons
```
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.2
shadowRadius: 4
elevation: 3 (Android)
```

### Modals
```
shadowColor: '#000'
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.3
shadowRadius: 12
elevation: 8 (Android)
```

## Icon Usage

### Ionicons Reference
- **Edit**: `create-outline` (20-22px)
- **Hide**: `eye-off-outline` (20-22px)
- **Unhide**: `eye-outline` (20-22px)
- **Delete**: `trash-outline` (20-22px)
- **Settings**: `settings-outline` (20px)
- **Back**: `arrow-back` (24px)
- **Add**: `add-circle-outline` (20px)
- **Info**: `information-circle-outline` (20px)
- **Close**: `close-circle` (24px)

## Accessibility

### Touch Targets
- **Minimum Size**: 44x44pt
- **Button Padding**: 14-16px vertical, 12-16px horizontal
- **Icon Buttons**: 36-40px circle

### Color Contrast
- **Text/Background**: Minimum 4.5:1 ratio (WCAG AA)
- **Large Text**: Minimum 3:1 ratio
- **Icons**: Minimum 3:1 ratio

### Screen Reader Labels
```
Manage Button: "Manage post options"
Edit Action: "Edit this post"
Hide Action: "Hide this post from public view"
Delete Action: "Delete this post permanently"
```

## Responsive Breakpoints

### Phone (Portrait)
- **Width**: < 600px
- **Layout**: Single column
- **Cards**: Full width with 12px margin

### Phone (Landscape)
- **Width**: < 900px
- **Layout**: Single column (maintain consistency)
- **Modals**: Adjust height for landscape

### Tablet
- **Width**: ≥ 600px
- **Layout**: Consider two columns for posts
- **Dialogs**: Max width 600px
- **Padding**: Increase to 20-24px

## State Indicators

### Hidden Post Badge
```
Background: rgba(243, 156, 18, 0.2)
Border: 1px solid #f39c12
Padding: 6px 10px
Radius: 12px
Icon: eye-off (14px)
Color: #f39c12
```

### Loading State
```
Spinner: ActivityIndicator
Color: #0a66c2
Size: large
Message: "Loading..." (#818384)
```

### Empty State
```
Icon: 64px (#4a4b4c)
Title: 20px bold (#e4e6eb)
Message: 14px (#818384)
```

## Error Handling

### Alert Dialogs
```
Success: Green accent, check icon
Error: Red accent, alert icon
Warning: Orange accent, warning icon
Info: Blue accent, info icon
```

### Validation Messages
```
Color: #e74c3c (red)
Size: 12px
Position: Below input field
Icon: alert-circle-outline
```

## Animation Timeline

### Screen Transition
```
0ms   - Start fade in
200ms - Full opacity reached
```

### Action Menu
```
0ms   - Overlay starts fading in
100ms - Menu starts sliding up
300ms - Menu fully visible
```

### Confirmation Dialog
```
0ms   - Overlay starts fading in
150ms - Dialog starts scaling/fading
250ms - Dialog fully visible
```

### Button Press
```
0ms   - Scale down to 0.95
100ms - Return to scale 1.0
```

## Performance Considerations

### List Rendering
- Use `FlatList` with `keyExtractor`
- Implement `memo` for feed items
- Lazy load images
- Virtual scrolling enabled

### State Updates
- Batch updates where possible
- Use `useCallback` for event handlers
- Minimize re-renders with proper deps

### Asset Optimization
- Vector icons (Ionicons)
- Optimized image URLs
- No large embedded assets

---

**This visual summary provides a complete reference for implementing and maintaining the User Feed Management feature with consistent, minimalist design.**
