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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import * as RecipeActions from '../../../store/recipes/recipe.actions';
import * as RecipeSelectors from '../../../store/recipes/recipe.selectors';
import * as ShoppingListActions from '../../../store/shopping-list/shopping-list.actions';
import * as FavoritesActions from '../../../store/favorites/favorites.actions';
import * as FavoritesSelectors from '../../../store/favorites/favorites.selectors';
import * as CommentsActions from '../../../store/comments/comments.actions';
import * as CommentsSelectors from '../../../store/comments/comments.selectors';
import * as RatingsActions from '../../../store/ratings/ratings.actions';
import * as RatingsSelectors from '../../../store/ratings/ratings.selectors';
import { Recipe } from '../models/recipe.model';
import { AsyncPipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { ResponsiveLayoutService } from '../../../core/services/responsive-layout.service';

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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
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
  private responsiveLayout = inject(ResponsiveLayoutService);
  private destroy$ = new Subject<void>();
  
  // Responsive layout signals
  deviceType = this.responsiveLayout.deviceType;
  layoutConfig = this.responsiveLayout.layoutConfig;
  isMobile = this.responsiveLayout.isMobile;
  isTablet = this.responsiveLayout.isTablet;
  isDesktop = this.responsiveLayout.isDesktop;
  
  recipe$!: Observable<Recipe | undefined>;
  recipeId: string = '';
  
  // Favorite state
  isFavorite = signal(false);
  
  // Comments and Ratings state
  comments = toSignal(this.store.select(CommentsSelectors.selectAllComments), { initialValue: [] });
  commentsLoading = toSignal(this.store.select(CommentsSelectors.selectCommentsLoading), { initialValue: false });
  commentsError = toSignal(this.store.select(CommentsSelectors.selectCommentsError), { initialValue: null });
  
  ratings = toSignal(this.store.select(RatingsSelectors.selectAllRatings), { initialValue: [] });
  userRating = toSignal(this.store.select(RatingsSelectors.selectUserRating), { initialValue: null });
  ratingStats = toSignal(this.store.select(RatingsSelectors.selectRatingStats), { initialValue: null });
  ratingsLoading = toSignal(this.store.select(RatingsSelectors.selectRatingsLoading), { initialValue: false });
  
  // New comment form
  newCommentText = signal('');
  isSubmittingComment = signal(false);
  
  // Editing comment
  editingCommentId = signal<string | null>(null);
  editCommentText = signal('');
  
  // LOCAL UI STATE - Using Signals
  
  // Active tab index
  activeTabIndex = signal(0);
  
  // Loading states
  isDeleting = signal(false);
  isAddingToCart = signal(false);
  isTogglingFavorite = signal(false);
  
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
      
      // Check if recipe is favorited
      this.store.select(FavoritesSelectors.selectIsFavorite(this.recipeId))
        .pipe(takeUntil(this.destroy$))
        .subscribe(isFav => this.isFavorite.set(isFav));
      (this as any).recipeSignal = recipeSignal;
      
      // Load recipe if not in store
      this.store.dispatch(RecipeActions.loadRecipe({ id: this.recipeId }));
      
      // Load comments and ratings
      this.store.dispatch(CommentsActions.loadComments({ recipeId: this.recipeId }));
      this.store.dispatch(RatingsActions.loadRatingStats({ recipeId: this.recipeId }));
      this.store.dispatch(RatingsActions.loadUserRating({ recipeId: this.recipeId }));
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
  
  async onToggleFavorite() {
    if (!this.isTogglingFavorite()) {
      this.isTogglingFavorite.set(true);
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.store.dispatch(
        FavoritesActions.toggleFavorite({ 
          recipeId: this.recipeId, 
          isFavorite: this.isFavorite() 
        })
      );
      
      this.isTogglingFavorite.set(false);
    }
  }
  
  // ============================================
  // Comments Methods
  // ============================================
  
  onSubmitComment() {
    const content = this.newCommentText().trim();
    if (content && !this.isSubmittingComment()) {
      this.isSubmittingComment.set(true);
      
      this.store.dispatch(
        CommentsActions.createComment({ 
          recipeId: this.recipeId, 
          content 
        })
      );
      
      // Clear the form and reset state after a delay
      setTimeout(() => {
        this.newCommentText.set('');
        this.isSubmittingComment.set(false);
        this.notificationService.showSuccess('Comment added!');
      }, 500);
    }
  }
  
  onEditComment(commentId: string, currentContent: string) {
    this.editingCommentId.set(commentId);
    this.editCommentText.set(currentContent);
  }
  
  onSaveEditComment(commentId: string) {
    const content = this.editCommentText().trim();
    if (content) {
      this.store.dispatch(
        CommentsActions.updateComment({ 
          id: commentId, 
          content 
        })
      );
      
      this.editingCommentId.set(null);
      this.editCommentText.set('');
      this.notificationService.showSuccess('Comment updated!');
    }
  }
  
  onCancelEditComment() {
    this.editingCommentId.set(null);
    this.editCommentText.set('');
  }
  
  onDeleteComment(commentId: string) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.store.dispatch(CommentsActions.deleteComment({ id: commentId }));
      this.notificationService.showSuccess('Comment deleted!');
    }
  }
  
  // ============================================
  // Ratings Methods
  // ============================================
  
  onRateRecipe(rating: number) {
    this.store.dispatch(
      RatingsActions.createOrUpdateRating({ 
        recipeId: this.recipeId, 
        rating 
      })
    );
    
    this.notificationService.showSuccess(`Recipe rated ${rating} stars!`);
    
    // Reload stats to get updated average
    setTimeout(() => {
      this.store.dispatch(RatingsActions.loadRatingStats({ recipeId: this.recipeId }));
    }, 500);
  }
  
  getRatingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
  
  isStarFilled(star: number): boolean {
    const userRating = this.userRating();
    return userRating ? star <= userRating.rating : false;
  }
}
