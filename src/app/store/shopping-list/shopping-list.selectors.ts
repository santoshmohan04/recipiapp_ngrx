import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromShoppingList from './shopping-list.reducer';

// Feature Selector
export const selectShoppingListState = 
  createFeatureSelector<fromShoppingList.State>('shoppingList');

// Basic Selectors
export const selectAllIngredients = createSelector(
  selectShoppingListState,
  (state) => state.items
);

export const selectLoading = createSelector(
  selectShoppingListState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectShoppingListState,
  (state) => state.error
);

export const selectEditedItemId = createSelector(
  selectShoppingListState,
  (state) => state.editedItemId
);

// Computed Selectors
export const selectIsEditing = createSelector(
  selectEditedItemId,
  (id) => id !== null
);

export const selectEditingIndex = createSelector(
  selectShoppingListState,
  (state) => {
    if (!state.editedItemId) return -1;
    return state.items.findIndex(item => item.id === state.editedItemId);
  }
);

export const selectEditedIngredient = createSelector(
  selectShoppingListState,
  (state) => {
    if (!state.editedItemId) return null;
    return state.items.find(item => item.id === state.editedItemId) || null;
  }
);

export const selectIngredientCount = createSelector(
  selectAllIngredients,
  (items) => items.length
);

export const selectIngredientById = (id: string) =>
  createSelector(
    selectAllIngredients,
    (items) => items.find(item => item.id === id)
  );

export const selectIngredientByIndex = (index: number) =>
  createSelector(
    selectAllIngredients,
    (items) => items[index]
  );

// Group ingredients by name (for deduplication/aggregation)
export const selectGroupedIngredients = createSelector(
  selectAllIngredients,
  (items) => {
    const grouped = new Map<string, { name: string; totalAmount: string; count: number; ids: string[] }>();
    
    items.forEach(item => {
      const key = item.itemName.toLowerCase();
      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.count += 1;
        existing.ids.push(item.id);
        // Simple aggregation - just concatenate amounts
        existing.totalAmount = `${existing.totalAmount}, ${item.quantity || ''}`;
      } else {
        grouped.set(key, {
          name: item.itemName,
          totalAmount: String(item.quantity || ''),
          count: 1,
          ids: [item.id]
        });
      }
    });
    
    return Array.from(grouped.values());
  }
);
