import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
    ShoppingEditComponent
  ],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
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
  
  loading = toSignal(
    this.store.select(ShoppingListSelectors.selectLoading),
    { initialValue: false }
  );
  
  error = toSignal(
    this.store.select(ShoppingListSelectors.selectError),
    { initialValue: null }
  );
  
  editingIndex = toSignal(
    this.store.select(ShoppingListSelectors.selectEditingIndex),
    { initialValue: -1 }
  );
  
  editedItemId = toSignal(
    this.store.select(ShoppingListSelectors.selectEditedItemId),
    { initialValue: null }
  );
  
  // LOCAL UI STATE - Using Signals
  
  // Selected items for bulk operations (using IDs now)
  selectedIds = signal<Set<string>>(new Set());
  
  // Search/filter state
  searchTerm = signal('');
  
  // Checked items (purchased) - using IDs
  checkedIds = signal<Set<string>>(new Set());
  
  // Show only unchecked items
  hideChecked = signal(false);
  
  // Computed filtered ingredients
  filteredIngredients = computed(() => {
    let ingredients = this.allIngredients();
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      ingredients = ingredients.filter(ing => 
        ing.name.toLowerCase().includes(search)
      );
    }
    
    // Filter checked items if hideChecked is true
    if (this.hideChecked()) {
      ingredients = ingredients.filter(item => 
        !this.checkedIds().has(item.id)
      );
    }
    
    return ingredients;
  });
  
  // Computed statistics
  totalItems = computed(() => this.allIngredients().length);
  filteredCount = computed(() => this.filteredIngredients().length);
  checkedCount = computed(() => this.checkedIds().size);
  selectedCount = computed(() => this.selectedIds().size);
  
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
      searchTerm: this.searchTerm(),
      loading: this.loading()
    });
  });
  
  // Effect to save checked items to localStorage
  private checkedItemsEffect = effect(() => {
    const checked = Array.from(this.checkedIds());
    localStorage.setItem('shopping-list-checked', JSON.stringify(checked));
  });
  
  constructor() {
    // Restore checked items from localStorage
    const savedChecked = localStorage.getItem('shopping-list-checked');
    if (savedChecked) {
      try {
        const ids = JSON.parse(savedChecked);
        this.checkedIds.set(new Set(ids));
      } catch (e) {
        console.error('Failed to restore checked items', e);
      }
    }
  }
  
  ngOnInit() {
    // Load shopping list from API on component init
    this.store.dispatch(ShoppingListActions.loadShoppingList());
  }
  
  // Search methods
  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }
  
  clearSearch() {
    this.searchTerm.set('');
  }
  
  // Selection methods
  toggleSelection(id: string) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }
  
  selectAll() {
    const allIds = new Set(
      this.allIngredients().map(item => item.id)
    );
    this.selectedIds.set(allIds);
  }
  
  clearSelection() {
    this.selectedIds.set(new Set());
  }
  
  // Checked/purchased methods
  toggleChecked(id: string) {
    const current = new Set(this.checkedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.checkedIds.set(current);
  }
  
  toggleHideChecked() {
    this.hideChecked.set(!this.hideChecked());
  }
  
  clearChecked() {
    // Remove all checked items from the list
    const checkedCount = this.checkedIds().size;
    const checked = Array.from(this.checkedIds());
    checked.forEach(id => {
      this.store.dispatch(ShoppingListActions.deleteIngredient({ id }));
    });
    this.checkedIds.set(new Set());
    this.notificationService.showSuccess(`${checkedCount} completed ${checkedCount === 1 ? 'item' : 'items'} removed!`);
  }
  
  // Edit methods
  onEditItem(id: string) {
    this.store.dispatch(ShoppingListActions.startEdit({ id }));
  }

  onDeleteItem(event: Event, id: string) {
    event.stopPropagation();
    const ingredient = this.allIngredients().find(item => item.id === id);
    const ingredientName = ingredient?.name || 'Item';
    
    this.store.dispatch(ShoppingListActions.deleteIngredient({ id }));
    
    // Remove from checked items if it was checked
    const checked = new Set(this.checkedIds());
    checked.delete(id);
    this.checkedIds.set(checked);
    
    // Remove from selection if it was selected
    const selected = new Set(this.selectedIds());
    selected.delete(id);
    this.selectedIds.set(selected);
    
    this.notificationService.showInfo(`${ingredientName} removed from shopping list`);
  }
  
  // Bulk operations
  deleteSelected() {
    if (this.hasSelection() && confirm(`Delete ${this.selectedCount()} items?`)) {
      const count = this.selectedCount();
      const ids = Array.from(this.selectedIds());
      ids.forEach(id => {
        this.store.dispatch(ShoppingListActions.deleteIngredient({ id }));
      });
      this.clearSelection();
      this.notificationService.showSuccess(`${count} ${count === 1 ? 'item' : 'items'} deleted!`);
    }
  }
  
  clearAll() {
    if (this.hasItems() && confirm('Clear entire shopping list?')) {
      const totalCount = this.totalItems();
      this.store.dispatch(ShoppingListActions.clearIngredients());
      this.selectedIds.set(new Set());
      this.checkedIds.set(new Set());
      this.notificationService.showSuccess(`Shopping list cleared! (${totalCount} ${totalCount === 1 ? 'item' : 'items'} removed)`);
    }
  }
}
