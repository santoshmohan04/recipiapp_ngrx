import { createAction, props } from '@ngrx/store';
import { Ingredient } from '../../shared/models/ingredient.model';

// Add ingredient
export const addIngredient = createAction(
  '[Shopping List] Add Ingredient',
  props<{ ingredient: Ingredient }>()
);

// Add ingredients
export const addIngredients = createAction(
  '[Shopping List] Add Ingredients',
  props<{ ingredients: Ingredient[] }>()
);

// Update ingredient
export const updateIngredient = createAction(
  '[Shopping List] Update Ingredient',
  props<{ index: number; ingredient: Ingredient }>()
);

// Delete ingredient
export const deleteIngredient = createAction(
  '[Shopping List] Delete Ingredient',
  props<{ index: number }>()
);

// Start edit
export const startEdit = createAction(
  '[Shopping List] Start Edit',
  props<{ index: number }>()
);

// Stop edit
export const stopEdit = createAction('[Shopping List] Stop Edit');
