import { createReducer, on } from '@ngrx/store';
import * as ShoppingListActions from './shopping-list.actions';
import { ShoppingListItem } from '../../core/services/shopping-list.service';

export interface State {
  items: ShoppingListItem[];
  loading: boolean;
  error: string | null;
  editedItemId: string | null;
}

const initialState: State = {
  items: [],
  loading: false,
  error: null,
  editedItemId: null,
};

export const shoppingListReducer = createReducer(
  initialState,
  
  // Load shopping list
  on(ShoppingListActions.loadShoppingList, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.loadShoppingListSuccess, (state, action) => ({
    ...state,
    items: action.items,
    loading: false,
    error: null,
  })),
  
  on(ShoppingListActions.loadShoppingListFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Add ingredient
  on(ShoppingListActions.addIngredient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.addIngredientSuccess, (state, action) => ({
    ...state,
    items: action.items,
    loading: false,
    error: null,
  })),
  
  on(ShoppingListActions.addIngredientFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Add ingredients
  on(ShoppingListActions.addIngredients, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.addIngredientsSuccess, (state, action) => ({
    ...state,
    items: action.items,
    loading: false,
    error: null,
  })),
  
  on(ShoppingListActions.addIngredientsFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Update ingredient
  on(ShoppingListActions.updateIngredient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.updateIngredientSuccess, (state, action) => ({
    ...state,
    items: state.items.map(item =>
      item.id === action.item.id ? action.item : item
    ),
    loading: false,
    error: null,
    editedItemId: null,
  })),
  
  on(ShoppingListActions.updateIngredientFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Delete ingredient
  on(ShoppingListActions.deleteIngredient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.deleteIngredientSuccess, (state, action) => ({
    ...state,
    items: state.items.filter(item => item.id !== action.id),
    loading: false,
    error: null,
    editedItemId: null,
  })),
  
  on(ShoppingListActions.deleteIngredientFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // Clear ingredients
  on(ShoppingListActions.clearIngredients, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(ShoppingListActions.clearIngredientsSuccess, (state) => ({
    ...state,
    items: [],
    loading: false,
    error: null,
    editedItemId: null,
  })),
  
  on(ShoppingListActions.clearIngredientsFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  // UI Actions
  on(ShoppingListActions.startEdit, (state, action) => ({
    ...state,
    editedItemId: action.id,
  })),
  
  on(ShoppingListActions.stopEdit, (state) => ({
    ...state,
    editedItemId: null,
  })),
  
  on(ShoppingListActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
