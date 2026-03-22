import { createAction, props } from '@ngrx/store';
import { Recipe } from '../../features/recipes/models/recipe.model';

// Fetch recipes
export const fetchRecipes = createAction('[Recipes] Fetch Recipes');

export const fetchRecipesSuccess = createAction(
  '[Recipes] Fetch Recipes Success',
  props<{ recipes: Recipe[] }>()
);

export const fetchRecipesFail = createAction(
  '[Recipes] Fetch Recipes Fail',
  props<{ error: string }>()
);

// Add recipe
export const addRecipe = createAction(
  '[Recipes] Add Recipe',
  props<{ recipe: Recipe }>()
);

// Update recipe
export const updateRecipe = createAction(
  '[Recipes] Update Recipe',
  props<{ index: number; recipe: Recipe }>()
);

// Delete recipe
export const deleteRecipe = createAction(
  '[Recipes] Delete Recipe',
  props<{ index: number }>()
);

// Set recipes
export const setRecipes = createAction(
  '[Recipes] Set Recipes',
  props<{ recipes: Recipe[] }>()
);
