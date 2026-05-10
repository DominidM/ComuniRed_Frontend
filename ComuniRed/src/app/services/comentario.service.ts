import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map, forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';


export interface Comentario {
  id: string;
  queja_id: string;
  texto: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
  eliminado?: boolean;
  fecha_eliminacion?: string;
  author: Usuario;
  showMenu?: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
}


const AGREGAR_COMENTARIO = gql`
  mutation AgregarComentario($quejaId: ID!, $usuarioId: ID!, $texto: String!) {
    agregarComentario(quejaId: $quejaId, usuarioId: $usuarioId, texto: $texto) {
      id
      queja_id
      texto
      fecha_creacion
      fecha_modificacion
      author {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;

const EDITAR_COMENTARIO = gql`
  mutation EditarComentario($id: ID!, $usuarioId: ID!, $texto: String!) {
    editarComentario(id: $id, usuarioId: $usuarioId, texto: $texto) {
      id
      queja_id
      texto
      fecha_creacion
      fecha_modificacion
      author {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;

const ELIMINAR_COMENTARIO = gql`
  mutation EliminarComentario($comentarioId: ID!, $usuarioId: ID!, $razon: String!) {
    eliminarComentario(comentarioId: $comentarioId, usuarioId: $usuarioId, razon: $razon)
  }
`;


const BUSCAR_COMENTARIO = gql`
  query BuscarComentario($id: ID!) {
    buscarComentario(id: $id) {
      id
      queja_id
      texto
      fecha_creacion
      fecha_modificacion
      author {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;

const BUSCAR_COMENTARIOS_POR_TEXTO = gql`
  query BuscarComentariosPorTexto($texto: String!, $usuarioId: ID!) {
    buscarComentariosPorTexto(texto: $texto, usuarioId: $usuarioId) {
      id
      queja_id
      texto
      fecha_creacion
      fecha_modificacion
      author {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;

const BUSCAR_COMENTARIOS_POR_USUARIO = gql`
  query BuscarComentariosPorUsuario($usuarioId: ID!) {
    buscarComentariosPorUsuario(usuarioId: $usuarioId) {
      id
      queja_id
      texto
      fecha_creacion
      fecha_modificacion
      author {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;

const OBTENER_QUEJA_POR_ID = gql`
  query ObtenerQuejaPorId($id: ID!, $usuarioActualId: ID!) {
    obtenerQuejaPorId(id: $id, usuarioActualId: $usuarioActualId) {
      id
      titulo
      descripcion
      fecha_creacion
      ubicacion
      imagen_url
      categoria {
        id
        nombre
      }
      estado {
        id
        clave
        nombre
      }
      usuario {
        id
        nombre
        apellido
        foto_perfil
      }
    }
  }
`;


const APROBAR_COMENTARIO = gql`
  mutation AprobarComentario($comentarioId: ID!, $soporteId: ID!) {
    aprobarComentario(comentarioId: $comentarioId, soporteId: $soporteId) {
      id
      texto
      fecha_creacion
      author {
        id
        nombre
        apellido
      }
    }
  }
`;

const RECHAZAR_COMENTARIO = gql`
  mutation RechazarComentario($comentarioId: ID!, $soporteId: ID!, $razon: String!) {
    rechazarComentario(comentarioId: $comentarioId, soporteId: $soporteId, razon: $razon) {
      id
      texto
      fecha_creacion
      author {
        id
        nombre
        apellido
      }
    }
  }
`;


@Injectable({ providedIn: 'root' })
export class ComentarioService {
  constructor(private apollo: Apollo) {}

  agregarComentario(quejaId: string, usuarioId: string, texto: string): Observable<Comentario> {
    return this.apollo
      .mutate<{ agregarComentario: Comentario }>({
        mutation: AGREGAR_COMENTARIO,
        variables: { quejaId, usuarioId, texto }
      })
      .pipe(map(result => result.data!.agregarComentario));
  }

  actualizarComentario(id: string, usuarioId: string, texto: string): Observable<Comentario> {
    return this.apollo
      .mutate<{ editarComentario: Comentario }>({
        mutation: EDITAR_COMENTARIO,
        variables: { id, usuarioId, texto }
      })
      .pipe(map(result => result.data!.editarComentario));
  }

  eliminarComentario(id: string, usuarioId: string, razon: string = 'Eliminado por moderación'): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarComentario: boolean }>({
        mutation: ELIMINAR_COMENTARIO,
        variables: { 
          comentarioId: id,  // ✅ Asegúrate que coincida con el schema
          usuarioId, 
          razon 
        }
      })
      .pipe(map(result => result.data?.eliminarComentario ?? false));
  }


  buscarComentario(id: string): Observable<Comentario | null> {
    return this.apollo
      .query<{ buscarComentario: Comentario }>({
        query: BUSCAR_COMENTARIO,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      .pipe(map(result => result.data?.buscarComentario ?? null));
  }

  buscarComentariosPorTexto(texto: string, usuarioId: string): Observable<Comentario[]> {
    return this.apollo
      .query<{ buscarComentariosPorTexto: Comentario[] }>({
        query: BUSCAR_COMENTARIOS_POR_TEXTO,
        variables: { texto, usuarioId },
        fetchPolicy: 'network-only'
      })
      .pipe(map(result => result.data?.buscarComentariosPorTexto ?? []));
  }

  buscarComentariosPorUsuario(usuarioId: string): Observable<Comentario[]> {
    return this.apollo
      .query<{ buscarComentariosPorUsuario: Comentario[] }>({
        query: BUSCAR_COMENTARIOS_POR_USUARIO,
        variables: { usuarioId },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => result.data?.buscarComentariosPorUsuario ?? []),
        catchError(() => of([]))
      );
  }

  contarComentariosPorUsuario(usuarioId: string): Observable<number> {
    return this.buscarComentariosPorUsuario(usuarioId).pipe(
      map(comentarios => comentarios.length)
    );
  }

  obtenerReportesComentados(usuarioId: string, page: number = 0, size: number = 10): Observable<any[]> {
    return this.buscarComentariosPorUsuario(usuarioId).pipe(
      map(comentarios => {
        const reporteIds = [...new Set(comentarios.map(c => c.queja_id))];
        return reporteIds.slice(page * size, (page + 1) * size);
      }),
      switchMap(reporteIds => {
        if (reporteIds.length === 0) return of([]);
        
        const reporteQueries = reporteIds.map(id => 
          this.apollo.query<{ obtenerQuejaPorId: any }>({
            query: OBTENER_QUEJA_POR_ID,
            variables: { id, usuarioActualId: usuarioId },
            fetchPolicy: 'network-only'
          }).pipe(
            map(result => result.data?.obtenerQuejaPorId),
            catchError(() => of(null))
          )
        );
        
        return forkJoin(reporteQueries).pipe(
          map(reportes => reportes.filter(r => r !== null))
        );
      }),
      catchError(() => of([]))
    );
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'justo ahora';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 172800) return 'hace 1 día';
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  obtenerTodosLosComentarios(): Observable<any[]> {
    return this.apollo
      .watchQuery<{ obtenerTodosLosComentarios: any[] }>({
        query: gql`
          query ObtenerTodosLosComentarios {
            obtenerTodosLosComentarios {
              id
              texto
              fecha_creacion
              queja_id
              author {
                id
                nombre
                apellido
                foto_perfil
              }
              queja {
                id
                titulo
                descripcion
                imagen_url
              }
            }
          }
        `,
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map((r: any) => r), 
        map(result => result.data.obtenerTodosLosComentarios)
      );
  }


  aprobarComentario(comentarioId: string, soporteId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: APROBAR_COMENTARIO,
        variables: { comentarioId, soporteId }
      })
      .pipe(map(result => result.data));
  }

  rechazarComentario(comentarioId: string, soporteId: string, razon: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: RECHAZAR_COMENTARIO,
        variables: { comentarioId, soporteId, razon }
      })
      .pipe(map(result => result.data));
  }

}
