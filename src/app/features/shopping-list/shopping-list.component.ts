import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import * as ShoppingListActions from '../../store/shopping-list/shopping-list.actions';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    ShoppingEditComponent
  ],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent {
  private store = inject(Store);
  
  shoppingState$ = this.store.select('shoppingList');

  onEditItem(index: number) {
    this.store.dispatch(ShoppingListActions.startEdit({ index }));
  }

  onDeleteItem(event: Event, index: number) {
    event.stopPropagation();
    this.store.dispatch(ShoppingListActions.deleteIngredient({ index }));
  }
}
