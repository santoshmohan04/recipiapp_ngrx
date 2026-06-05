import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  
  authState$ = this.store.select('auth');
  
  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSwitchMode() {
    this.isLoginMode.update(mode => !mode);
    this.authForm.reset();
  }
  
  togglePasswordVisibility() {
    this.hidePassword.update(hide => !hide);
  }

  onSubmit() {
    if (!this.authForm.valid) return;

    const { email, password } = this.authForm.value;
    
    if (this.isLoginMode()) {
      this.store.dispatch(AuthActions.loginStart({ 
        email: email!, 
        password: password! 
      }));
    } else {
      this.store.dispatch(AuthActions.signupStart({ 
        email: email!, 
        password: password! 
      }));
    }
  }
}
