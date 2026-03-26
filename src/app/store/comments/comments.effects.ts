import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as CommentsActions from './comments.actions';
import { CommentsService } from '../../core/services/comments.service';

@Injectable()
export class CommentsEffects {
  private actions$ = inject(Actions);
  private commentsService = inject(CommentsService);

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.loadComments),
      switchMap(({ recipeId }) =>
        this.commentsService.getCommentsByRecipe(recipeId).pipe(
          map(comments => CommentsActions.loadCommentsSuccess({ comments })),
          catchError(error => 
            of(CommentsActions.loadCommentsFailure({ 
              error: error.message || 'Failed to load comments' 
            }))
          )
        )
      )
    )
  );

  createComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.createComment),
      switchMap(({ recipeId, content }) =>
        this.commentsService.createComment({ recipeId, content }).pipe(
          map(comment => CommentsActions.createCommentSuccess({ comment })),
          tap(() => {
            // You can add a notification here if desired
            console.log('Comment created successfully');
          }),
          catchError(error =>
            of(CommentsActions.createCommentFailure({
              error: error.message || 'Failed to create comment'
            }))
          )
        )
      )
    )
  );

  updateComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.updateComment),
      switchMap(({ id, content }) =>
        this.commentsService.updateComment(id, { content }).pipe(
          map(comment => CommentsActions.updateCommentSuccess({ comment })),
          tap(() => {
            console.log('Comment updated successfully');
          }),
          catchError(error =>
            of(CommentsActions.updateCommentFailure({
              error: error.message || 'Failed to update comment'
            }))
          )
        )
      )
    )
  );

  deleteComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentsActions.deleteComment),
      switchMap(({ id }) =>
        this.commentsService.deleteComment(id).pipe(
          map(() => CommentsActions.deleteCommentSuccess({ id })),
          tap(() => {
            console.log('Comment deleted successfully');
          }),
          catchError(error =>
            of(CommentsActions.deleteCommentFailure({
              error: error.message || 'Failed to delete comment'
            }))
          )
        )
      )
    )
  );
}
