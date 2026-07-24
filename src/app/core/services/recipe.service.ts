import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Recipe } from '../../features/recipes/models/recipe.model';
import { environment } from '../../../environments/environment';
import { selectAllRecipes, selectRecipesLoading } from '../../store/recipes/recipe.selectors';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private store = inject(Store);
  
  private apiUrl = `${environment.apiUrl}/recipes`;
  
  // Signals for reactive state
  recipes = this.store.selectSignal(selectAllRecipes);
  selectedRecipe = signal<Recipe | null>(null);
  isLoading = this.store.selectSignal(selectRecipesLoading);
  error = signal<string | null>(null);

  // ============================================
  // HTTP API Methods for NestJS Backend
  // ============================================

  /**
   * Map API response to Recipe model
   * Convert _id to id for consistency
   */
  private mapApiRecipe(apiRecipe: any): Recipe {
    return {
      ...apiRecipe,
      id: apiRecipe._id || apiRecipe.id,
      name: apiRecipe.title || apiRecipe.name,
      imagePath: apiRecipe.imageUrl || apiRecipe.imagePath,
      rating: apiRecipe.averageRating || apiRecipe.rating || 0,
      instructions: apiRecipe.instructions || []
    };
  }

  /**
   * Get all recipes from the API
   * @returns Observable<Recipe[]>
   */
  getRecipes(): Observable<Recipe[]> {
    this.error.set(null);

    // Pass a high limit to retrieve all recipes in one request.
    // The API returns { data: Recipe[], page, totalPages, totalItems }.
    // MongoDB documents use `_id`; we normalise it to `id` so the NgRx
    // entity adapter (which keys on `recipe.id`) works correctly.
    return this.http.get<{ data: any[] } | any[]>(`${this.apiUrl}?limit=200`).pipe(
      map(response => {
        const raw = Array.isArray(response) ? response : response.data;
        return raw.map((r: any) => ({ ...r, id: r.id ?? r._id }));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get a single recipe by ID
   * @param id - Recipe ID
   * @returns Observable<Recipe>
   */
  getRecipeById(id: string | number): Observable<Recipe> {
    this.error.set(null);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        // Handle both direct recipe response or wrapped in data property
        const recipe = response.data || response;
        return this.mapApiRecipe(recipe);
      }),
      tap(recipe => {
        this.selectedRecipe.set(recipe);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Create a new recipe
   * @param recipe - Recipe data
   * @returns Observable<Recipe>
   */
  createRecipe(recipe: Recipe): Observable<Recipe> {
    this.error.set(null);
    
    return this.http.post<Recipe>(this.apiUrl, recipe).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update an existing recipe
   * @param id - Recipe ID
   * @param recipe - Updated recipe data
   * @returns Observable<Recipe>
   */
  updateRecipe(id: string | number, recipe: Recipe): Observable<Recipe> {
    this.error.set(null);
    
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Delete a recipe
   * @param id - Recipe ID
   * @returns Observable<void>
   */
  deleteRecipe(id: string | number): Observable<void> {
    this.error.set(null);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
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
    
    this.error.set(errorMessage);
    console.error('Recipe Service Error:', errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }

  // ============================================
  // Local State Management (NgRx Integration)
  // ============================================

  /**
   * Get recipe by index from local state
   * @param index - Recipe index
   * @returns Recipe or undefined
   */
  getRecipe(index: number): Recipe | undefined {
    return this.recipes()[index];
  }

  /**
   * Add ingredients to shopping list
   * @param recipe - Recipe with ingredients
   */
  addIngredientsToShoppingList(recipe: Recipe) {
    // Dispatch action to shopping list store
    // This would be implemented based on your shopping list store structure
  }

  /**
   * Clear error state
   */
  clearError() {
    this.error.set(null);
  }
}
