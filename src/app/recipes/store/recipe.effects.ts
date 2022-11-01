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
  ) {}

  fetchRecipes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.fetchRecipes),
      switchMap(() =>
        this.http.get<Recipe[]>(this.url).pipe(
          map((recipes) =>
            recipes.map((recipe) => ({
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : [],
            }))
          ),
          map((recipes) => RecipesActions.setRecipes({ recipes }))
        )
      )
    )
  );

  addRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.addRecipe),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([{ recipe }, recipesState]) => {
        const updatedRecipes = [...recipesState.recipes, recipe];
        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => RecipesActions.setRecipes({ recipes: updatedRecipes }))
        );
      })
    )
  );

  updateRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.updateRecipe),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([{ index, newRecipe }, recipesState]) => {
        const updatedRecipe = {
          ...recipesState.recipes[index],
          ...newRecipe,
        };
        const updatedRecipes = [...recipesState.recipes];
        updatedRecipes[index] = updatedRecipe;

        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => RecipesActions.setRecipes({ recipes: updatedRecipes }))
        );
      })
    )
  );

  deleteRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.deleteRecipe),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([{ index }, recipesState]) => {
        const updatedRecipes = recipesState.recipes.filter((_, i) => i !== index);
        return this.http.put(this.url, updatedRecipes).pipe(
          map(() => RecipesActions.setRecipes({ recipes: updatedRecipes }))
        );
      })
    )
  );

  storeRecipes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipesActions.storeRecipes),
      withLatestFrom(this.store.select('recipes')),
      switchMap(([_, recipesState]) => {
        return this.http.put(this.url, recipesState.recipes);
      })
    ),
    { dispatch: false }
  );
}
