import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Comentario {
  id: string;
  queja_id: string;
  texto: string;
  fecha_creacion: string;
  author: Usuario;
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
      texto
      fecha_creacion
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
  mutation EliminarComentario($id: ID!, $usuarioId: ID!) {
    eliminarComentario(id: $id, usuarioId: $usuarioId)
  }
`;

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  constructor(private apollo: Apollo) {}

  agregarComentario(quejaId: string, usuarioId: string, texto: string): Observable<Comentario> {
    console.log('💬 Agregando comentario:', { quejaId, usuarioId, texto });
    
    return this.apollo
      .mutate<{ agregarComentario: Comentario }>({
        mutation: AGREGAR_COMENTARIO,
        variables: { quejaId, usuarioId, texto }
      })
      .pipe(
        map(result => {
          console.log('✅ Comentario agregado:', result.data!.agregarComentario);
          return result.data!.agregarComentario;
        })
      );
  }

  eliminarComentario(id: string, usuarioId: string, quejaId?: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarComentario: boolean }>({
        mutation: ELIMINAR_COMENTARIO,
        variables: { id, usuarioId }
      })
      .pipe(map(result => result.data?.eliminarComentario ?? false));
  }
}
