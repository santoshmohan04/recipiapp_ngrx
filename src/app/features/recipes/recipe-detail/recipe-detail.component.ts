import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import * as RecipeActions from '../../../store/recipes/recipe.actions';
import * as ShoppingListActions from '../../../store/shopping-list/shopping-list.actions';
import { Recipe } from '../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  
  recipe = signal<Recipe | null>(null);
  recipeIndex = signal<number>(-1);

  constructor() {
    effect(() => {
      this.route.params.subscribe(params => {
        const id = +params['id'];
        this.recipeIndex.set(id);
        
        this.store.select('recipes').subscribe(state => {
          this.recipe.set(state.recipes[id] || null);
        });
      });
    });
  }
  
  getRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  onAddToShoppingList() {
    if (this.recipe()) {
      this.store.dispatch(
        ShoppingListActions.addIngredients({ 
          ingredients: this.recipe()!.ingredients 
        })
      );
    }
  }

  onEditRecipe() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteRecipe() {
    this.store.dispatch(
      RecipeActions.deleteRecipe({ index: this.recipeIndex() })
    );
    this.router.navigate(['/recipes']);
  }
}
