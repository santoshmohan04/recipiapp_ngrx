import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import * as ShoppingListActions from '../../../store/shopping-list/shopping-list.actions';
import { Ingredient } from '../../../shared/models/ingredient.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-shopping-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.scss']
})
export class ShoppingEditComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  
  editMode = signal(false);
  editedItemId = signal<string | null>(null);
  
  ingredientForm = this.fb.group({
    name: ['', Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]]
  });

  constructor() {
    effect(() => {
      this.store.select('shoppingList').subscribe(state => {
        if (state.editedItemId) {
          const editedItem = state.items.find(item => item.id === state.editedItemId);
          if (editedItem) {
            this.editMode.set(true);
            this.editedItemId.set(state.editedItemId);
            this.ingredientForm.patchValue({
              name: editedItem.itemName,
              amount: editedItem.quantity?.toString() || ''
            });
          }
        } else {
          this.editMode.set(false);
          this.editedItemId.set(null);
        }
      });
    });
  }

  onSubmit() {
    if (!this.ingredientForm.valid) return;

    const { name, amount } = this.ingredientForm.value;
    const ingredient = new Ingredient(name!, +amount!);

    if (this.editMode() && this.editedItemId()) {
      this.store.dispatch(
        ShoppingListActions.updateIngredient({ 
          id: this.editedItemId()!, 
          ingredient 
        })
      );
      this.notificationService.showSuccess(`${name} updated successfully!`);
    } else {
      this.store.dispatch(ShoppingListActions.addIngredient({ ingredient }));
      this.notificationService.showSuccess(`${name} added to shopping list!`);
    }

    this.onClear();
  }

  onClear() {
    this.ingredientForm.reset();
    this.store.dispatch(ShoppingListActions.stopEdit());
  }
}
