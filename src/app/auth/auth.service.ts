import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
import { HttpClient } from '@angular/common/http';
import { AuthResponseData } from './store/auth.effects';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenExpirationTimer: any;
  private url = environment.authurl;

  constructor(
    private store: Store<fromApp.AppState>,
    private http: HttpClient
  ) {}

  login(payload: {
    email: string;
    password: string;
    returnSecureToken: boolean;
  }) {
    return this.http.post<AuthResponseData>(
      this.url + '/verifyPassword?key=' + environment.firebaseAPIKey,
      payload
    );
  }

  signup(payload: {
    email: string;
    password: string;
    returnSecureToken: boolean;
  }) {
    return this.http.post<AuthResponseData>(
      this.url + '/signupNewUser?key=' + environment.firebaseAPIKey,
      payload
    );
  }

  setLogoutTimer(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.store.dispatch(AuthActions.logout());
    }, expirationDuration);
  }

  clearLogoutTimer() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}
