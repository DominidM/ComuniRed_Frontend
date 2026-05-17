import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  referenciaId?: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

export interface NotificacionPage {
  content: Notificacion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private apollo: Apollo) {}

  misNotificaciones(
    usuarioId: string,
    page: number = 0,
    size: number = 20,
  ): Observable<NotificacionPage> {
    return this.apollo
      .query<{ misNotificaciones: NotificacionPage }>({
        query: gql`
          query MisNotificaciones($usuarioId: ID!, $page: Int!, $size: Int!) {
            misNotificaciones(usuarioId: $usuarioId, page: $page, size: $size) {
              content {
                id
                usuarioId
                tipo
                titulo
                cuerpo
                referenciaId
                leida
                fechaCreacion
                fechaLectura
              }
              totalElements
              totalPages
              number
              size
            }
          }
        `,
        variables: { usuarioId, page, size },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data.misNotificaciones));
  }

  contarNoLeidas(usuarioId: string): Observable<number> {
    return this.apollo
      .query<{ contarNotificacionesNoLeidas: number }>({
        query: gql`
          query ContarNotificacionesNoLeidas($usuarioId: ID!) {
            contarNotificacionesNoLeidas(usuarioId: $usuarioId)
          }
        `,
        variables: { usuarioId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data.contarNotificacionesNoLeidas));
  }

  marcarLeida(id: string): Observable<Notificacion> {
    return this.apollo
      .mutate<{ marcarNotificacionLeida: Notificacion }>({
        mutation: gql`
          mutation MarcarNotificacionLeida($id: ID!) {
            marcarNotificacionLeida(id: $id) {
              id
              leida
              fechaLectura
            }
          }
        `,
        variables: { id },
      })
      .pipe(map((r) => r.data!.marcarNotificacionLeida));
  }

  marcarTodasLeidas(usuarioId: string): Observable<boolean> {
    return this.apollo
      .mutate<{ marcarTodasNotificacionesLeidas: boolean }>({
        mutation: gql`
          mutation MarcarTodasNotificacionesLeidas($usuarioId: ID!) {
            marcarTodasNotificacionesLeidas(usuarioId: $usuarioId)
          }
        `,
        variables: { usuarioId },
      })
      .pipe(map((r) => r.data!.marcarTodasNotificacionesLeidas));
  }

  suscribirseANotificaciones(usuarioId: string): Observable<Notificacion> {
    return this.apollo
      .subscribe<{ nuevaNotificacion: Notificacion }>({
        query: gql`
          subscription NuevaNotificacion($usuarioId: ID!) {
            nuevaNotificacion(usuario_id: $usuarioId) {
              id
              usuarioId
              tipo
              titulo
              cuerpo
              referenciaId
              leida
              fechaCreacion
            }
          }
        `,
        variables: { usuarioId },
      })
      .pipe(map((r) => r.data!.nuevaNotificacion));
  }
}
