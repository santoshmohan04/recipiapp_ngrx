import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Rating model
 */
export interface Rating {
  id: string;
  recipeId: string;
  userId: string;
  userName?: string;
  rating: number; // 1-5 stars
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create or update rating payload
 */
export interface CreateRatingDto {
  recipeId: string;
  rating: number;
}

/**
 * Average rating for a recipe
 */
export interface RecipeRatingStats {
  recipeId: string;
  averageRating: number;
  totalRatings: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ratings`;

  /**
   * Get all ratings for a recipe
   * GET /api/ratings/recipe/:recipeId
   */
  getRatingsByRecipe(recipeId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/recipe/${recipeId}`);
  }

  /**
   * Get rating statistics for a recipe
   * GET /api/ratings/recipe/:recipeId/stats
   */
  getRecipeRatingStats(recipeId: string): Observable<RecipeRatingStats> {
    return this.http.get<RecipeRatingStats>(`${this.apiUrl}/recipe/${recipeId}/stats`);
  }

  /**
   * Get the current user's rating for a recipe
   * GET /api/ratings/recipe/:recipeId/user
   */
  getUserRating(recipeId: string): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.apiUrl}/recipe/${recipeId}/user`);
  }

  /**
   * Create or update a rating
   * POST /api/ratings
   */
  createOrUpdateRating(dto: CreateRatingDto): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, dto);
  }

  /**
   * Delete a rating
   * DELETE /api/ratings/:id
   */
  deleteRating(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
