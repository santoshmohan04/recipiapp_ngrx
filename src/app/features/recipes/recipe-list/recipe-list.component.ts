import { Component, computed, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Recipe } from '../models/recipe.model';
import { selectAllRecipes, selectRecipesLoading } from '../../../store/recipes/recipe.selectors';
import { ResponsiveLayoutService } from '../../../core/services/responsive-layout.service';

type SortOption = 'name' | 'rating' | 'cookingTime';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
  private store = inject(Store);
  private responsiveLayout = inject(ResponsiveLayoutService);
  
  // Convert observables to signals for reactive composition
  private allRecipes = toSignal(this.store.select(selectAllRecipes), { initialValue: [] });
  loading = toSignal(this.store.select(selectRecipesLoading), { initialValue: false });
  
  // Responsive layout signals
  deviceType = this.responsiveLayout.deviceType;
  layoutConfig = this.responsiveLayout.layoutConfig;
  isMobile = this.responsiveLayout.isMobile;
  isTablet = this.responsiveLayout.isTablet;
  isDesktop = this.responsiveLayout.isDesktop;
  
  // LOCAL UI STATE - Using Signals
  
  // Filter signals
  searchTerm = signal('');
  selectedDifficulty = signal<string>('all');
  minRating = signal(0);
  
  // Sort signal
  sortBy = signal<SortOption>('name');
  
  // View mode signal
  viewMode = signal<ViewMode>('grid');
  
  // Computed filtered and sorted recipes
  filteredRecipes = computed(() => {
    let recipes = this.allRecipes();
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      recipes = recipes.filter(r => 
        r.name.toLowerCase().includes(search) || 
        r.description.toLowerCase().includes(search)
      );
    }
    
    // Apply difficulty filter
    const difficulty = this.selectedDifficulty();
    if (difficulty !== 'all') {
      recipes = recipes.filter(r => r.difficulty === difficulty);
    }
    
    // Apply rating filter
    const rating = this.minRating();
    if (rating > 0) {
      recipes = recipes.filter(r => r.rating >= rating);
    }
    
    // Apply sorting
    const sort = this.sortBy();
    const sorted = [...recipes];
    
    switch (sort) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'cookingTime':
        sorted.sort((a, b) => a.cookingTime - b.cookingTime);
        break;
    }
    
    return sorted;
  });
  
  // Computed statistics
  recipeCount = computed(() => this.filteredRecipes().length);
  totalRecipes = computed(() => this.allRecipes().length);
  averageRating = computed(() => {
    const recipes = this.filteredRecipes();
    if (recipes.length === 0) return 0;
    const sum = recipes.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / recipes.length) * 10) / 10;
  });
  
  // Computed flags
  hasFilters = computed(() => 
    this.searchTerm() !== '' || 
    this.selectedDifficulty() !== 'all' || 
    this.minRating() > 0
  );
  
  // Effect to log filter changes (for debugging/analytics)
  private filterEffect = effect(() => {
    console.log('Filters changed:', {
      search: this.searchTerm(),
      difficulty: this.selectedDifficulty(),
      minRating: this.minRating(),
      sortBy: this.sortBy(),
      resultCount: this.recipeCount()
    });
  });
  
  // Effect to save view preference to localStorage
  private viewModeEffect = effect(() => {
    const mode = this.viewMode();
    localStorage.setItem('recipe-view-mode', mode);
    console.log('View mode changed to:', mode);
  });
  
  // Difficulty options
  difficultyOptions = ['all', 'Easy', 'Medium', 'Hard'];
  
  // Sort options
  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'rating', label: 'Rating' },
    { value: 'cookingTime', label: 'Cooking Time' }
  ];
  
  constructor() {
    // Restore view mode from localStorage
    const savedViewMode = localStorage.getItem('recipe-view-mode') as ViewMode;
    if (savedViewMode) {
      this.viewMode.set(savedViewMode);
    }
    
    // Load recipes on initialization
    this.store.dispatch({ type: '[Recipes API] Load Recipes' });
  }
  
  // Methods to update signals
  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }
  
  onDifficultyChange(difficulty: string) {
    this.selectedDifficulty.set(difficulty);
  }
  
  onRatingChange(rating: number) {
    this.minRating.set(rating);
  }
  
  onSortChange(sort: SortOption) {
    this.sortBy.set(sort);
  }
  
  onViewModeChange(mode: ViewMode) {
    this.viewMode.set(mode);
  }
  
  clearFilters() {
    this.searchTerm.set('');
    this.selectedDifficulty.set('all');
    this.minRating.set(0);
  }
  
  getRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
