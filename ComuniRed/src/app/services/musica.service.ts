import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MusicTrackResponse {
  id: number;
  title: string;
  artist: string;
  previewUrl: string;
  coverUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MusicaService {
  private readonly API = '/api/musica/search';

  constructor(private http: HttpClient) {}

  buscar(query: string): Observable<MusicTrackResponse[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<MusicTrackResponse[]>(this.API, { params });
  }
}
