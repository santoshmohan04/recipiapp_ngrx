import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Recipe } from '../../features/recipes/models/recipe.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private store = inject(Store);
  
  private apiUrl = `${environment.apiUrl}/recipes`;
  
  // Signals for reactive state
  recipes = signal<Recipe[]>([]);
  selectedRecipe = signal<Recipe | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Subscribe to recipe state from store
    this.store.select('recipes').subscribe(state => {
      this.recipes.set(state.recipes);
      this.isLoading.set(state.loading);
    });
  }

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
      instructions: apiRecipe.instructions || []
    };
  }

  /**
   * Get all recipes from the API
   * @returns Observable<Recipe[]>
   */
  getRecipes(): Observable<Recipe[]> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(recipes => recipes.map(r => this.mapApiRecipe(r))),
      tap(recipes => {
        this.recipes.set(recipes);
        this.isLoading.set(false);
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
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(recipe => this.mapApiRecipe(recipe)),
      tap(recipe => {
        this.selectedRecipe.set(recipe);
        this.isLoading.set(false);
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
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.post<Recipe>(this.apiUrl, recipe).pipe(
      tap(newRecipe => {
        const currentRecipes = this.recipes();
        this.recipes.set([...currentRecipes, newRecipe]);
        this.isLoading.set(false);
      }),
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
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe).pipe(
      tap(updatedRecipe => {
        const currentRecipes = this.recipes();
        const index = currentRecipes.findIndex((r: any) => r.id === id);
        if (index !== -1) {
          const updated = [...currentRecipes];
          updated[index] = updatedRecipe;
          this.recipes.set(updated);
        }
        this.isLoading.set(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Delete a recipe
   * @param id - Recipe ID
   * @returns Observable<void>
   */
  deleteRecipe(id: string | number): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentRecipes = this.recipes();
        this.recipes.set(currentRecipes.filter((r: any) => r.id !== id));
        this.isLoading.set(false);
      }),
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
    this.isLoading.set(false);
    
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
