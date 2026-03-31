import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  standalone: false,
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, { static: false })
  alertHost: PlaceholderDirective;
  authForm!: FormGroup;

  private closeSub: Subscription;
  private storeSub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.authForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  get email() {
    return this.authForm.get('email')!;
  }

  get password() {
    return this.authForm.get('password')!;
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    
    if (this.isLoginMode) {
      // Login mode - remove name validators
      this.authForm.get('firstName')?.clearValidators();
      this.authForm.get('lastName')?.clearValidators();
    } else {
      // Signup mode - add name validators
      this.authForm.get('firstName')?.setValidators([Validators.required]);
      this.authForm.get('lastName')?.setValidators([Validators.required]);
    }
    
    this.authForm.get('firstName')?.updateValueAndValidity();
    this.authForm.get('lastName')?.updateValueAndValidity();
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) return;
    const { firstName, lastName, email, password, rememberMe } = this.authForm.value;

    if (rememberMe) {
      localStorage.setItem('email', email);
    }

    if (this.isLoginMode) {
      this.store.dispatch(
        AuthActions.loginStart({
          email: email,
          password: password,
        })
      );
    } else {
      this.store.dispatch(
        AuthActions.signupStart({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
        })
      );
    }

    this.authForm.reset();
  }

  onHandleError() {
    this.store.dispatch(AuthActions.clearError());
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
