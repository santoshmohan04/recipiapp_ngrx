import { createAction, props } from '@ngrx/store';
import { FavoriteRecipe } from '../../core/services/favorites.service';

// Load favorites
export const loadFavorites = createAction('[Favorites API] Load Favorites');

export const loadFavoritesSuccess = createAction(
  '[Favorites API] Load Favorites Success',
  props<{ favorites: FavoriteRecipe[] }>()
);

export const loadFavoritesFail = createAction(
  '[Favorites API] Load Favorites Fail',
  props<{ error: string }>()
);

// Add to favorites
export const addFavorite = createAction(
  '[Favorites] Add Favorite',
  props<{ recipeId: string }>()
);

export const addFavoriteSuccess = createAction(
  '[Favorites API] Add Favorite Success',
  props<{ favorite: FavoriteRecipe }>()
);

export const addFavoriteFail = createAction(
  '[Favorites API] Add Favorite Fail',
  props<{ error: string }>()
);

// Remove from favorites
export const removeFavorite = createAction(
  '[Favorites] Remove Favorite',
  props<{ recipeId: string }>()
);

export const removeFavoriteSuccess = createAction(
  '[Favorites API] Remove Favorite Success',
  props<{ recipeId: string }>()
);

export const removeFavoriteFail = createAction(
  '[Favorites API] Remove Favorite Fail',
  props<{ error: string }>()
);

// Toggle favorite (smart action)
export const toggleFavorite = createAction(
  '[Favorites] Toggle Favorite',
  props<{ recipeId: string; isFavorite: boolean }>()
);

// Check if recipe is favorited
export const checkFavorite = createAction(
  '[Favorites] Check Favorite',
  props<{ recipeId: string }>()
);

export const checkFavoriteSuccess = createAction(
  '[Favorites API] Check Favorite Success',
  props<{ recipeId: string; isFavorite: boolean }>()
);

export const checkFavoriteFail = createAction(
  '[Favorites API] Check Favorite Fail',
  props<{ error: string }>()
);

// UI Actions
export const clearError = createAction('[Favorites] Clear Error');
