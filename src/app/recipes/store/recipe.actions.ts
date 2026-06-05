import { createAction, props } from '@ngrx/store';
import { Recipe } from '../recipe.model';

// Set Recipes
export const setRecipes = createAction(
  '[Recipes] Set Recipes',
  props<{ recipes: Recipe[] }>()
);

// Fetch Recipes
export const fetchRecipes = createAction(
  '[Recipes] Fetch Recipes'
);

// Add Recipe
export const addRecipe = createAction(
  '[Recipe] Add Recipe',
  props<{ recipe: Recipe }>()
);

// Update Recipe
export const updateRecipe = createAction(
  '[Recipe] Update Recipe',
  props<{ index: number; newRecipe: Recipe }>()
);

// Delete Recipe
export const deleteRecipe = createAction(
  '[Recipe] Delete Recipe',
  props<{ index: number }>()
);

// Store Recipes
export const storeRecipes = createAction(
  '[Recipe] Store Recipes'
);
