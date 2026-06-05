import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';

import { routes } from './app.routes';
import { appReducer } from './store/app.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { RecipeEffects } from './store/recipes/recipe.effects';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideStore(appReducer),
    provideEffects([AuthEffects, RecipeEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      connectInZone: true
    }),
    provideRouterStore()
  ]
};
