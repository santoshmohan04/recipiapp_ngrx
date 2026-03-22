import { createReducer, on } from '@ngrx/store';
import * as ShoppingListActions from './shopping-list.actions';
import { Ingredient } from '../../shared/models/ingredient.model';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient | null;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [],
  editedIngredient: null,
  editedIngredientIndex: -1,
};

export const shoppingListReducer = createReducer(
  initialState,
  
  on(ShoppingListActions.addIngredient, (state, action) => ({
    ...state,
    ingredients: [...state.ingredients, action.ingredient],
  })),
  
  on(ShoppingListActions.addIngredients, (state, action) => ({
    ...state,
    ingredients: [...state.ingredients, ...action.ingredients],
  })),
  
  on(ShoppingListActions.updateIngredient, (state, action) => {
    const updatedIngredients = [...state.ingredients];
    updatedIngredients[action.index] = action.ingredient;
    return {
      ...state,
      ingredients: updatedIngredients,
      editedIngredient: null,
      editedIngredientIndex: -1,
    };
  }),
  
  on(ShoppingListActions.deleteIngredient, (state, action) => ({
    ...state,
    ingredients: state.ingredients.filter((_, index) => index !== action.index),
    editedIngredient: null,
    editedIngredientIndex: -1,
  })),
  
  on(ShoppingListActions.startEdit, (state, action) => ({
    ...state,
    editedIngredient: { ...state.ingredients[action.index] },
    editedIngredientIndex: action.index,
  })),
  
  on(ShoppingListActions.stopEdit, (state) => ({
    ...state,
    editedIngredient: null,
    editedIngredientIndex: -1,
  })),
  
  on(ShoppingListActions.clearIngredients, (state) => ({
    ...state,
    ingredients: [],
    editedIngredient: null,
    editedIngredientIndex: -1,
  }))
);
