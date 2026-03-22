import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import * as RecipeActions from '../../../store/recipes/recipe.actions';
import { Recipe } from '../models/recipe.model';
import { Ingredient } from '../../../shared/models/ingredient.model';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  
  editMode = signal(false);
  recipeIndex = signal<number>(-1);
  
  recipeForm = this.fb.group({
    name: ['', Validators.required],
    imagePath: ['', Validators.required],
    description: ['', Validators.required],
    ingredients: this.fb.array([])
  });

  constructor() {
    effect(() => {
      this.route.params.subscribe(params => {
        const id = params['id'];
        this.editMode.set(id != null && id !== 'new');
        
        if (this.editMode()) {
          this.recipeIndex.set(+id);
          this.store.select('recipes').subscribe(state => {
            const recipe = state.recipes[+id];
            if (recipe) {
              this.initForm(recipe);
            }
          });
        } else {
          this.initForm();
        }
      });
    });
  }

  private initForm(recipe?: Recipe) {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients: Ingredient[] = [];

    if (recipe) {
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeDescription = recipe.description;
      recipeIngredients = recipe.ingredients;
    }

    // Clear existing ingredients
    while (this.ingredients.length) {
      this.ingredients.removeAt(0);
    }
    
    // Add ingredient FormGroups
    if (recipeIngredients.length > 0) {
      recipeIngredients.forEach(ingredient => {
        this.ingredients.push(this.fb.group({
          name: [ingredient.name, Validators.required],
          amount: [ingredient.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]]
        }));
      });
    }

    this.recipeForm.patchValue({
      name: recipeName,
      imagePath: recipeImagePath,
      description: recipeDescription
    });
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  onAddIngredient() {
    this.ingredients.push(this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]]
    }));
  }

  onDeleteIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  onSubmit() {
    if (!this.recipeForm.valid) return;

    const formValue = this.recipeForm.value;
    const ingredients: Ingredient[] = [];
    
    if (formValue.ingredients) {
      formValue.ingredients.forEach((ing: any) => {
        if (ing.name && ing.amount) {
          ingredients.push(new Ingredient(ing.name, ing.amount));
        }
      });
    }

    const recipe = new Recipe(
      formValue.name!,
      formValue.description!,
      formValue.imagePath!,
      ingredients
    );

    if (this.editMode()) {
      this.store.dispatch(
        RecipeActions.updateRecipe({ 
          index: this.recipeIndex(), 
          recipe 
        })
      );
    } else {
      this.store.dispatch(RecipeActions.addRecipe({ recipe }));
    }

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
