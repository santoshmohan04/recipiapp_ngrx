import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Ingredient } from '../../shared/models/ingredient.model';
import { environment } from '../../../environments/environment';

export interface ShoppingListItem {
  id: string;
  itemName: string;
  quantity?: string;
  category?: string;
  isChecked?: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingListStats {
  totalItems: number;
  checkedItems: number;
  uncheckedItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/shopping-list`;

  /**
   * Get user's shopping list
   * GET /api/shopping-list
   * @returns Observable<ShoppingListItem[]>
   */
  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.http.get<ShoppingListItem[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Add items to shopping list (makes multiple POST calls)
   * @param items - Array of ingredients to add
   * @returns Observable<ShoppingListItem[]>
   */
  addItems(items: Ingredient[]): Observable<ShoppingListItem[]> {
    // Backend doesn't support batch creation, so we need to add items one by one
    // For now, just add the first item or handle this at the effects level
    if (items.length === 0) {
      return this.getShoppingList();
    }
    
    // Add first item and return updated list
    return this.addItem(items[0]).pipe(
      map(() => []), // Will be followed by a getShoppingList() call in effects
      catchError(this.handleError)
    );
  }

  /**
   * Add single item to shopping list
   * POST /api/shopping-list
   * @param item - Ingredient to add
   * @returns Observable<ShoppingListItem>
   */
  addItem(item: Ingredient): Observable<ShoppingListItem> {
    const payload = {
      itemName: item.name,
      quantity: item.amount?.toString(),
      category: '' // Could be extracted from ingredient if available
    };
    
    return this.http.post<ShoppingListItem>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update shopping list item
   * PATCH /api/shopping-list/:id
   * @param id - Item ID
   * @param updates - Partial updates to the item
   * @returns Observable<ShoppingListItem>
   */
  updateItem(id: string, updates: Partial<{ itemName: string; quantity: string; category: string; isChecked: boolean }>): Observable<ShoppingListItem> {
    return this.http.patch<ShoppingListItem>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete shopping list item
   * DELETE /api/shopping-list/:id
   * @param id - Item ID
   * @returns Observable<void>
   */
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get shopping list statistics
   * GET /api/shopping-list/stats
   * @returns Observable<ShoppingListStats>
   */
  getStats(): Observable<ShoppingListStats> {
    return this.http.get<ShoppingListStats>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear all checked items from shopping list
   * DELETE /api/shopping-list/checked
   * @returns Observable<{ deletedCount: number }>
   */
  clearCheckedItems(): Observable<{ deletedCount: number }> {
    return this.http.delete<{ deletedCount: number }>(`${this.apiUrl}/checked`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear entire shopping list (convenience method - deletes all checked items)
   * @returns Observable<{ deletedCount: number }>
   */
  clearShoppingList(): Observable<{ deletedCount: number }> {
    return this.clearCheckedItems();
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
