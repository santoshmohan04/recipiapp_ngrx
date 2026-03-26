import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface State {
  user: AuthActions.AuthUser | null;
  authError: string | null;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false,
};

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.loginStart, (state) => ({
    ...state,
    authError: null,
    loading: true,
  })),
  
  on(AuthActions.loginSuccess, (state, action) => ({
    ...state,
    user: action.user,
    authError: null,
    loading: false,
  })),
  
  on(AuthActions.loginFail, (state, action) => ({
    ...state,
    user: null,
    authError: action.error,
    loading: false,
  })),
  
  // Signup
  on(AuthActions.signupStart, (state) => ({
    ...state,
    authError: null,
    loading: true,
  })),
  
  on(AuthActions.signupSuccess, (state, action) => ({
    ...state,
    user: action.user,
    authError: null,
    loading: false,
  })),
  
  on(AuthActions.signupFail, (state, action) => ({
    ...state,
    user: null,
    authError: action.error,
    loading: false,
  })),
  
  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
  })),
  
  // Clear error
  on(AuthActions.clearError, (state) => ({
    ...state,
    authError: null,
  }))
);
