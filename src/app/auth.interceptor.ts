// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwtToken');
    console.log('Token from localStorage:', token);

    if (token) {
      console.log('Adding token to request headers');
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Request headers after clone:', request.headers.get('Authorization'));
    } else {
      console.log('No token found in localStorage');
    }

    return next.handle(request);
  }
}
