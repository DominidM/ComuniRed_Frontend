import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Queja, Usuario } from './models';


export interface Asignacion {
  id: number;
  queja_id: number;
  queja?: Queja;
  soporte_id: number;
  soporte?: Usuario;
  fecha_asignacion: string;
  atendida: boolean;
}

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  constructor(private apollo: Apollo) {}

  getAll(): Observable<Asignacion[]> {
    return this.apollo.query<{ asignaciones: Asignacion[] }>({
      query: gql`
        query {
          asignaciones {
            id
            queja_id
            queja { id descripcion }
            soporte_id
            soporte { id nombre }
            fecha_asignacion
            atendida
          }
        }
      `
    }).pipe(map(result => result.data.asignaciones));
  }

  create(asignacion: Partial<Asignacion>): Observable<Asignacion> {
    return this.apollo.mutate<{ createAsignacion: Asignacion }>({
      mutation: gql`
        mutation($input: AsignacionInput!) {
          createAsignacion(input: $input) {
            id
            queja_id
            queja { id descripcion }
            soporte_id
            soporte { id nombre }
            fecha_asignacion
            atendida
          }
        }
      `,
      variables: { input: asignacion }
    }).pipe(map(result => result.data!.createAsignacion));
  }

  update(id: number, asignacion: Partial<Asignacion>): Observable<Asignacion> {
    return this.apollo.mutate<{ updateAsignacion: Asignacion }>({
      mutation: gql`
        mutation($id: ID!, $input: AsignacionInput!) {
          updateAsignacion(id: $id, input: $input) {
            id
            queja_id
            queja { id descripcion }
            soporte_id
            soporte { id nombre }
            fecha_asignacion
            atendida
          }
        }
      `,
      variables: { id, input: asignacion }
    }).pipe(map(result => result.data!.updateAsignacion));
  }

  delete(id: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteAsignacion: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteAsignacion(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => result.data!.deleteAsignacion));
  }
}