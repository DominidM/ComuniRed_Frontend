import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EstadoQueja {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class EstadoQuejaService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<EstadoQueja[]> {
    return this.apollo.query<{ estadosQueja: EstadoQueja[] }>({
      query: gql`
        query {
          estadosQueja {
            id
            nombre
            descripcion
          }
        }
      `
    }).pipe(map(result => result.data.estadosQueja));
  }

  create(estado: Partial<EstadoQueja>): Observable<EstadoQueja> {
    return this.apollo.mutate<{ createEstadoQueja: EstadoQueja }>({
      mutation: gql`
        mutation($input: EstadoQuejaInput!) {
          createEstadoQueja(input: $input) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { input: estado }
    }).pipe(map(result => result.data!.createEstadoQueja));
  }

  update(id: number, estado: Partial<EstadoQueja>): Observable<EstadoQueja> {
    return this.apollo.mutate<{ updateEstadoQueja: EstadoQueja }>({
      mutation: gql`
        mutation($id: ID!, $input: EstadoQuejaInput!) {
          updateEstadoQueja(id: $id, input: $input) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { id, input: estado }
    }).pipe(map(result => result.data!.updateEstadoQueja));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteEstadoQueja: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteEstadoQueja(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteEstadoQueja));
  }
}