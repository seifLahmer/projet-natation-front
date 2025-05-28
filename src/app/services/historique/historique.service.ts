// src/app/services/result.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultDTO } from 'src/app/models/ResultDTO';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private apiUrl = 'http://localhost:8082/results'; // adapte si nécessaire

  constructor(private http: HttpClient) {}

  getAllResults(): Observable<ResultDTO[]> {
    const token = localStorage.getItem('jwtToken'); // ou sessionStorage selon ton choix

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ResultDTO[]>(this.apiUrl, { headers });
  }
}
