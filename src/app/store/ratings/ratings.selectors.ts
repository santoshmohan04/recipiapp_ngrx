import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RatingsState } from './ratings.reducer';

export const selectRatingsState = createFeatureSelector<RatingsState>('ratings');

export const selectAllRatings = createSelector(
  selectRatingsState,
  (state: RatingsState) => state.ratings
);

export const selectUserRating = createSelector(
  selectRatingsState,
  (state: RatingsState) => state.userRating
);

export const selectRatingStats = createSelector(
  selectRatingsState,
  (state: RatingsState) => state.stats
);

export const selectRatingsLoading = createSelector(
  selectRatingsState,
  (state: RatingsState) => state.loading
);

export const selectRatingsError = createSelector(
  selectRatingsState,
  (state: RatingsState) => state.error
);
