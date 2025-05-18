import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import * as AuthActions from './auth.actions';
import { AuthService } from '../auth.service';
import { User } from '../user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private handleAuthentication(
    expiresIn: number,
    email: string,
    userId: string,
    token: string
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));

    return AuthActions.authenticateSuccess({
      email,
      userId,
      token,
      expirationDate,
      redirect: true,
    });
  }

  private handleError(errorRes: any) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return of(AuthActions.authenticateFail({ errorMessage }));
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return of(AuthActions.authenticateFail({ errorMessage }));
  }

  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap((action) =>
        this.handleAuthRequest(() =>
          this.authService.signup({
            email: action.email,
            password: action.password,
            returnSecureToken: action.returnSecureToken,
          })
        )
      )
    )
  );

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap((action) =>
        this.handleAuthRequest(() =>
          this.authService.login({
            email: action.email,
            password: action.password,
            returnSecureToken: action.returnSecureToken,
          })
        )
      )
    )
  );

  private handleAuthRequest(authCall: () => Observable<AuthResponseData>) {
    return authCall().pipe(
      tap((resData) => {
        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
      }),
      map((resData) =>
        this.handleAuthentication(
          +resData.expiresIn,
          resData.email,
          resData.localId,
          resData.idToken
        )
      ),
      catchError((error) => this.handleError(error))
    );
  }

  authRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.authenticateSuccess),
        tap((action) => {
          if (action.redirect) {
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
          localStorage.removeItem('userData');
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );
}
