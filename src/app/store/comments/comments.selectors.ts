import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentsState } from './comments.reducer';

export const selectCommentsState = createFeatureSelector<CommentsState>('comments');

export const selectAllComments = createSelector(
  selectCommentsState,
  (state: CommentsState) => state.comments
);

export const selectCommentsLoading = createSelector(
  selectCommentsState,
  (state: CommentsState) => state.loading
);

export const selectCommentsError = createSelector(
  selectCommentsState,
  (state: CommentsState) => state.error
);

export const selectCommentById = (id: string) => createSelector(
  selectAllComments,
  (comments) => comments.find(c => c.id === id)
);
