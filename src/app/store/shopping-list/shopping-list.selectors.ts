import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromShoppingList from './shopping-list.reducer';

// Feature Selector
export const selectShoppingListState = 
  createFeatureSelector<fromShoppingList.State>('shoppingList');

// Basic Selectors
export const selectAllIngredients = createSelector(
  selectShoppingListState,
  (state) => state.ingredients
);

export const selectEditedIngredient = createSelector(
  selectShoppingListState,
  (state) => state.editedIngredient
);

export const selectEditingIndex = createSelector(
  selectShoppingListState,
  (state) => state.editedIngredientIndex
);

// Computed Selectors
export const selectIsEditing = createSelector(
  selectEditingIndex,
  (index) => index !== -1
);

export const selectIngredientCount = createSelector(
  selectAllIngredients,
  (ingredients) => ingredients.length
);

export const selectIngredientByIndex = (index: number) =>
  createSelector(
    selectAllIngredients,
    (ingredients) => ingredients[index]
  );

// Group ingredients by name (for deduplication/aggregation)
export const selectGroupedIngredients = createSelector(
  selectAllIngredients,
  (ingredients) => {
    const grouped = new Map<string, { name: string; totalAmount: string; count: number }>();
    
    ingredients.forEach(ing => {
      const key = ing.name.toLowerCase();
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.count++;
        // Simple concatenation for amounts (could be more sophisticated)
        existing.totalAmount += `, ${ing.amount}`;
      } else {
        grouped.set(key, {
          name: ing.name,
          totalAmount: String(ing.amount),
          count: 1
        });
      }
    });
    
    return Array.from(grouped.values());
  }
);
