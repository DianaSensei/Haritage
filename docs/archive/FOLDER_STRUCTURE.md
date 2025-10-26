# Haritage App - Modular Folder Structure

This document outlines the modular folder structure designed for scalability, maintainability, and performance.

## 📁 Root Structure

```
/Users/thongnguyen/Documents/GitHub/Haritage/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with navigation
│   ├── (tabs)/                  # Tab-based navigation
│   └── modal.tsx                # Modal screens
├── src/                         # Source code (modular architecture)
│   ├── modules/                 # Feature modules
│   ├── shared/                  # Shared components and utilities
│   └── core/                    # Core application logic
├── assets/                      # Static assets
├── components/                  # Legacy components (to be migrated)
├── constants/                   # App constants
└── hooks/                       # Legacy hooks (to be migrated)
```

## 🏗️ Modular Architecture (`src/`)

### 📦 Modules (`src/modules/`)
Each module is self-contained with its own components, services, hooks, and types.

#### 🔐 Authentication Module (`src/modules/auth/`)
```
auth/
├── components/
│   ├── PhoneLoginForm.tsx       # Phone number input form
│   └── OTPVerificationForm.tsx  # OTP verification form
├── services/
│   └── authService.ts           # Authentication API calls
├── hooks/
│   └── useAuth.ts              # Authentication state management
├── types/
│   └── index.ts                # Auth-specific types
└── screens/
    └── AuthScreen.tsx          # Main auth screen
```

**Features:**
- Phone number OTP authentication
- Biometric authentication (Face ID/Touch ID)
- Secure token storage
- Session management

#### 🏠 Home Module (`src/modules/home/`)
```
home/
├── components/
│   └── UserInfoBlock.tsx       # User profile display
├── screens/
│   └── HomeScreen.tsx          # Main home screen
└── services/
    └── homeService.ts          # Home data fetching
```

**Features:**
- User information display
- Quick actions (edit profile, logout)
- Integration with feed and ads

#### 📱 Feed Module (`src/modules/feed/`)
```
feed/
├── components/
│   ├── VideoPlayer.tsx         # Video player with auto-play
│   └── FeedItem.tsx            # Individual feed item
├── screens/
│   └── FeedScreen.tsx          # Feed list screen
└── services/
    └── feedService.ts          # Feed data management
```

**Features:**
- Video auto-play functionality
- Like, comment, share actions
- Infinite scroll
- Pull-to-refresh

#### 🔔 Notifications Module (`src/modules/notifications/`)
```
notifications/
├── components/
│   ├── NotificationCenter.tsx  # Full notification modal
│   └── NotificationBell.tsx    # Notification bell with badge
└── services/
    └── notificationService.ts  # Notification management
```

**Features:**
- Real-time notifications
- Unread count badge
- Mark as read functionality
- Notification history

#### 📢 Ads Module (`src/modules/ads/`)
```
ads/
├── components/
│   └── AdBanner.tsx            # Advertisement banner
└── services/
    └── adService.ts            # Ad management
```

**Features:**
- Banner advertisements
- Native ad integration
- Ad interaction tracking

### 🔄 Shared Resources (`src/shared/`)

#### 🧩 Components (`src/shared/components/`)
```
components/
├── ui/                         # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── forms/                      # Form components
│   └── FormField.tsx
└── layout/                     # Layout components
    ├── Container.tsx
    └── SafeArea.tsx
```

#### 🎣 Hooks (`src/shared/hooks/`)
```
hooks/
├── useApi.ts                   # API call hook
├── useDebounce.ts              # Debounce utility
└── useLocalStorage.ts          # Local storage hook
```

#### 🛠️ Utilities (`src/shared/utils/`)
```
utils/
├── validation.ts               # Form validation
├── formatting.ts               # Data formatting
├── constants.ts                # Shared constants
└── helpers.ts                  # Utility functions
```

#### 📝 Types (`src/shared/types/`)
```
types/
└── index.ts                    # Global TypeScript types
```

#### 🌐 Services (`src/shared/services/`)
```
services/
├── api/
│   ├── client.ts               # API client configuration
│   └── endpoints.ts            # API endpoints
├── storage/
│   └── storageService.ts       # Storage utilities
└── auth/
    └── tokenService.ts         # Token management
```

### ⚙️ Core (`src/core/`)

#### 🧭 Navigation (`src/core/navigation/`)
```
navigation/
└── AppNavigator.tsx            # Main app navigation
```

#### 🗄️ State Management (`src/core/store/`)
```
store/
├── slices/
│   ├── authSlice.ts            # Authentication state
│   ├── feedSlice.ts            # Feed state
│   └── notificationSlice.ts    # Notification state
├── providers/
│   └── StoreProvider.tsx       # Store provider
└── index.ts                    # Store exports
```

#### ⚙️ Configuration (`src/core/config/`)
```
config/
└── index.ts                    # App configuration
```

## 🎯 Benefits of This Structure

### ✅ Modularity
- **Self-contained modules**: Each feature is isolated
- **Clear boundaries**: Easy to understand dependencies
- **Independent development**: Teams can work on different modules

### ⚡ Performance
- **Code splitting**: Modules can be lazy-loaded
- **Tree shaking**: Unused code can be eliminated
- **Optimized imports**: Clear import paths

### 🔧 Maintainability
- **Single responsibility**: Each file has a clear purpose
- **Easy testing**: Modules can be tested independently
- **Scalable**: Easy to add new features

### 🚀 Developer Experience
- **Intuitive navigation**: Easy to find files
- **Consistent patterns**: Similar structure across modules
- **Type safety**: Strong TypeScript integration

## 📋 Migration Strategy

1. **Phase 1**: Set up core structure and authentication
2. **Phase 2**: Migrate existing components to modules
3. **Phase 3**: Implement new features using modular approach
4. **Phase 4**: Optimize and refactor based on usage

## 🔄 State Management Flow

```
User Action → Component → Hook → Service → API → Store → UI Update
```

## 📱 Module Communication

- **Direct imports**: For tightly coupled modules
- **Shared services**: For cross-module communication
- **Global state**: For app-wide state management
- **Event system**: For loose coupling when needed

This structure ensures your Haritage app is scalable, maintainable, and performant while supporting the complex features you've requested.
