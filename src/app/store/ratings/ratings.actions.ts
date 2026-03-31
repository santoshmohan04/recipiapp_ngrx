import { createAction, props } from '@ngrx/store';
import { Rating, RecipeRatingStats } from '../../core/services/ratings.service';

// Load ratings for a recipe
export const loadRatings = createAction(
  '[Ratings] Load Ratings',
  props<{ recipeId: string }>()
);

export const loadRatingsSuccess = createAction(
  '[Ratings] Load Ratings Success',
  props<{ ratings: Rating[] }>()
);

export const loadRatingsFailure = createAction(
  '[Ratings] Load Ratings Failure',
  props<{ error: string }>()
);

// Load rating stats
export const loadRatingStats = createAction(
  '[Ratings] Load Rating Stats',
  props<{ recipeId: string }>()
);

export const loadRatingStatsSuccess = createAction(
  '[Ratings] Load Rating Stats Success',
  props<{ stats: RecipeRatingStats }>()
);

export const loadRatingStatsFailure = createAction(
  '[Ratings] Load Rating Stats Failure',
  props<{ error: string }>()
);

// Load user's rating for a recipe
export const loadUserRating = createAction(
  '[Ratings] Load User Rating',
  props<{ recipeId: string }>()
);

export const loadUserRatingSuccess = createAction(
  '[Ratings] Load User Rating Success',
  props<{ rating: Rating | null }>()
);

export const loadUserRatingFailure = createAction(
  '[Ratings] Load User Rating Failure',
  props<{ error: string }>()
);

// Create or update rating
export const createOrUpdateRating = createAction(
  '[Ratings] Create Or Update Rating',
  props<{ recipeId: string; rating: number }>()
);

export const createOrUpdateRatingSuccess = createAction(
  '[Ratings] Create Or Update Rating Success',
  props<{ rating: Rating }>()
);

export const createOrUpdateRatingFailure = createAction(
  '[Ratings] Create Or Update Rating Failure',
  props<{ error: string }>()
);

// Delete rating
export const deleteRating = createAction(
  '[Ratings] Delete Rating',
  props<{ id: string }>()
);

export const deleteRatingSuccess = createAction(
  '[Ratings] Delete Rating Success',
  props<{ id: string }>()
);

export const deleteRatingFailure = createAction(
  '[Ratings] Delete Rating Failure',
  props<{ error: string }>()
);

// Clear ratings (when navigating away)
export const clearRatings = createAction('[Ratings] Clear Ratings');
