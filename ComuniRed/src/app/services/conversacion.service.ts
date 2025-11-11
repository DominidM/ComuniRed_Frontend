import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Mensaje {
  id: string;
  conversacionId: string;
  emisorId: string;
  contenido: string;
  fechaEnvio: string;
  leido: boolean;
  fechaLectura?: string;
}

export interface Conversacion {
  id: string;
  participante1Id: string;
  participante2Id: string;
  ultimoMensaje?: Mensaje;
  fechaCreacion: string;
  fechaUltimaActividad: string;
}

export interface ConversacionPage {
  content: Conversacion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MensajePage {
  content: Mensaje[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConversacionService {

  constructor(private apollo: Apollo) {}

  // ========================================
  // QUERIES - CONVERSACIONES CON LOGS
  // ========================================

  misConversaciones(usuarioId: string, page: number = 0, size: number = 20): Observable<ConversacionPage> {
    const query = gql`
      query MisConversaciones($usuarioId: ID!, $page: Int!, $size: Int!) {
        misConversaciones(usuarioId: $usuarioId, page: $page, size: $size) {
          content {
            id
            participante1Id
            participante2Id
            ultimoMensaje {
              id
              contenido
              emisorId
              fechaEnvio
              leido
            }
            fechaCreacion
            fechaUltimaActividad
          }
          totalElements
          totalPages
          number
          size
        }
      }
    `;

    console.log('🔍 [ConversacionService] Ejecutando query con:', { usuarioId, page, size });

    return this.apollo.query<{ misConversaciones: ConversacionPage }>({
      query,
      variables: { usuarioId, page, size },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        console.log('✅ [ConversacionService] Resultado Apollo completo:', result);
        console.log('✅ [ConversacionService] Data:', result.data);
        console.log('✅ [ConversacionService] misConversaciones:', result.data.misConversaciones);
        console.log('✅ [ConversacionService] Content array:', result.data.misConversaciones?.content);
        console.log('✅ [ConversacionService] Total elements:', result.data.misConversaciones?.totalElements);
        return result.data.misConversaciones;
      })
    );
  }

  obtenerConversacion(conversacionId: string): Observable<Conversacion> {
    const query = gql`
      query ObtenerConversacion($conversacionId: ID!) {
        obtenerConversacion(conversacionId: $conversacionId) {
          id
          participante1Id
          participante2Id
          ultimoMensaje {
            id
            contenido
            emisorId
            fechaEnvio
            leido
          }
          fechaCreacion
          fechaUltimaActividad
        }
      }
    `;

    return this.apollo.query<{ obtenerConversacion: Conversacion }>({
      query,
      variables: { conversacionId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.obtenerConversacion)
    );
  }

  buscarConversacionConUsuario(usuarioId: string, otroUsuarioId: string): Observable<Conversacion | null> {
    const query = gql`
      query BuscarConversacionConUsuario($usuarioId: ID!, $otroUsuarioId: ID!) {
        buscarConversacionConUsuario(usuarioId: $usuarioId, otroUsuarioId: $otroUsuarioId) {
          id
          participante1Id
          participante2Id
          ultimoMensaje {
            id
            contenido
            emisorId
            fechaEnvio
            leido
          }
          fechaCreacion
          fechaUltimaActividad
        }
      }
    `;

    return this.apollo.query<{ buscarConversacionConUsuario: Conversacion | null }>({
      query,
      variables: { usuarioId, otroUsuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.buscarConversacionConUsuario)
    );
  }

  mensajesDeConversacion(conversacionId: string, page: number = 0, size: number = 50): Observable<MensajePage> {
    const query = gql`
      query MensajesDeConversacion($conversacionId: ID!, $page: Int!, $size: Int!) {
        mensajesDeConversacion(conversacionId: $conversacionId, page: $page, size: $size) {
          content {
            id
            conversacionId
            emisorId
            contenido
            fechaEnvio
            leido
            fechaLectura
          }
          totalElements
          totalPages
          number
          size
        }
      }
    `;

    return this.apollo.query<{ mensajesDeConversacion: MensajePage }>({
      query,
      variables: { conversacionId, page, size },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.mensajesDeConversacion)
    );
  }

  contarMensajesNoLeidos(conversacionId: string, usuarioId: string): Observable<number> {
    const query = gql`
      query ContarMensajesNoLeidos($conversacionId: ID!, $usuarioId: ID!) {
        contarMensajesNoLeidos(conversacionId: $conversacionId, usuarioId: $usuarioId)
      }
    `;

    return this.apollo.query<{ contarMensajesNoLeidos: number }>({
      query,
      variables: { conversacionId, usuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.contarMensajesNoLeidos)
    );
  }

  crearConversacion(usuarioId: string, otroUsuarioId: string): Observable<Conversacion> {
    const mutation = gql`
      mutation CrearConversacion($usuarioId: ID!, $otroUsuarioId: ID!) {
        crearConversacion(usuarioId: $usuarioId, otroUsuarioId: $otroUsuarioId) {
          id
          participante1Id
          participante2Id
          fechaCreacion
          fechaUltimaActividad
        }
      }
    `;

    return this.apollo.mutate<{ crearConversacion: Conversacion }>({
      mutation,
      variables: { usuarioId, otroUsuarioId }
    }).pipe(
      map(result => result.data!.crearConversacion)
    );
  }

  eliminarConversacion(conversacionId: string, usuarioId: string): Observable<boolean> {
    const mutation = gql`
      mutation EliminarConversacion($conversacionId: ID!, $usuarioId: ID!) {
        eliminarConversacion(conversacionId: $conversacionId, usuarioId: $usuarioId)
      }
    `;

    return this.apollo.mutate<{ eliminarConversacion: boolean }>({
      mutation,
      variables: { conversacionId, usuarioId }
    }).pipe(
      map(result => result.data!.eliminarConversacion)
    );
  }

  enviarMensaje(conversacionId: string, emisorId: string, contenido: string): Observable<Mensaje> {
    const mutation = gql`
      mutation EnviarMensaje($conversacionId: ID!, $emisorId: ID!, $contenido: String!) {
        enviarMensaje(conversacionId: $conversacionId, emisorId: $emisorId, contenido: $contenido) {
          id
          conversacionId
          emisorId
          contenido
          fechaEnvio
          leido
          fechaLectura
        }
      }
    `;

    return this.apollo.mutate<{ enviarMensaje: Mensaje }>({
      mutation,
      variables: { conversacionId, emisorId, contenido }
    }).pipe(
      map(result => result.data!.enviarMensaje)
    );
  }

  marcarMensajesComoLeidos(conversacionId: string, usuarioId: string): Observable<boolean> {
    const mutation = gql`
      mutation MarcarMensajesComoLeidos($conversacionId: ID!, $usuarioId: ID!) {
        marcarMensajesComoLeidos(conversacionId: $conversacionId, usuarioId: $usuarioId)
      }
    `;

    return this.apollo.mutate<{ marcarMensajesComoLeidos: boolean }>({
      mutation,
      variables: { conversacionId, usuarioId }
    }).pipe(
      map(result => result.data!.marcarMensajesComoLeidos)
    );
  }

  seSiguenMutuamente(usuarioId1: string, usuarioId2: string): Observable<boolean> {
    const query = gql`
      query SeSiguenMutuamente($usuarioId1: ID!, $usuarioId2: ID!) {
        seSiguenMutuamente(usuarioId1: $usuarioId1, usuarioId2: $usuarioId2)
      }
    `;

    return this.apollo.query<{ seSiguenMutuamente: boolean }>({
      query,
      variables: { usuarioId1, usuarioId2 },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.seSiguenMutuamente)
    );
  }

  obtenerOCrearConversacion(usuarioId: string, otroUsuarioId: string): Observable<Conversacion> {
    return new Observable(observer => {
      this.buscarConversacionConUsuario(usuarioId, otroUsuarioId).subscribe({
        next: (conversacion) => {
          if (conversacion) {
            observer.next(conversacion);
            observer.complete();
          } else {
            this.crearConversacion(usuarioId, otroUsuarioId).subscribe({
              next: (nuevaConversacion) => {
                observer.next(nuevaConversacion);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
