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
    const isGitHubApi = request.url.includes('api.github.com');

    let clonedRequest = request;

    if (isGitHubApi) {
      clonedRequest = request.clone({
        setHeaders: {
          Accept: 'application/vnd.github.v3+json',
        },
      });
    }

    return next.handle(clonedRequest).pipe(
      retry(2),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.status === 401) {
          errorMessage =
            'Authentication failed. Please check your GitHub token.';
        } else if (error.status === 403) {
          errorMessage = 'API rate limit exceeded. Please try again later.';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found.';
        } else {
          errorMessage = `Error ${error.status}: ${error.message}`;
        }

        console.error('API Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}
