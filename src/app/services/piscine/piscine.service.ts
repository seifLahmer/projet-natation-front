import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Piscine } from '../../models/piscine'; // Adjust the import path as necessary


@Injectable({
  providedIn: 'root'
})
export class PiscineService {

  private baseUrl = 'http://localhost:8082/api/piscines'; // Adjust URL to match your backend

  constructor(private http: HttpClient) { }

  getAllPiscines(): Observable<Piscine[]> {
    return this.http.get<Piscine[]>(this.baseUrl);
  }

  getPiscineById(id: number): Observable<Piscine> {
    return this.http.get<Piscine>(`${this.baseUrl}/${id}`);
  }

  createPiscine(piscine: Piscine): Observable<Piscine> {
    return this.http.post<Piscine>(this.baseUrl, piscine);
  }

  updatePiscine(id: number, piscine: Piscine): Observable<Piscine> {
    return this.http.put<Piscine>(`${this.baseUrl}/${id}`, piscine);
  }

  deletePiscine(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  affecterPiscineAuCentre(idPiscine: number, idCentre: number): Observable<string> {
    const url = `${this.baseUrl}/${idPiscine}/${idCentre}`;
    return this.http.put<string>(url, {});
  }

  getPiscinesParCentre(idCentre: number): Observable<Piscine[]> {
  return this.http.get<Piscine[]>(`${this.baseUrl}/centres/${idCentre}/piscines`);
}


  
}
