import { createReducer, on } from '@ngrx/store';
import { Comment } from '../../core/services/comments.service';
import * as CommentsActions from './comments.actions';

export interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null
};

export const commentsReducer = createReducer(
  initialState,

  // Load comments
  on(CommentsActions.loadComments, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CommentsActions.loadCommentsSuccess, (state, { comments }) => ({
    ...state,
    comments,
    loading: false,
    error: null
  })),
  on(CommentsActions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create comment
  on(CommentsActions.createComment, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CommentsActions.createCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: [...state.comments, comment],
    loading: false,
    error: null
  })),
  on(CommentsActions.createCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update comment
  on(CommentsActions.updateComment, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CommentsActions.updateCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: state.comments.map(c => c.id === comment.id ? comment : c),
    loading: false,
    error: null
  })),
  on(CommentsActions.updateCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete comment
  on(CommentsActions.deleteComment, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CommentsActions.deleteCommentSuccess, (state, { id }) => ({
    ...state,
    comments: state.comments.filter(c => c.id !== id),
    loading: false,
    error: null
  })),
  on(CommentsActions.deleteCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear comments
  on(CommentsActions.clearComments, () => initialState)
);
