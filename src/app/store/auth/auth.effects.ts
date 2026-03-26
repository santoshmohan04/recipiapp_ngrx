import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private authService = inject(AuthService);

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          return { type: 'NO_ACTION' };
        }

        const parsedData = JSON.parse(userData);
        const loadedUser: AuthActions.AuthUser = {
          email: parsedData.email,
          id: parsedData.id,
          token: parsedData._token,
          tokenExpirationDate: new Date(parsedData._tokenExpirationDate),
        };

        if (loadedUser.token) {
          const expirationDuration =
            loadedUser.tokenExpirationDate.getTime() - new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);

          return AuthActions.loginSuccess({
            user: loadedUser,
            redirect: false,
          });
        }

        return { type: 'NO_ACTION' };
      })
    )
  );

  authRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.signupSuccess),
        tap((action) => {
          if (action.redirect) {
            this.router.navigate(['/recipes']);
          }
        })
      ),
    { dispatch: false }
  );

  authLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.clearLogoutTimer();
          localStorage.removeItem('userData');
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );
}
