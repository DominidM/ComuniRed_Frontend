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
}
