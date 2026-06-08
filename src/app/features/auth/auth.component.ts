import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { createFeatureSelector, createSelector, Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { State as AuthState } from '../../store/auth/auth.reducer';
import { ResponsiveLayoutService } from '../../core/services/responsive-layout.service';
import { NotificationService } from '../../core/services/notification.service';

// ---------------------------------------------------------------------------
// Feature selectors (defined here; move to auth.selectors.ts if the store grows)
// ---------------------------------------------------------------------------
const selectAuthFeature = createFeatureSelector<AuthState>('auth');
const selectAuthError   = createSelector(selectAuthFeature, s => s.authError);
const selectAuthLoading = createSelector(selectAuthFeature, s => s.loading);

interface AuthForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private layout = inject(ResponsiveLayoutService);
  private notifications = inject(NotificationService);

  isMobile = this.layout.isMobile;

  isLoginMode = signal(true);
  hidePassword = signal(true);

  /** Sliced signals from the NgRx store via typed selectors. */
  isLoading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  authError = toSignal(this.store.select(selectAuthError),   { initialValue: null });

  /**
   * Skip the initial store value (which may be a stale error from a previous
   * navigation) by only reacting to errors that arrive AFTER mount.
   */
  private _mounted = false;
  private readonly errorEffect = effect(() => {
    const err = this.authError();
    if (this._mounted && err) {
      this.notifications.showError(err);
    }
    this._mounted = true;
  });

  constructor() {
    // Clear any residual auth error left in the store from a previous attempt.
    this.store.dispatch(AuthActions.clearError());
  }

  authForm: FormGroup<AuthForm> = this.fb.group({
    email: this.fb.control<string | null>(null, [Validators.required, Validators.email]),
    password: this.fb.control<string | null>(null, [Validators.required, Validators.minLength(6)]),
    firstName: this.fb.control<string | null>(null),
    lastName: this.fb.control<string | null>(null),
  });

  get emailCtrl()     { return this.authForm.controls.email; }
  get passwordCtrl()  { return this.authForm.controls.password; }
  get firstNameCtrl() { return this.authForm.controls.firstName; }
  get lastNameCtrl()  { return this.authForm.controls.lastName; }

  onSwitchMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
    // Toggle required validators on name fields based on mode.
    const nameControls = [this.firstNameCtrl, this.lastNameCtrl];
    if (!this.isLoginMode()) {
      nameControls.forEach(c => c.setValidators([Validators.required]));
    } else {
      nameControls.forEach(c => c.clearValidators());
    }
    nameControls.forEach(c => c.updateValueAndValidity());
    // Clear any lingering server error so it doesn't appear in the new mode.
    this.store.dispatch(AuthActions.clearError());
  }

  togglePasswordVisibility() {
    this.hidePassword.update(hide => !hide);
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const { email, password, firstName, lastName } = this.authForm.value;

    if (this.isLoginMode()) {
      this.store.dispatch(AuthActions.loginStart({
        email: email!,
        password: password!
      }));
    } else {
      this.store.dispatch(AuthActions.signupStart({
        email: email!,
        password: password!,
        firstName: firstName!,
        lastName: lastName!
      }));
    }
  }
}
