import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReelComentario {
  id: string;
  reelId: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar: string;
  texto: string;
  fechaCreacion: string;
}

export interface ReelResponse {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  authorId: string;
  author: string;
  avatarUrl?: string;
  likes: number;
  shares: number;
  vistas: number;
  comentariosCount: number;
  liked: boolean;
  saved: boolean;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class ReelService {
  private readonly API = '/api/reels';
  private readonly ADMIN_API = '/api/admin/reels';

  constructor(private http: HttpClient) {}

  obtenerActivos(usuarioId: string): Observable<ReelResponse[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<ReelResponse[]>(this.API, { params });
  }

  marcarLike(id: string, usuarioId: string): Observable<ReelResponse> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.patch<ReelResponse>(`${this.API}/${id}/like`, null, { params });
  }

  marcarSave(id: string, usuarioId: string): Observable<ReelResponse> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.patch<ReelResponse>(`${this.API}/${id}/save`, null, { params });
  }

  incrementarVista(id: string): Observable<ReelResponse> {
    return this.http.patch<ReelResponse>(`${this.API}/${id}/view`, null);
  }

  listarTodos(search?: string): Observable<ReelResponse[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<ReelResponse[]>(this.ADMIN_API, { params });
  }

  obtenerPorId(id: string): Observable<ReelResponse> {
    return this.http.get<ReelResponse>(`${this.ADMIN_API}/${id}`);
  }

  crear(formData: FormData): Observable<ReelResponse> {
    return this.http.post<ReelResponse>(this.ADMIN_API, formData);
  }

  actualizar(id: string, formData: FormData): Observable<ReelResponse> {
    return this.http.put<ReelResponse>(`${this.ADMIN_API}/${id}`, formData);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_API}/${id}`);
  }

  obtenerComentarios(reelId: string): Observable<ReelComentario[]> {
    return this.http.get<ReelComentario[]>(`${this.API}/${reelId}/comentarios`);
  }

  comentar(reelId: string, usuarioId: string, usuarioNombre: string, usuarioAvatar: string, texto: string): Observable<ReelComentario> {
    return this.http.post<ReelComentario>(`${this.API}/${reelId}/comentarios`, {
      usuarioId, usuarioNombre, usuarioAvatar, texto
    });
  }
}
