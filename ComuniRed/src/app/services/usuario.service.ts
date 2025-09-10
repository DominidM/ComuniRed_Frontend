import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Rol } from './models';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol_id: number;
  rol?: Rol;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Usuario[]> {
    return this.apollo.query<{ usuarios: Usuario[] }>({
      query: gql`
        query {
          usuarios {
            id
            nombre
            email
            rol_id
            rol { id nombre }
          }
        }
      `
    }).pipe(map(result => result.data.usuarios));
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.apollo.mutate<{ createUsuario: Usuario }>({
      mutation: gql`
        mutation($input: UsuarioInput!) {
          createUsuario(input: $input) {
            id
            nombre
            email
            rol_id
            rol { id nombre }
          }
        }
      `,
      variables: { input: usuario }
    }).pipe(map(result => result.data!.createUsuario));
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.apollo.mutate<{ updateUsuario: Usuario }>({
      mutation: gql`
        mutation($id: ID!, $input: UsuarioInput!) {
          updateUsuario(id: $id, input: $input) {
            id
            nombre
            email
            rol_id
            rol { id nombre }
          }
        }
      `,
      variables: { id, input: usuario }
    }).pipe(map(result => result.data!.updateUsuario));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteUsuario: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteUsuario(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteUsuario));
  }
}