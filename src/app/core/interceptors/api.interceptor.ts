// src/app/core/interceptors/api.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Simplified interceptor since we're only loading local assets
    return next.handle(request).pipe(
      retry(1), // Only retry once for local assets
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found. The requested icon may not exist.';
        } else {
          errorMessage = `Error ${error.status}: ${error.message}`;
        }

        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}