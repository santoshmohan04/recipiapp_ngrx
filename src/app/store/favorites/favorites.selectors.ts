import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFavorites from './favorites.reducer';

// Feature Selector
export const selectFavoritesState = 
  createFeatureSelector<fromFavorites.State>('favorites');

// Basic Selectors
export const selectAllFavorites = createSelector(
  selectFavoritesState,
  (state) => state.favorites
);

export const selectFavoriteRecipeIds = createSelector(
  selectFavoritesState,
  (state) => state.favoriteRecipeIds
);

export const selectLoading = createSelector(
  selectFavoritesState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectFavoritesState,
  (state) => state.error
);

// Computed Selectors
export const selectFavoriteCount = createSelector(
  selectAllFavorites,
  (favorites) => favorites.length
);

export const selectIsFavorite = (recipeId: string) =>
  createSelector(
    selectFavoriteRecipeIds,
    (favoriteIds) => favoriteIds.has(recipeId)
  );

export const selectFavoriteRecipes = createSelector(
  selectAllFavorites,
  (favorites) => favorites.map(f => f.recipe).filter(r => r !== undefined)
);

export const selectFavoriteById = (recipeId: string) =>
  createSelector(
    selectAllFavorites,
    (favorites) => favorites.find(f => {
      const id = f.recipe.id || (f.recipe as any)._id;
      return id === recipeId;
    })
  );

// Check if any favorites exist
export const selectHasFavorites = createSelector(
  selectFavoriteCount,
  (count) => count > 0
);
