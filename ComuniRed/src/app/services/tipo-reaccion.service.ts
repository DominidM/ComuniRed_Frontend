import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TipoReaccion {
  id: number;
  nombre: string;
  icono?: string;
}

@Injectable({ providedIn: 'root' })
export class TipoReaccionService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<TipoReaccion[]> {
    return this.apollo.query<{ tiposReaccion: TipoReaccion[] }>({
      query: gql`
        query {
          tiposReaccion {
            id
            nombre
            icono
          }
        }
      `
    }).pipe(map(result => result.data.tiposReaccion));
  }

  create(tipo: Partial<TipoReaccion>): Observable<TipoReaccion> {
    return this.apollo.mutate<{ createTipoReaccion: TipoReaccion }>({
      mutation: gql`
        mutation($input: TipoReaccionInput!) {
          createTipoReaccion(input: $input) {
            id
            nombre
            icono
          }
        }
      `,
      variables: { input: tipo }
    }).pipe(map(result => result.data!.createTipoReaccion));
  }

  update(id: number, tipo: Partial<TipoReaccion>): Observable<TipoReaccion> {
    return this.apollo.mutate<{ updateTipoReaccion: TipoReaccion }>({
      mutation: gql`
        mutation($id: ID!, $input: TipoReaccionInput!) {
          updateTipoReaccion(id: $id, input: $input) {
            id
            nombre
            icono
          }
        }
      `,
      variables: { id, input: tipo }
    }).pipe(map(result => result.data!.updateTipoReaccion));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteTipoReaccion: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteTipoReaccion(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteTipoReaccion));
  }
}