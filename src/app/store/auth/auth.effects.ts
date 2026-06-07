import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  access_token: string;
  expiresIn?: number; // seconds — optional, defaults to 3600
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private buildUserAndPersist(response: AuthResponse): AuthActions.AuthUser {
    const expiresInMs = (response.expiresIn ?? 3600) * 1000;
    const tokenExpirationDate = new Date(new Date().getTime() + expiresInMs);
    const user: AuthActions.AuthUser = {
      email: response.user.email,
      id: response.user.id,
      token: response.access_token,
      tokenExpirationDate,
    };
    localStorage.setItem(
      'userData',
      JSON.stringify({
        email: user.email,
        id: user.id,
        _token: user.token,
        _tokenExpirationDate: user.tokenExpirationDate.toISOString(),
      })
    );
    this.authService.setLogoutTimer(expiresInMs);
    return user;
  }

  loginStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(action =>
        this.http
          .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
            email: action.email,
            password: action.password,
          })
          .pipe(
            map(response =>
              AuthActions.loginSuccess({
                user: this.buildUserAndPersist(response),
                redirect: true,
              })
            ),
            catchError(error =>
              of(
                AuthActions.loginFail({
                  error: error?.error?.message ?? 'Login failed.',
                })
              )
            )
          )
      )
    )
  );

  signupStart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap(action =>
        this.http
          .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
            email: action.email,
            password: action.password,
            firstName: action.firstName,
            lastName: action.lastName,
          })
          .pipe(
            map(response =>
              AuthActions.signupSuccess({
                user: this.buildUserAndPersist(response),
                redirect: true,
              })
            ),
            catchError(error =>
              of(
                AuthActions.signupFail({
                  error: error?.error?.message ?? 'Registration failed.',
                })
              )
            )
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
