
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthBrand } from '../components/auth-brand/auth-brand';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { finalize } from 'rxjs';


function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthBrand],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alert = inject(AlertService);

  submitted = false;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(72),
        // Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    },
    {
      validators: passwordsMatch,
    }
  );

  get name() {
    return this.registerForm.controls.name;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }


  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();

      void this.alert.warning(
        'Check your details',
        'Complete all required fields and make sure your passwords match.'
      );

      return;
    }

    this.loading = true;

    const { name, email, password } =
      this.registerForm.getRawValue();

    this.auth
      .register({ name, email, password })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (!response?.user) {
            void this.alert.error(
              'Registration failed',
              'The server returned an unexpected response.'
            );
            return;
          }

          const isAdmin = response.user.role === 'ADMIN';

          void this.alert
            .success(
              'Account created!',
              'Welcome to Fresh Music. Your account is ready.'
            )
            .then(() => {
              return this.router.navigate([
                isAdmin ? '/admin' : '/home',
              ]);
            });
        },

        error: (error: unknown) => {
          console.error('Registration API error:', error);

          const message = this.auth.getErrorMessage(error);

          void this.alert.error(
            'Registration failed',
            message
          );
        },
      });
  }

}
