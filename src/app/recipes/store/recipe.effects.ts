import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';

import * as RecipesActions from './recipe.actions';
import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import { environment } from 'src/environments/environment';

@Injectable()
export class RecipeEffects {
  url = environment.apiurl;
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) { }

  fetchRecipes = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.FETCH_RECIPES),
      switchMap(() => {
        return this.http.get<Recipe[]>(
          this.url
        );
      }),
      map((recipes) => {
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      map((recipes) => {
        return new RecipesActions.SetRecipes(recipes);
      })
    )
  });

  addRecipe = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.ADD_RECIPE),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        const updatedRecipes = [...recipesState.recipes, actionData.payload];
  
        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => new RecipesActions.SetRecipes(updatedRecipes))
        );
      })
    );
  });  

  updateRecipe = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.UPDATE_RECIPE),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        const updatedRecipe = {
          ...recipesState.recipes[actionData.payload.index],
          ...actionData.payload.newRecipe,
        };
  
        const updatedRecipes = [...recipesState.recipes];
        updatedRecipes[actionData.payload.index] = updatedRecipe;
  
        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => new RecipesActions.SetRecipes(updatedRecipes))
        );
      })
    );
  });  

  deleteRecipe = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.DELETE_RECIPE),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        const updatedRecipes = recipesState.recipes.filter((_, index) => index !== actionData.payload);
        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => new RecipesActions.SetRecipes(updatedRecipes))
        );
      })
    );
  });


  storeRecipes = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.STORE_RECIPES),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([actionData, recipesState]) => {
        return this.http.put(
          this.url,
          recipesState.recipes
        );
      })
    )
  }, { dispatch: false });
}
