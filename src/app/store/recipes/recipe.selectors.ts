import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRecipes from './recipe.reducer';
import { AppState } from '../app.reducer';
import { Recipe } from '../../features/recipes/models/recipe.model';

// Feature Selector
export const selectRecipeState = createFeatureSelector<fromRecipes.State>('recipes');

// Entity Adapter Selectors - Use adapter.getSelectors with feature state
const adapterSelectors = fromRecipes.adapter.getSelectors(selectRecipeState);

export const selectRecipeIds = adapterSelectors.selectIds;
export const selectRecipeEntities = adapterSelectors.selectEntities;
export const selectAllRecipes = adapterSelectors.selectAll;
export const selectRecipeTotal = adapterSelectors.selectTotal;

// Additional Selectors
export const selectRecipesLoading = createSelector(
  selectRecipeState,
  (state) => state.loading
);

export const selectRecipesLoaded = createSelector(
  selectRecipeState,
  (state) => state.loaded
);

export const selectRecipesError = createSelector(
  selectRecipeState,
  (state) => state.error
);

export const selectSelectedRecipeId = createSelector(
  selectRecipeState,
  (state) => state.selectedRecipeId
);

// Select recipe by ID
export const selectRecipeById = (id: string) =>
  createSelector(
    selectRecipeEntities,
    (entities) => entities[id]
  );

// Select currently selected recipe
export const selectSelectedRecipe = createSelector(
  selectRecipeEntities,
  selectSelectedRecipeId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Select recipes by difficulty
export const selectRecipesByDifficulty = (difficulty: string) =>
  createSelector(
    selectAllRecipes,
    (recipes: Recipe[]) => recipes.filter(recipe => recipe.difficulty === difficulty)
  );

// Select recipes by rating (greater than or equal to)
export const selectRecipesByMinRating = (minRating: number) =>
  createSelector(
    selectAllRecipes,
    (recipes: Recipe[]) => recipes.filter(recipe => recipe.rating >= minRating)
  );

// Select recipes sorted by rating (descending)
export const selectRecipesSortedByRating = createSelector(
  selectAllRecipes,
  (recipes: Recipe[]) => [...recipes].sort((a, b) => b.rating - a.rating)
);

// Select recipes sorted by cooking time (ascending)
export const selectRecipesSortedByCookingTime = createSelector(
  selectAllRecipes,
  (recipes: Recipe[]) => [...recipes].sort((a, b) => a.cookingTime - b.cookingTime)
);

// Select recipes with search filter
export const selectRecipesBySearchTerm = (searchTerm: string) =>
  createSelector(
    selectAllRecipes,
    (recipes: Recipe[]) => {
      if (!searchTerm || searchTerm.trim() === '') {
        return recipes;
      }
      const term = searchTerm.toLowerCase();
      return recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term)
      );
    }
  );

// Select quick recipes (cooking time <= 30 minutes)
export const selectQuickRecipes = createSelector(
  selectAllRecipes,
  (recipes: Recipe[]) => recipes.filter(recipe => recipe.cookingTime <= 30)
);

// Select high-rated recipes (rating >= 4)
export const selectHighRatedRecipes = createSelector(
  selectAllRecipes,
  (recipes: Recipe[]) => recipes.filter(recipe => recipe.rating >= 4)
);

// Select recipe statistics
export const selectRecipeStats = createSelector(
  selectAllRecipes,
  (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      return {
        total: 0,
        averageRating: 0,
        averageCookingTime: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
      };
    }

    const totalRating = recipes.reduce((sum, recipe) => sum + recipe.rating, 0);
    const totalCookingTime = recipes.reduce((sum, recipe) => sum + recipe.cookingTime, 0);

    return {
      total: recipes.length,
      averageRating: totalRating / recipes.length,
      averageCookingTime: totalCookingTime / recipes.length,
      easyCount: recipes.filter(r => r.difficulty === 'Easy').length,
      mediumCount: recipes.filter(r => r.difficulty === 'Medium').length,
      hardCount: recipes.filter(r => r.difficulty === 'Hard').length,
    };
  }
);

// VM Selector - combines multiple selectors for a component view model
export const selectRecipesViewModel = createSelector(
  selectAllRecipes,
  selectRecipesLoading,
  selectRecipesError,
  selectSelectedRecipeId,
  (recipes: Recipe[], loading, error, selectedId) => ({
    recipes,
    loading,
    error,
    selectedId,
    hasRecipes: recipes.length > 0,
  })
);
