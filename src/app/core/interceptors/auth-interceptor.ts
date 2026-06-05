import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { exhaustMap, take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select('auth').pipe(
    take(1),
    exhaustMap(authState => {
      if (!authState.user) {
        return next(req);
      }
      
      const modifiedReq = req.clone({
        params: req.params.append('auth', authState.user.token)
      });
      return next(modifiedReq);
    })
  );
};
