import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Recipe } from '../../features/recipes/models/recipe.model';
import { environment } from '../../../environments/environment';

export interface FavoriteRecipe {
  favoriteId: string;
  recipe: Recipe;
  createdAt: string;
}

// For internal use - mapping to recipeId
export interface FavoriteRecipeInternal {
  id: string;
  userId: string;
  recipeId: string;
  recipe?: Recipe;
  createdAt: string;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl;

  /**
   * Get user's favorite recipes
   * @returns Observable<FavoriteRecipe[]>
   */
  getFavorites(): Observable<FavoriteRecipe[]> {
    return this.http.get<FavoriteRecipe[]>(`${this.baseApiUrl}/users/me/favorites`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add recipe to favorites
   * @param recipeId - Recipe ID to add
   * @returns Observable<FavoriteRecipe>
   */
  addFavorite(recipeId: string): Observable<FavoriteRecipe> {
    return this.http.post<FavoriteRecipe>(`${this.baseApiUrl}/recipes/${recipeId}/favorite`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Remove recipe from favorites
   * @param recipeId - Recipe ID to remove
   * @returns Observable<void>
   */
  removeFavorite(recipeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/recipes/${recipeId}/favorite`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check if recipe is favorited by user
   * @param recipeId - Recipe ID to check
   * @returns Observable<boolean>
   */
  checkFavorite(recipeId: string): Observable<boolean> {
    return this.http.get<FavoriteCheckResponse>(`${this.baseApiUrl}/recipes/${recipeId}/favorite/check`).pipe(
      catchError(this.handleError)
    ) as Observable<boolean>;
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while accessing favorites';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Favorites Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
