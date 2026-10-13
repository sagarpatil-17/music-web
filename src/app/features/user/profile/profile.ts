
import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  ProfileService,
  UserProfile,
} from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  // Component state
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly changingPassword = signal(false);

  // Derived state
  readonly displayName = computed(
    () => this.profile()?.name ?? ''
  );

  readonly avatarInitial = computed(
    () => this.displayName().charAt(0).toUpperCase()
  );

  readonly isProfileFormInvalid = computed(
    () => this.profileForm.invalid
  );

  readonly isPasswordFormInvalid = computed(
    () => this.passwordForm.invalid
  );

  readonly profileForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
      ],
    ],
    avatarUrl: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);

        this.profileForm.patchValue({
          name: profile.name,
          avatarUrl: profile.avatarUrl ?? '',
        });

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);

        void this.alertService.error(
          'Unable to load profile',
          this.getErrorMessage(error)
        );
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const name = this.profileForm.controls.name.value.trim();
    const avatarUrl =
      this.profileForm.controls.avatarUrl.value.trim();

    if (name.length < 2) {
      this.profileForm.controls.name.setErrors({
        minlength: true,
      });
      return;
    }

    if (avatarUrl && !this.isValidUrl(avatarUrl)) {
      this.profileForm.controls.avatarUrl.setErrors({
        invalidUrl: true,
      });
      return;
    }

    this.savingProfile.set(true);

    this.profileService
      .updateProfile({
        name,
        avatarUrl: avatarUrl || null,
      })
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.savingProfile.set(false);

          this.authService.updateCachedUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          });

          this.profileForm.patchValue({
            name: profile.name,
            avatarUrl: profile.avatarUrl ?? '',
          });

          void this.alertService.success(
            'Profile updated',
            'Your profile has been saved successfully.'
          );
        },
        error: (error: unknown) => {
          this.savingProfile.set(false);

          void this.alertService.error(
            'Update failed',
            this.getErrorMessage(error)
          );
        },
      });
  }

  changePassword(): void {
    if (
      this.passwordForm.invalid ||
      this.changingPassword()
    ) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      void this.alertService.warning(
        'Passwords do not match',
        'Please make sure both new passwords are identical.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      void this.alertService.warning(
        'Choose a new password',
        'Your new password must differ from your current password.'
      );
      return;
    }

    this.changingPassword.set(true);

    this.profileService
      .changePassword({
        currentPassword,
        newPassword,
      })
      .subscribe({
        next: (response) => {
          this.changingPassword.set(false);
          this.passwordForm.reset();

          void this.alertService.success(
            'Password changed',
            response.message ||
              'Your password was changed successfully.'
          );
        },
        error: (error: unknown) => {
          this.changingPassword.set(false);

          void this.alertService.error(
            'Password change failed',
            this.getErrorMessage(error)
          );
        },
      });
  }

  onAvatarError(): void {
    const current = this.profile();

    if (current?.avatarUrl) {
      this.profile.set({
        ...current,
        avatarUrl: null,
      });
    }
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return (
        url.protocol === 'https:' ||
        url.protocol === 'http:'
      );
    } catch {
      return false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }

      if (error.status === 0) {
        return 'Cannot connect to the server. Please try again.';
      }

      if (error.status === 401) {
        return 'Your session may have expired, or your current password may be incorrect.';
      }
    }

    return 'Something went wrong. Please try again.';
  }
}
