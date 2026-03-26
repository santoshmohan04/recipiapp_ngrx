import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import { environment } from '../../../environments/environment';

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string | number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingListResponse {
  id: string;
  userId: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/shopping-list`;

  /**
   * Get user's shopping list
   * @returns Observable<ShoppingListItem[]>
   */
  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.http.get<ShoppingListResponse>(this.apiUrl).pipe(
      map(response => response.items || []),
      catchError(this.handleError)
    );
  }

  /**
   * Add items to shopping list
   * @param items - Array of ingredients to add
   * @returns Observable<ShoppingListItem[]>
   */
  addItems(items: Ingredient[]): Observable<ShoppingListItem[]> {
    const payload = {
      items: items.map(item => ({
        name: item.name,
        amount: item.amount
      }))
    };
    
    return this.http.post<ShoppingListResponse>(`${this.apiUrl}/items`, payload).pipe(
      map(response => response.items || []),
      catchError(this.handleError)
    );
  }

  /**
   * Add single item to shopping list
   * @param item - Ingredient to add
   * @returns Observable<ShoppingListItem[]>
   */
  addItem(item: Ingredient): Observable<ShoppingListItem[]> {
    return this.addItems([item]);
  }

  /**
   * Update shopping list item
   * @param id - Item ID
   * @param item - Updated ingredient data
   * @returns Observable<ShoppingListItem>
   */
  updateItem(id: string, item: Ingredient): Observable<ShoppingListItem> {
    const payload = {
      name: item.name,
      amount: item.amount
    };
    
    return this.http.put<ShoppingListItem>(`${this.apiUrl}/items/${id}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete shopping list item
   * @param id - Item ID
   * @returns Observable<void>
   */
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear entire shopping list
   * @returns Observable<void>
   */
  clearShoppingList(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while accessing shopping list';
    
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
    
    console.error('Shopping List Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
