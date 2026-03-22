import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as RecipeActions from './recipe.actions';
import { RecipeService } from '../../core/services/recipe.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class RecipeEffects {
  private actions$ = inject(Actions);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Load all recipes
  loadRecipes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.loadRecipes),
      switchMap(() =>
        this.recipeService.getRecipes().pipe(
          map(recipes => RecipeActions.loadRecipesSuccess({ recipes })),
          catchError(error =>
            of(RecipeActions.loadRecipesFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Load single recipe
  loadRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.loadRecipe),
      switchMap(({ id }) =>
        this.recipeService.getRecipeById(id).pipe(
          map(recipe => RecipeActions.loadRecipeSuccess({ recipe })),
          catchError(error =>
            of(RecipeActions.loadRecipeFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Add recipe
  addRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.addRecipe),
      switchMap(({ recipe }) =>
        this.recipeService.createRecipe(recipe).pipe(
          map(newRecipe => RecipeActions.addRecipeSuccess({ recipe: newRecipe })),
          catchError(error =>
            of(RecipeActions.addRecipeFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Navigate after successful add
  addRecipeSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RecipeActions.addRecipeSuccess),
        tap(({ recipe }) => {
          this.notificationService.showSuccess(`Recipe "${recipe.name}" created successfully!`);
          console.log('Recipe created successfully:', recipe);
          // Optionally navigate to the recipe detail page
          // this.router.navigate(['/recipes', recipe.id]);
        })
      ),
    { dispatch: false }
  );

  // Update recipe
  updateRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.updateRecipe),
      switchMap(({ id, recipe }) =>
        this.recipeService.updateRecipe(id, recipe).pipe(
          map(updatedRecipe => RecipeActions.updateRecipeSuccess({ recipe: updatedRecipe })),
          catchError(error =>
            of(RecipeActions.updateRecipeFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Navigate after successful update
  updateRecipeSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RecipeActions.updateRecipeSuccess),
        tap(({ recipe }) => {
          this.notificationService.showSuccess(`Recipe "${recipe.name}" updated successfully!`);
          console.log('Recipe updated successfully:', recipe);
          // Optionally navigate back to recipe list
          // this.router.navigate(['/recipes']);
        })
      ),
    { dispatch: false }
  );

  // Delete recipe
  deleteRecipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecipeActions.deleteRecipe),
      switchMap(({ id }) =>
        this.recipeService.deleteRecipe(id).pipe(
          map(() => RecipeActions.deleteRecipeSuccess({ id })),
          catchError(error =>
            of(RecipeActions.deleteRecipeFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Navigate after successful delete
  deleteRecipeSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RecipeActions.deleteRecipeSuccess),
        tap(({ id }) => {
          this.notificationService.showSuccess('Recipe deleted successfully!');
          console.log('Recipe deleted successfully:', id);
          // Optionally navigate to recipe list
          // this.router.navigate(['/recipes']);
        })
      ),
    { dispatch: false }
  );

  // Handle errors
  handleError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          RecipeActions.loadRecipesFail,
          RecipeActions.loadRecipeFail,
          RecipeActions.addRecipeFail,
          RecipeActions.updateRecipeFail,
          RecipeActions.deleteRecipeFail
        ),
        tap(({ error, type }) => {
          console.error('Recipe Effect Error:', error);
          
          // Show specific error messages based on action type
          if (type === RecipeActions.addRecipeFail.type) {
            this.notificationService.showError('Error creating recipe. Please try again.');
          } else if (type === RecipeActions.updateRecipeFail.type) {
            this.notificationService.showError('Error updating recipe. Please try again.');
          } else if (type === RecipeActions.deleteRecipeFail.type) {
            this.notificationService.showError('Error deleting recipe. Please try again.');
          } else if (type === RecipeActions.loadRecipesFail.type) {
            this.notificationService.showError('Error loading recipes. Please refresh the page.');
          } else if (type === RecipeActions.loadRecipeFail.type) {
            this.notificationService.showError('Error loading recipe details.');
          }
        })
      ),
    { dispatch: false }
  );
}
