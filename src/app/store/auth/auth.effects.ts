import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private authService = inject(AuthService);

  private handleAuthentication(email: string, userId: string, token: string, expiresInMs: number) {
    const expirationDate = new Date(new Date().getTime() + expiresInMs);
    const user: AuthActions.AuthUser = {
      email,
      id: userId,
      token,
      tokenExpirationDate: expirationDate,
    };

    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify({
      email,
      id: userId,
      _token: token,
      _tokenExpirationDate: expirationDate.toISOString()
    }));

    // Set auto logout timer
    this.authService.setLogoutTimer(expiresInMs);

    return AuthActions.loginSuccess({ user, redirect: true });
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (errorRes.error && errorRes.error.message) {
      errorMessage = errorRes.error.message;
    } else if (errorRes.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (errorRes.status === 400) {
      errorMessage = 'Please check your input';
    } else if (errorRes.status === 409) {
      errorMessage = 'Email already exists';
    } else if (errorRes.status === 0) {
      errorMessage = 'Unable to connect to server. Please check if the backend is running.';
    }
    
    return of(AuthActions.loginFail({ error: errorMessage }));
  }

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap((action) =>
        this.authService.login({
          email: action.email,
          password: action.password,
        }).pipe(
          map((resData) => {
            // Default expiration: 7 days
            const expiresInMs = 7 * 24 * 60 * 60 * 1000;
            return this.handleAuthentication(
              resData.user.email,
              resData.user.id,
              resData.access_token,
              expiresInMs
            );
          }),
          catchError((error) => this.handleError(error))
        )
      )
    )
  );

  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap((action) =>
        this.authService.register({
          firstName: action.firstName,
          lastName: action.lastName,
          email: action.email,
          password: action.password,
        }).pipe(
          map((resData) => {
            // Default expiration: 7 days (JWT typically has exp claim we could decode)
            const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            const expirationDate = new Date(new Date().getTime() + expiresInMs);
            const user: AuthActions.AuthUser = {
              email: resData.user.email,
              id: resData.user.id,
              token: resData.access_token,
              tokenExpirationDate: expirationDate,
            };

            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify({
              email: resData.user.email,
              id: resData.user.id,
              _token: resData.access_token,
              _tokenExpirationDate: expirationDate.toISOString()
            }));

            // Set auto logout timer
            this.authService.setLogoutTimer(expiresInMs);

            return AuthActions.signupSuccess({ user, redirect: true });
          }),
          catchError((error) => {
            let errorMessage = 'Signup failed!';
            
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.status === 409) {
              errorMessage = 'Email already exists';
            } else if (error.status === 400) {
              errorMessage = 'Invalid email or password format';
            } else if (error.status === 0) {
              errorMessage = 'Unable to connect to server. Please check if the backend is running.';
            }
            
            return of(AuthActions.signupFail({ error: errorMessage }));
          })
        )
      )
    )
  );

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
