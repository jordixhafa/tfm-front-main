import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

type LoginResponse = {
  access_token: string;
  user: {
    name: string;
    email: string;
  };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/users';

  private readonly currentUserSubject =
    new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());

  currentUser$ = this.currentUserSubject.asObservable();

  private getUserFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('auth', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  register(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  logout() {
    localStorage.removeItem('auth');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.access_token ?? null;
  }

  getCurrentUser() {
    return this.currentUserSubject.value?.user ?? null;
  }

  updateCurrentUser(user: { name: string; email: string }) {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = {
        ...current,
        name: user.name,
        email: user.email,
      };
      localStorage.setItem('auth', JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }
}
