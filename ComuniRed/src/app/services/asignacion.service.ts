import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Queja, Usuario } from './models';


export interface Asignacion {
  id: string;
  queja_id: string;
  queja?: Queja;
  soporte_id: string;
  soporte?: Usuario;
  asignado_por_id: string;
  asignado_por?: Usuario;
  estado: string;
  fecha_asignacion: string;
  fecha_actualizacion?: string;
  observacion?: string;
}


const GET_ASIGNACIONES_POR_SOPORTE = gql`
  query AsignacionesPorSoporte($soporteId: ID!) {
    asignacionesPorSoporte(soporteId: $soporteId) {
      id
      queja_id
      soporte_id
      asignado_por_id
      estado
      fecha_asignacion
      fecha_actualizacion
      observacion
    }
  }
`;

const GET_ASIGNACIONES_ACTIVAS = gql`
  query AsignacionesActivas {
    asignacionesActivas {
      id
      queja_id
      soporte_id
      asignado_por_id
      estado
      fecha_asignacion
      fecha_actualizacion
      observacion
    }
  }
`;

const GET_ASIGNACION_POR_ID = gql`
  query AsignacionPorId($id: ID!) {
    asignacionPorId(id: $id) {
      id
      queja_id
      soporte_id
      asignado_por_id
      estado
      fecha_asignacion
      fecha_actualizacion
      observacion
    }
  }
`;

const ASIGNAR_QUEJA = gql`
  mutation AsignarQueja(
    $quejaId: ID!
    $soporteId: ID!
    $adminId: ID!
    $observacion: String
  ) {
    asignarQueja(
      quejaId: $quejaId
      soporteId: $soporteId
      adminId: $adminId
      observacion: $observacion
    ) {
      id
      queja_id
      soporte_id
      asignado_por_id
      estado
      fecha_asignacion
      observacion
    }
  }
`;

const REASIGNAR_QUEJA = gql`
  mutation ReasignarQueja(
    $asignacionId: ID!
    $nuevoSoporteId: ID!
    $adminId: ID!
    $motivo: String
  ) {
    reasignarQueja(
      asignacionId: $asignacionId
      nuevoSoporteId: $nuevoSoporteId
      adminId: $adminId
      motivo: $motivo
    ) {
      id
      soporte_id
      estado
      observacion
      fecha_actualizacion
    }
  }
`;

const CAMBIAR_ESTADO_ASIGNACION = gql`
  mutation CambiarEstadoAsignacion(
    $asignacionId: ID!
    $nuevoEstado: String!
    $soporteId: ID!
  ) {
    cambiarEstadoAsignacion(
      asignacionId: $asignacionId
      nuevoEstado: $nuevoEstado
      soporteId: $soporteId
    ) {
      id
      estado
      fecha_actualizacion
    }
  }
`;


@Injectable({ providedIn: 'root' })
export class AsignacionService {
  constructor(private apollo: Apollo) {}

  obtenerAsignacionesPorSoporte(soporteId: string): Observable<Asignacion[]> {
    return this.apollo
      .watchQuery<{ asignacionesPorSoporte: Asignacion[] }>({
        query: GET_ASIGNACIONES_POR_SOPORTE,
        variables: { soporteId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => {
          console.log('📥 Asignaciones del soporte:', result.data.asignacionesPorSoporte);
          return result.data.asignacionesPorSoporte;
        })
      );
  }

  obtenerAsignacionesActivas(): Observable<Asignacion[]> {
    return this.apollo
      .watchQuery<{ asignacionesActivas: Asignacion[] }>({
        query: GET_ASIGNACIONES_ACTIVAS,
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => {
          console.log('📥 Asignaciones activas:', result.data.asignacionesActivas);
          return result.data.asignacionesActivas;
        })
      );
  }

  obtenerAsignacionPorId(id: string): Observable<Asignacion> {
    return this.apollo
      .watchQuery<{ asignacionPorId: Asignacion }>({
        query: GET_ASIGNACION_POR_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => {
          console.log('📥 Asignación recibida:', result.data.asignacionPorId);
          return result.data.asignacionPorId;
        })
      );
  }

  asignarQueja(
    quejaId: string,
    soporteId: string,
    adminId: string,
    observacion?: string
  ): Observable<Asignacion> {
    return this.apollo
      .mutate<{ asignarQueja: Asignacion }>({
        mutation: ASIGNAR_QUEJA,
        variables: { quejaId, soporteId, adminId, observacion },
        refetchQueries: [
          { query: GET_ASIGNACIONES_ACTIVAS },
          { query: GET_ASIGNACIONES_POR_SOPORTE, variables: { soporteId } }
        ]
      })
      .pipe(
        map(result => {
          console.log('✅ Queja asignada:', result.data!.asignarQueja);
          return result.data!.asignarQueja;
        })
      );
  }

  reasignarQueja(
    asignacionId: string,
    nuevoSoporteId: string,
    adminId: string,
    motivo?: string
  ): Observable<Asignacion> {
    return this.apollo
      .mutate<{ reasignarQueja: Asignacion }>({
        mutation: REASIGNAR_QUEJA,
        variables: { asignacionId, nuevoSoporteId, adminId, motivo },
        refetchQueries: [
          { query: GET_ASIGNACIONES_ACTIVAS }
        ]
      })
      .pipe(
        map(result => {
          console.log('✅ Queja reasignada:', result.data!.reasignarQueja);
          return result.data!.reasignarQueja;
        })
      );
  }

  cambiarEstadoAsignacion(
    asignacionId: string,
    nuevoEstado: string,
    soporteId: string
  ): Observable<Asignacion> {
    return this.apollo
      .mutate<{ cambiarEstadoAsignacion: Asignacion }>({
        mutation: CAMBIAR_ESTADO_ASIGNACION,
        variables: { asignacionId, nuevoEstado, soporteId },
        refetchQueries: [
          { query: GET_ASIGNACIONES_POR_SOPORTE, variables: { soporteId } },
          { query: GET_ASIGNACIONES_ACTIVAS }
        ]
      })
      .pipe(
        map(result => {
          console.log('✅ Estado de asignación cambiado:', result.data!.cambiarEstadoAsignacion);
          return result.data!.cambiarEstadoAsignacion;
        })
      );
  }

  filtrarPorEstado(asignaciones: Asignacion[], estado: string): Asignacion[] {
    return asignaciones.filter(a => a.estado === estado);
  }

  obtenerPendientes(asignaciones: Asignacion[]): Asignacion[] {
    return this.filtrarPorEstado(asignaciones, 'PENDIENTE');
  }

  obtenerEnProceso(asignaciones: Asignacion[]): Asignacion[] {
    return this.filtrarPorEstado(asignaciones, 'EN_PROCESO');
  }

  obtenerCompletadas(asignaciones: Asignacion[]): Asignacion[] {
    return this.filtrarPorEstado(asignaciones, 'COMPLETADA');
  }

  esActiva(asignacion: Asignacion): boolean {
    return asignacion.estado !== 'COMPLETADA' && asignacion.estado !== 'CANCELADA';
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-warning';
      case 'EN_PROCESO':
        return 'badge-info';
      case 'COMPLETADA':
        return 'badge-success';
      case 'CANCELADA':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_PROCESO':
        return 'En Proceso';
      case 'COMPLETADA':
        return 'Completada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  }
}
