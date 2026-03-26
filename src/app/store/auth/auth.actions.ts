import { createAction, props } from '@ngrx/store';

export interface AuthUser {
  email: string;
  id: string;
  token: string;
  tokenExpirationDate: Date;
}

// Login actions
export const loginStart = createAction(
  '[Auth] Login Start',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; redirect: boolean }>()
);

export const loginFail = createAction(
  '[Auth] Login Fail',
  props<{ error: string }>()
);

// Signup actions
export const signupStart = createAction(
  '[Auth] Signup Start',
  props<{ email: string; password: string }>()
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ user: AuthUser; redirect: boolean }>()
);

export const signupFail = createAction(
  '[Auth] Signup Fail',
  props<{ error: string }>()
);

// Auto login
export const autoLogin = createAction('[Auth] Auto Login');

// Logout
export const logout = createAction('[Auth] Logout');

// Clear error
export const clearError = createAction('[Auth] Clear Error');
