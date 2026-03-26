import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as FavoritesActions from './favorites.actions';
import { FavoritesService } from '../../core/services/favorites.service';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private favoritesService = inject(FavoritesService);
  private notificationService = inject(NotificationService);

  // Load favorites
  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      switchMap(() =>
        this.favoritesService.getFavorites().pipe(
          map(favorites => FavoritesActions.loadFavoritesSuccess({ favorites })),
          catchError(error =>
            of(FavoritesActions.loadFavoritesFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Add favorite
  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),
      switchMap(({ recipeId }) =>
        this.favoritesService.addFavorite(recipeId).pipe(
          map(favorite => FavoritesActions.addFavoriteSuccess({ favorite })),
          catchError(error =>
            of(FavoritesActions.addFavoriteFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Remove favorite
  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),
      switchMap(({ recipeId }) =>
        this.favoritesService.removeFavorite(recipeId).pipe(
          map(() => FavoritesActions.removeFavoriteSuccess({ recipeId })),
          catchError(error =>
            of(FavoritesActions.removeFavoriteFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Toggle favorite (smart effect)
  toggleFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.toggleFavorite),
      map(({ recipeId, isFavorite }) =>
        isFavorite
          ? FavoritesActions.removeFavorite({ recipeId })
          : FavoritesActions.addFavorite({ recipeId })
      )
    )
  );

  // Check favorite
  checkFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.checkFavorite),
      switchMap(({ recipeId }) =>
        this.favoritesService.checkFavorite(recipeId).pipe(
          map(isFavorite => FavoritesActions.checkFavoriteSuccess({ recipeId, isFavorite })),
          catchError(error =>
            of(FavoritesActions.checkFavoriteFail({ error: error.message }))
          )
        )
      )
    )
  );

  // Success notifications
  addFavoriteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FavoritesActions.addFavoriteSuccess),
        tap(() => {
          this.notificationService.showSuccess('Added to favorites!');
        })
      ),
    { dispatch: false }
  );

  removeFavoriteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(FavoritesActions.removeFavoriteSuccess),
        tap(() => {
          this.notificationService.showSuccess('Removed from favorites!');
        })
      ),
    { dispatch: false }
  );

  // Error notifications
  handleErrors$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          FavoritesActions.loadFavoritesFail,
          FavoritesActions.addFavoriteFail,
          FavoritesActions.removeFavoriteFail,
          FavoritesActions.checkFavoriteFail
        ),
        tap(({ error }) => {
          this.notificationService.showError(error);
          console.error('Favorites Error:', error);
        })
      ),
    { dispatch: false }
  );
}
