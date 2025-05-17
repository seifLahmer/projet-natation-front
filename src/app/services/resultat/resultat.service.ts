import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resultat } from '../../models/resultat'; 

@Injectable({
  providedIn: 'root'
})
export class ResultatService {

  private baseUrl = 'http://localhost:8082/api/resultats'; 

  constructor(private http : HttpClient) { }

  getAllResultats(): Observable<Resultat[]> {
      return this.http.get<Resultat[]>(this.baseUrl);
    }
  
    getResultatById(id: number): Observable<Resultat> {
      return this.http.get<Resultat>(`${this.baseUrl}/${id}`);
    }
  
    createResultat(resultat: Resultat): Observable<Resultat> {
      return this.http.post<Resultat>(this.baseUrl, resultat);
    }
  
    updateResultat(id: number, resultat: Resultat): Observable<Resultat> {
      return this.http.put<Resultat>(`${this.baseUrl}/${id}`, resultat);
    }
  
    deleteResultat(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/${id}`);
    }
    getResultatsParCompetition(typeC: string, page: number, size: number): Observable<Resultat[]> {
      return this.http.get<Resultat[]>(`${this.baseUrl}/competition`, {
        params: {
          typeC,
          page: page.toString(),
          size: size.toString()
        }
      });
    }
   
  }