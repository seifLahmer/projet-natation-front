import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Centre } from 'src/app/models/centre';

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  
  private baseUrl = 'http://localhost:8082/api/centres'; // Ajustez le port selon votre configuration

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste de tous les centres
   * @returns Une liste observable de centres
   */
  getAllCentres(): Observable<Centre[]> {
    return this.http.get<Centre[]>(this.baseUrl);
  }

  /**
   * Récupère un centre par son identifiant
   * @param id L'identifiant du centre
   * @returns Un observable du centre correspondant
   */
  getCentreById(id: number): Observable<Centre> {
    return this.http.get<Centre>(`${this.baseUrl}/${id}`);
  }

  /**
   * Ajoute un nouveau centre
   * @param centre Le centre à créer
   * @returns Un observable du centre créé
   */
  createCentre(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(this.baseUrl, centre);
  }

  /**
   * Met à jour un centre existant
   * @param centre Le centre à mettre à jour
   * @returns Un observable du centre mis à jour
   */
  updateCentre(centre: Centre): Observable<Centre> {
    return this.http.put<Centre>(this.baseUrl, centre);
  }

  /**
   * Supprime un centre par son identifiant
   * @param id L'identifiant du centre à supprimer
   * @returns Un observable de la réponse de suppression
   */
  deleteCentre(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}