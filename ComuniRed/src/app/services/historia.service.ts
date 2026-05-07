import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Story } from '../public/stories/stories.component';

export interface HistoriaResponse {
  id: string;
  usuarioId: string;
  nombreUsuario: string;
  avatarUsuario: string;
  imagenUrl?: string;
  texto?: string;
  colorFondo?: string;
  tiempoTranscurrido: string;
  vista: boolean;
  categoriaEmoji?: string;
  categoriaNombre?: string;
  duracion: number;
}

@Injectable({ providedIn: 'root' })
export class HistoriaService {
  private readonly API = '/api/historias';

  constructor(private http: HttpClient) {}

  /** Obtiene historias activas de otros usuarios */
  obtenerActivas(usuarioId: string): Observable<Story[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http
      .get<HistoriaResponse[]>(this.API, { params })
      .pipe(map((res) => res.map(this.mapToStory)));
  }

  /** Publica una nueva historia */
  crear(
    usuarioId: string,
    texto: string,
    colorFondo: string,
    duracion: number,
    imagen?: File | null
  ): Observable<Story> {
    const form = new FormData();
    form.append('usuarioId', usuarioId);
    if (texto) form.append('texto', texto);
    if (colorFondo) form.append('colorFondo', colorFondo);
    form.append('duracion', String(duracion));
    if (imagen) form.append('imagen', imagen);
    return this.http
      .post<HistoriaResponse>(this.API, form)
      .pipe(map(this.mapToStory));
  }

  /** Marca una historia como vista */
  marcarVista(historiaId: string, usuarioId: string): Observable<Story> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http
      .patch<HistoriaResponse>(`${this.API}/${historiaId}/vista`, null, { params })
      .pipe(map(this.mapToStory));
  }

  /** Elimina una historia propia */
  eliminar(historiaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${historiaId}`);
  }

  // Mapea HistoriaResponse → Story (modelo del componente)
  private mapToStory(r: HistoriaResponse): Story {
    return {
      id: r.id,
      userId: r.usuarioId,
      userName: r.nombreUsuario,
      userAvatar: r.avatarUsuario || 'assets/img/default-avatar.png',
      imageUrl: r.imagenUrl,
      text: r.texto,
      bgColor: r.colorFondo,
      timeAgo: r.tiempoTranscurrido,
      seen: r.vista,
      categoryEmoji: r.categoriaEmoji,
      categoryName: r.categoriaNombre,
      duration: r.duracion ?? 5,
    };
  }
}