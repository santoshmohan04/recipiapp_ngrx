import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Comment model
 */
export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create comment payload
 */
export interface CreateCommentDto {
  recipeId: string;
  content: string;
}

/**
 * Update comment payload
 */
export interface UpdateCommentDto {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all comments for a recipe
   * GET /api/recipes/:recipeId/comments
   */
  getCommentsByRecipe(recipeId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/recipes/${recipeId}/comments`);
  }

  /**
   * Create a new comment
   * POST /api/recipes/:recipeId/comments
   */
  createComment(dto: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/recipes/${dto.recipeId}/comments`, dto);
  }

  /**
   * Update a comment
   * PUT /api/comments/:id
   * Note: This endpoint may not be implemented in the backend yet
   */
  updateComment(id: string, dto: UpdateCommentDto): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, dto);
  }

  /**
   * Delete a comment
   * DELETE /api/comments/:id
   */
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }
}
