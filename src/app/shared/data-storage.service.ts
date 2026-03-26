import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Recipe } from '../recipes/recipe.model';
import { environment } from '../../environments/environment';

/**
 * Legacy Data Storage Service
 * 
 * NOTE: This service is deprecated and not actively used.
 * The application now uses RecipeService with NgRx for state management
 * and REST API calls to the backend.
 * 
 * Keeping this for backward compatibility, but it has been updated
 * to use REST API endpoints instead of Firebase.
 */
@Injectable({ providedIn: 'root' })
export class DataStorageService {
  private apiUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  /**
   * Store/Save all recipes to the backend
   * @deprecated Use RecipeService with NgRx store instead
   */
  storeRecipes(recipes: Recipe[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/bulk`, recipes).pipe(
      tap(response => {
        console.log('Recipes saved:', response);
      })
    );
  }

  /**
   * Fetch all recipes from the backend
   * @deprecated Use RecipeService with NgRx store instead
   */
  fetchRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl).pipe(
      map(recipes => {
        // Ensure ingredients array exists
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          };
        });
      }),
      tap(recipes => {
        console.log('Recipes fetched:', recipes.length);
      })
    );
  }
}
