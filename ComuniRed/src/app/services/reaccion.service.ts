import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { ReactionsData } from './queja.service';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
}

const TOGGLE_REACCION = gql`
  mutation ToggleReaccion($quejaId: ID!, $tipoReaccion: String!, $usuarioId: ID!) {
    toggleReaccion(quejaId: $quejaId, tipoReaccion: $tipoReaccion, usuarioId: $usuarioId) {
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
  }
`;


const CONTAR_REACCIONES_POR_USUARIO = gql`
  query ContarReaccionesPorUsuario($usuarioId: ID!) {
    contarReaccionesPorUsuario(usuarioId: $usuarioId)
  }
`;

@Injectable({ providedIn: 'root' })
export class ReaccionService {
  constructor(private apollo: Apollo) {}

  toggleReaccion(
    quejaId: string,
    tipoReaccion: string,
    usuarioId: string
  ): Observable<ReactionsData> {
    console.log('🔄 Toggle reacción:', { quejaId, tipoReaccion, usuarioId });
    
    return this.apollo
      .mutate<{ toggleReaccion: ReactionsData }>({
        mutation: TOGGLE_REACCION,
        variables: { quejaId, tipoReaccion, usuarioId }
      })
      .pipe(
        map(result => {
          console.log('✅ Reacción actualizada:', result.data!.toggleReaccion);
          return result.data!.toggleReaccion;
        })
      );
  }


  contarReaccionesPorUsuario(usuarioId: string): Observable<number> {
    console.log('🔄 Contando reacciones del usuario:', usuarioId);
    
    return this.apollo
      .query<{ contarReaccionesPorUsuario: number }>({
        query: CONTAR_REACCIONES_POR_USUARIO,
        variables: { usuarioId },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          console.log('✅ Total de reacciones:', result.data.contarReaccionesPorUsuario);
          return result.data.contarReaccionesPorUsuario;
        })
      );
  }
}
