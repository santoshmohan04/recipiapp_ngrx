import { Component, inject, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterModule,
    AsyncPipe
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent {
  private store = inject(Store);
  
  recipeState$ = this.store.select('recipes');
}
