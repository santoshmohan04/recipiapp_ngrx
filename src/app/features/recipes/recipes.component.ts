import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RecipeListComponent } from './recipe-list/recipe-list.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [RouterModule, RecipeListComponent],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent {}
