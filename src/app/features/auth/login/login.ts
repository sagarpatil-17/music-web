
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthBrand } from '../components/auth-brand/auth-brand';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthBrand],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly alert = inject(AlertService);

  showPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [true],
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    this.auth
      .login({ email, password })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();

          console.log('Login request finished. Loading:', this.loading);
        })
      )
      .subscribe({
        next: (response) => {
          // Reset the button before displaying the popup.
          this.loading = false;
          this.cdr.detectChanges();

          console.log('Login response received:', response);

          if (!response?.user) {
            void this.alert.error(
              'Login failed',
              'Unexpected response from the server.'
            );
            return;
          }

          const route =
            response.user.role === 'ADMIN' ? '/admin' : '/home';

          void this.alert
            .success(
              'Welcome back!',
              'You have successfully signed in to Fresh Music.'
            )
            .then(() => this.router.navigate([route]));
        },

        error: (error: unknown) => {
          // Reset the button before displaying the error popup.
          this.loading = false;
          this.cdr.detectChanges();

          console.error('Login API error:', error);

          void this.alert.error(
            'Login failed',
            this.auth.getErrorMessage(error)
          );
        },
      });
  }

}
