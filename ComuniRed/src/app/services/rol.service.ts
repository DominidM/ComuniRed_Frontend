import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Rol[]> {
    return this.apollo.query<{ roles: Rol[] }>({
      query: gql`
        query {
          roles {
            id
            nombre
            descripcion
          }
        }
      `
    }).pipe(map(result => result.data.roles));
  }

  create(rol: Partial<Rol>): Observable<Rol> {
    return this.apollo.mutate<{ createRol: Rol }>({
      mutation: gql`
        mutation($input: RolInput!) {
          createRol(input: $input) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { input: rol }
    }).pipe(map(result => result.data!.createRol));
  }

  update(id: number, rol: Partial<Rol>): Observable<Rol> {
    return this.apollo.mutate<{ updateRol: Rol }>({
      mutation: gql`
        mutation($id: ID!, $input: RolInput!) {
          updateRol(id: $id, input: $input) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { id, input: rol }
    }).pipe(map(result => result.data!.updateRol));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteRol: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteRol(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteRol));
  }
}