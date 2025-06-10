import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

type User = {
  name: string;
  email: string;
  password?: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/users';
  private readonly authService = inject(AuthService);

  updateProfile(data: User): Observable<any> {
    return this.http.patch(`${this.apiUrl}`, data).pipe(
      tap((response: any) => {
        this.authService.updateCurrentUser(response);
      })
    );
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me`).pipe(
      tap(() => {
        this.authService.logout();
      })
    );
  }
}
