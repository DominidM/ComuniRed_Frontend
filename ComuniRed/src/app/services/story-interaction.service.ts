import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ViewerInfo {
  usuarioId: string;
  userName: string;
  userAvatar: string;
  leGusta: boolean;
}

export interface LikeResult {
  leGusta: boolean;
  totalLikes: number;
}

@Injectable({ providedIn: 'root' })
export class StoryInteractionService {
  private readonly API = '/api/historias';

  constructor(private http: HttpClient) {}

  toggleLike(historiaId: string, usuarioId: string): Observable<LikeResult> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.post<LikeResult>(`${this.API}/${historiaId}/like`, null, { params });
  }

  enviarRespuesta(historiaId: string, usuarioId: string, texto: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${historiaId}/reply`, { usuarioId, texto });
  }

  obtenerViewers(historiaId: string): Observable<ViewerInfo[]> {
    return this.http.get<ViewerInfo[]>(`${this.API}/${historiaId}/viewers`);
  }
}
