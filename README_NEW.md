# Recipe Book - Modern Angular 19 Application

A modern recipe management application built with Angular 19, featuring standalone components, signals, NgRx state management, and Angular Material UI.

## 🚀 Features

- **Modern Angular 19 Architecture**: Standalone components with no NgModules
- **Angular Signals**: Reactive state management with signals
- **NgRx State Management**: Global state management for auth, recipes, and shopping list
- **Angular Material**: Modern, accessible UI components
- **Type-Safe**: Full TypeScript support
- **Lazy Loading**: Route-based code splitting
- **Responsive Design**: Mobile-first Material Design

## 📁 Project Structure

```
src/app/
├── core/                          # Core application services
│   ├── services/                  # Business logic services
│   │   ├── auth.service.ts       # Authentication service with signals
│   │   └── recipe.service.ts     # Recipe service with signals
│   ├── guards/                    # Route guards
│   │   └── auth.guard.ts         # Functional auth guard
│   └── interceptors/              # HTTP interceptors
│       └── auth-interceptor.ts   # Functional HTTP interceptor
│
├── features/                      # Feature modules
│   ├── auth/                     # Authentication feature
│   │   └── auth.component.ts    # Standalone auth component
│   ├── recipes/                  # Recipes feature
│   │   ├── models/
│   │   │   └── recipe.model.ts
│   │   ├── recipes.component.ts
│   │   ├── recipe-list/
│   │   ├── recipe-detail/
│   │   ├── recipe-edit/
│   │   ├── recipe-start/
│   │   └── recipes.routes.ts    # Recipe routes
│   └── shopping-list/            # Shopping list feature
│       ├── shopping-list.component.ts
│       └── shopping-edit/
│
├── shared/                        # Shared resources
│   ├── models/                   # Shared models
│   │   └── ingredient.model.ts
│   └── ui-components/            # Reusable UI components
│       ├── header.component.ts
│       ├── loading-spinner.component.ts
│       └── alert.component.ts
│
├── store/                         # NgRx state management
│   ├── auth/
│   │   ├── auth.actions.ts
│   │   ├── auth.reducer.ts
│   │   └── auth.effects.ts
│   ├── recipes/
│   │   ├── recipe.actions.ts
│   │   ├── recipe.reducer.ts
│   │   └── recipe.effects.ts
│   ├── shopping-list/
│   │   ├── shopping-list.actions.ts
│   │   └── shopping-list.reducer.ts
│   └── app.reducer.ts            # Root reducer
│
├── app.component.standalone.ts    # Root standalone component
├── app.config.ts                  # Application configuration
└── app.routes.ts                  # Application routes
```

## 🛠️ Technologies

- **Angular 19.2**: Latest Angular framework
- **Angular Material 19.2**: Material Design components
- **NgRx 19.2**: State management
  - @ngrx/store - Core state management
  - @ngrx/effects - Side effect handling
  - @ngrx/store-devtools - Developer tools
  - @ngrx/router-store - Router state integration
- **TypeScript 5.8**: Type-safe JavaScript
- **RxJS 7.8**: Reactive programming
- **Signals**: Angular's new reactivity primitive

## 🎯 Key Architectural Decisions

### 1. Standalone Components
All components are standalone, eliminating the need for NgModules:
```typescript
@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [RouterModule, RecipeListComponent],
  // ...
})
export class RecipesComponent {}
```

### 2. Angular Signals
Services use signals for reactive state:
```typescript
export class AuthService {
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
}
```

### 3. Functional Guards & Interceptors
Modern functional approach instead of class-based:
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Guard logic
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Interceptor logic
};
```

### 4. NgRx for Global State
While signals handle local component state, NgRx manages global state for:
- Authentication state
- Recipe collection
- Shopping list items

### 5. Angular Material UI
All UI components use Material Design:
- `MatToolbar` for navigation
- `MatCard` for content containers
- `MatButton`, `MatFormField`, `MatInput` for forms
- `MatList`, `MatMenu`, `MatIcon`, etc.

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Open browser at `http://localhost:4200`

## 🧪 Testing

Run unit tests:
```bash
npm test
```

## 🏗️ Build

Build for production:
```bash
npm run build
```

## 🎨 Material Theme

The application uses the `indigo-pink` Material theme. To customize:

1. Create a custom theme in `src/styles.css`:
```css
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  )
));

@include mat.all-component-themes($my-theme);
```

## 🔐 Authentication

The app uses a mock authentication system:
- Email/password login and signup
- JWT token storage in localStorage
- Auto-login on app reload
- Token expiration handling
- Route protection with auth guard

## 📝 State Management Flow

### Authentication Flow
1. User submits credentials → `AuthActions.loginStart/signupStart`
2. Effect processes action → API call (mock)
3. Success → `AuthActions.loginSuccess` → Update store
4. Token saved to localStorage
5. Auto-login timer set
6. User redirected to recipes

### Recipe Management Flow
1. Component dispatches action → `RecipeActions.addRecipe`
2. Reducer updates state immutably
3. Store notifies subscribers
4. Component receives new state via selector/signal
5. UI updates automatically

## 🚦 Routing

- `/` → Redirects to `/recipes`
- `/recipes` → Recipe list and detail (protected)
- `/recipes/new` → Create new recipe (protected)
- `/recipes/:id` → View recipe detail (protected)
- `/recipes/:id/edit` → Edit recipe (protected)
- `/shopping-list` → Shopping list (protected)
- `/auth` → Login/Signup page

## 🔄 Migration Notes

### From Old Architecture
This refactoring includes:

✅ **Removed**:
- Bootstrap and ng-bootstrap
- Firebase dependencies
- jQuery and Popper.js
- NgModule-based architecture
- Class-based guards and interceptors

✅ **Added**:
- Angular Material
- Standalone components
- Angular Signals
- Functional guards and interceptors
- Modern project structure

✅ **Maintained**:
- NgRx state management
- All core features
- TypeScript strict mode

## 📚 Learn More

- [Angular Standalone Components](https://angular.dev/guide/components/importing)
- [Angular Signals](https://angular.dev/guide/signals)
- [Angular Material](https://material.angular.io/)
- [NgRx Documentation](https://ngrx.io/)

## 🤝 Contributing

1. Follow the established project structure
2. Use standalone components
3. Prefer signals for local state
4. Use NgRx for global state
5. Follow Material Design guidelines
6. Write unit tests for all components and services

## 📄 License

MIT
