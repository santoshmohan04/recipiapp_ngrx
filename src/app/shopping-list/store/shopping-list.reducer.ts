import { createReducer, on } from '@ngrx/store';
import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient | null;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [new Ingredient('Apples', 5), new Ingredient('Tomatoes', 10)],
  editedIngredient: null,
  editedIngredientIndex: -1,
};

export const shoppingListReducer = createReducer(
  initialState,

  on(ShoppingListActions.addIngredient, (state, { ingredient }) => ({
    ...state,
    ingredients: [...state.ingredients, ingredient],
  })),

  on(ShoppingListActions.addIngredients, (state, { ingredients }) => ({
    ...state,
    ingredients: [...state.ingredients, ...ingredients],
  })),

  on(ShoppingListActions.updateIngredient, (state, { ingredient }) => {
    const updatedIngredient = {
      ...state.ingredients[state.editedIngredientIndex],
      ...ingredient,
    };

    const updatedIngredients = [...state.ingredients];
    updatedIngredients[state.editedIngredientIndex] = updatedIngredient;

    return {
      ...state,
      ingredients: updatedIngredients,
      editedIngredient: null,
      editedIngredientIndex: -1,
    };
  }),

  on(ShoppingListActions.deleteIngredient, (state) => ({
    ...state,
    ingredients: state.ingredients.filter(
      (_, index) => index !== state.editedIngredientIndex
    ),
    editedIngredient: null,
    editedIngredientIndex: -1,
  })),

  on(ShoppingListActions.startEdit, (state, { index }) => ({
    ...state,
    editedIngredientIndex: index,
    editedIngredient: { ...state.ingredients[index] },
  })),

  on(ShoppingListActions.stopEdit, (state) => ({
    ...state,
    editedIngredient: null,
    editedIngredientIndex: -1,
  }))
);