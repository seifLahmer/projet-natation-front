import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competition } from '../models/competition';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private baseUrl = 'http://localhost:8082/api/competitions';

  constructor(private http: HttpClient) { }

  getAllCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.baseUrl);
  }

  getCompetitionById(id: number): Observable<Competition> {
    return this.http.get<Competition>(`${this.baseUrl}/${id}`);
  }

  createCompetition(competition: Competition): Observable<Competition> {
    return this.http.post<Competition>(this.baseUrl, competition);
  }

  updateCompetition(id: number, competition: Competition): Observable<Competition> {
    return this.http.put<Competition>(`${this.baseUrl}/${id}`, competition);
  }

  deleteCompetition(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
} 