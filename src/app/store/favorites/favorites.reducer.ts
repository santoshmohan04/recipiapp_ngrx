import { createReducer, on } from '@ngrx/store';
import * as FavoritesActions from './favorites.actions';
import { FavoriteRecipe } from '../../core/services/favorites.service';

export interface State {
  favorites: FavoriteRecipe[];
  favoriteRecipeIds: Set<string>;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  favorites: [],
  favoriteRecipeIds: new Set<string>(),
  loading: false,
  error: null,
};

export const favoritesReducer = createReducer(
  initialState,
  
  // Load favorites
  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(FavoritesActions.loadFavoritesSuccess, (state, action) => ({
    ...state,
    favorites: action.favorites,
    favoriteRecipeIds: new Set(action.favorites
      .filter(f => f.recipe)
      .map(f => f.recipe.id || (f.recipe as any)._id)
      .filter(id => id)),
    loading: false,
    error: null,
  })),
  
  on(FavoritesActions.loadFavoritesFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Add favorite
  on(FavoritesActions.addFavorite, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(FavoritesActions.addFavoriteSuccess, (state, action) => {
    const recipe = action.favorite.recipe;
    
    if (!recipe) {
      console.warn('addFavoriteSuccess: No recipe found in favorite', action.favorite);
      return state;
    }
    
    const recipeId = recipe.id || (recipe as any)._id;
    
    if (!recipeId) {
      console.warn('addFavoriteSuccess: No recipe ID found', recipe);
      return state;
    }
    
    const newFavoriteIds = new Set(state.favoriteRecipeIds);
    newFavoriteIds.add(recipeId);
    
    return {
      ...state,
      favorites: [...state.favorites, action.favorite],
      favoriteRecipeIds: newFavoriteIds,
      loading: false,
      error: null,
    };
  }),
  
  on(FavoritesActions.addFavoriteFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Remove favorite
  on(FavoritesActions.removeFavorite, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(FavoritesActions.removeFavoriteSuccess, (state, action) => {
    const newFavoriteIds = new Set(state.favoriteRecipeIds);
    newFavoriteIds.delete(action.recipeId);
    
    return {
      ...state,
      favorites: state.favorites.filter(f => {
        const recipeId = f.recipe.id || (f.recipe as any)._id;
        return recipeId !== action.recipeId;
      }),
      favoriteRecipeIds: newFavoriteIds,
      loading: false,
      error: null,
    };
  }),
  
  on(FavoritesActions.removeFavoriteFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Check favorite
  on(FavoritesActions.checkFavoriteSuccess, (state, action) => {
    if (action.isFavorite) {
      const newFavoriteIds = new Set(state.favoriteRecipeIds);
      newFavoriteIds.add(action.recipeId);
      return {
        ...state,
        favoriteRecipeIds: newFavoriteIds,
      };
    }
    return state;
  }),
  
  // Clear error
  on(FavoritesActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
