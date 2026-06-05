import { createAction, props } from '@ngrx/store';
import { Recipe } from '../../features/recipes/models/recipe.model';

// Load Recipes
export const loadRecipes = createAction(
  '[Recipes API] Load Recipes'
);

export const loadRecipesSuccess = createAction(
  '[Recipes API] Load Recipes Success',
  props<{ recipes: Recipe[] }>()
);

export const loadRecipesFail = createAction(
  '[Recipes API] Load Recipes Fail',
  props<{ error: string }>()
);

// Load Single Recipe
export const loadRecipe = createAction(
  '[Recipes API] Load Recipe',
  props<{ id: string }>()
);

export const loadRecipeSuccess = createAction(
  '[Recipes API] Load Recipe Success',
  props<{ recipe: Recipe }>()
);

export const loadRecipeFail = createAction(
  '[Recipes API] Load Recipe Fail',
  props<{ error: string }>()
);

// Add Recipe
export const addRecipe = createAction(
  '[Recipes API] Add Recipe',
  props<{ recipe: Recipe }>()
);

export const addRecipeSuccess = createAction(
  '[Recipes API] Add Recipe Success',
  props<{ recipe: Recipe }>()
);

export const addRecipeFail = createAction(
  '[Recipes API] Add Recipe Fail',
  props<{ error: string }>()
);

// Update Recipe
export const updateRecipe = createAction(
  '[Recipes API] Update Recipe',
  props<{ id: string; recipe: Recipe }>()
);

export const updateRecipeSuccess = createAction(
  '[Recipes API] Update Recipe Success',
  props<{ recipe: Recipe }>()
);

export const updateRecipeFail = createAction(
  '[Recipes API] Update Recipe Fail',
  props<{ error: string }>()
);

// Delete Recipe
export const deleteRecipe = createAction(
  '[Recipes API] Delete Recipe',
  props<{ id: string }>()
);

export const deleteRecipeSuccess = createAction(
  '[Recipes API] Delete Recipe Success',
  props<{ id: string }>()
);

export const deleteRecipeFail = createAction(
  '[Recipes API] Delete Recipe Fail',
  props<{ error: string }>()
);

// UI Actions
export const selectRecipe = createAction(
  '[Recipes Page] Select Recipe',
  props<{ id: string }>()
);

export const clearSelectedRecipe = createAction(
  '[Recipes Page] Clear Selected Recipe'
);

export const clearError = createAction(
  '[Recipes Page] Clear Error'
);
