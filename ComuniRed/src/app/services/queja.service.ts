import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Queja {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion?: string;
  imagen_url?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  nivel_riesgo?: string;
  fecha_clasificacion?: string;
  clasificado_por_id?: string;
  usuario: Usuario;
  categoria: Categoria;
  estado?: EstadoQueja;
  evidence: Evidencia[];
  votes: VotesData;
  reactions: ReactionsData;
  comments: Comentario[];
  commentsCount: number;
  canVote: boolean;
  userVote?: string;
  showComments?: boolean;
  showMenu?: boolean;
  fue_editado?: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
  email?: string;
  rol?: Rol;
}

export interface Rol {
  id: string;
  nombre: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface EstadoQueja {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string;
}

export interface VotesData {
  yes: number;
  no: number;
  total: number;
}

export interface ReactionsData {
  counts: ReactionCounts;
  userReaction?: string;
  total: number;
}

export interface ReactionCounts {
  [key: string]: number;
}

export interface Comentario {
  id: string;
  queja_id: string;
  texto: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
  author: Usuario;
  showMenu?: boolean;
}

export interface Evidencia {
  id: string;
  queja_id: string;
  url: string;
  tipo: string;
  fecha_subida?: string;
}

export interface HistorialEvento {
  id: string;
  queja_id: string;
  tipo_evento: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  descripcion: string;
  fecha_evento: string;
  usuario_id: string;
}

// ✅ Query principal con TODOS los campos necesarios
const OBTENER_QUEJAS = gql`
  query ObtenerQuejas($usuarioActualId: ID!) {
    obtenerQuejas(usuarioActualId: $usuarioActualId) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      fecha_creacion
      nivel_riesgo
      fecha_clasificacion
      usuario {
        id
        nombre
        apellido
        foto_perfil
      }
      categoria {
        id
        nombre
      }
      estado {
        id
        clave
        nombre
      }
      evidence {
        id
        url
        tipo
      }
      votes {
        yes
        no
        total
      }
      reactions {
        total
        userReaction
        counts {
          like
          love
          wow
          helpful
          dislike
          report
        }
      }
      comments {
        id
        texto
        fecha_creacion
        author {
          id
          nombre
          apellido
          foto_perfil
        }
      }
      commentsCount
      canVote
      userVote
    }
  }
`;

const OBTENER_QUEJA_POR_ID = gql`
  query ObtenerQuejaPorId($id: ID!, $usuarioActualId: ID!) {
    obtenerQuejaPorId(id: $id, usuarioActualId: $usuarioActualId) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      fecha_creacion
      nivel_riesgo
      fecha_clasificacion
      clasificado_por_id
      usuario {
        id
        nombre
        apellido
        foto_perfil
      }
      categoria {
        id
        nombre
        descripcion
      }
      estado {
        id
        clave
        nombre
      }
      evidence {
        id
        url
        tipo
        fecha_subida
      }
      votes {
        yes
        no
        total
      }
      reactions {
        total
        userReaction
        counts {
          like
          love
          wow
          helpful
          dislike
          report
        }
      }
      comments {
        id
        texto
        fecha_creacion
        author {
          id
          nombre
          apellido
          foto_perfil
        }
      }
      commentsCount
      canVote
      userVote
    }
  }
`;


const QUEJAS_POR_USUARIO = gql`
  query QuejasPorUsuario($usuarioId: ID!, $usuarioActualId: ID!) {
    quejasPorUsuario(usuarioId: $usuarioId, usuarioActualId: $usuarioActualId) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      fecha_creacion
      fecha_actualizacion
      nivel_riesgo
      usuario {
        id
        nombre
        apellido
        foto_perfil
      }
      categoria {
        id
        nombre
        descripcion
      }
      estado {
        id
        clave
        nombre
      }
      evidence {
        id
        url
        tipo
      }
      votes {
        yes
        no
        total
      }
      reactions {
        total
        userReaction
        counts {
          like
          love
          wow
          helpful
          dislike
          report
        }
      }
      commentsCount
      canVote
      userVote
    }
  }
`;

const QUEJAS_APROBADAS = gql`
  query QuejasAprobadas($usuarioActualId: ID!) {
    quejasAprobadas(usuarioActualId: $usuarioActualId) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      fecha_creacion
      nivel_riesgo
      usuario {
        id
        nombre
        apellido
        foto_perfil
      }
      categoria {
        id
        nombre
      }
      estado {
        id
        clave
        nombre
      }
      evidence {
        id
        url
        tipo
      }
      votes {
        yes
        no
        total
      }
      reactions {
        total
        userReaction
        counts {
          like
          love
          wow
          helpful
          dislike
          report
        }
      }
      comments {
        id
        texto
        fecha_creacion
        author {
          id
          nombre
          apellido
          foto_perfil
        }
      }
      commentsCount
      canVote
      userVote
    }
  }
`;

const HISTORIAL_POR_QUEJA = gql`
  query HistorialPorQueja($quejaId: ID!) {
    historialPorQueja(quejaId: $quejaId) {
      id
      queja_id
      tipo_evento
      estado_anterior
      estado_nuevo
      descripcion
      fecha_evento
      usuario_id
    }
  }
`;

const CREAR_QUEJA = gql`
  mutation CrearQueja(
    $titulo: String!
    $descripcion: String!
    $categoriaId: ID!
    $ubicacion: String
    $usuarioId: ID!
  ) {
    crearQueja(
      titulo: $titulo
      descripcion: $descripcion
      categoriaId: $categoriaId
      ubicacion: $ubicacion
      usuarioId: $usuarioId
    ) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      usuario {
        id
        nombre
        apellido
      }
      categoria {
        id
        nombre
      }
      estado {
        id
        nombre
        clave
      }
    }
  }
`;

const ACTUALIZAR_QUEJA = gql`
  mutation ActualizarQueja(
    $id: ID!
    $titulo: String
    $descripcion: String
    $categoriaId: ID
    $estadoId: ID
    $ubicacion: String
    $imagen_url: String
  ) {
    actualizarQueja(
      id: $id
      titulo: $titulo
      descripcion: $descripcion
      categoriaId: $categoriaId
      estadoId: $estadoId
      ubicacion: $ubicacion
      imagen_url: $imagen_url
    ) {
      id
      titulo
      descripcion
      ubicacion
      imagen_url
      usuario {
        id
        nombre
        apellido
      }
      categoria {
        id
        nombre
      }
      estado {
        id
        clave
        nombre
      }
    }
  }
`;

const ELIMINAR_QUEJA = gql`
  mutation EliminarQueja($id: ID!) {
    eliminarQueja(id: $id)
  }
`;

const CLASIFICAR_RIESGO = gql`
  mutation ClasificarRiesgo(
    $quejaId: ID!
    $soporteId: ID!
    $nivelRiesgo: String!
    $observacion: String
  ) {
    clasificarRiesgo(
      quejaId: $quejaId
      soporteId: $soporteId
      nivelRiesgo: $nivelRiesgo
      observacion: $observacion
    ) {
      id
      titulo
      nivel_riesgo
      fecha_clasificacion
      clasificado_por_id
      estado {
        clave
        nombre
      }
    }
  }
`;

const CAMBIAR_ESTADO_QUEJA = gql`
  mutation CambiarEstadoQueja(
    $quejaId: ID!
    $usuarioId: ID!
    $nuevoEstado: String!
    $observacion: String
  ) {
    cambiarEstadoQueja(
      quejaId: $quejaId
      usuarioId: $usuarioId
      nuevoEstado: $nuevoEstado
      observacion: $observacion
    ) {
      id
      titulo
      estado {
        clave
        nombre
      }
    }
  }
`;

const VOTAR_QUEJA = gql`
  mutation VotarQueja($quejaId: ID!, $usuarioId: ID!, $voto: String!) {
    votarQueja(quejaId: $quejaId, usuarioId: $usuarioId, voto: $voto) {
      id
      titulo
      descripcion
      votes {
        yes
        no
        total
      }
      userVote
      canVote
      estado {
        id
        nombre
        clave
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class QuejaService {
  constructor(private apollo: Apollo) {}

  obtenerQuejas(usuarioActualId: string): Observable<Queja[]> {
    return this.apollo
      .watchQuery<{ obtenerQuejas: Queja[] }>({
        query: OBTENER_QUEJAS,
        variables: { usuarioActualId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.obtenerQuejas)
      );
  }

  obtenerQuejaPorId(id: string, usuarioActualId: string): Observable<Queja> {
    return this.apollo
      .watchQuery<{ obtenerQuejaPorId: Queja }>({
        query: OBTENER_QUEJA_POR_ID,
        variables: { id, usuarioActualId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.obtenerQuejaPorId)
      );
  }

  quejasPorUsuario(usuarioId: string, usuarioActualId: string): Observable<Queja[]> {
    return this.apollo
      .watchQuery<{ quejasPorUsuario: Queja[] }>({
        query: QUEJAS_POR_USUARIO,
        variables: { usuarioId, usuarioActualId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.quejasPorUsuario)
      );
  }

  obtenerQuejasAprobadas(usuarioActualId: string): Observable<Queja[]> {
    return this.apollo
      .watchQuery<{ quejasAprobadas: Queja[] }>({
        query: QUEJAS_APROBADAS,
        variables: { usuarioActualId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.quejasAprobadas)
      );
  }

  async subirImagenCloudinary(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', 'quejas');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/da4wxtjwu/image/upload',
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.secure_url;
  }

  crearQueja(
    titulo: string,
    descripcion: string,
    categoriaId: string,
    usuarioId: string,
    ubicacion?: string,
    imagen?: File
  ): Observable<Queja> {
    if (imagen) {
      return new Observable<Queja>(observer => {
        this.subirImagenCloudinary(imagen)
          .then(imagenUrl => {
            const createVars: any = { titulo, descripcion, categoriaId, usuarioId };
            if (ubicacion) createVars.ubicacion = ubicacion;

            return this.apollo.mutate<{ crearQueja: Queja }>({
              mutation: CREAR_QUEJA,
              variables: createVars
            }).toPromise()
              .then(result => {
                const queja = result?.data?.crearQueja;
                if (!queja) throw new Error('No se pudo crear la queja');
                return this.apollo.mutate<{ actualizarQueja: Queja }>({
                  mutation: ACTUALIZAR_QUEJA,
                  variables: { id: queja.id, imagen_url: imagenUrl },
                  refetchQueries: [
                    { query: OBTENER_QUEJAS, variables: { usuarioActualId: usuarioId } }
                  ]
                }).toPromise();
              });
          })
          .then(result => {
            const quejaFinal = result?.data?.actualizarQueja;
            if (!quejaFinal) throw new Error('No se pudo actualizar la imagen');
            observer.next(quejaFinal);
            observer.complete();
          })
          .catch(error => observer.error(error));
      });
    }

    const variables: any = { titulo, descripcion, categoriaId, usuarioId };
    if (ubicacion) variables.ubicacion = ubicacion;

    return this.apollo
      .mutate<{ crearQueja: Queja }>({
        mutation: CREAR_QUEJA,
        variables,
        refetchQueries: [
          { query: OBTENER_QUEJAS, variables: { usuarioActualId: usuarioId } }
        ]
      })
      .pipe(map(result => result.data!.crearQueja));
  }

  actualizarQueja(
    id: string,
    titulo?: string,
    descripcion?: string,
    categoriaId?: string,
    estadoId?: string,
    ubicacion?: string,
    usuarioActualId?: string
  ): Observable<Queja> {
    return this.apollo
      .mutate<{ actualizarQueja: Queja }>({
        mutation: ACTUALIZAR_QUEJA,
        variables: { id, titulo, descripcion, categoriaId, estadoId, ubicacion },
        refetchQueries: usuarioActualId ? [
          { query: OBTENER_QUEJAS, variables: { usuarioActualId } }
        ] : []
      })
      .pipe(map(result => result.data!.actualizarQueja));
  }

  eliminarQueja(id: string, usuarioActualId?: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarQueja: boolean }>({
        mutation: ELIMINAR_QUEJA,
        variables: { id },
        refetchQueries: usuarioActualId ? [
          { query: OBTENER_QUEJAS, variables: { usuarioActualId } }
        ] : []
      })
      .pipe(map(result => result.data?.eliminarQueja ?? false));
  }

  clasificarRiesgo(
    quejaId: string,
    soporteId: string,
    nivelRiesgo: string,
    observacion?: string
  ): Observable<Queja> {
    return this.apollo
      .mutate<{ clasificarRiesgo: Queja }>({
        mutation: CLASIFICAR_RIESGO,
        variables: { quejaId, soporteId, nivelRiesgo, observacion }
      })
      .pipe(map(result => result.data!.clasificarRiesgo));
  }

  cambiarEstadoQueja(
    quejaId: string,
    usuarioId: string,
    nuevoEstado: string,
    observacion?: string
  ): Observable<Queja> {
    return this.apollo
      .mutate<{ cambiarEstadoQueja: Queja }>({
        mutation: CAMBIAR_ESTADO_QUEJA,
        variables: { quejaId, usuarioId, nuevoEstado, observacion }
      })
      .pipe(map(result => result.data!.cambiarEstadoQueja));
  }

  obtenerHistorialPorQueja(quejaId: string): Observable<HistorialEvento[]> {
    return this.apollo
      .watchQuery<{ historialPorQueja: HistorialEvento[] }>({
        query: HISTORIAL_POR_QUEJA,
        variables: { quejaId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => result.data.historialPorQueja)
      );
  }

  votarQueja(quejaId: string, usuarioId: string, voto: string): Observable<Queja> {
    return this.apollo
      .mutate<{ votarQueja: Queja }>({
        mutation: VOTAR_QUEJA,
        variables: { quejaId, usuarioId, voto },
        refetchQueries: [
          { query: OBTENER_QUEJAS, variables: { usuarioActualId: usuarioId } }
        ]
      })
      .pipe(map(result => result.data!.votarQueja));
  }
}
