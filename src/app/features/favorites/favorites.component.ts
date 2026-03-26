import { Component, inject, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import * as FavoritesActions from '../../store/favorites/favorites.actions';
import * as FavoritesSelectors from '../../store/favorites/favorites.selectors';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  private store = inject(Store);
  
  // Convert store observables to signals
  favorites = toSignal(
    this.store.select(FavoritesSelectors.selectAllFavorites),
    { initialValue: [] }
  );
  
  loading = toSignal(
    this.store.select(FavoritesSelectors.selectLoading),
    { initialValue: false }
  );
  
  error = toSignal(
    this.store.select(FavoritesSelectors.selectError),
    { initialValue: null }
  );
  
  favoriteCount = toSignal(
    this.store.select(FavoritesSelectors.selectFavoriteCount),
    { initialValue: 0 }
  );
  
  hasFavorites = toSignal(
    this.store.select(FavoritesSelectors.selectHasFavorites),
    { initialValue: false }
  );
  
  ngOnInit() {
    // Load favorites from API on component init
    this.store.dispatch(FavoritesActions.loadFavorites());
  }
  
  onRemoveFavorite(recipeId: string) {
    this.store.dispatch(FavoritesActions.removeFavorite({ recipeId }));
  }
}
