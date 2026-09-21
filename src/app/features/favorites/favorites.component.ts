import { Component, computed, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectAllRecipes } from '../../store/recipes/recipe.selectors';

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
    RouterModule,
    AsyncPipe
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  private store = inject(Store);

  recipes$ = this.store.select(selectAllRecipes);
  private recipes = toSignal(this.recipes$, { initialValue: [] });
  favoriteCount = computed(() => this.recipes().length);

  ngOnInit(): void {}
}
