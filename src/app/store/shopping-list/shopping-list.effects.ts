import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as ShoppingListActions from './shopping-list.actions';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class ShoppingListEffects {
  private actions$ = inject(Actions);
  private shoppingListService = inject(ShoppingListService);
  private notificationService = inject(NotificationService);

  // Load shopping list
  loadShoppingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.loadShoppingList),
      switchMap(() =>
        this.shoppingListService.getShoppingList().pipe(
          map(items => ShoppingListActions.loadShoppingListSuccess({ items })),
          catchError(error =>
            of(ShoppingListActions.loadShoppingListFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Add ingredient
  addIngredient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.addIngredient),
      switchMap(({ ingredient }) =>
        this.shoppingListService.addItem(ingredient).pipe(
          map(items => ShoppingListActions.addIngredientSuccess({ items })),
          catchError(error =>
            of(ShoppingListActions.addIngredientFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Add ingredients
  addIngredients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.addIngredients),
      switchMap(({ ingredients }) =>
        this.shoppingListService.addItems(ingredients).pipe(
          map(items => ShoppingListActions.addIngredientsSuccess({ items })),
          catchError(error =>
            of(ShoppingListActions.addIngredientsFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Update ingredient
  updateIngredient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.updateIngredient),
      switchMap(({ id, ingredient }) =>
        this.shoppingListService.updateItem(id, ingredient).pipe(
          map(item => ShoppingListActions.updateIngredientSuccess({ item })),
          catchError(error =>
            of(ShoppingListActions.updateIngredientFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Delete ingredient
  deleteIngredient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.deleteIngredient),
      switchMap(({ id }) =>
        this.shoppingListService.deleteItem(id).pipe(
          map(() => ShoppingListActions.deleteIngredientSuccess({ id })),
          catchError(error =>
            of(ShoppingListActions.deleteIngredientFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Clear shopping list
  clearIngredients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShoppingListActions.clearIngredients),
      switchMap(() =>
        this.shoppingListService.clearShoppingList().pipe(
          map(() => ShoppingListActions.clearIngredientsSuccess()),
          catchError(error =>
            of(ShoppingListActions.clearIngredientsFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Success notifications
  addIngredientSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ShoppingListActions.addIngredientSuccess),
        tap(() => {
          this.notificationService.showSuccess('Ingredient added to shopping list!');
        })
      ),
    { dispatch: false }
  );

  addIngredientsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ShoppingListActions.addIngredientsSuccess),
        tap(({ items }) => {
          this.notificationService.showSuccess(`${items.length} ingredients added to shopping list!`);
        })
      ),
    { dispatch: false }
  );

  updateIngredientSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ShoppingListActions.updateIngredientSuccess),
        tap(() => {
          this.notificationService.showSuccess('Ingredient updated!');
        })
      ),
    { dispatch: false }
  );

  deleteIngredientSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ShoppingListActions.deleteIngredientSuccess),
        tap(() => {
          this.notificationService.showSuccess('Ingredient deleted!');
        })
      ),
    { dispatch: false }
  );

  clearIngredientsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ShoppingListActions.clearIngredientsSuccess),
        tap(() => {
          this.notificationService.showSuccess('Shopping list cleared!');
        })
      ),
    { dispatch: false }
  );

  // Error notifications
  handleErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ShoppingListActions.loadShoppingListFail,
          ShoppingListActions.addIngredientFail,
          ShoppingListActions.addIngredientsFail,
          ShoppingListActions.updateIngredientFail,
          ShoppingListActions.deleteIngredientFail,
          ShoppingListActions.clearIngredientsFail
        ),
        tap(({ error }) => {
          this.notificationService.showError(error);
          console.error('Shopping List Error:', error);
        })
      ),
    { dispatch: false }
  );
}
