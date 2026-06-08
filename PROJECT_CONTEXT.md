# Recipe Book App — Project Context & Enhancement Reference

> **Single source of truth** for the codebase. Cross-checked against the actual source files as of June 2026. Use this document for planning improvements, onboarding, and feature development.
>
> **Last updated:** June 2026 — auth API effects wired, interceptor migrated to Bearer token, sidenav gated on auth state, `AuthComponent` refactored to typed reactive form + signal-native state.

---

## Table of Contents

1. [Technology Stack & Packages](#1-technology-stack--packages)
2. [Project Structure](#2-project-structure)
3. [Architecture Overview](#3-architecture-overview)
4. [Entry Point & Bootstrap](#4-entry-point--bootstrap)
5. [Routing](#5-routing)
6. [UI & UX — Current State](#6-ui--ux--current-state)
7. [Components](#7-components)
8. [Services](#8-services)
9. [State Management (NgRx)](#9-state-management-ngrx)
10. [Data Models](#10-data-models)
11. [Authentication Flow](#11-authentication-flow)
12. [API Integration](#12-api-integration)
13. [Known Issues & Gaps](#13-known-issues--gaps)
14. [Enhancement Roadmap](#14-enhancement-roadmap)

---

## 1. Technology Stack & Packages

### Core Angular (v21.2.x)
| Package | Version | Purpose |
|---|---|---|
| `@angular/core` | ^21.2.16 | Framework core |
| `@angular/common` | ^21.2.16 | Common directives/pipes |
| `@angular/forms` | ^21.2.16 | Reactive forms |
| `@angular/router` | ^21.2.16 | Client-side routing |
| `@angular/animations` | ^21.2.16 | Animation support |
| `@angular/cdk` | ^21.2.14 | Component Dev Kit (layout, drag-drop, breakpoints) |
| `@angular/material` | ^21.2.14 | Material Design UI components |
| `zone.js` | ~0.15.0 | Change detection |
| `rxjs` | ^7.8.2 | Reactive programming |
| `tslib` | ^2.8.1 | TypeScript runtime helpers |

### State Management (NgRx v21.1.0)
| Package | Purpose |
|---|---|
| `@ngrx/store` | Redux-inspired global state |
| `@ngrx/effects` | Side effects (HTTP, navigation, timers) |
| `@ngrx/entity` | Normalized entity state (used in recipes slice) |
| `@ngrx/operators` | Custom RxJS operators for NgRx |
| `@ngrx/router-store` | Router state in NgRx store |
| `@ngrx/store-devtools` | Redux DevTools integration |

### Build & Dev Tools
| Package | Version |
|---|---|
| `@angular/cli` | ^21.2.14 |
| `@angular/build` | ^21.2.14 |
| `typescript` | ~5.9.3 |

### Testing
| Package | Version |
|---|---|
| `jasmine-core` | ^5.7.1 |
| `karma` | ^6.4.4 |
| `karma-chrome-launcher` | ^3.2.0 |
| `karma-coverage` | ^2.2.1 |
| `karma-jasmine` | ^5.1.0 |
| `karma-jasmine-html-reporter` | ^2.1.0 |

**Removed from previous versions:** Bootstrap, ng-bootstrap, jQuery, @popperjs/core, Firebase SDK.

---

## 2. Project Structure

```
src/
├── main.standalone.ts              ← Active entry point (bootstraps standalone AppComponent)
├── main.ts                         ← Legacy entry point (NgModule-based, inactive)
├── styles.css / styles.scss        ← Global styles + Material theme
├── index.html                      ← Loads Material fonts & icons
├── environments/
│   ├── environment.ts              ← { production: false, apiUrl: 'http://localhost:3000/api' }
│   └── environment.prod.ts         ← { production: true, apiUrl: 'http://localhost:3000/api' }
└── app/
    ├── app.component.standalone.ts ← Root component with Material Sidenav layout
    ├── app.config.ts               ← ApplicationConfig (providers, NgRx, interceptors)
    ├── app.routes.ts               ← Top-level routes
    │
    ├── core/                       ← Singleton services, guards, interceptors
    │   ├── guards/
    │   │   └── auth.guard.ts       ← Functional CanActivateFn guard
    │   ├── interceptors/
    │   │   └── auth-interceptor.ts ← Functional HttpInterceptorFn (appends ?auth= token)
    │   └── services/
    │       ├── auth.service.ts     ← Auth signals + logout timer
    │       ├── recipe.service.ts   ← HTTP + signals for recipe state
    │       ├── notification.service.ts ← MatSnackBar wrapper (success/error/info/warning)
    │       ├── responsive-layout.service.ts ← CDK BreakpointObserver → signals
    │       └── theme.service.ts    ← Light/dark theme toggle, persisted to localStorage
    │
    ├── features/                   ← Feature-sliced standalone components
    │   ├── auth/
    │   │   └── auth.component.ts   ← Login/Signup toggle, Material forms, signals
    │   ├── favorites/
    │   │   └── favorites.component.ts  ← Stub (reads recipes state, UI not implemented)
    │   ├── profile/
    │   │   └── profile.component.ts    ← Stub (reads auth state, UI not implemented)
    │   ├── recipes/
    │   │   ├── models/recipe.model.ts
    │   │   ├── recipes.component.ts    ← Shell with <router-outlet>
    │   │   ├── recipes.routes.ts       ← RECIPE_ROUTES (list, new, :id, :id/edit)
    │   │   ├── recipe-list/            ← Grid/list view, search, filter, sort (signals)
    │   │   ├── recipe-detail/          ← Tabbed detail view, add-to-shopping-list
    │   │   ├── recipe-edit/            ← Create/edit form, drag-drop ingredients
    │   │   └── recipe-start/           ← Empty state placeholder
    │   └── shopping-list/
    │       ├── shopping-list.component.ts   ← Checkbox list, grouped view (signals)
    │       └── shopping-edit/
    │           └── shopping-edit.component.ts ← Inline add/edit form
    │
    ├── shared/
    │   ├── models/
    │   │   └── ingredient.model.ts
    │   └── ui-components/
    │       ├── header.component.ts     ← Standalone toolbar (used optionally)
    │       ├── loading-spinner.component.ts
    │       └── alert.component.ts
    │
    └── store/                      ← NgRx slices
        ├── app.reducer.ts          ← ActionReducerMap (auth + recipes + shoppingList)
        ├── auth/
        │   ├── auth.actions.ts
        │   ├── auth.reducer.ts
        │   └── auth.effects.ts
        ├── recipes/
        │   ├── recipe.actions.ts
        │   ├── recipe.reducer.ts   ← Uses @ngrx/entity EntityAdapter
        │   ├── recipe.selectors.ts ← Rich selectors: filter, sort, stats, VM selector
        │   ├── recipe.effects.ts
        │   └── index.ts
        └── shopping-list/
            ├── shopping-list.actions.ts
            ├── shopping-list.reducer.ts
            └── shopping-list.selectors.ts ← Includes groupedIngredients selector

LEGACY (still present, not used by active build):
    app/auth/           ← Old NgModule-based auth
    app/recipes/        ← Old NgModule-based recipes
    app/shopping-list/  ← Old NgModule-based shopping list
    app/header/
    app/shared/ (old)
    app/app.module.ts
    app/app-routing.module.ts
    app/core.module.ts
```

---

## 3. Architecture Overview

**Pattern:** Standalone Components + NgRx + Angular Signals (hybrid)

- All active components are **standalone** (`standalone: true`) — no NgModules required.
- **Local UI state** managed with `signal()` and `computed()` directly in components.
- **Global application state** (auth, recipes, shopping list) managed via **NgRx store**.
- **Side effects** (HTTP calls, navigation, localStorage, timers) handled in NgRx Effects.
- **Services** bridge between the store (NgRx) and templates (signals) — they subscribe to store slices and expose the data as signals.
- **Dependency injection** uses `inject()` function, not constructor injection.
- **Guards and interceptors** are functional (`CanActivateFn`, `HttpInterceptorFn`).

```
Template ──reads──▶ Signals (computed / toSignal)
                         ▲
Service ──subscribes──▶ NgRx Store Selector
                         ▲
Effects ──HTTP──▶ REST API ──▶ Actions ──▶ Reducer ──▶ Store
                         ▼
Component ──dispatch──▶ Action
```

---

## 4. Entry Point & Bootstrap

**Active:** `src/main.standalone.ts`
```typescript
bootstrapApplication(AppComponent, appConfig)
```

**`app.config.ts` providers:**
- `provideZoneChangeDetection({ eventCoalescing: true })`
- `provideRouter(routes)`
- `provideAnimations()`
- `provideHttpClient(withInterceptors([authInterceptor]))`
- `provideStore(appReducer)`
- `provideEffects([AuthEffects, RecipeEffects])`
- `provideStoreDevtools({ maxAge: 25, logOnly: false, connectInZone: true })`
- `provideRouterStore()`

**Root component (`app.component.standalone.ts`):**
- Material `MatSidenav` shell layout (responsive drawer)
- Dispatches `AuthActions.autoLogin()` on `ngOnInit`
- Uses `BreakpointObserver` (CDK) for handset detection
- Dynamic page title via `signal('Recipe Book')` updated on `NavigationEnd`
- `isAuthRoute = signal(false)` — tracks whether the current URL is `/auth`
- `showNav = computed(...)` — sidenav is fully removed from DOM when unauthenticated or on `/auth`; uses `AuthService.isAuthenticated` signal

---

## 5. Routing

```
/                       → redirect to /recipes
/recipes                → RecipesComponent (shell, lazy: RECIPE_ROUTES) [authGuard]
  /recipes              → RecipeListComponent
  /recipes/new          → RecipeEditComponent (create mode)
  /recipes/:id          → RecipeDetailComponent
  /recipes/:id/edit     → RecipeEditComponent (edit mode)
/favorites              → FavoritesComponent (lazy, loadComponent) [authGuard]
/shopping-list          → ShoppingListComponent (lazy, loadComponent) [authGuard]
/profile                → ProfileComponent (lazy, loadComponent) [authGuard]
/auth                   → AuthComponent (lazy, loadComponent, public)
```

**Auth Guard:** Functional `CanActivateFn` — selects `auth` slice from store, redirects to `/auth` if `user` is null.

**Preloading:** No explicit `PreloadAllModules` strategy configured (uses default lazy loading).

---

## 6. UI & UX — Current State

### Framework
- **Angular Material v21** — replaces Bootstrap entirely
- **No Bootstrap, jQuery, or Popper.js**
- **Material Icons** loaded via Google Fonts CDN in `index.html`

### Layout (Root App Component)
- **`MatSidenav`** shell: responsive side drawer navigation
- **`MatToolbar`** top bar with page title and action buttons
- Drawer auto-closes on mobile after navigation
- Breakpoint detection via Angular CDK `BreakpointObserver`

### Authentication Page (`/auth`)
- `MatCard` centered on-screen via `display: grid; place-items: center` (full-viewport, dvh-aware)
- Sidenav is completely hidden while on this route (`showNav` computed in `AppComponent`)
- Email + password fields with `MatFormField appearance="outline"` / `MatInput`
- Typed `FormGroup<AuthForm>` with `FormControl<string | null>` for compile-time safety
- Toggle between Login and Sign Up modes via `isLoginMode = signal(true)`; switching also dispatches `AuthActions.clearError()`
- Password visibility toggle (`MatIcon`, `hidePassword = signal(true)`)
- `mat-error` messages gated on `touched || dirty` — no premature validation noise
- `MatProgressSpinner` (indeterminate, diameter 48) shown during loading via `isLoading` computed signal
- `authError` computed signal drives both an inline error banner and `NotificationService.showError()` via `effect()`
- Responsive: `isMobile` signal from `ResponsiveLayoutService` available in template
- `autocomplete` attributes set per field; `novalidate` on form; `aria-label` on toggle button

### Recipe List (`/recipes`)
- **Grid and List view modes** (toggle via `MatButtonToggle`, persisted to localStorage)
- **Search** by name/description (debounced signal, `MatInput`)
- **Filter** by difficulty (Easy / Medium / Hard / All) via `MatSelect`
- **Filter** by minimum rating (0–5)
- **Sort** by name / rating / cookingTime via `MatSelect`
- Computed statistics: recipe count, average rating
- `MatProgressSpinner` for loading state
- Recipes displayed as `MatCard` items
- Responsive: uses `ResponsiveLayoutService` for grid columns (1 mobile / 2 tablet / 3 desktop)

### Recipe Detail (`/recipes/:id`)
- **`MatTabGroup`** with tabs: Overview, Ingredients, Instructions
- Recipe metadata: rating, cooking time, difficulty, servings (as `MatChip` items)
- Ingredient list with `MatList`
- Instructions rendered as step list
- "Add to Shopping List" button dispatches `ShoppingListActions.addIngredients`
- Edit / Delete actions via `MatMenu`
- `NotificationService` (MatSnackBar) for feedback

### Recipe Edit (`/recipes/new`, `/recipes/:id/edit`)
- Reactive form with `FormBuilder` and `FormArray` for ingredients + instructions
- `DragDropModule` (CDK) for drag-and-drop reordering of ingredients/instructions
- `MatSelect` for difficulty level
- Rating, cooking time, servings fields with validation
- Dispatches `RecipeActions.addRecipe` or `RecipeActions.updateRecipe`

### Shopping List (`/shopping-list`)
- Ingredient list with `MatCheckbox` items
- Inline `ShoppingEditComponent` for add/update
- Grouped ingredient view via selector (aggregates duplicate items)
- `MatTooltip`, `MatDivider`, `MatChips` for UX polish
- Clear all button with `ShoppingListActions.clearIngredients`
- Responsive layout via `ResponsiveLayoutService`

### Notifications
- `NotificationService` wraps `MatSnackBar`
- 4 variants: `showSuccess`, `showError`, `showInfo`, `showWarning`
- CSS classes: `success-snackbar`, `error-snackbar`, `info-snackbar`, `warning-snackbar`
- Default duration: 3s (errors: 5s), top-end position

### Theme
- `ThemeService` supports light/dark toggle
- Theme stored in localStorage under key `app-theme`
- Applies/removes `dark-theme` CSS class on `document.body`
- **Current gap:** Dark theme CSS variables are not fully defined — toggle exists but visual effect is incomplete

### Responsive Layout
- `ResponsiveLayoutService` uses CDK `BreakpointObserver`
- Breakpoints: mobile `<768px`, tablet `768–1200px`, desktop `>1200px`
- Exposes `deviceType`, `isMobile`, `isTablet`, `isDesktop`, `layoutConfig` as signals
- `layoutConfig.gridColumns`: 1 / 2 / 3 for respective breakpoints

---

## 7. Components

### Active (Standalone, Angular 21)

| Component | Path | Key Patterns |
|---|---|---|
| `AppComponent` | `app.component.standalone.ts` | Root sidenav shell, autoLogin dispatch; `showNav` computed hides drawer on `/auth` |
| `AuthComponent` | `features/auth/auth.component.ts` | Typed reactive form; `isLoginMode`, `hidePassword`, `isLoading`, `authError` signals; `NotificationService` error relay via `effect()` |
| `RecipesComponent` | `features/recipes/recipes.component.ts` | Shell with `<router-outlet>` |
| `RecipeListComponent` | `features/recipes/recipe-list/` | `computed()` filters/sort, `toSignal()`, view mode, CDK layout |
| `RecipeDetailComponent` | `features/recipes/recipe-detail/` | Tabs, add to shopping list, NgRx selectors |
| `RecipeEditComponent` | `features/recipes/recipe-edit/` | FormArray, CDK DragDrop, edit/create mode |
| `RecipeStartComponent` | `features/recipes/recipe-start/` | Empty state placeholder |
| `ShoppingListComponent` | `features/shopping-list/` | Checkbox list, grouped, signals |
| `ShoppingEditComponent` | `features/shopping-list/shopping-edit/` | Inline add/edit form |
| `FavoritesComponent` | `features/favorites/` | **Stub** — reads recipes state, no UI implemented |
| `ProfileComponent` | `features/profile/` | **Stub** — reads auth state, no UI implemented |
| `HeaderComponent` | `shared/ui-components/header.component.ts` | Standalone toolbar (optional usage) |
| `LoadingSpinnerComponent` | `shared/ui-components/loading-spinner.component.ts` | Reusable spinner |
| `AlertComponent` | `shared/ui-components/alert.component.ts` | Reusable alert |

### Legacy (NgModule-based, not active in build)
Located in `app/auth/`, `app/recipes/`, `app/shopping-list/`, `app/header/` — kept for reference only.

---

## 8. Services

### `AuthService` (`core/services/auth.service.ts`)
- **Signals:** `isAuthenticated`, `currentUser`
- Subscribes to `store.select('auth')` to keep signals in sync
- `setLogoutTimer(ms)` — sets a `setTimeout` that dispatches `logout` action
- `clearLogoutTimer()` — cancels the timer
- `currentUser` signal is used as a token fallback in the auth interceptor

### `RecipeService` (`core/services/recipe.service.ts`)
- **Signals:** `recipes`, `selectedRecipe`, `isLoading`, `error`
- HTTP methods: `getRecipes()`, `getRecipeById(id)`, `createRecipe(recipe)`, `updateRecipe(id, recipe)`, `deleteRecipe(id)`
- API base URL: `environment.apiUrl + '/recipes'` → `http://localhost:3000/api/recipes`
- Subscribes to store `recipes` slice for signal sync (note: state key is `recipes.recipes` — may be stale if entity adapter used)
- **Gap:** `addIngredientsToShoppingList()` is a stub — does not dispatch any action

### `NotificationService` (`core/services/notification.service.ts`)
- Wraps `MatSnackBar`
- Methods: `showSuccess`, `showError`, `showInfo`, `showWarning`, `show`, `dismiss`
- Duration: 3s default, 5s for errors
- Position: top-end

### `ResponsiveLayoutService` (`core/services/responsive-layout.service.ts`)
- Uses `BreakpointObserver` (CDK)
- Signals: `deviceType`, `isMobile`, `isTablet`, `isDesktop`, `layoutConfig`
- `layoutConfig` includes `gridColumns`, `headerHeight`, `containerPadding`

### `ThemeService` (`core/services/theme.service.ts`)
- Signals: `currentTheme` (`'light' | 'dark'`)
- `toggleTheme()`, `setTheme(theme)`, `isDarkMode()`
- Persists to localStorage, applies CSS class to `document.body`

---

## 9. State Management (NgRx)

### Global Store Shape
```typescript
AppState {
  auth: {
    user: AuthUser | null,   // { email, id, token, tokenExpirationDate }
    authError: string | null,
    loading: boolean
  },
  recipes: {
    ids: string[],           // EntityAdapter
    entities: { [id]: Recipe },
    selectedRecipeId: string | null,
    loading: boolean,
    loaded: boolean,
    error: string | null
  },
  shoppingList: {
    ingredients: Ingredient[],
    editedIngredient: Ingredient | null,
    editedIngredientIndex: number    // -1 when not editing
  }
}
```

### Auth Slice (`store/auth/`)

**Actions:**
- `loginStart({ email, password })`
- `loginSuccess({ user: AuthUser, redirect: boolean })`
- `loginFail({ error })`
- `signupStart({ email, password })`
- `signupSuccess({ user: AuthUser, redirect: boolean })`
- `signupFail({ error })`
- `autoLogin`
- `logout`
- `clearError`

**Effects:**
- `loginStart$` — `switchMap`s `loginStart` → `POST /api/auth/login` → `loginSuccess` (with localStorage persist + logout timer) or `loginFail`
- `signupStart$` — `switchMap`s `signupStart` → `POST /api/auth/register` → `signupSuccess` or `signupFail`
- `autoLogin$` — reads `localStorage.userData`, dispatches `loginSuccess` if valid token found
- `authRedirect$` — navigates to `/recipes` on `loginSuccess`/`signupSuccess` when `redirect: true`
- `authLogout$` — clears timer, removes `localStorage.userData`, navigates to `/auth`

**`AuthResponse` interface (internal to effects):**
```typescript
interface AuthResponse { email: string; id: string; token: string; expiresIn: number; }
```

**`buildUserAndPersist()` helper (private, shared by `loginStart$` and `signupStart$`):** constructs `AuthUser`, writes `localStorage.userData` using the `_token`/`_tokenExpirationDate` keys that `autoLogin$` expects, and starts the logout timer.

### Recipes Slice (`store/recipes/`)

**Entity Adapter:** `createEntityAdapter<Recipe>({ selectId: recipe => recipe.id! })`

**Actions:** Full CRUD with optimistic/pessimistic patterns:
- `loadRecipes` / `loadRecipesSuccess` / `loadRecipesFail`
- `loadRecipe(id)` / `loadRecipeSuccess` / `loadRecipeFail`
- `addRecipe(recipe)` / `addRecipeSuccess` / `addRecipeFail`
- `updateRecipe(id, recipe)` / `updateRecipeSuccess` / `updateRecipeFail`
- `deleteRecipe(id)` / `deleteRecipeSuccess` / `deleteRecipeFail`
- `selectRecipe(id)`, `clearSelectedRecipe`, `clearError`

**Effects:** Full CRUD via `RecipeService` HTTP calls, `NotificationService` feedback on success/fail.

**Selectors (`store/recipes/recipe.selectors.ts`):**
- Entity: `selectAllRecipes`, `selectRecipeEntities`, `selectRecipeIds`, `selectRecipeTotal`
- Status: `selectRecipesLoading`, `selectRecipesLoaded`, `selectRecipesError`
- UI: `selectSelectedRecipeId`, `selectSelectedRecipe`, `selectRecipeById(id)`
- Filters: `selectRecipesByDifficulty(d)`, `selectRecipesByMinRating(n)`, `selectRecipesBySearchTerm(term)`
- Computed: `selectQuickRecipes` (≤30 min), `selectHighRatedRecipes` (≥4), `selectRecipesSortedByRating`, `selectRecipesSortedByCookingTime`
- Stats: `selectRecipeStats` (total, averageRating, averageCookingTime, easyCount, mediumCount, hardCount)
- VM: `selectRecipesViewModel` (recipes + loading + error + selectedId + hasRecipes)

### Shopping List Slice (`store/shopping-list/`)

**Actions:**
- `addIngredient`, `addIngredients`, `updateIngredient(index, ingredient)`, `deleteIngredient(index)`
- `startEdit(index)`, `stopEdit`, `clearIngredients`

**Selectors:**
- `selectAllIngredients`, `selectEditedIngredient`, `selectEditingIndex`, `selectIsEditing`
- `selectIngredientCount`, `selectIngredientByIndex(i)`, `selectGroupedIngredients`

**No Effects** — shopping list is client-side only, no backend persistence.

---

## 10. Data Models

### `Recipe` (`features/recipes/models/recipe.model.ts`)
```typescript
class Recipe {
  name: string
  description: string
  imagePath: string
  ingredients: Ingredient[]
  rating: number         // default 0, range 0–5
  cookingTime: number    // default 30 (minutes)
  instructions: string[] // default []
  difficulty: string     // 'Easy' | 'Medium' | 'Hard', default 'Medium'
  servings: number       // default 4
  id?: string            // optional, assigned by backend
}
```

### `Ingredient` (`shared/models/ingredient.model.ts`)
```typescript
class Ingredient {
  name: string
  amount: string | number
}
```

### `AuthUser` (`store/auth/auth.actions.ts`)
```typescript
interface AuthUser {
  email: string
  id: string
  token: string
  tokenExpirationDate: Date
}
```

---

## 11. Authentication Flow

### Current Implementation
- `loginStart$` and `signupStart$` effects call `POST /api/auth/login` and `POST /api/auth/register` respectively via `HttpClient`
- On success: `AuthUser` is built from the response, persisted to `localStorage.userData`, logout timer started, and `loginSuccess`/`signupSuccess` dispatched with `redirect: true`
- On error: server message extracted and dispatched as `loginFail`/`signupFail`; `AuthComponent` relays these to `NotificationService.showError()` via `effect()`
- `autoLogin$` reads `localStorage.userData` on app start (keyed as `_token` / `_tokenExpirationDate`)

### Interceptor
- `auth-interceptor.ts` (functional `HttpInterceptorFn`)
- Requests to `/api/auth/login` or `/api/auth/register` bypass token injection entirely
- All other requests receive `Authorization: Bearer <token>` header
- Token resolved from NgRx auth state; `AuthService.currentUser()` signal used as fallback via `??`

### Auth Guard
- Functional `CanActivateFn`
- Selects `auth.user` from store
- If null → redirects to `/auth` via `router.createUrlTree(['/auth'])`

### localStorage Schema
```json
{
  "userData": {
    "email": "...",
    "id": "...",
    "_token": "...",
    "_tokenExpirationDate": "ISO string"
  }
}
```

---

## 12. API Integration

### Backend Expected
- **Base URL:** `http://localhost:3000/api` (configurable via `environment.apiUrl`)
- **No backend included** — must be run separately (see `BACKEND_IMPLEMENTATION.md` for Node.js/Express reference)

### Recipe Endpoints (consumed by `RecipeService`)
| Method | URL | Action |
|---|---|---|
| GET | `/api/recipes` | Load all recipes |
| GET | `/api/recipes/:id` | Load single recipe |
| POST | `/api/recipes` | Create recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |

### Auth Endpoints
| Method | URL | Expected Response |
|---|---|---|
| POST | `/api/auth/login` | `{ email, id, token, expiresIn }` |
| POST | `/api/auth/register` | `{ email, id, token, expiresIn }` |
| GET | `/api/auth/me` | `{ id, email, name, createdAt }` |

### Token Attachment
- **Current:** `Authorization: Bearer <token>` header (JWT/REST standard)
- Token sourced from NgRx auth state; `AuthService.currentUser` signal used as fallback
- Requests to `/api/auth/login` and `/api/auth/register` bypass token injection

---

## 13. Known Issues & Gaps

### Critical
1. ~~**Auth API not connected**~~ — ✅ **Resolved.** `loginStart$` and `signupStart$` effects implemented in `auth.effects.ts`.
2. ~~**Interceptor uses wrong token format**~~ — ✅ **Resolved.** Interceptor now sends `Authorization: Bearer <token>` and bypasses auth endpoints.
3. **`RecipeService` state sync issue** — constructor subscribes to `state.recipes` but the entity adapter stores in `state.entities`/`state.ids`. The signal will always be empty.

### Functional Gaps
4. **Favorites feature is a stub** — `FavoritesComponent` has no implementation; no favorites state slice, no actions, no selectors.
5. **Profile feature is a stub** — `ProfileComponent` displays auth state only; no profile editing or user data management.
6. **Shopping list has no backend persistence** — ingredients are lost on page refresh.
7. **`addIngredientsToShoppingList()` in `RecipeService`** is an empty stub.
8. **No recipe resolver/guard for pre-loading** — recipe detail page may show blank if navigating directly via URL.
9. **Dark mode CSS not fully implemented** — `ThemeService` applies a class but the Material theme does not respond to it.
10. ~~**No auth effects for signup/login**~~ — ✅ **Resolved.** `loginStart$`/`signupStart$` effects now dispatch `loginFail`/`signupFail` on HTTP error.

### Code Quality
11. **Dual state management in `RecipeService`** — service maintains its own signals AND dispatches/subscribes to NgRx. This creates two sources of truth.
12. **Legacy files still present** — old NgModule-based `app/auth/`, `app/recipes/`, `app/shopping-list/` directories exist alongside new structure.
13. **No unit tests** for any new standalone components or services.
14. **`effect()` in `RecipeListComponent` logs to console** — should be removed in production.
15. **`closeSidenavOnMobile()` in `AppComponent`** subscribes inside a method without unsubscribing — potential memory leak.
16. **`RecipeService` constructor** subscribes to store without `takeUntilDestroyed` — leak in service lifecycle.

---

## 14. Enhancement Roadmap

### High Priority (Correctness)

1. ~~**Wire auth API in effects**~~ — ✅ **Done.** `loginStart$` and `signupStart$` implemented with `HttpClient`, `buildUserAndPersist`, error dispatch.

2. ~~**Fix auth interceptor for REST API**~~ — ✅ **Done.** Bearer token header; `/api/auth/login` and `/api/auth/register` bypassed.

3. **Fix `RecipeService` signal sync**
   - Use `selectAllRecipes` selector (entity adapter) to populate `recipes` signal
   - Or remove the duplicate signal state entirely and have components select directly

4. **Implement `addIngredientsToShoppingList()`**
   - Dispatch `ShoppingListActions.addIngredients({ ingredients: recipe.ingredients })`

### Medium Priority (Features)

5. **Favorites feature**
   - Add `favorites` NgRx slice: `{ recipeIds: string[] }`
   - Actions: `addFavorite(id)`, `removeFavorite(id)`, `toggleFavorite(id)`
   - Selectors: `selectFavoriteIds`, `selectFavoriteRecipes`
   - `FavoritesComponent` UI with `MatCard` grid, heart icon toggle
   - Persist favorites to localStorage or backend

6. **Profile feature**
   - Profile editing form (name, avatar URL)
   - Password change flow
   - Display account info (email, member since)
   - Connect to `GET /api/auth/me`

7. **Shopping list persistence**
   - Add effects to save/load shopping list to/from backend API
   - Endpoint suggestion: `GET/PUT /api/shopping-list`

8. **Recipe detail pre-loading**
   - Add functional resolver to load recipe by ID before route activation
   - Prevents flash of empty content on direct URL access

9. **Dark mode completion**
   - Define Material theme with dark palette
   - Apply via `@use '@angular/material' as mat` theme switching
   - Surface `ThemeService.toggleTheme()` in header toolbar

### Low Priority (DX & Polish)

10. **Remove legacy NgModule files** — delete `app/auth/`, `app/recipes/` (old), `app/shopping-list/` (old), `app/header/`, `app/app.module.ts`, `app/app-routing.module.ts`, `app/core.module.ts`

11. **Add unit tests** — Karma/Jasmine already configured; write tests for:
    - `AuthEffects`, `RecipeEffects`
    - `authGuard`, `authInterceptor`
    - `RecipeListComponent` filter/sort computed signals
    - `NotificationService`, `ThemeService`

12. **Recipe skeleton loader** — `shared/recipe-skeleton/recipe-skeleton.component.ts` exists but is likely unused; wire into recipe list loading state

13. **Lazy load shopping list selectors** — `selectGroupedIngredients` does string-based aggregation on every state change; memoize or debounce for large lists

14. **Route preloading strategy** — add `PreloadAllModules` or a custom predictive strategy in `app.config.ts`

15. **Remove console.log in production** — effects and components log extensively; use `environment.production` flag

16. **Fix `closeSidenavOnMobile` subscription leak** in `AppComponent` — subscribe in `ngOnInit`, unsubscribe in `ngOnDestroy`, or use `takeUntilDestroyed()`

---

## Quick Commands

```bash
# Start dev server
npm start                          # http://localhost:4200

# Build
npm run build                      # Production build
npm run watch                      # Watch mode

# Test
npm test                           # Karma + Jasmine

# Backend (must run separately for API)
# See BACKEND_IMPLEMENTATION.md for Node.js/Express reference server
# node server.js                   # http://localhost:3000/api
```
