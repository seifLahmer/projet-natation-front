import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inscription } from 'src/app/models/inscription';
import { Competition } from 'src/app/models/competition';
@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  private apiUrl = 'http://localhost:8082/api/inscriptions';

  constructor(private http: HttpClient) {}

  inscrireACompetition(idCompetition: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/inscrire/${idCompetition}`, {}, { responseType: 'text' });
  }
  
  getInscriptions(userId: number, role: string): Observable<Inscription[]> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('role', role);

    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptionsUser`, { params });
  }
  getCompetitionParInscriptionId(idInscription: number): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${idInscription}/competition`);
  }

  /**
   * Met à jour le statut d'une inscription
   * @param id identifiant de l'inscription
   * @param statut le nouveau statut (ex: 'CONFIRMEE', 'REJETEE', etc.)
   */
  changerStatut(id: number, statut: string): Observable<string> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put(`${this.apiUrl}/inscription/${id}/statut`, null, { params, responseType: 'text' });
  }
}
