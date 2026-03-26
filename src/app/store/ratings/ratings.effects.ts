import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as RatingsActions from './ratings.actions';
import { RatingsService } from '../../core/services/ratings.service';

@Injectable()
export class RatingsEffects {
  private actions$ = inject(Actions);
  private ratingsService = inject(RatingsService);

  loadRatings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RatingsActions.loadRatings),
      switchMap(({ recipeId }) =>
        this.ratingsService.getRatingsByRecipe(recipeId).pipe(
          map(ratings => RatingsActions.loadRatingsSuccess({ ratings })),
          catchError(error =>
            of(RatingsActions.loadRatingsFailure({
              error: error.message || 'Failed to load ratings'
            }))
          )
        )
      )
    )
  );

  loadRatingStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RatingsActions.loadRatingStats),
      switchMap(({ recipeId }) =>
        this.ratingsService.getRecipeRatingStats(recipeId).pipe(
          map(stats => RatingsActions.loadRatingStatsSuccess({ stats })),
          catchError(error =>
            of(RatingsActions.loadRatingStatsFailure({
              error: error.message || 'Failed to load rating stats'
            }))
          )
        )
      )
    )
  );

  loadUserRating$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RatingsActions.loadUserRating),
      switchMap(({ recipeId }) =>
        this.ratingsService.getUserRating(recipeId).pipe(
          map(rating => RatingsActions.loadUserRatingSuccess({ rating })),
          catchError(error =>
            of(RatingsActions.loadUserRatingFailure({
              error: error.message || 'Failed to load user rating'
            }))
          )
        )
      )
    )
  );

  createOrUpdateRating$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RatingsActions.createOrUpdateRating),
      switchMap(({ recipeId, rating }) =>
        this.ratingsService.createOrUpdateRating({ recipeId, rating }).pipe(
          map(ratingResult => RatingsActions.createOrUpdateRatingSuccess({ rating: ratingResult })),
          tap(() => {
            console.log('Rating saved successfully');
          }),
          catchError(error =>
            of(RatingsActions.createOrUpdateRatingFailure({
              error: error.message || 'Failed to save rating'
            }))
          )
        )
      )
    )
  );

  deleteRating$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RatingsActions.deleteRating),
      switchMap(({ id }) =>
        this.ratingsService.deleteRating(id).pipe(
          map(() => RatingsActions.deleteRatingSuccess({ id })),
          tap(() => {
            console.log('Rating deleted successfully');
          }),
          catchError(error =>
            of(RatingsActions.deleteRatingFailure({
              error: error.message || 'Failed to delete rating'
            }))
          )
        )
      )
    )
  );
}
