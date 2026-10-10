
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import { AuthResponse } from '../models/user.model';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenKey = 'access_token';

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('/auth/login', payload)
      .pipe(
        tap((response) => {
          this.saveToken(response.accessToken);
        }),
      );
  }

  register(
    payload: RegisterPayload,
  ): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('/auth/register', payload)
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            this.saveToken(response.accessToken);
          }
        }),
      );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
