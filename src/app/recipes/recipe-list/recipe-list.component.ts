import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { Recipe } from '../recipe.model';
import * as fromApp from '../../store/app.reducer';
import * as RecipeActions from '../../store/recipes/recipe.actions';
import * as RecipeSelectors from '../../store/recipes/recipe.selectors';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
  standalone: false
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[];
  isLoading = false;
  private subscription: Subscription;
  private loadingSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    // Subscribe to loading state
    this.loadingSubscription = this.store
      .select(RecipeSelectors.selectRecipesLoading)
      .subscribe((loading) => {
        this.isLoading = loading;
      });

    // Subscribe to recipes
    this.subscription = this.store
      .select(RecipeSelectors.selectAllRecipes)
      .subscribe((recipes: Recipe[]) => {
        this.recipes = recipes;
        // Dispatch load action if no recipes loaded and not currently loading
        if (this.recipes.length === 0 && !this.isLoading) {
          this.store.dispatch(RecipeActions.loadRecipes());
        }
      });
  }

  onNewRecipe() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
  }
}
