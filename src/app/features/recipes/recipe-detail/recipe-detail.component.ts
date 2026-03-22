import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import * as RecipeActions from '../../../store/recipes/recipe.actions';
import * as RecipeSelectors from '../../../store/recipes/recipe.selectors';
import * as ShoppingListActions from '../../../store/shopping-list/shopping-list.actions';
import { Recipe } from '../models/recipe.model';
import { AsyncPipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

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
    MatDividerModule,
    MatProgressSpinnerModule,
    AsyncPipe
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  
  recipe$!: Observable<Recipe | undefined>;
  recipeId: string | number = '';
  
  // LOCAL UI STATE - Using Signals
  
  // Active tab index
  activeTabIndex = signal(0);
  
  // Loading states
  isDeleting = signal(false);
  isAddingToCart = signal(false);
  
  // Show confirmation dialog
  showDeleteConfirm = signal(false);
  
  // Convert recipe observable to signal for easier template usage
  recipeSignal = computed(() => {
    // This will be set in ngOnInit
    return undefined as Recipe | undefined;
  });
  
  // Computed properties based on recipe data
  totalIngredients = computed(() => {
    const recipe = this.recipeSignal();
    return recipe?.ingredients.length || 0;
  });
  
  totalSteps = computed(() => {
    const recipe = this.recipeSignal();
    return recipe?.instructions?.length || 0;
  });
  
  difficulty = computed(() => {
    const recipe = this.recipeSignal();
    return recipe?.difficulty || 'Medium';
  });
  
  difficultyColor = computed(() => {
    const diff = this.difficulty();
    switch (diff) {
      case 'Easy': return 'primary';
      case 'Medium': return 'accent';
      case 'Hard': return 'warn';
      default: return 'accent';
    }
  });
  
  // Computed flag for showing recipe actions
  canEdit = computed(() => {
    return !this.isDeleting() && !this.isAddingToCart();
  });
  
  // Effect to track tab changes (for analytics/persistence)
  private tabChangeEffect = effect(() => {
    const tabIndex = this.activeTabIndex();
    const tabs = ['Ingredients', 'Instructions', 'Comments'];
    console.log(`Viewing tab: ${tabs[tabIndex]} (index: ${tabIndex})`);
    
    // Could save to localStorage for persistence
    localStorage.setItem('recipe-detail-last-tab', tabIndex.toString());
  });
  
  // Effect to track recipe loads
  private recipeLoadEffect = effect(() => {
    const recipe = this.recipeSignal();
    if (recipe) {
      console.log(`Recipe loaded: ${recipe.name}`);
    }
  });

  ngOnInit() {
    // Restore last viewed tab
    const lastTab = localStorage.getItem('recipe-detail-last-tab');
    if (lastTab) {
      this.activeTabIndex.set(parseInt(lastTab, 10));
    }
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.recipeId = params['id'];
      // Select recipe by ID using selector
      this.recipe$ = this.store.select(RecipeSelectors.selectRecipeById(this.recipeId));
      
      // Convert observable to signal
      const recipeSignal = toSignal(this.recipe$);
      // Update the computed to use the actual signal
      (this as any).recipeSignal = recipeSignal;
      
      // Load recipe if not in store
      this.store.dispatch(RecipeActions.loadRecipe({ id: this.recipeId }));
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
  
  onTabChange(index: number) {
    this.activeTabIndex.set(index);
  }

  async onAddToShoppingList(recipe: Recipe) {
    if (recipe && !this.isAddingToCart()) {
      this.isAddingToCart.set(true);
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.store.dispatch(
        ShoppingListActions.addIngredients({ 
          ingredients: recipe.ingredients 
        })
      );
      
      const count = recipe.ingredients.length;
      this.notificationService.showSuccess(
        `${count} ingredient${count !== 1 ? 's' : ''} added to shopping list!`
      );
      
      this.isAddingToCart.set(false);
    }
  }

  onEditRecipe() {
    if (this.canEdit()) {
      this.router.navigate(['edit'], { relativeTo: this.route });
    }
  }

  onDeleteRecipe() {
    this.showDeleteConfirm.set(true);
  }
  
  confirmDelete() {
    if (!this.isDeleting()) {
      this.isDeleting.set(true);
      this.showDeleteConfirm.set(false);
      
      this.store.dispatch(
        RecipeActions.deleteRecipe({ id: this.recipeId })
      );
      
      // Navigate after a short delay
      setTimeout(() => {
        this.isDeleting.set(false);
        this.router.navigate(['/recipes']);
      }, 500);
    }
  }
  
  cancelDelete() {
    this.showDeleteConfirm.set(false);
  }
}
