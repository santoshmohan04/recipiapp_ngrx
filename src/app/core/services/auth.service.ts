import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';
import { environment } from '../../../environments/environment';

export interface User {
  email: string;
  id: string;
  token: string;
  tokenExpirationDate: Date;
}

/**
 * JWT Authentication Response from Backend API
 */
export interface JwtAuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * User profile response from /api/auth/me
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private store = inject(Store);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  // Signals for reactive state
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);
  
  private tokenExpirationTimer: any;
  private apiUrl = environment.apiUrl;

  constructor() {
    // Subscribe to auth state from store
    this.store.select('auth').subscribe(state => {
      this.isAuthenticated.set(!!state.user);
      this.currentUser.set(state.user);
    });
  }

  // ============================================
  // HTTP API Methods
  // ============================================

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
    firstName: string;
    lastName: string;
    email: string;
    password: string;
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
  }

  // ============================================
  // Timer Management
  // ============================================

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
