import { createReducer, on } from '@ngrx/store';
import { Recipe } from '../recipe.model';
import * as RecipesActions from './recipe.actions';

export interface State {
  recipes: Recipe[];
}

const initialState: State = {
  recipes: [],
};

export const recipeReducer = createReducer(
  initialState,

  on(RecipesActions.setRecipes, (state, { recipes }) => ({
    ...state,
    recipes: [...recipes],
  })),

  on(RecipesActions.addRecipe, (state, { recipe }) => ({
    ...state,
    recipes: [...state.recipes, recipe],
  })),

  on(RecipesActions.updateRecipe, (state, { index, newRecipe }) => {
    const updatedRecipes = [...state.recipes];
    updatedRecipes[index] = { ...state.recipes[index], ...newRecipe };
    return {
      ...state,
      recipes: updatedRecipes,
    }
  }),

  on(RecipesActions.deleteRecipe, (state, { index }) => ({
    ...state,
    recipes: state.recipes.filter((_, i) => i !== index),
  }))
);
