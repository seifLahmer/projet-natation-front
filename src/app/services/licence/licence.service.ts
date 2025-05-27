import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Licence } from '../../models/licence';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LicenceService {
  private baseUrl = 'http://localhost:8082/api/licences';

  constructor(private http: HttpClient) { }

  // Création d'une licence
  createLicence(licence: Licence): Observable<Licence> {
    return this.http.post<Licence>(this.baseUrl, licence).pipe(
      tap(response => console.log('Réponse création licence:', response))
    );
  }

  // Liste des licences
  getAllLicences(): Observable<Licence[]> {
    return this.http.get<Licence[]>(this.baseUrl);
  }

  // Détails d'une licence
  getLicenceById(numLicence: string): Observable<Licence> {
    return this.http.get<Licence>(`${this.baseUrl}/numero/${numLicence}`);
  }

  // Vérifier si un joueur a une licence par son email
  checkUserLicence(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/parmail/${email}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of({ hasLicence: false });
        }
        throw error;
      })
    );
  }

  // Récupérer sa propre licence
  getMyLicence(): Observable<Licence> {
    return this.http.get<Licence>(`${this.baseUrl}/my-licence`);
  }

  // Mise à jour d'une licence
  updateLicence(numLicence: string, licence: Licence): Observable<Licence> {
    console.log('Mise à jour licence:', {
      url: `${this.baseUrl}/${numLicence}`,
      data: licence
    });
    
    // Appel direct sans authentification
    return this.http.put<Licence>(`${this.baseUrl}/${numLicence}`, licence).pipe(
      tap(response => console.log('Réponse mise à jour licence:', response)),
      catchError(error => {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
      })
    );
  }

  // Suppression d'une licence
  deleteLicence(numLicence: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${numLicence}`).pipe(
      tap(() => console.log('Licence supprimée avec succès'))
    );
  }
} 