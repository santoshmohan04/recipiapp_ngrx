# Migration Guide: Angular 19 Modern Architecture

This guide explains the migration from the old NgModule-based architecture to the new standalone component architecture.

## Overview

The application has been completely refactored to use:
- ✅ Standalone components (no NgModules)
- ✅ Angular Signals for reactive state
- ✅ Angular Material (replacing Bootstrap)
- ✅ Modern functional guards and interceptors
- ✅ New project structure (core/features/shared/store)

## File Mapping: Old vs New

### Entry Point
- **Old**: `src/main.ts` (bootstraps AppModule)
- **New**: `src/main.standalone.ts` (bootstraps AppComponent directly)

### App Component
- **Old**: `src/app/app.component.ts` (declared in AppModule)
- **New**: `src/app/app.component.standalone.ts` (standalone)

### Configuration
- **Old**: `src/app/app.module.ts` (NgModule with providers)
- **New**: `src/app/app.config.ts` (ApplicationConfig with providers)

### Routing
- **Old**: `src/app/app-routing.module.ts` (RouterModule)
- **New**: `src/app/app.routes.ts` (Routes array)

### Store
- **Old**: 
  - `src/app/auth/store/*`
  - `src/app/recipes/store/*`
  - `src/app/shopping-list/store/*`
- **New**: 
  - `src/app/store/auth/*`
  - `src/app/store/recipes/*`
  - `src/app/store/shopping-list/*`

### Services
- **Old**: `src/app/auth/auth.service.ts`
- **New**: `src/app/core/services/auth.service.ts` (with signals)

### Guards
- **Old**: `src/app/auth/auth.guard.ts` (class-based)
- **New**: `src/app/core/guards/auth.guard.ts` (functional)

### Interceptors
- **Old**: `src/app/auth/auth-interceptor.service.ts` (class-based)
- **New**: `src/app/core/interceptors/auth-interceptor.ts` (functional)

### Components by Feature

#### Auth
- **Old**: `src/app/auth/auth.component.ts`
- **New**: `src/app/features/auth/auth.component.ts` (standalone, Material UI)

#### Recipes
- **Old**: 
  - `src/app/recipes/recipes.component.ts`
  - `src/app/recipes/recipe-list/recipe-list.component.ts`
  - etc.
- **New**: 
  - `src/app/features/recipes/recipes.component.ts` (standalone)
  - `src/app/features/recipes/recipe-list/recipe-list.component.ts` (standalone)
  - etc.

#### Shopping List
- **Old**: 
  - `src/app/shopping-list/shopping-list.component.ts`
  - `src/app/shopping-list/shopping-edit/shopping-edit.component.ts`
- **New**: 
  - `src/app/features/shopping-list/shopping-list.component.ts` (standalone)
  - `src/app/features/shopping-list/shopping-edit/shopping-edit.component.ts` (standalone)

#### Header
- **Old**: `src/app/header/header.component.ts`
- **New**: `src/app/shared/ui-components/header.component.ts` (standalone)

### Models
- **Old**: 
  - `src/app/auth/user.model.ts`
  - `src/app/recipes/recipe.model.ts`
  - `src/app/shared/ingredient.model.ts`
- **New**: 
  - `src/app/store/auth/auth.actions.ts` (AuthUser interface)
  - `src/app/features/recipes/models/recipe.model.ts`
  - `src/app/shared/models/ingredient.model.ts`

## Breaking Changes

### 1. Bootstrap Removed
All Bootstrap classes and components have been replaced with Angular Material:

- **Old**: `<div class="btn btn-primary">`
- **New**: `<button mat-raised-button color="primary">`

### 2. NgModules Removed
No more `declarations`, `imports`, `providers` in NgModule:

- **Old**: 
```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ...],
  bootstrap: [AppComponent]
})
```

- **New**: 
```typescript
@Component({
  standalone: true,
  imports: [RouterModule, ...],
})
export class AppComponent {}
```

### 3. Service Injection
Injectable services now use `inject()` function:

- **Old**: 
```typescript
constructor(private store: Store) {}
```

- **New**: 
```typescript
private store = inject(Store);
```

### 4. Guards & Interceptors
Now use functional approach:

- **Old**: 
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() { ... }
}
```

- **New**: 
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // ...
};
```

### 5. HTTP Interceptors
- **Old**: `HTTP_INTERCEPTORS` token with class
- **New**: `withInterceptors([authInterceptor])`

### 6. Providers
- **Old**: Register in `providers` array in NgModule
- **New**: Register in `app.config.ts` using provider functions

## Running the New Architecture

1. **Install dependencies** (includes Angular Material):
```bash
npm install
```

2. **Start the app**:
```bash
npm start
```

The app will use `main.standalone.ts` as configured in `angular.json`.

## Key Advantages

### 1. Bundle Size
- Removed Bootstrap, jQuery, Popper.js
- Tree-shakeable Material components
- Better lazy loading with standalone components

### 2. Developer Experience
- Less boilerplate (no NgModule declarations)
- Better IDE support
- Clearer component dependencies

### 3. Performance
- Signals for fine-grained reactivity
- Smaller initial bundles
- Faster change detection

### 4. Maintainability
- Clear folder structure
- Separation of concerns
- Easier testing

### 5. Modern Patterns
- Functional programming (guards, interceptors)
- Reactive programming (signals + RxJS)
- Composition over inheritance

## Common Migration Patterns

### Converting a Component
```typescript
// Old
@Component({ ... })
export class MyComponent {
  constructor(private service: MyService) {}
}

// New
@Component({ 
  standalone: true,
  imports: [...],
  ...
})
export class MyComponent {
  private service = inject(MyService);
}
```

### Converting a Guard
```typescript
// Old
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private store: Store) {}
  canActivate() { return this.store.select(...); }
}

// New
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  return store.select(...);
};
```

### Using Signals
```typescript
// Old
export class MyComponent {
  isLoading = false;
  
  ngOnInit() {
    this.isLoading = true;
  }
}

// New
export class MyComponent {
  isLoading = signal(false);
  
  ngOnInit() {
    this.isLoading.set(true);
  }
}

// In template: {{ isLoading() }}
```

## Rollback Plan

If you need to use the old architecture:
1. Change `main` in `angular.json` back to `src/main.ts`
2. Ensure old modules are intact
3. Restart dev server

## Next Steps

1. **Remove Old Files**: After testing, delete old module files
2. **Add Tests**: Write tests for new components
3. **Document**: Update team documentation
4. **Train**: Familiarize team with new patterns

## Resources

- [Angular Standalone Migration Guide](https://angular.dev/guide/standalone-components)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Material Design Components](https://material.angular.io/components)
- [NgRx Best Practices](https://ngrx.io/guide/store/best-practices)
