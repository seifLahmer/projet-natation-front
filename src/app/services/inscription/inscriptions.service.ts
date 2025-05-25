import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inscription } from 'src/app/models/inscription';
import { Competition } from 'src/app/models/competition';
import { AuthService } from '../_services/auth.service';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class InscriptionService {

  private apiUrl = 'http://localhost:8082/api/inscriptions';

  constructor(private http: HttpClient,private authService :AuthService) {}
  getUserIdFromToken(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
   
    const decoded: any = jwtDecode(token);
    return decoded?.id ?? null;
  }
  inscrireACompetition(idCompetition: number): Observable<string> {
    const token = this.authService.getToken();
    const userId = this.getUserIdFromToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      ,
  'Content-Type': 'application/json'
    });
    const body = {
      idUtilisateur: userId
    };
    console.log('Token envoyé:', token);
    console.log('ID de la compétition:', idCompetition);
    return this.http.post<string>(
      `${this.apiUrl}/inscrire/${idCompetition}`,
      body, // aucun body requis ici
      { headers }
    );
  }
  
  getInscriptions(): Observable<Inscription[]> {
    const token = this.authService.getToken();
    const userId = this.getUserIdFromToken(); // ou this.authService.getUserId() si tu l’as centralisé
    const role = this.authService.getUserRole();
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const params = new HttpParams()
      .set('userId', userId!.toString())
      .set('role', !role);
  
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptionsUser`, { headers, params });
  }



  getCompetitionParInscriptionId(idInscription: number): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${idInscription}/competition`);
  }
  changerStatut(id: number, statut: string): Observable<string> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put(`${this.apiUrl}/inscription/${id}/statut`, null, { params, responseType: 'text' });
  }
}
