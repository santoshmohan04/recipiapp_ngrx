import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth/auth.reducer';
import * as fromRecipes from './recipes/recipe.reducer';
import * as fromShoppingList from './shopping-list/shopping-list.reducer';
import * as fromFavorites from './favorites/favorites.reducer';
import * as fromComments from './comments/comments.reducer';
import * as fromRatings from './ratings/ratings.reducer';

export interface AppState {
  auth: fromAuth.State;
  recipes: fromRecipes.State;
  shoppingList: fromShoppingList.State;
  favorites: fromFavorites.State;
  comments: fromComments.CommentsState;
  ratings: fromRatings.RatingsState;
}

export const appReducer: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  recipes: fromRecipes.recipeReducer,
  shoppingList: fromShoppingList.shoppingListReducer,
  favorites: fromFavorites.favoritesReducer,
  comments: fromComments.commentsReducer,
  ratings: fromRatings.ratingsReducer,
};
