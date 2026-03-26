import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  {
    path: 'recipes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/recipes/recipes.routes').then(m => m.RECIPE_ROUTES)
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'shopping-list',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/shopping-list/shopping-list.component').then(m => m.ShoppingListComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'auth',
    loadComponent: () => 
      import('./features/auth/auth.component').then(m => m.AuthComponent)
  }
];
