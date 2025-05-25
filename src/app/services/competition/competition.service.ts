import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition } from '../../models/competition';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = 'http://localhost:8082/api/competitions';

  constructor(private http: HttpClient) { }

  // Méthode principale : récupérer les utilisateurs inscrits à une compétition
  getUsersByCompetitionId(competitionId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${competitionId}/users`);
  }

  // Méthode bonus : vérifier si un utilisateur est inscrit à une compétition
  isUserRegistered(competitionId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${competitionId}/users/${userId}/inscription-status`);
  }

  // Obtenir toutes les compétitions
  getAllCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.apiUrl);
  }

  // Obtenir une compétition par ID
  getCompetition(id: number): Observable<Competition> {
    return this.http.get<Competition>(`${this.apiUrl}/${id}`);
  }

  // Ajouter une nouvelle compétition
  addCompetition(competition: Competition): Observable<Competition> {
    return this.http.post<Competition>(this.apiUrl, competition);
  }

  // Mettre à jour une compétition
  updateCompetition(competition: Competition): Observable<Competition> {
    return this.http.put<Competition>(this.apiUrl, competition);
  }

  // Supprimer une compétition
  deleteCompetition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}