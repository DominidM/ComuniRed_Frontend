import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario, Queja, TipoReaccion } from './models';

export interface Reaccion {
  id: number;
  usuario_id: number;
  usuario?: Usuario;
  queja_id: number;
  queja?: Queja;
  tipo_reaccion_id: number;
  tipo_reaccion?: TipoReaccion;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ReaccionService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Reaccion[]> {
    return this.apollo.query<{ reacciones: Reaccion[] }>({
      query: gql`
        query {
          reacciones {
            id
            usuario_id
            usuario { id nombre }
            queja_id
            queja { id descripcion }
            tipo_reaccion_id
            tipo_reaccion { id nombre icono }
            fecha
          }
        }
      `
    }).pipe(map(result => result.data.reacciones));
  }

  create(reaccion: Partial<Reaccion>): Observable<Reaccion> {
    return this.apollo.mutate<{ createReaccion: Reaccion }>({
      mutation: gql`
        mutation($input: ReaccionInput!) {
          createReaccion(input: $input) {
            id
            usuario_id
            usuario { id nombre }
            queja_id
            queja { id descripcion }
            tipo_reaccion_id
            tipo_reaccion { id nombre icono }
            fecha
          }
        }
      `,
      variables: { input: reaccion }
    }).pipe(map(result => result.data!.createReaccion));
  }

  update(id: number, reaccion: Partial<Reaccion>): Observable<Reaccion> {
    return this.apollo.mutate<{ updateReaccion: Reaccion }>({
      mutation: gql`
        mutation($id: ID!, $input: ReaccionInput!) {
          updateReaccion(id: $id, input: $input) {
            id
            usuario_id
            usuario { id nombre }
            queja_id
            queja { id descripcion }
            tipo_reaccion_id
            tipo_reaccion { id nombre icono }
            fecha
          }
        }
      `,
      variables: { id, input: reaccion }
    }).pipe(map(result => result.data!.updateReaccion));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteReaccion: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteReaccion(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteReaccion));
  }
}