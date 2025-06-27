import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Thread } from '../models/Thread';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { AuthService } from './_services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = 'http://localhost:8082/forum';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserIdFromToken(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded?.id ?? null;
  }

  // === THREADS ===
  getAllThreads(): Observable<Thread[]> {
    return this.http.get<Thread[]>(`${this.apiUrl}/threads`, { headers: this.getHeaders() });
  }

  createThread(title: string): Observable<Thread> {
    const thread = { title };
    return this.http.post<Thread>(`${this.apiUrl}/threads`, thread, { headers: this.getHeaders() });
  }

  updateThread(thread: Thread): Observable<Thread> {
    return this.http.put<Thread>(`${this.apiUrl}/threads`, thread, { headers: this.getHeaders() });
  }

  deleteThread(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/threads/${id}`, { headers: this.getHeaders() });
  }

  // === POSTS ===
  getPostsByThreadId(threadId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/threads/${threadId}/posts`, { headers: this.getHeaders() });
  }

  createPost(threadId: number, content: string): Observable<Post> {
    const post = { content };
    return this.http.post<Post>(`${this.apiUrl}/posts/${threadId}`, post, { headers: this.getHeaders() });
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`, { headers: this.getHeaders() });
  }

  // === COMMENTS ===
  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/posts/${postId}/comments`, { headers: this.getHeaders() });
  }

  createComment(postId: number, content: string): Observable<Comment> {
    const comment = { content };
    return this.http.post<Comment>(`${this.apiUrl}/posts/${postId}/comments`, comment, { headers: this.getHeaders() });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`, { headers: this.getHeaders() });
  }
  updatePost(id: number, content: string): Observable<Post> {
    const post = { id, content };
    return this.http.put<Post>(`${this.apiUrl}/posts`, post, { headers: this.getHeaders() });
  }
  
}
