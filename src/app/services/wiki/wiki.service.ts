// src/app/services/wiki/wiki.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikiService {
  private UNSPLASH_URL = 'https://api.unsplash.com/search/photos';
  private ACCESS_KEY = 'DzOCIdLLO1vChI4ZXQ_S4XxMn2yG3ZOW-_iYQg6T8sw'; // Remplace par ta vraie clé Unsplash

  constructor(private http: HttpClient) {}

  // Récupérer plusieurs images de natation de l'API Unsplash
  getSwimmingImages(count: number): Observable<string[]> {
    const headers = new HttpHeaders({
      Authorization: `Client-ID ${this.ACCESS_KEY}`
    });
  
    const params = new HttpParams()
      .set('query', 'swimming')
      .set('orientation', 'landscape')
      .set('per_page', count.toString());
  
    return this.http.get<any>(this.UNSPLASH_URL, { headers, params }).pipe(
      map(response =>
        response.results.map((r: any) => r.urls.regular) || ['https://via.placeholder.com/1200x500']
      )
    );
  }
  
}
