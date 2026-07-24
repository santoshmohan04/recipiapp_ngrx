import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { exhaustMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

const AUTH_BYPASS_URLS = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (AUTH_BYPASS_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const store = inject(Store);
  const authService = inject(AuthService);

  // Skip auth header for auth endpoints (login, register)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  return store.select('auth').pipe(
    take(1),
    exhaustMap(authState => {
      const token = authState.user?.token ?? authService.currentUser()?.token;

      if (!token) {
        return next(req);
      }

      const modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(modifiedReq);
    })
  );
};
