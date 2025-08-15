import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);

  return http.get(`${environment.backendUrl}/api/auth/me`, { withCredentials: true })
    .pipe(
      map(() => true),
      catchError(() => {
        window.location.href = `${environment.backendUrl}/api/auth/login`;
        return of(false);
      })
    );
};
