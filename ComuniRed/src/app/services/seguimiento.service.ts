import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { Usuario, UsuarioPage } from './usuario.service';

// ========================================
// INTERFACES
// ========================================

export interface EstadoSeguimiento {
  estaSiguiendo: boolean;
  teSigue: boolean;
  seguimientoMutuo: boolean;
  solicitudPendiente: boolean;
  solicitudEnviada: boolean;
}

export interface Seguimiento {
  id: string;
  seguidorId: string;
  seguidoId: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  fechaSeguimiento: string;
  fechaRespuesta?: string;
  notificacionesActivas: boolean;
}

export interface SeguimientoPage {
  content: Seguimiento[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ========================================
// QUERIES
// ========================================

const USUARIOS_SUGERIDOS = gql`
  query UsuariosSugeridos($usuarioId: ID!, $page: Int!, $size: Int!) {
    usuariosSugeridos(usuarioId: $usuarioId, page: $page, size: $size) {
      content {
        id foto_perfil nombre apellido email distrito fecha_nacimiento
      }
      totalElements totalPages number size
    }
  }
`;

const BUSCAR_USUARIOS = gql`
  query BuscarUsuarios($termino: String!, $page: Int!, $size: Int!) {
    buscarUsuarios(termino: $termino, page: $page, size: $size) {
      content {
        id foto_perfil nombre apellido email distrito fecha_nacimiento
      }
      totalElements totalPages number size
    }
  }
`;

const ESTADO_SEGUIMIENTO = gql`
  query EstadoSeguimiento($usuarioActualId: ID!, $otroUsuarioId: ID!) {
    estadoSeguimiento(usuarioActualId: $usuarioActualId, otroUsuarioId: $otroUsuarioId) {
      estaSiguiendo teSigue seguimientoMutuo
      solicitudPendiente solicitudEnviada
    }
  }
`;

const SEGUIDORES_DE = gql`
  query SeguidoresDe($usuarioId: ID!, $page: Int!, $size: Int!) {
    seguidoresDe(usuarioId: $usuarioId, page: $page, size: $size) {
      content {
        id seguidorId seguidoId estado fechaSeguimiento
      }
      totalElements totalPages number size
    }
  }
`;

const SEGUIDOS_POR = gql`
  query SeguidosPor($usuarioId: ID!, $page: Int!, $size: Int!) {
    seguidosPor(usuarioId: $usuarioId, page: $page, size: $size) {
      content {
        id seguidorId seguidoId estado fechaSeguimiento
      }
      totalElements totalPages number size
    }
  }
`;

const SOLICITUDES_PENDIENTES = gql`
  query SolicitudesPendientes($usuarioId: ID!, $page: Int!, $size: Int!) {
    solicitudesPendientes(usuarioId: $usuarioId, page: $page, size: $size) {
      content {
        id seguidorId seguidoId estado fechaSeguimiento
      }
      totalElements totalPages number size
    }
  }
`;

const SOLICITUDES_ENVIADAS = gql`
  query SolicitudesEnviadas($usuarioId: ID!, $page: Int!, $size: Int!) {
    solicitudesEnviadas(usuarioId: $usuarioId, page: $page, size: $size) {
      content {
        id seguidorId seguidoId estado fechaSeguimiento
      }
      totalElements totalPages number size
    }
  }
`;

const CONTAR_SEGUIDORES = gql`
  query ContarSeguidores($usuarioId: ID!) {
    contarSeguidores(usuarioId: $usuarioId)
  }
`;

const CONTAR_SEGUIDOS = gql`
  query ContarSeguidos($usuarioId: ID!) {
    contarSeguidos(usuarioId: $usuarioId)
  }
`;

// ========================================
// MUTATIONS
// ========================================

const ENVIAR_SOLICITUD = gql`
  mutation EnviarSolicitud($seguidorId: ID!, $seguidoId: ID!) {
    enviarSolicitudSeguimiento(seguidorId: $seguidorId, seguidoId: $seguidoId) {
      id seguidorId seguidoId estado fechaSeguimiento notificacionesActivas
    }
  }
`;

const ACEPTAR_SOLICITUD = gql`
  mutation AceptarSolicitud($seguimientoId: ID!) {
    aceptarSolicitud(seguimientoId: $seguimientoId) {
      id seguidorId seguidoId estado fechaRespuesta
    }
  }
`;

const RECHAZAR_SOLICITUD = gql`
  mutation RechazarSolicitud($seguimientoId: ID!) {
    rechazarSolicitud(seguimientoId: $seguimientoId)
  }
`;

const CANCELAR_SOLICITUD = gql`
  mutation CancelarSolicitud($seguimientoId: ID!) {
    cancelarSolicitud(seguimientoId: $seguimientoId)
  }
`;

const DEJAR_DE_SEGUIR = gql`
  mutation DejarDeSeguir($seguidorId: ID!, $seguidoId: ID!) {
    dejarDeSeguir(seguidorId: $seguidorId, seguidoId: $seguidoId)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {

  constructor(private apollo: Apollo) {}

  // ========================================
  // BÚSQUEDA Y SUGERENCIAS
  // ========================================

  obtenerUsuariosSugeridos(usuarioId: string, page: number, size: number): Observable<UsuarioPage> {
    return this.apollo.watchQuery<{ usuariosSugeridos: UsuarioPage }>({
      query: USUARIOS_SUGERIDOS,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.usuariosSugeridos || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as UsuarioPage)
    );
  }

  buscarUsuarios(termino: string, page: number, size: number): Observable<UsuarioPage> {
    return this.apollo.watchQuery<{ buscarUsuarios: UsuarioPage }>({
      query: BUSCAR_USUARIOS,
      variables: { termino, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.buscarUsuarios || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as UsuarioPage)
    );
  }

  // ========================================
  // ESTADO DE SEGUIMIENTO
  // ========================================

  obtenerEstadoSeguimiento(usuarioActualId: string, otroUsuarioId: string): Observable<EstadoSeguimiento> {
    return this.apollo.watchQuery<{ estadoSeguimiento: EstadoSeguimiento }>({
      query: ESTADO_SEGUIMIENTO,
      variables: { usuarioActualId, otroUsuarioId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.estadoSeguimiento || {
        estaSiguiendo: false,
        teSigue: false,
        seguimientoMutuo: false,
        solicitudPendiente: false,
        solicitudEnviada: false
      })
    );
  }

  // ========================================
  // LISTAS DE SEGUIMIENTO
  // ========================================

  obtenerSeguidores(usuarioId: string, page: number, size: number): Observable<SeguimientoPage> {
    return this.apollo.watchQuery<{ seguidoresDe: SeguimientoPage }>({
      query: SEGUIDORES_DE,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.seguidoresDe || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as SeguimientoPage)
    );
  }

  obtenerSeguidos(usuarioId: string, page: number, size: number): Observable<SeguimientoPage> {
    return this.apollo.watchQuery<{ seguidosPor: SeguimientoPage }>({
      query: SEGUIDOS_POR,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.seguidosPor || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as SeguimientoPage)
    );
  }

  obtenerSolicitudesPendientes(usuarioId: string, page: number, size: number): Observable<SeguimientoPage> {
    return this.apollo.watchQuery<{ solicitudesPendientes: SeguimientoPage }>({
      query: SOLICITUDES_PENDIENTES,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.solicitudesPendientes || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as SeguimientoPage)
    );
  }

  obtenerSolicitudesEnviadas(usuarioId: string, page: number, size: number): Observable<SeguimientoPage> {
    return this.apollo.watchQuery<{ solicitudesEnviadas: SeguimientoPage }>({
      query: SOLICITUDES_ENVIADAS,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.solicitudesEnviadas || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as SeguimientoPage)
    );
  }

  contarSeguidores(usuarioId: string): Observable<number> {
    return this.apollo.watchQuery<{ contarSeguidores: number }>({
      query: CONTAR_SEGUIDORES,
      variables: { usuarioId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.contarSeguidores || 0)
    );
  }

  contarSeguidos(usuarioId: string): Observable<number> {
    return this.apollo.watchQuery<{ contarSeguidos: number }>({
      query: CONTAR_SEGUIDOS,
      variables: { usuarioId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.contarSeguidos || 0)
    );
  }

  // ========================================
  // ACCIONES DE SEGUIMIENTO
  // ========================================

  enviarSolicitud(seguidorId: string, seguidoId: string): Observable<Seguimiento> {
    return this.apollo.mutate<{ enviarSolicitudSeguimiento: Seguimiento }>({
      mutation: ENVIAR_SOLICITUD,
      variables: { seguidorId, seguidoId }
    }).pipe(
      map(result => result.data!.enviarSolicitudSeguimiento)
    );
  }

  aceptarSolicitud(seguimientoId: string): Observable<Seguimiento> {
    return this.apollo.mutate<{ aceptarSolicitud: Seguimiento }>({
      mutation: ACEPTAR_SOLICITUD,
      variables: { seguimientoId }
    }).pipe(
      map(result => result.data!.aceptarSolicitud)
    );
  }

  rechazarSolicitud(seguimientoId: string): Observable<boolean> {
    return this.apollo.mutate<{ rechazarSolicitud: boolean }>({
      mutation: RECHAZAR_SOLICITUD,
      variables: { seguimientoId }
    }).pipe(
      map(result => result.data?.rechazarSolicitud ?? false)
    );
  }

  cancelarSolicitud(seguimientoId: string): Observable<boolean> {
    return this.apollo.mutate<{ cancelarSolicitud: boolean }>({
      mutation: CANCELAR_SOLICITUD,
      variables: { seguimientoId }
    }).pipe(
      map(result => result.data?.cancelarSolicitud ?? false)
    );
  }

  dejarDeSeguir(seguidorId: string, seguidoId: string): Observable<boolean> {
    return this.apollo.mutate<{ dejarDeSeguir: boolean }>({
      mutation: DEJAR_DE_SEGUIR,
      variables: { seguidorId, seguidoId }
    }).pipe(
      map(result => result.data?.dejarDeSeguir ?? false)
    );
  }
}
