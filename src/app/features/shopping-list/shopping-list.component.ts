import { Component, inject, signal, computed, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as ShoppingListActions from '../../store/shopping-list/shopping-list.actions';
import * as ShoppingListSelectors from '../../store/shopping-list/shopping-list.selectors';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveLayoutService } from '../../core/services/responsive-layout.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDividerModule,
    ShoppingEditComponent
  ],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent {
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private responsiveLayout = inject(ResponsiveLayoutService);
  
  // Responsive layout signals
  deviceType = this.responsiveLayout.deviceType;
  layoutConfig = this.responsiveLayout.layoutConfig;
  isMobile = this.responsiveLayout.isMobile;
  isTablet = this.responsiveLayout.isTablet;
  isDesktop = this.responsiveLayout.isDesktop;
  
  // Convert store observables to signals
  private allIngredients = toSignal(
    this.store.select(ShoppingListSelectors.selectAllIngredients),
    { initialValue: [] }
  );
  
  editingIndex = toSignal(
    this.store.select(ShoppingListSelectors.selectEditingIndex),
    { initialValue: -1 }
  );
  
  // LOCAL UI STATE - Using Signals
  
  // Selected items for bulk operations
  selectedIndices = signal<Set<number>>(new Set());
  
  // Search/filter state
  searchTerm = signal('');
  
  // Checked items (purchased)
  checkedItems = signal<Set<number>>(new Set());
  
  // Show only unchecked items
  hideChecked = signal(false);
  
  // Computed filtered ingredients
  filteredIngredients = computed(() => {
    let ingredients = this.allIngredients();
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      ingredients = ingredients.filter((ing, index) => 
        ing.name.toLowerCase().includes(search)
      );
    }
    
    // Filter checked items if hideChecked is true
    if (this.hideChecked()) {
      ingredients = ingredients.filter((_, index) => 
        !this.checkedItems().has(index)
      );
    }
    
    return ingredients;
  });
  
  // Computed statistics
  totalItems = computed(() => this.allIngredients().length);
  filteredCount = computed(() => this.filteredIngredients().length);
  checkedCount = computed(() => this.checkedItems().size);
  selectedCount = computed(() => this.selectedIndices().size);
  
  // Computed flags
  hasItems = computed(() => this.totalItems() > 0);
  hasSelection = computed(() => this.selectedCount() > 0);
  allSelected = computed(() => 
    this.hasItems() && this.selectedCount() === this.totalItems()
  );
  hasCheckedItems = computed(() => this.checkedCount() > 0);
  
  // Effect to log shopping list changes
  private shoppingListEffect = effect(() => {
    console.log('Shopping List State:', {
      total: this.totalItems(),
      filtered: this.filteredCount(),
      checked: this.checkedCount(),
      selected: this.selectedCount(),
      searchTerm: this.searchTerm()
    });
  });
  
  // Effect to save checked items to localStorage
  private checkedItemsEffect = effect(() => {
    const checked = Array.from(this.checkedItems());
    localStorage.setItem('shopping-list-checked', JSON.stringify(checked));
  });
  
  constructor() {
    // Restore checked items from localStorage
    const savedChecked = localStorage.getItem('shopping-list-checked');
    if (savedChecked) {
      try {
        const indices = JSON.parse(savedChecked);
        this.checkedItems.set(new Set(indices));
      } catch (e) {
        console.error('Failed to restore checked items', e);
      }
    }
  }
  
  // Search methods
  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }
  
  clearSearch() {
    this.searchTerm.set('');
  }
  
  // Selection methods
  toggleSelection(index: number) {
    const current = new Set(this.selectedIndices());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.selectedIndices.set(current);
  }
  
  selectAll() {
    const allIndices = new Set(
      this.allIngredients().map((_, i) => i)
    );
    this.selectedIndices.set(allIndices);
  }
  
  clearSelection() {
    this.selectedIndices.set(new Set());
  }
  
  // Checked/purchased methods
  toggleChecked(index: number) {
    const current = new Set(this.checkedItems());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    this.checkedItems.set(current);
  }
  
  toggleHideChecked() {
    this.hideChecked.set(!this.hideChecked());
  }
  
  clearChecked() {
    // Remove all checked items from the list
    const checkedCount = this.checkedItems().size;
    const checked = Array.from(this.checkedItems()).sort((a, b) => b - a);
    checked.forEach(index => {
      this.store.dispatch(ShoppingListActions.deleteIngredient({ index }));
    });
    this.checkedItems.set(new Set());
    this.notificationService.showSuccess(`${checkedCount} completed ${checkedCount === 1 ? 'item' : 'items'} removed!`);
  }
  
  // Edit methods
  onEditItem(index: number) {
    this.store.dispatch(ShoppingListActions.startEdit({ index }));
  }

  onDeleteItem(event: Event, index: number) {
    event.stopPropagation();
    const ingredient = this.allIngredients()[index];
    const ingredientName = ingredient?.name || 'Item';
    
    this.store.dispatch(ShoppingListActions.deleteIngredient({ index }));
    
    // Remove from checked items if it was checked
    const checked = new Set(this.checkedItems());
    checked.delete(index);
    this.checkedItems.set(checked);
    
    // Remove from selection if it was selected
    const selected = new Set(this.selectedIndices());
    selected.delete(index);
    this.selectedIndices.set(selected);
    
    this.notificationService.showInfo(`${ingredientName} removed from shopping list`);
  }
  
  // Bulk operations
  deleteSelected() {
    if (this.hasSelection() && confirm(`Delete ${this.selectedCount()} items?`)) {
      const count = this.selectedCount();
      const indices = Array.from(this.selectedIndices()).sort((a, b) => b - a);
      indices.forEach(index => {
        this.store.dispatch(ShoppingListActions.deleteIngredient({ index }));
      });
      this.clearSelection();
      this.notificationService.showSuccess(`${count} ${count === 1 ? 'item' : 'items'} deleted!`);
    }
  }
  
  clearAll() {
    if (this.hasItems() && confirm('Clear entire shopping list?')) {
      const totalCount = this.totalItems();
      this.store.dispatch(ShoppingListActions.clearIngredients());
      this.selectedIndices.set(new Set());
      this.checkedItems.set(new Set());
      this.notificationService.showSuccess(`Shopping list cleared! (${totalCount} ${totalCount === 1 ? 'item' : 'items'} removed)`);
    }
  }
}
