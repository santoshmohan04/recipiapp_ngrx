import { createReducer, on } from '@ngrx/store';
import * as RecipeActions from './recipe.actions';
import { Recipe } from '../../features/recipes/models/recipe.model';

export interface State {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  recipes: [],
  loading: false,
  error: null,
};

export const recipeReducer = createReducer(
  initialState,
  
  on(RecipeActions.fetchRecipes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.fetchRecipesSuccess, (state, action) => ({
    ...state,
    recipes: action.recipes,
    loading: false,
    error: null,
  })),
  
  on(RecipeActions.fetchRecipesFail, (state, action) => ({
    ...state,
    loading: false,
    error: action.error,
  })),
  
  on(RecipeActions.setRecipes, (state, action) => ({
    ...state,
    recipes: [...action.recipes],
  })),
  
  on(RecipeActions.addRecipe, (state, action) => ({
    ...state,
    recipes: [...state.recipes, action.recipe],
  })),
  
  on(RecipeActions.updateRecipe, (state, action) => {
    const updatedRecipes = [...state.recipes];
    updatedRecipes[action.index] = action.recipe;
    return {
      ...state,
      recipes: updatedRecipes,
    };
  }),
  
  on(RecipeActions.deleteRecipe, (state, action) => ({
    ...state,
    recipes: state.recipes.filter((_, index) => index !== action.index),
  }))
);
