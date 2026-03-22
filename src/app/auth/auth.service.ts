import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Response from Backend API
 */
export interface JwtAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expiresIn: number; // seconds until token expires
}

/**
 * User profile response from /api/auth/me
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenExpirationTimer: any;
  private apiUrl = environment.apiUrl;

  constructor(
    private store: Store<fromApp.AppState>,
    private http: HttpClient
  ) {}

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  login(payload: {
    email: string;
    password: string;
  }): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(
      `${this.apiUrl}/auth/login`,
      payload
    );
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register(payload: {
    email: string;
    password: string;
    name?: string;
  }): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(
      `${this.apiUrl}/auth/register`,
      payload
    );
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getCurrentUser(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(
      `${this.apiUrl}/auth/me`
    );
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Store JWT token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userData');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Set auto logout timer
   */
  setLogoutTimer(expirationDuration: number): void {
    this.clearLogoutTimer();
    this.tokenExpirationTimer = setTimeout(() => {
      this.store.dispatch(AuthActions.logout());
    }, expirationDuration);
  }

  /**
   * Clear auto logout timer
   */
  clearLogoutTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}
