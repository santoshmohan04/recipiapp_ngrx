import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { exhaustMap, take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  // Skip auth header for auth endpoints (login, register)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  return store.select('auth').pipe(
    take(1),
    exhaustMap(authState => {
      if (!authState.user) {
        return next(req);
      }
      
      // Add Authorization header with Bearer token
      const modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authState.user.token}`
        }
      });
      return next(modifiedReq);
    })
  );
};
