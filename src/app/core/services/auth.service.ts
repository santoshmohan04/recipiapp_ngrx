import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

export interface User {
  email: string;
  id: string;
  token: string;
  tokenExpirationDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private store = inject(Store);
  private router = inject(Router);
  
  // Signals for reactive state
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  
  private tokenExpirationTimer: any;

  constructor() {
    // Subscribe to auth state from store
    this.store.select('auth').subscribe(state => {
      this.isAuthenticated.set(!!state.user);
      this.currentUser.set(state.user);
    });
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
