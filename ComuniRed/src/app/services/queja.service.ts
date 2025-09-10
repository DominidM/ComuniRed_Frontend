import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Queja {
  id: number;
  descripcion: string;
  fecha_creacion: string;
  usuario_id: number;
  estado_id: number;
  imagen_url?: string;
  // Puedes expandir con: usuario?: Usuario, estado?: EstadoQueja
}

@Injectable({ providedIn: 'root' })
export class QuejaService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Queja[]> {
    return this.apollo.query<{ quejas: Queja[] }>({
      query: gql`
        query {
          quejas {
            id
            descripcion
            fecha_creacion
            usuario_id
            estado_id
            imagen_url
          }
        }
      `
    }).pipe(map(result => result.data.quejas));
  }

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