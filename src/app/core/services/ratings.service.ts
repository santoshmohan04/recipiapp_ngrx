import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

/**
 * Response from GET /recipes/:id/ratings
 */
export interface RecipeRatingsResponse {
  averageRating: number;
  totalRatings: number;
  ratings: Rating[];
}

@Injectable({
  providedIn: 'root'
})
export class RatingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all ratings for a recipe (includes stats and all ratings)
   * GET /api/recipes/:recipeId/ratings
   * Returns averageRating, totalRatings, and ratings array
   */
  getRatingsByRecipe(recipeId: string): Observable<RecipeRatingsResponse> {
    return this.http.get<RecipeRatingsResponse>(`${this.apiUrl}/recipes/${recipeId}/ratings`);
  }

  /**
   * Get rating statistics for a recipe
   * Calls getRatingsByRecipe and extracts stats
   * GET /api/recipes/:recipeId/ratings
   */
  getRecipeRatingStats(recipeId: string): Observable<RecipeRatingStats> {
    return this.getRatingsByRecipe(recipeId).pipe(
      map(response => ({
        recipeId,
        averageRating: response.averageRating,
        totalRatings: response.totalRatings
      }))
    );
  }

  /**
   * Get the current user's rating for a recipe
   * Note: This requires getting all ratings and filtering client-side
   * since the backend doesn't have a dedicated user rating endpoint
   * GET /api/recipes/:recipeId/ratings
   */
  getUserRating(recipeId: string): Observable<Rating | null> {
    // For now, return null since we'd need the Auth service to get current userId
    // This should be handled at the component/effects level where auth context is available
    return this.getRatingsByRecipe(recipeId).pipe(
      map(response => {
        // TODO: Filter ratings array by current user's ID when auth context is available
        // For now, returning null - this needs auth integration
        return null;
      })
    );
  }

  /**
   * Create or update a rating
   * POST /api/recipes/:recipeId/rate
   */
  createOrUpdateRating(dto: CreateRatingDto): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/recipes/${dto.recipeId}/rate`, dto);
  }

  /**
   * Delete a rating
   * Note: This endpoint may not be implemented in the backend
   */
  deleteRating(recipeId: string): Observable<void> {
    // Backend might not have this endpoint
    return this.http.delete<void>(`${this.apiUrl}/ratings/${recipeId}`);
  }
}
