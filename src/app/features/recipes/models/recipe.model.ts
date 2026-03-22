import { Ingredient } from '../../../shared/models/ingredient.model';

export class Recipe {
  constructor(
    public name: string,
    public description: string,
    public imagePath: string,
    public ingredients: Ingredient[],
    public rating: number = 0,
    public cookingTime: number = 30,
    public instructions: string[] = []
  ) {}
}
