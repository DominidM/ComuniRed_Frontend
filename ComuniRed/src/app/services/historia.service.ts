import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  videoUrl?: string;
  text?: string;
  bgColor?: string;
  timeAgo: string;
  seen: boolean;
  categoryEmoji?: string;
  categoryName?: string;
  duration: number;
  songTitle?: string;
  songArtist?: string;
  songPreviewUrl?: string;
  songCoverUrl?: string;
}

export interface HistoriaResponse {
  id: string;
  usuarioId: string;
  userName: string;
  userAvatar: string;
  imagenUrl?: string;
  videoUrl?: string;
  texto?: string;
  colorFondo?: string;
  duracion: number;
  cancionTitulo?: string;
  cancionArtista?: string;
  cancionPreviewUrl?: string;
  cancionCoverUrl?: string;
  activa: boolean;
  fechaCreacion: string;
  fechaExpiracion: string;
  totalVistas: number;
  vistaPorMi: boolean;
}

@Injectable({ providedIn: 'root' })
export class HistoriaService {
  private readonly API = '/api/historias';

  constructor(private http: HttpClient) {}

  obtenerActivas(usuarioId: string): Observable<Story[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http
      .get<HistoriaResponse[]>(this.API, { params })
      .pipe(map((res) => res.map(this.mapToStory)));
  }

  crear(
    usuarioId: string,
    texto: string,
    colorFondo: string,
    duracion: number,
    imagen?: File | null,
    video?: File | null,
    cancionTitulo?: string,
    cancionArtista?: string,
    cancionPreviewUrl?: string,
    cancionCoverUrl?: string
  ): Observable<Story> {
    const form = new FormData();
    form.append('usuarioId', usuarioId);
    if (texto) form.append('texto', texto);
    if (colorFondo) form.append('colorFondo', colorFondo);
    form.append('duracion', String(duracion));
    if (imagen) form.append('imagen', imagen);
    if (video) form.append('video', video);
    if (cancionTitulo) form.append('cancionTitulo', cancionTitulo);
    if (cancionArtista) form.append('cancionArtista', cancionArtista);
    if (cancionPreviewUrl) form.append('cancionPreviewUrl', cancionPreviewUrl);
    if (cancionCoverUrl) form.append('cancionCoverUrl', cancionCoverUrl);
    return this.http
      .post<HistoriaResponse>(this.API, form)
      .pipe(map(this.mapToStory));
  }

  marcarVista(historiaId: string, usuarioId: string): Observable<Story> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http
      .patch<HistoriaResponse>(`${this.API}/${historiaId}/vista`, null, { params })
      .pipe(map(this.mapToStory));
  }

  eliminar(historiaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${historiaId}`);
  }

  private mapToStory(r: HistoriaResponse): Story {
    return {
      id: r.id,
      userId: r.usuarioId,
      userName: r.userName,
      userAvatar: r.userAvatar || 'assets/img/default-avatar.png',
      imageUrl: r.imagenUrl,
      videoUrl: r.videoUrl,
      text: r.texto,
      bgColor: r.colorFondo,
      timeAgo: r.fechaCreacion,
      seen: r.vistaPorMi,
      categoryEmoji: undefined,
      categoryName: undefined,
      duration: r.duracion ?? 5,
      songTitle: r.cancionTitulo,
      songArtist: r.cancionArtista,
      songPreviewUrl: r.cancionPreviewUrl,
      songCoverUrl: r.cancionCoverUrl,
    };
  }
}
