import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as RecipeActions from './recipe.actions';
import { Recipe } from '../../features/recipes/models/recipe.model';

// Entity State Interface
export interface State extends EntityState<Recipe> {
  selectedRecipeId: string | number | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

// Entity Adapter
export const adapter: EntityAdapter<Recipe> = createEntityAdapter<Recipe>({
  selectId: (recipe: Recipe) => recipe.id!,
  sortComparer: false, // No sorting, maintain insertion order
});

// Initial State
export const initialState: State = adapter.getInitialState({
  selectedRecipeId: null,
  loading: false,
  loaded: false,
  error: null,
});

// Reducer
export const recipeReducer = createReducer(
  initialState,
  
  // Load Recipes
  on(RecipeActions.loadRecipes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.loadRecipesSuccess, (state, { recipes }) => 
    adapter.setAll(recipes, {
      ...state,
      loading: false,
      loaded: true,
      error: null,
    })
  ),
  
  on(RecipeActions.loadRecipesFail, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Single Recipe
  on(RecipeActions.loadRecipe, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.loadRecipeSuccess, (state, { recipe }) =>
    adapter.upsertOne(recipe, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  
  on(RecipeActions.loadRecipeFail, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Add Recipe
  on(RecipeActions.addRecipe, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.addRecipeSuccess, (state, { recipe }) =>
    adapter.addOne(recipe, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  
  on(RecipeActions.addRecipeFail, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Update Recipe
  on(RecipeActions.updateRecipe, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.updateRecipeSuccess, (state, { recipe }) =>
    adapter.updateOne(
      { id: recipe.id!, changes: recipe },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  
  on(RecipeActions.updateRecipeFail, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Delete Recipe
  on(RecipeActions.deleteRecipe, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  
  on(RecipeActions.deleteRecipeSuccess, (state, { id }) =>
    adapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
      selectedRecipeId: state.selectedRecipeId === id ? null : state.selectedRecipeId,
    })
  ),
  
  on(RecipeActions.deleteRecipeFail, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // UI Actions
  on(RecipeActions.selectRecipe, (state, { id }) => ({
    ...state,
    selectedRecipeId: id,
  })),
  
  on(RecipeActions.clearSelectedRecipe, (state) => ({
    ...state,
    selectedRecipeId: null,
  })),
  
  on(RecipeActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);

// Export entity adapter selectors
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
