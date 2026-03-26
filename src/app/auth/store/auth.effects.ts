import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import * as AuthActions from './auth.actions';
import { AuthService, JwtAuthResponse } from '../auth.service';
import { User } from '../user.model';
import { NotificationService } from '../../core/services/notification.service';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Handle successful authentication and store JWT token
   */
  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    
    // Store JWT token in localStorage
    this.authService.setToken(token);
    
    // Store user data in localStorage for auto-login
    localStorage.setItem('userData', JSON.stringify({
      email,
      id: userId,
      _token: token,
      _tokenExpirationDate: expirationDate.toISOString()
    }));

    return AuthActions.authenticateSuccess({
      email,
      userId,
      token,
      expirationDate,
      redirect: true,
    });
  }

  /**
   * Handle authentication errors
   */
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (errorRes.error && errorRes.error.message) {
      // Backend API error message
      errorMessage = errorRes.error.message;
    } else if (errorRes.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (errorRes.status === 400) {
      errorMessage = 'Please check your input';
    } else if (errorRes.status === 409) {
      errorMessage = 'Email already exists';
    } else if (errorRes.status === 0) {
      errorMessage = 'Unable to connect to server';
    }
    
    return of(AuthActions.authenticateFail({ errorMessage }));
  }

  /**
   * Handle registration (signup)
   */
  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap((action) =>
        this.authService.register({
          email: action.email,
          password: action.password,
        }).pipe(
          tap((resData) => {
            // Set auto logout timer
            this.authService.setLogoutTimer(resData.expiresIn * 1000);
          }),
          map((resData) =>
            this.handleAuthentication(
              resData.user.email,
              resData.user.id,
              resData.token,
              resData.expiresIn
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    )
  );

  /**
   * Handle login
   */
  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap((action) =>
        this.authService.login({
          email: action.email,
          password: action.password,
        }).pipe(
          tap((resData) => {
            // Set auto logout timer
            this.authService.setLogoutTimer(resData.expiresIn * 1000);
          }),
          map((resData) =>
            this.handleAuthentication(
              resData.user.email,
              resData.user.id,
              resData.token,
              resData.expiresIn
            )
          ),
          catchError((error) => this.handleError(error))
        )
      )
    )
  );

  authRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.authenticateSuccess),
        tap((action) => {
          if (action.redirect) {
            this.notificationService.showSuccess('Login successful! Welcome back.');
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData') || 'null');

        if (!userData) {
          return { type: '[Auth] Dummy' };
        }

        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
          const expirationDuration =
            new Date(userData._tokenExpirationDate).getTime() -
            new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);

          return AuthActions.authenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false,
          });
        }

        return { type: '[Auth] Dummy' };
      })
    )
  );

  authLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.clearLogoutTimer();
          this.authService.removeToken();
          this.notificationService.showInfo('You have been logged out.');
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );

  authFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.authenticateFail),
        tap((action) => {
          this.notificationService.showError(action.errorMessage);
        })
      ),
    { dispatch: false }
  );
}
