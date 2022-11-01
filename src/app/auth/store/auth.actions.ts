import { createAction, props } from '@ngrx/store';

/**
 * Login action - triggers JWT authentication
 */
export const loginStart = createAction(
  '[Auth] Login Start',
  props<{ email: string; password: string }>()
);

/**
 * Successful authentication - stores user data and token
 */
export const authenticateSuccess = createAction(
  '[Auth] Login',
  props<{
    email: string;
    userId: string;
    token: string;
    expirationDate: Date;
    redirect: boolean;
  }>()
);

/**
 * Authentication failure - displays error message
 */
export const authenticateFail = createAction(
  '[Auth] Login Fail',
  props<{ errorMessage: string }>()
);

/**
 * Signup/Register action - creates new user account
 */
export const signupStart = createAction(
  '[Auth] Signup Start',
  props<{ email: string; password: string; name?: string }>()
);

/**
 * Clear authentication error
 */
export const clearError = createAction('[Auth] Clear Error');

/**
 * Auto login on app initialization
 */
export const autoLogin = createAction('[Auth] Auto Login');

/**
 * Logout - clears user data and JWT token
 */
export const logout = createAction('[Auth] Logout');
