import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';


export interface Evidencia {
  id: string;
  queja_id: string;
  url: string;
  tipo: string;
  fecha_subida?: string;
}

const EVIDENCIAS_POR_QUEJA = gql`
  query EvidenciasPorQueja($quejaId: ID!) {
    evidenciasPorQueja(quejaId: $quejaId) {
      id url tipo fecha_subida
    }
  }
`;


const SUBIR_EVIDENCIA = gql`
  mutation SubirEvidencia($quejaId: ID!, $archivo: Upload!, $tipo: String) {
    subirEvidencia(quejaId: $quejaId, archivo: $archivo, tipo: $tipo) {
      id url tipo
    }
  }
`;

const ELIMINAR_EVIDENCIA = gql`
  mutation EliminarEvidencia($id: ID!) {
    eliminarEvidencia(id: $id)
  }
`;

@Injectable({ providedIn: 'root' })
export class EvidenciaService {
  constructor(private apollo: Apollo) {}



  evidenciasPorQueja(quejaId: string): Observable<Evidencia[]> {
    return this.apollo
      .watchQuery<{ evidenciasPorQueja: Evidencia[] }>({
        query: EVIDENCIAS_POR_QUEJA,
        variables: { quejaId },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map(result => result.data.evidenciasPorQueja));
  }


  subirEvidencia(quejaId: string, archivo: File, tipo?: string): Observable<Evidencia> {
    return this.apollo
      .mutate<{ subirEvidencia: Evidencia }>({
        mutation: SUBIR_EVIDENCIA,
        variables: { quejaId, archivo, tipo },
        refetchQueries: [
          { query: EVIDENCIAS_POR_QUEJA, variables: { quejaId } }
        ]
      })
      .pipe(map(result => result.data!.subirEvidencia));
  }

  eliminarEvidencia(id: string, quejaId?: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarEvidencia: boolean }>({
        mutation: ELIMINAR_EVIDENCIA,
        variables: { id },
        refetchQueries: quejaId ? [
          { query: EVIDENCIAS_POR_QUEJA, variables: { quejaId } }
        ] : []
      })
      .pipe(map(result => result.data?.eliminarEvidencia ?? false));
  }
}
