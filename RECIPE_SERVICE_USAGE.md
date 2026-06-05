# RecipeService API Documentation

The `RecipeService` provides methods to communicate with the NestJS backend API for managing recipes.

## Location
```
src/app/core/services/recipe.service.ts
```

## Configuration

API Base URL is configured in environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

## Available Methods

### 1. getRecipes()
Fetch all recipes from the API.

**Returns:** `Observable<Recipe[]>`

**Example:**
```typescript
import { RecipeService } from '@core/services/recipe.service';

export class RecipeListComponent {
  private recipeService = inject(RecipeService);

  ngOnInit() {
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        console.log('Recipes loaded:', recipes);
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
      }
    });
  }
}
```

### 2. getRecipeById(id)
Fetch a single recipe by ID.

**Parameters:**
- `id`: string | number - Recipe ID

**Returns:** `Observable<Recipe>`

**Example:**
```typescript
this.recipeService.getRecipeById(123).subscribe({
  next: (recipe) => {
    console.log('Recipe loaded:', recipe);
  },
  error: (error) => {
    console.error('Error loading recipe:', error);
  }
});
```

### 3. createRecipe(recipe)
Create a new recipe.

**Parameters:**
- `recipe`: Recipe - Recipe object to create

**Returns:** `Observable<Recipe>`

**Example:**
```typescript
const newRecipe: Recipe = {
  name: 'Chocolate Cake',
  description: 'Delicious chocolate cake',
  imagePath: 'https://example.com/cake.jpg',
  ingredients: [
    { name: 'Flour', amount: '2 cups' },
    { name: 'Sugar', amount: '1 cup' }
  ],
  rating: 4.5,
  cookingTime: 45,
  difficulty: 'Medium',
  servings: 8,
  instructions: [
    'Preheat oven to 350°F',
    'Mix dry ingredients',
    'Bake for 30 minutes'
  ]
};

this.recipeService.createRecipe(newRecipe).subscribe({
  next: (recipe) => {
    console.log('Recipe created:', recipe);
  },
  error: (error) => {
    console.error('Error creating recipe:', error);
  }
});
```

### 4. updateRecipe(id, recipe)
Update an existing recipe.

**Parameters:**
- `id`: string | number - Recipe ID
- `recipe`: Recipe - Updated recipe data

**Returns:** `Observable<Recipe>`

**Example:**
```typescript
const updatedRecipe: Recipe = {
  name: 'Updated Chocolate Cake',
  description: 'Even more delicious!',
  // ... other properties
};

this.recipeService.updateRecipe(123, updatedRecipe).subscribe({
  next: (recipe) => {
    console.log('Recipe updated:', recipe);
  },
  error: (error) => {
    console.error('Error updating recipe:', error);
  }
});
```

### 5. deleteRecipe(id)
Delete a recipe.

**Parameters:**
- `id`: string | number - Recipe ID

**Returns:** `Observable<void>`

**Example:**
```typescript
this.recipeService.deleteRecipe(123).subscribe({
  next: () => {
    console.log('Recipe deleted successfully');
  },
  error: (error) => {
    console.error('Error deleting recipe:', error);
  }
});
```

## Signal-Based State Management

The service provides reactive signals for easy state access:

```typescript
import { RecipeService } from '@core/services/recipe.service';

export class MyComponent {
  private recipeService = inject(RecipeService);

  // Access reactive signals
  recipes = this.recipeService.recipes;           // Signal<Recipe[]>
  selectedRecipe = this.recipeService.selectedRecipe;  // Signal<Recipe | null>
  isLoading = this.recipeService.isLoading;       // Signal<boolean>
  error = this.recipeService.error;               // Signal<string | null>

  // Use in template
  // {{ recipes().length }} recipes available
  // @if (isLoading()) { Loading... }
  // @if (error()) { {{ error() }} }
}
```

## Error Handling

The service includes comprehensive error handling:

```typescript
this.recipeService.getRecipes().subscribe({
  next: (recipes) => {
    // Success
  },
  error: (error) => {
    // Error is automatically logged
    // Error state is set in service.error signal
    console.error('Failed to load recipes:', error.message);
  }
});

// Clear error manually
this.recipeService.clearError();
```

## Complete Component Example

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { RecipeService } from '@core/services/recipe.service';
import { Recipe } from '@features/recipes/models/recipe.model';

@Component({
  selector: 'app-recipe-manager',
  template: `
    <div class="recipe-manager">
      @if (isLoading()) {
        <p>Loading recipes...</p>
      }
      
      @if (error()) {
        <div class="error">{{ error() }}</div>
      }
      
      <div class="recipes">
        @for (recipe of recipes(); track recipe.name) {
          <div class="recipe-card">
            <h3>{{ recipe.name }}</h3>
            <p>{{ recipe.description }}</p>
            <button (click)="deleteRecipe(recipe.id)">Delete</button>
          </div>
        }
      </div>
    </div>
  `
})
export class RecipeManagerComponent implements OnInit {
  private recipeService = inject(RecipeService);

  // Expose signals to template
  recipes = this.recipeService.recipes;
  isLoading = this.recipeService.isLoading;
  error = this.recipeService.error;

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe();
  }

  deleteRecipe(id: string | number) {
    if (confirm('Are you sure?')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => {
          console.log('Recipe deleted');
        }
      });
    }
  }
}
```

## API Endpoints

The service communicates with the following NestJS endpoints:

- `GET    /api/recipes` - Get all recipes
- `GET    /api/recipes/:id` - Get recipe by ID
- `POST   /api/recipes` - Create new recipe
- `PUT    /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Notes

- The service uses Angular signals for reactive state management
- HTTP errors are automatically handled and logged
- The service integrates with NgRx store for state synchronization
- All methods return RxJS Observables for flexible subscription management
- The service is provided at root level, making it available application-wide
