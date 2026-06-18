import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  previewUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MusicaService {
  private readonly API = '/api/musica/buscar';

  constructor(private http: HttpClient) {}

  buscar(query: string): Observable<MusicTrack[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<MusicTrack[]>(this.API, { params });
  }
}
