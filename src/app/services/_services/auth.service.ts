import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  
  id: number;
  role: string;
  groupe: string;
  sub: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenKey = 'jwtToken';
  private decodedToken: JwtPayload | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }

    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.decodeToken(token);
      console.log('Token décodé au démarrage:', this.decodedToken); 
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.user && response.token) {
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.saveToken(response.token); // ✅ enregistrer et décoder
          this.decodeToken(response.token);

          // Redirection basée sur le rôle
          const role = this.getUserRole();
          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'CHEF_EQUIPE') {
            this.router.navigate(['/chef-equipe']);
          } else if (role === 'JOUEUR') {
            this.router.navigate(['/joueur']);
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
    sessionStorage.removeItem('currentUser'); // Pour l'utilisateur
  localStorage.removeItem(this.tokenKey);   // Pour le token
  this.currentUserSubject.next(null);
  this.decodedToken = null;
  this.router.navigate(['/login']);
  }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  decodeToken(token: string): void {
    
    try {
      this.decodedToken = jwtDecode<JwtPayload>(token);
    } catch (err) {
      console.error('Erreur de décodage du token :', err);
      this.decodedToken = null;
    }
  }
  getUserRole(): string | null {
    return this.decodedToken?.role || null;
  }
  
  
  getUserId(): number | null {
    return this.decodedToken?.id || null;
  }

  isJoueur(): boolean {
    return this.getUserRole() === 'JOUEUR';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isChefEquipe(): boolean {
    return this.getUserRole() === 'CHEF_EQUIPE';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(error => {
        let errorMsg = 'Une erreur est survenue';
        if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.status === 404) {
          errorMsg = 'Aucun compte trouvé avec cet email';
        }
        return throwError(() => errorMsg);
      })
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword }).pipe(
      catchError(error => {
        let errorMsg = 'Une erreur est survenue';
        if (error.error?.error) {
          errorMsg = error.error.error;
        }
        return throwError(() => errorMsg);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  getDecodedToken(): JwtPayload | null {
    return this.decodedToken;
  }
}
