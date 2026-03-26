import { Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import * as AuthActions from '../../store/auth/auth.actions';
import { LoadingSpinnerComponent } from '../../shared/ui-components/loading-spinner.component';

// Custom Validators
function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const isValidLength = value.length >= 8;
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;
    
    return !passwordValid ? {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecialChar,
        isValidLength
      }
    } : null;
  };
}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
  };
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
    MatProgressSpinnerModule,
    MatIconModule,
    AsyncPipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  
  isLoginMode = signal(true);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  
  authState$ = this.store.select('auth');
  
  authForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
    confirmPassword: ['']
  }, { validators: passwordMatchValidator() });

  constructor() {
    // Rebuild form when switching modes
    effect(() => {
      if (this.isLoginMode()) {
        // Login mode - remove confirmPassword and name validators
        this.authForm.get('firstName')?.clearValidators();
        this.authForm.get('lastName')?.clearValidators();
        this.authForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.authForm.get('confirmPassword')?.clearValidators();
        this.authForm.get('confirmPassword')?.setValue('');
      } else {
        // Signup mode - add strong password validators and name requirements
        this.authForm.get('firstName')?.setValidators([Validators.required]);
        this.authForm.get('lastName')?.setValidators([Validators.required]);
        this.authForm.get('password')?.setValidators([
          Validators.required, 
          Validators.minLength(8), 
          passwordStrengthValidator()
        ]);
        this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
      }
      this.authForm.get('firstName')?.updateValueAndValidity();
      this.authForm.get('lastName')?.updateValueAndValidity();
      this.authForm.get('password')?.updateValueAndValidity();
      this.authForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  onSwitchMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
  }
  
  togglePasswordVisibility() {
    this.hidePassword.update(hide => !hide);
  }
  
  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword.update(hide => !hide);
  }

  onSubmit() {
    if (!this.authForm.valid) return;

    const { firstName, lastName, email, password } = this.authForm.value;
    
    if (this.isLoginMode()) {
      this.store.dispatch(AuthActions.loginStart({ 
        email: email!, 
        password: password! 
      }));
    } else {
      this.store.dispatch(AuthActions.signupStart({ 
        firstName: firstName!,
        lastName: lastName!,
        email: email!, 
        password: password! 
      }));
    }
  }

  // Password strength checkers for template
  hasMinLength(): boolean {
    const password = this.authForm.get('password')?.value;
    return password ? password.length >= 8 : false;
  }

  hasUpperCase(): boolean {
    const password = this.authForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasLowerCase(): boolean {
    const password = this.authForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.authForm.get('password')?.value;
    return password ? /[0-9]/.test(password) : false;
  }

  hasSpecialChar(): boolean {
    const password = this.authForm.get('password')?.value;
    return password ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) : false;
  }
}
