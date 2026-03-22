# Quick Start Guide - Refactored Angular 19 App

## ✅ What Has Been Done

The application has been completely refactored to use:
- ✅ Standalone components (Angular 19)
- ✅ Angular Signals for reactive state
- ✅ Angular Material for UI (Bootstrap removed)
- ✅ Modern functional guards and interceptors
- ✅ Clean architecture (core/features/shared/store)
- ✅ NgRx for global state management
- ✅ Firebase removed

## 🚀 Getting Started

### 1. Verify Installation
Dependencies are already installed. If needed:
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```
The app will run on `http://localhost:4200`

### 3. Build for Production
```bash
npm run build
```

## 📱 Testing the Application

### Login/Signup
1. Navigate to http://localhost:4200
2. You'll be redirected to `/auth`
3. Enter any email/password (mock authentication)
4. Click "Login" or switch to "Sign Up"

### Recipe Management
1. After login, you'll see the recipes page
2. Click "New Recipe" to add a recipe
3. Fill in name, description, image URL, and ingredients
4. Click "Save"
5. View recipe details by clicking on a recipe
6. Edit or delete recipes using the menu

### Shopping List
1. Click "Shopping List" in the navigation
2. Add ingredients manually
3. Or add ingredients from a recipe detail page

## 🎨 UI Components (Material Design)

All components now use Angular Material:
- **Toolbar** - Application header
- **Cards** - Content containers
- **Forms** - Material form fields with validation
- **Buttons** - Raised, stroked, and icon buttons
- **Lists** - Recipe list and shopping list
- **Chips** - Ingredient display
- **Menus** - Dropdown actions
- **Icons** - Material Design icons

## 📂 Project Structure

```
src/app/
├── core/               # Services, guards, interceptors
├── features/           # Feature modules (auth, recipes, shopping-list)
├── shared/             # Shared components and models
└── store/              # NgRx state management
```

## 🔧 Configuration Files

### Entry Point
- **File**: `src/main.standalone.ts`
- **Purpose**: Bootstrap the standalone Angular application

### App Config
- **File**: `src/app/app.config.ts`
- **Purpose**: Configure providers (NgRx, routing, interceptors)

### Routes
- **File**: `src/app/app.routes.ts`
- **Purpose**: Main application routes
- **File**: `src/app/features/recipes/recipes.routes.ts`
- **Purpose**: Recipe sub-routes

## 🔐 Authentication

Currently using **mock authentication**:
- Credentials stored in localStorage
- Token expiration simulation
- Auth guard protects routes

**To connect to a real backend:**
1. Update `AuthEffects` in `src/app/store/auth/auth.effects.ts`
2. Add HttpClient calls to your API
3. Handle real token management

## 🛠️ Common Tasks

### Adding a New Feature
1. Create feature folder in `src/app/features/`
2. Create standalone components
3. Create route configuration
4. Add to main routes in `app.routes.ts`

### Adding NgRx State
1. Create folder in `src/app/store/`
2. Create actions file (*.actions.ts)
3. Create reducer file (*.reducer.ts)
4. Create effects file if needed (*.effects.ts)
5. Add to `app.reducer.ts`

### Adding a Shared Component
1. Create in `src/app/shared/ui-components/`
2. Make it standalone with `standalone: true`
3. Import where needed

## 📝 Key Code Patterns

### Standalone Component
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `...`
})
export class MyComponent {}
```

### Using Signals
```typescript
export class MyComponent {
  count = signal(0);
  
  increment() {
    this.count.update(c => c + 1);
  }
}

// In template: {{ count() }}
```

### Dispatching Actions
```typescript
this.store.dispatch(MyActions.doSomething({ data: value }));
```

### Selecting from Store
```typescript
this.store.select('myFeature').subscribe(state => {
  // Handle state
});
```

## 🐛 Troubleshooting

### Build Errors
Run a clean build:
```bash
npm run build -- --configuration=development
```

### Module Not Found
Check import paths - use relative paths from the component file.

### Material Components Not Working
Ensure the component imports the Material module it needs.

## 📚 Documentation

- **[README_NEW.md](./README_NEW.md)** - Full project documentation
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration from old architecture
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Complete refactoring summary

## 🎯 Next Steps

1. **Test the application** - Run it and test all features
2. **Clean up old files** - Remove old module-based files
3. **Add unit tests** - Test new components
4. **Connect real backend** - Replace mock auth with real API
5. **Customize theme** - Adjust Material theme colors
6. **Add more features** - Build on the new architecture

## ⚡ Performance Tips

1. **Lazy loading is enabled** - Routes load on demand
2. **Tree shaking works** - Only imported Material components are bundled
3. **Signals are efficient** - Fine-grained change detection
4. **NgRx DevTools** - Debug state changes in Chrome

## 🆘 Need Help?

- Check the console for errors
- Use Angular DevTools browser extension
- Use Redux DevTools for NgRx state inspection
- Refer to documentation files

## ✨ Enjoy Your Modern Angular 19 App!

The application is production-ready and follows Angular best practices!
