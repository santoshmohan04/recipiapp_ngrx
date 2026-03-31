import { createAction, props } from '@ngrx/store';
import { Ingredient } from '../../shared/models/ingredient.model';
import { ShoppingListItem } from '../../core/services/shopping-list.service';

// Load shopping list from API
export const loadShoppingList = createAction('[Shopping List API] Load Shopping List');

export const loadShoppingListSuccess = createAction(
  '[Shopping List API] Load Shopping List Success',
  props<{ items: ShoppingListItem[] }>()
);

export const loadShoppingListFail = createAction(
  '[Shopping List API] Load Shopping List Fail',
  props<{ error: string }>()
);

// Add ingredient (with API)
export const addIngredient = createAction(
  '[Shopping List] Add Ingredient',
  props<{ ingredient: Ingredient }>()
);

export const addIngredientSuccess = createAction(
  '[Shopping List API] Add Ingredient Success',
  props<{ items: ShoppingListItem[] }>()
);

export const addIngredientFail = createAction(
  '[Shopping List API] Add Ingredient Fail',
  props<{ error: string }>()
);

// Add ingredients (with API)
export const addIngredients = createAction(
  '[Shopping List] Add Ingredients',
  props<{ ingredients: Ingredient[] }>()
);

export const addIngredientsSuccess = createAction(
  '[Shopping List API] Add Ingredients Success',
  props<{ items: ShoppingListItem[] }>()
);

export const addIngredientsFail = createAction(
  '[Shopping List API] Add Ingredients Fail',
  props<{ error: string }>()
);

// Update ingredient (with API)
export const updateIngredient = createAction(
  '[Shopping List] Update Ingredient',
  props<{ id: string; ingredient: Ingredient }>()
);

export const updateIngredientSuccess = createAction(
  '[Shopping List API] Update Ingredient Success',
  props<{ item: ShoppingListItem }>()
);

export const updateIngredientFail = createAction(
  '[Shopping List API] Update Ingredient Fail',
  props<{ error: string }>()
);

// Delete ingredient (with API)
export const deleteIngredient = createAction(
  '[Shopping List] Delete Ingredient',
  props<{ id: string }>()
);

export const deleteIngredientSuccess = createAction(
  '[Shopping List API] Delete Ingredient Success',
  props<{ id: string }>()
);

export const deleteIngredientFail = createAction(
  '[Shopping List API] Delete Ingredient Fail',
  props<{ error: string }>()
);

// Clear all ingredients (with API)
export const clearIngredients = createAction('[Shopping List] Clear All Ingredients');

export const clearIngredientsSuccess = createAction(
  '[Shopping List API] Clear Ingredients Success'
);

export const clearIngredientsFail = createAction(
  '[Shopping List API] Clear Ingredients Fail',
  props<{ error: string }>()
);

// UI Actions (local only)
export const startEdit = createAction(
  '[Shopping List] Start Edit',
  props<{ id: string }>()
);

export const stopEdit = createAction('[Shopping List] Stop Edit');

export const clearError = createAction('[Shopping List] Clear Error');
