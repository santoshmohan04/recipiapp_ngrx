import { createAction, props } from '@ngrx/store';
import { Comment } from '../../core/services/comments.service';

// Load comments for a recipe
export const loadComments = createAction(
  '[Comments] Load Comments',
  props<{ recipeId: string }>()
);

export const loadCommentsSuccess = createAction(
  '[Comments] Load Comments Success',
  props<{ comments: Comment[] }>()
);

export const loadCommentsFailure = createAction(
  '[Comments] Load Comments Failure',
  props<{ error: string }>()
);

// Create comment
export const createComment = createAction(
  '[Comments] Create Comment',
  props<{ recipeId: string; content: string }>()
);

export const createCommentSuccess = createAction(
  '[Comments] Create Comment Success',
  props<{ comment: Comment }>()
);

export const createCommentFailure = createAction(
  '[Comments] Create Comment Failure',
  props<{ error: string }>()
);

// Update comment
export const updateComment = createAction(
  '[Comments] Update Comment',
  props<{ id: string; content: string }>()
);

export const updateCommentSuccess = createAction(
  '[Comments] Update Comment Success',
  props<{ comment: Comment }>()
);

export const updateCommentFailure = createAction(
  '[Comments] Update Comment Failure',
  props<{ error: string }>()
);

// Delete comment
export const deleteComment = createAction(
  '[Comments] Delete Comment',
  props<{ id: string }>()
);

export const deleteCommentSuccess = createAction(
  '[Comments] Delete Comment Success',
  props<{ id: string }>()
);

export const deleteCommentFailure = createAction(
  '[Comments] Delete Comment Failure',
  props<{ error: string }>()
);

// Clear comments (when navigating away)
export const clearComments = createAction('[Comments] Clear Comments');
