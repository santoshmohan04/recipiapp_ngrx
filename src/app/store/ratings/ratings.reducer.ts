import { createReducer, on } from '@ngrx/store';
import { Rating, RecipeRatingStats } from '../../core/services/ratings.service';
import * as RatingsActions from './ratings.actions';

export interface RatingsState {
  ratings: Rating[];
  userRating: Rating | null;
  stats: RecipeRatingStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: RatingsState = {
  ratings: [],
  userRating: null,
  stats: null,
  loading: false,
  error: null
};

export const ratingsReducer = createReducer(
  initialState,

  // Load ratings
  on(RatingsActions.loadRatings, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RatingsActions.loadRatingsSuccess, (state, { ratings }) => ({
    ...state,
    ratings,
    loading: false,
    error: null
  })),
  on(RatingsActions.loadRatingsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load rating stats
  on(RatingsActions.loadRatingStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RatingsActions.loadRatingStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loading: false,
    error: null
  })),
  on(RatingsActions.loadRatingStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load user rating
  on(RatingsActions.loadUserRating, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RatingsActions.loadUserRatingSuccess, (state, { rating }) => ({
    ...state,
    userRating: rating,
    loading: false,
    error: null
  })),
  on(RatingsActions.loadUserRatingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create or update rating
  on(RatingsActions.createOrUpdateRating, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RatingsActions.createOrUpdateRatingSuccess, (state, { rating }) => ({
    ...state,
    userRating: rating,
    ratings: state.ratings.some(r => r.userId === rating.userId)
      ? state.ratings.map(r => r.userId === rating.userId ? rating : r)
      : [...state.ratings, rating],
    loading: false,
    error: null
  })),
  on(RatingsActions.createOrUpdateRatingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete rating
  on(RatingsActions.deleteRating, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(RatingsActions.deleteRatingSuccess, (state, { id }) => ({
    ...state,
    ratings: state.ratings.filter(r => r.id !== id),
    userRating: state.userRating?.id === id ? null : state.userRating,
    loading: false,
    error: null
  })),
  on(RatingsActions.deleteRatingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear ratings
  on(RatingsActions.clearRatings, () => initialState)
);
