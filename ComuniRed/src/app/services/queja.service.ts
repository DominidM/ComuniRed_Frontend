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

const OBTENER_QUEJAS = gql`
  query ObtenerQuejas($usuarioActualId: ID!) {
    obtenerQuejas(usuarioActualId: $usuarioActualId) {
      id titulo descripcion ubicacion imagen_url fecha_creacion
      usuario { id nombre apellido foto_perfil }
      categoria { id nombre }
      estado { id nombre }
      evidence { id url tipo }
      votes { yes no total }
      reactions {
        total
        userReaction
        counts {
          like love wow helpful dislike report
        }
      }
      comments {
        id texto fecha_creacion
        author { id nombre apellido foto_perfil }
      }
      commentsCount canVote userVote
    }
  }
`;

const OBTENER_QUEJA_POR_ID = gql`
  query ObtenerQuejaPorId($id: ID!, $usuarioActualId: ID!) {
    obtenerQuejaPorId(id: $id, usuarioActualId: $usuarioActualId) {
      id titulo descripcion ubicacion imagen_url fecha_creacion
      usuario { id nombre apellido foto_perfil }
      categoria { id nombre descripcion }
      estado { id nombre }
      evidence { id url tipo }
      votes { yes no total }
      reactions {
        total
        userReaction
        counts {
          like love wow helpful dislike report
        }
      }
      comments {
        id texto fecha_creacion
        author { id nombre apellido foto_perfil }
      }
      commentsCount canVote userVote
    }
  }
`;

// ✅ Nueva query para obtener quejas por usuario
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

/*
  CREAR_QUEJA: sin imagen_url en variables, porque tu schema backend actual
  no acepta ese argumento (por eso daba UnknownArgument).
  Haremos CREATE sin imagen, y luego UPDATE con imagen_url.
*/
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
      id titulo descripcion ubicacion imagen_url
      usuario { id nombre apellido }
      categoria { id nombre }
    }
  }
`;

/* ACTUALIZAR_QUEJA ya acepta imagen_url (según tu schema actual),
   lo usaremos inmediatamente después de crear la queja. */
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
      id titulo descripcion ubicacion imagen_url
      usuario { id nombre apellido }
      categoria { id nombre }
      estado { id nombre }
    }
  }
`;

const ELIMINAR_QUEJA = gql`
  mutation EliminarQueja($id: ID!) {
    eliminarQueja(id: $id)
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
        map(result => {
          console.log('📥 Quejas recibidas:', result.data.obtenerQuejas);
          return result.data.obtenerQuejas;
        })
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
        map(result => {
          console.log('📥 Queja recibida:', result.data.obtenerQuejaPorId);
          return result.data.obtenerQuejaPorId;
        })
      );
  }

  // ✅ Nuevo método: Obtener quejas por usuario
  quejasPorUsuario(usuarioId: string, usuarioActualId: string): Observable<Queja[]> {
    return this.apollo
      .watchQuery<{ quejasPorUsuario: Queja[] }>({
        query: QUEJAS_POR_USUARIO,
        variables: { usuarioId, usuarioActualId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map(result => {
          console.log('📥 Quejas del usuario recibidas:', result.data.quejasPorUsuario);
          return result.data.quejasPorUsuario;
        })
      );
  }

  async subirImagenCloudinary(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', 'quejas');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/da4wxtjwu/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      console.log('✅ Imagen subida a Cloudinary:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('❌ Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }

  crearQueja(
    titulo: string,
    descripcion: string,
    categoriaId: string,
    usuarioId: string,
    ubicacion?: string,
    imagen?: File
  ): Observable<Queja> {
    // Si hay imagen: subimos primero, luego:
    // 1) creamos la queja (CREATE sin imagen_url)
    // 2) hacemos UPDATE para añadir imagen_url (porque el backend no acepta crearCon imagen_url)
    if (imagen) {
      return new Observable<Queja>(observer => {
        console.log('📤 Subiendo imagen a Cloudinary...');
        this.subirImagenCloudinary(imagen)
          .then(imagenUrl => {
            console.log('✅ Imagen subida:', imagenUrl);
            console.log('📤 Creando queja (sin imagen) ...');

            const createVars: any = {
              titulo,
              descripcion,
              categoriaId,
              usuarioId
            };
            if (ubicacion) createVars.ubicacion = ubicacion;

            return this.apollo.mutate<{ crearQueja: Queja }>({
              mutation: CREAR_QUEJA,
              variables: createVars
            }).toPromise()
              .then(result => {
                const queja = result?.data?.crearQueja;
                if (!queja) throw new Error('No se pudo crear la queja');
                // Ahora actualizamos con la imagen_url
                console.log('✅ Queja creada (id=' + queja.id + '), actualizando imagen_url ...');
                return this.apollo.mutate<{ actualizarQueja: Queja }>({
                  mutation: ACTUALIZAR_QUEJA,
                  variables: {
                    id: queja.id,
                    imagen_url: imagenUrl
                  },
                  refetchQueries: [
                    { query: OBTENER_QUEJAS, variables: { usuarioActualId: usuarioId } }
                  ]
                }).toPromise();
              });
          })
          .then(result => {
            const quejaFinal = result?.data?.actualizarQueja;
            if (!quejaFinal) throw new Error('No se pudo actualizar la imagen en la queja');
            console.log('✅ Queja creada y actualizada con imagen:', quejaFinal);
            observer.next(quejaFinal);
            observer.complete();
          })
          .catch(error => {
            console.error('❌ Error en crearQueja con imagen:', error);
            observer.error(error);
          });
      });
    }

    // Sin imagen: crear directamente (imagen_url = null)
    const variables: any = {
      titulo,
      descripcion,
      categoriaId,
      usuarioId,
      imagen_url: null
    };
    if (ubicacion) variables.ubicacion = ubicacion;

    console.log('📤 Creando queja sin imagen');

    return this.apollo
      .mutate<{ crearQueja: Queja }>({
        mutation: CREAR_QUEJA,
        variables,
        refetchQueries: [
          { query: OBTENER_QUEJAS, variables: { usuarioActualId: usuarioId } }
        ]
      })
      .pipe(
        map(result => {
          console.log('✅ Queja creada:', result.data!.crearQueja);
          return result.data!.crearQueja;
        })
      );
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
}