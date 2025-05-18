import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../user.model';

export interface State {
  user: User | null;
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

  on(AuthActions.authenticateSuccess, (state, action) => {
    const user = new User(
      action.email,
      action.userId,
      action.token,
      action.expirationDate
    );
    return {
      ...state,
      user,
      authError: null,
      loading: false,
    };
  }),

  on(AuthActions.logout, state => ({
    ...state,
    user: null,
  })),

  on(AuthActions.loginStart, AuthActions.signupStart, state => ({
    ...state,
    authError: null,
    loading: true,
  })),

  on(AuthActions.authenticateFail, (state, action) => ({
    ...state,
    user: null,
    authError: action.errorMessage,
    loading: false,
  })),

  on(AuthActions.clearError, state => ({
    ...state,
    authError: null,
  }))
);