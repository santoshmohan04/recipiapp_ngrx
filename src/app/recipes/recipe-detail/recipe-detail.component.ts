import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';

import { Recipe } from '../../features/recipes/models/recipe.model';
import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../../store/recipes/recipe.actions';
import * as RecipeSelectors from '../../store/recipes/recipe.selectors';
import * as ShoppingListActions from '../../store/shopping-list/shopping-list.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
  standalone: false
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => params['id']),
        switchMap((id) => {
          this.id = id;
          return this.store.select(RecipeSelectors.selectRecipeById(id));
        })
      )
      .subscribe((recipe) => {
        this.recipe = recipe;
      });
  }

  onAddToShoppingList() {
    // this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
    this.store.dispatch(
      ShoppingListActions.addIngredients({ingredients:this.recipe.ingredients})
    );
  }

  onEditRecipe() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    // this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    // this.recipeService.deleteRecipe(this.id);
    this.store.dispatch(RecipesActions.deleteRecipe({id: this.id}));
    this.router.navigate(['/recipes']);
  }
}
