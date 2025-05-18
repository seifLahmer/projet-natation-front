import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelevanceAiService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = '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'; // 🔒 Remplace par une variable d'environnement en production

  constructor(private http: HttpClient) {}

  generateDescription(competitionType: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {

      //model: 'anthropic/claude-3.5-sonnet',
      models : ["gryphe/mythomax-l2-13b"],
      messages: [
        {
          role: 'system',
          content: "Tu es un expert en compétitions de natation. Fournis une brève description formelle et informative du type de compétition suivant, en français."
        },
        {
          role: 'user',
          content: competitionType
        }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
