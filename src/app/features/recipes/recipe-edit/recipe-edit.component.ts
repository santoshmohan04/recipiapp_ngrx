import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    DragDropModule
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
  recipeId = signal<string | null>(null);
  recipeIndex = signal<number>(-1);
  
  difficultyLevels = ['Easy', 'Medium', 'Hard'];
  
  recipeForm = this.fb.group({
    name: ['', Validators.required],
    imagePath: ['', Validators.required],
    description: ['', Validators.required],
    rating: [0, [Validators.min(0), Validators.max(5)]],
    cookingTime: [30, [Validators.required, Validators.min(1)]],
    difficulty: ['Medium', Validators.required],
    servings: [4, [Validators.required, Validators.min(1)]],
    ingredients: this.fb.array([]),
    instructions: this.fb.array([])
  });

  constructor() {
    effect(() => {
      this.route.params.subscribe(params => {
        const id = params['id'];
        this.editMode.set(id != null && id !== 'new');
        
        if (this.editMode()) {
          this.recipeId.set(id);
          this.recipeIndex.set(+id);
          this.store.select('recipes').subscribe(state => {
            // Find recipe by id in the entities
            const recipe = Object.values(state.entities).find((r: any) => r?.id === id);
            if (recipe) {
              this.initForm(recipe as Recipe);
            }
          });
        } else {
          this.recipeId.set(null);
          this.initForm();
        }
      });
    });
  }

  private initForm(recipe?: Recipe) {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeRating = 0;
    let recipeCookingTime = 30;
    let recipeDifficulty = 'Medium';
    let recipeServings = 4;
    let recipeIngredients: Ingredient[] = [];
    let recipeInstructions: string[] = [];

    if (recipe) {
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeDescription = recipe.description;
      recipeRating = recipe.rating || 0;
      recipeCookingTime = recipe.cookingTime || 30;
      recipeDifficulty = recipe.difficulty || 'Medium';
      recipeServings = recipe.servings || 4;
      recipeIngredients = recipe.ingredients;
      recipeInstructions = recipe.instructions || [];
    }

    // Clear existing ingredients
    while (this.ingredients.length) {
      this.ingredients.removeAt(0);
    }
    
    // Clear existing instructions
    while (this.instructions.length) {
      this.instructions.removeAt(0);
    }
    
    // Add ingredient FormGroups
    if (recipeIngredients.length > 0) {
      recipeIngredients.forEach(ingredient => {
        this.ingredients.push(this.fb.group({
          name: [ingredient.name, Validators.required],
          amount: [ingredient.amount, Validators.required]
        }));
      });
    }
    
    // Add instruction FormControls
    if (recipeInstructions.length > 0) {
      recipeInstructions.forEach(instruction => {
        this.instructions.push(this.fb.control(instruction, Validators.required));
      });
    }

    this.recipeForm.patchValue({
      name: recipeName,
      imagePath: recipeImagePath,
      description: recipeDescription,
      rating: recipeRating,
      cookingTime: recipeCookingTime,
      difficulty: recipeDifficulty,
      servings: recipeServings
    });
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }
  
  get instructions() {
    return this.recipeForm.get('instructions') as FormArray;
  }

  onAddIngredient() {
    this.ingredients.push(this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required]
    }));
  }

  onDeleteIngredient(index: number) {
    this.ingredients.removeAt(index);
  }
  
  dropIngredient(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.ingredients.controls, event.previousIndex, event.currentIndex);
    moveItemInArray(this.ingredients.value, event.previousIndex, event.currentIndex);
    this.ingredients.updateValueAndValidity();
  }
  
  onAddInstruction() {
    this.instructions.push(this.fb.control('', Validators.required));
  }
  
  onDeleteInstruction(index: number) {
    this.instructions.removeAt(index);
  }

  onSubmit() {
    if (!this.recipeForm.valid) return;

    const formValue = this.recipeForm.value;
    const ingredients: Ingredient[] = [];
    const instructions: string[] = [];
    
    if (formValue.ingredients) {
      formValue.ingredients.forEach((ing: any) => {
        if (ing.name && ing.amount) {
          ingredients.push(new Ingredient(ing.name, ing.amount));
        }
      });
    }
    
    if (formValue.instructions) {
      formValue.instructions.forEach((instruction: any) => {
        if (instruction && instruction.trim()) {
          instructions.push(instruction.trim());
        }
      });
    }

    const recipe = new Recipe(
      formValue.name!,
      formValue.description!,
      formValue.imagePath!,
      ingredients,
      formValue.rating || 0,
      formValue.cookingTime || 30,
      instructions,
      formValue.difficulty || 'Medium',
      formValue.servings || 4,
      this.recipeId() || undefined
    );

    if (this.editMode() && this.recipeId()) {
      this.store.dispatch(
        RecipeActions.updateRecipe({ 
          id: this.recipeId()!, 
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
