import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition } from '../../models/competition';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = 'http://localhost:8082/api/competitions'; // Ajustez le port si nécessaire

  constructor(private http: HttpClient) { }

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

  // Tester la connexion en récupérant une compétition spécifique
  testConnection(id: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}