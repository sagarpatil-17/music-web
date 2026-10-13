
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'fresh_music_user';

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/register`,
        payload
      )
      .pipe(tap((response) => this.saveSession(response)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/login`,
        payload
      )
      .pipe(tap((response) => this.saveSession(response)));
  }

  getMe(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap((user) => {
          localStorage.setItem(
            this.userKey,
            JSON.stringify(user)
          );
        })
      );
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(
      this.tokenKey,
      response.accessToken
    );

    localStorage.setItem(
      this.userKey,
      JSON.stringify(response.user)
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    const value = localStorage.getItem(this.userKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    return this.getUser()?.role === role;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }

      if (error.status === 0) {
        return 'Unable to connect to the server. Check your backend.';
      }

      if (error.status === 401) {
        return 'Invalid email or password.';
      }

      if (error.status === 409) {
        return 'An account with these details already exists.';
      }
    }

    return 'Something went wrong. Please try again.';
  }

  updateCachedUser(user: Partial<AuthUser>): void {
    const currentUser = this.getUser();

    if (!currentUser) {
      return;
    }

    localStorage.setItem(
      this.userKey,
      JSON.stringify({
        ...currentUser,
        ...user,
      })
    );
  }

}
