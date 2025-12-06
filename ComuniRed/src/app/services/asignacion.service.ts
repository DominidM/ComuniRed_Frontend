import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Queja, Usuario } from './models';

// Unified Asignacion type using string ids (matches GraphQL / backend)
export interface Asignacion {
  id: string;
  quejaId?: string;
  queja?: Queja;
  soporteId?: string;
  soporte?: Usuario;
  fechaAsignacion?: string;
  fechaActualizacion?: string;
  atendida?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  constructor(private apollo: Apollo) {}

  // existing methods (kept for compatibility)
  getAll(): Observable<Asignacion[]> {
    return this.apollo.query<{ asignaciones: Asignacion[] }>({
      query: gql`
        query {
          asignaciones {
            id
            quejaId
            queja { id descripcion }
            soporteId
            soporte { id nombre apellido }
            fechaAsignacion
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
            quejaId
            queja { id descripcion }
            soporteId
            soporte { id nombre apellido }
            fechaAsignacion
            atendida
          }
        }
      `,
      variables: { input: asignacion }
    }).pipe(map(result => result.data!.createAsignacion));
  }

  update(id: string, asignacion: Partial<Asignacion>): Observable<Asignacion> {
    return this.apollo.mutate<{ updateAsignacion: Asignacion }>({
      mutation: gql`
        mutation($id: ID!, $input: AsignacionInput!) {
          updateAsignacion(id: $id, input: $input) {
            id
            quejaId
            queja { id descripcion }
            soporteId
            soporte { id nombre apellido }
            fechaAsignacion
            atendida
          }
        }
      `,
      variables: { id, input: asignacion }
    }).pipe(map(result => result.data!.updateAsignacion));
  }

  delete(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteAsignacion: boolean }>({
      mutation: gql`
        mutation($id: ID!) {
          deleteAsignacion(id: $id)
        }
      `,
      variables: { id }
    }).pipe(map(result => !!result.data?.deleteAsignacion));
  }

  // New: mutation that your component calls: asignarQueja(...)
  asignarQueja(quejaId: string, soporteId: string, asignadoPor: string, comentarios?: string): Observable<Asignacion> {
    const ASIGNAR_QUEJA = gql`
      mutation AsignarQueja($quejaId: ID!, $soporteId: ID!, $asignadoPor: ID!, $comentarios: String) {
        asignarQueja(quejaId: $quejaId, soporteId: $soporteId, asignadoPor: $asignadoPor, comentarios: $comentarios) {
          id
          quejaId
          queja { id descripcion }
          soporteId
          soporte { id nombre apellido }
          fechaAsignacion
          fechaActualizacion
          atendida
        }
      }
    `;

    return this.apollo.mutate<{ asignarQueja: Asignacion }>({
      mutation: ASIGNAR_QUEJA,
      variables: { quejaId, soporteId, asignadoPor, comentarios }
    }).pipe(map(r => r.data!.asignarQueja));
  }

  // New: query to get assignments for a queja
  obtenerAsignacionesPorQueja(quejaId: string): Observable<Asignacion[]> {
    const ASIG_POR_QUEJA = gql`
      query AsignacionesPorQueja($quejaId: ID!) {
        asignacionesPorQueja(quejaId: $quejaId) {
          id
          quejaId
          queja { id descripcion }
          soporteId
          soporte { id nombre apellido }
          fechaAsignacion
          fechaActualizacion
          atendida
        }
      }
    `;
    return this.apollo.watchQuery<{ asignacionesPorQueja: Asignacion[] }>({
      query: ASIG_POR_QUEJA,
      variables: { quejaId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(map(r => r.data.asignacionesPorQueja));
  }
}