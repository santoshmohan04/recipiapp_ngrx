import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Recipe } from '../../features/recipes/models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private store = inject(Store);
  
  // Signals for reactive state
  recipes = signal<Recipe[]>([]);
  selectedRecipe = signal<Recipe | null>(null);
  isLoading = signal(false);

  constructor() {
    // Subscribe to recipe state from store
    this.store.select('recipes').subscribe(state => {
      this.recipes.set(state.recipes);
      this.isLoading.set(state.loading);
    });
  }

  // Recipe operations will interact with store
  addRecipe(recipe: Recipe) {
    // Dispatch actions instead of direct manipulation
  }

  updateRecipe(index: number, recipe: Recipe) {
    // Dispatch actions
  }

  deleteRecipe(index: number) {
    // Dispatch actions
  }

  getRecipe(index: number): Recipe | undefined {
    return this.recipes()[index];
  }

  addIngredientsToShoppingList(recipe: Recipe) {
    // Dispatch action to shopping list store
  }
}
