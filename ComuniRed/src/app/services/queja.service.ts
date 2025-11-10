import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Queja } from './models';

@Injectable({ providedIn: 'root' })
export class QuejaService {
  constructor(private apollo: Apollo) {}

  // tu método existente getAll()
  getAll(page = 0, size = 20): Observable<Queja[]> {
    return this.apollo.query<{ quejas: any[] }>({
      query: gql`
        query GetQuejas($page: Int, $size: Int) {
          quejas(page: $page, size: $size) {
            id
            descripcion
            fecha_creacion
            usuario_id
            estado_id
            imagen_url
            usuario { id nombre email fotoPerfil }
            estado { id nombre descripcion clave }
            evidence { id url type thumbnailUrl }
            votes { yes no total }
            userVote
            votingEndAt
            canVote
            reactions { counts userReaction total }
            commentsCount
            comments { id author { id nombre fotoPerfil } text createdAt }
          }
        }
      `,
      variables: { page, size },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data.quejas || []));
  }

  // alias para compatibilidad con componentes que llamen getFeed()
  getFeed(page = 0, size = 20): Observable<Queja[]> {
    return this.getAll(page, size);
  }

  getById(id: string | number): Observable<any> {
    return this.apollo.query<{ queja: any }>({
      query: gql`
        query GetQueja($id: ID!) {
          queja(id: $id) {
            id
            descripcion
            fecha_creacion
            usuario_id
            estado_id
            imagen_url
            usuario { id nombre email fotoPerfil }
            estado { id nombre descripcion clave }
            evidence { id url type thumbnailUrl }
            votes { yes no total }
            userVote
            votingEndAt
            canVote
            reactions { counts userReaction total }
            commentsCount
            comments { id author { id nombre fotoPerfil } text createdAt }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(map(r => r.data.queja));
  }

  vote(quejaId: string | number, positive: boolean): Observable<{ yes: number; no: number; userVote: string }> {
    return this.apollo.mutate<{ voteQueja: { yes: number; no: number; userVote: string } }>({
      mutation: gql`
        mutation VoteQueja($input: VoteInput!) {
          voteQueja(input: $input) {
            yes
            no
            userVote
          }
        }
      `,
      variables: { input: { quejaId, positive } }
    }).pipe(map(r => r.data!.voteQueja));
  }

  toggleReaction(quejaId: string | number, type: string): Observable<{ action: string; counts?: Record<string, number>; userReaction?: string }> {
    return this.apollo.mutate<{ toggleReaction: { action: string; counts?: Record<string, number>; userReaction?: string } }>({
      mutation: gql`
        mutation ToggleReaction($input: ReactionInput!) {
          toggleReaction(input: $input) {
            action
            counts
            userReaction
          }
        }
      `,
      variables: { input: { quejaId, type } }
    }).pipe(map(r => r.data!.toggleReaction));
  }

  // utilidad para descargar JSON desde el servidor (opcional) o hacer en frontend
  downloadQuejaJson(queja: any): void {
    // si tienes un endpoint que devuelve la queja en JSON, podrías usar httpClient to download;
    // aquí construimos el blob localmente (fallback)
    const blob = new Blob([JSON.stringify(queja, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${queja.id || 'queja'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // mantiene create/update/delete si las usas
  create(queja: Partial<Queja>): Observable<Queja> {
    return this.apollo.mutate<{ createQueja: Queja }>({
      mutation: gql`
        mutation($input: QuejaInput!) {
          createQueja(input: $input) {
            id
            descripcion
            fecha_creacion
            usuario_id
            estado_id
            imagen_url
          }
        }
      `,
      variables: { input: queja }
    }).pipe(map(result => result.data!.createQueja));
  }

  update(id: number, queja: Partial<Queja>): Observable<Queja> {
    return this.apollo.mutate<{ updateQueja: Queja }>({
      mutation: gql`
        mutation($id: ID!, $input: QuejaInput!) {
          updateQueja(id: $id, input: $input) {
            id
            descripcion
            fecha_creacion
            usuario_id
            estado_id
            imagen_url
          }
        }
      `,
      variables: { id, input: queja }
    }).pipe(map(result => result.data!.updateQueja));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteQueja: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteQueja(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteQueja));
  }
}