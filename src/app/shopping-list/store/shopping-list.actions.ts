import { createAction, props } from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';

// Add single ingredient
export const addIngredient = createAction(
  '[Shopping List] Add Ingredient',
  props<{ ingredient: Ingredient }>()
);

// Add multiple ingredients
export const addIngredients = createAction(
  '[Shopping List] Add Ingredients',
  props<{ ingredients: Ingredient[] }>()
);

// Update ingredient
export const updateIngredient = createAction(
  '[Shopping List] Update Ingredient',
  props<{ ingredient: Ingredient }>()
);

// Delete ingredient
export const deleteIngredient = createAction(
  '[Shopping List] Delete Ingredient'
);

// Start editing an ingredient (by index)
export const startEdit = createAction(
  '[Shopping List] Start Edit',
  props<{ index: number }>()
);

// Stop editing
export const stopEdit = createAction(
  '[Shopping List] Stop Edit'
);
