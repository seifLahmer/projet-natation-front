import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.user) {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          
          // Redirection basée sur le rôle
          if (response.user.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (response.user.role === 'CHEF_EQUIPE') {
            this.router.navigate(['/chef-equipe']); 
          } else if (response.user.role === 'JOUEUR') {
            this.router.navigate(['/joueur']); // Redirection vers l'interface joueur
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      }),
      catchError(error => {
        let errorMessage = 'Erreur de connexion';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 403) {
          errorMessage = 'Votre compte n\'est pas encore activé';
        }
        return throwError(() => errorMessage);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  isJoueur(): boolean {
    const user = this.currentUserValue;
    return user && user.role === 'JOUEUR';
  }
}