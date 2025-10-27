<!--
Guidance for AI coding assistants working on Haritage (React Native + Expo)
Keep this short and actionable. Reference key files and conventions so the agent can be productive immediately.
-->

# Haritage — Copilot instructions (short)

Quick orientation

- Minimalist oriented when possible include layout design, iconic, text box, input text, button, anything must focus on minimalist; beside that prioritize clarity and maintainability.
- Platform: Expo + React Native (TypeScript). Entry point: `index.js` and app routes under `app/` (Expo Router).
- Project layout: see `src/` — feature modules under `src/modules/`, shared utilities under `src/shared/`, core app wiring under `src/core/`.

Big-picture architecture (what to know)

- Navigation & layout: `app/_layout.tsx` sets global providers and renders `src/core/navigation/AppNavigator.tsx`, which branches to `AuthScreen` or `HomeScreen` based on `useAuthStore()`.
- State: small, module-sliced stores implemented with Zustand in `src/core/store/slices/*`. `src/core/store/index.tsx` exports hooks like `useAuthStore`, `useFeedStore`, and `useNotificationStore` and provides `StoreProvider` to initialize them.
- Config: runtime constants live in `src/core/config/index.ts` (CONFIG). Prefer using these keys for timeouts, feature flags, and storage keys rather than hardcoding values.
- Modules: each feature (auth, feed, home, notifications, ads) lives in `src/modules/<feature>` with their own `components`, `screens`, `services`, and `hooks`.
- Mockable: UI components call hooks exported from src/core/store or src/shared/data. Hooks talk to repositories (mock today, API-ready) via the data service factory. Repositories load or mutate data through mockDataStore (+ AsyncStorage persistence) or future API clients. Zustand stores broadcast state changes back to the UI.

Developer workflows & commands

- Start development: `yarn start` (uses `expo start`). Platform shortcuts in `package.json`: `yarn ios`, `yarn android`, `yarn web`.
- Reset project: `yarn reset-project` runs `scripts/reset-project.js` (useful before CI or when switching branches).
- Linting: `yarn lint` (uses Expo lint config). There is no test runner configured in package.json by default — check `README.md` if you need tests added.
- Avoid to use cat commands to modify files due to the vscode terminal will disconnect shell.
- Avoid to use some deprecated libraries such as 'expo-av' due to it is no longer maintained and have a drop in replacement 'expo-video', 'expo-audio' which is actively maintained by expo team.
  Code conventions & patterns to follow

- Use yarn instead of npm to manage dependencies.
- TypeScript-first: prefer adding types and export them from `src/shared/types` or the module's `types/` folder.
- State hooks: use the exported hooks from `src/core/store` (e.g., `useAuthStore()`). Avoid introducing new global singletons — add stores under `src/core/store/slices/` following existing patterns.
- Services: API clients and error handling live under `src/shared/services/api/` — use `client.ts` for requests and `errorHandler.ts` for normalized errors.
- Config usage: read from `src/core/config/index.ts` for timeouts, storage keys, and feature flags. Example: use `CONFIG.FEED.ITEMS_PER_PAGE` when paginating.
- The project uses absolute imports with alias `@/` — match existing imports (e.g., `import { useAuthStore } from '@/core/store/slices/authSlice'`). Keep new files consistent with this resolver.

Keep the code simple (project style)

- Prefer clear, linear code flow over deep indirection. Small, single-purpose functions and components are easier to read and review.
- Concrete rules:
  - Keep components focused on UI and delegate business logic to `services/` or `store` hooks.
  - Keep component design, style consistent with existing minimalist dark/light theme.
  - Put async/fetching logic in `src/modules/*/services/*` (e.g., `src/modules/feed/services/mediaService.ts`) and return plain data objects or Promises.
  - Update UI state via store hooks (e.g., `useFeedStore()`) instead of passing callbacks deeply through props.
  - Avoid premature abstraction: extract helpers only when the logic is used in 2+ places.
  - Prefer straightforward imperative code rather than clever one-liners; prefer readability for maintainers.
- Example (flow):
  1. `mediaService.fetchPage(page)` -> returns `Promise<MediaItem[]>`
  2. `const items = await mediaService.fetchPage(page)` inside a screen or hook
  3. `useFeedStore().append(items)` to update the feed state

Integration points & external dependencies

- Expo SDK (see `package.json`) — use Expo-compatible native APIs (expo-av, expo-notifications, expo-secure-store, etc.).
- Navigation: Expo Router + React Navigation themes are set in `app/_layout.tsx`.
- Storage & auth: AsyncStorage and SecureStore keys are defined in `CONFIG.STORAGE_KEYS` — use them to persist tokens or preferences.

Quick examples (copy-paste friendly)

- Read config:
  - `import { CONFIG } from '@/core/config'`
  - `const perPage = CONFIG.FEED.ITEMS_PER_PAGE`
- Use auth state in a screen:
  - `import { useAuthStore } from '@/core/store'`
  - `const { isAuthenticated, user } = useAuthStore()`
- Add a new module:
  1. Create `src/modules/<name>/{screens,components,services,types}`
  2. Export any store hook from `src/core/store/slices/` and add to `src/core/store/index.tsx` if global state is needed

What not to change without a follow-up

- Do not change the `app/` routing layout or `app/_layout.tsx` providers without testing on device (iOS/Android) — these are platform-sensitive.
- Don't replace Zustand stores with other global state libraries in a single PR; if needed, propose an incremental migration plan.

If you need more context

- Read `README.md` for broader architecture and dev setup notes.
- Inspect `src/core/config/index.ts`, `src/core/navigation/AppNavigator.tsx`, and `src/core/store/slices/*` for concrete patterns.

Feedback

- After applying changes, ask maintainers to run `yarn start` and smoke-test authentication + feed screens on device or simulator.
