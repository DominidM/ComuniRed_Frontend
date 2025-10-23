import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TipoReaccion {
  id: string;
  key: string;
  label: string;
  activo: boolean;
  orden: number;
}

@Injectable({ providedIn: 'root' })
export class TipoReaccionService {
  constructor(private apollo: Apollo) {}

  // Listar todos
  getAll(): Observable<TipoReaccion[]> {
    return this.apollo
      .watchQuery<{ listarTiposReaccion: TipoReaccion[] }>({
        query: gql`
          query {
            listarTiposReaccion {
              id
              key
              label
              activo
              orden
            }
          }
        `,
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map(result => result.data.listarTiposReaccion));
  }

  // Buscar por label
  buscarPorNombre(label: string): Observable<TipoReaccion | null> {
    return this.apollo
      .watchQuery<{ buscarTipoReaccionPorLabel: TipoReaccion | null }>({
        query: gql`
          query BuscarTipoReaccionPorLabel($label: String!) {
            buscarTipoReaccionPorLabel(label: $label) {
              id
              key
              label
              activo
              orden
            }
          }
        `,
        variables: { label },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map(result => result.data.buscarTipoReaccionPorLabel));
  }

  // Crear
  create(tipo: Partial<TipoReaccion>): Observable<TipoReaccion> {
    return this.apollo
      .mutate<{ crearTipoReaccion: TipoReaccion }>({
        mutation: gql`
          mutation($key: String!, $label: String!, $activo: Boolean!, $orden: Int!) {
            crearTipoReaccion(key: $key, label: $label, activo: $activo, orden: $orden) {
              id
              key
              label
              activo
              orden
            }
          }
        `,
        variables: {
          key: tipo.key!,
          label: tipo.label!,
          activo: tipo.activo ?? true,
          orden: tipo.orden ?? 1
        }
      })
      .pipe(map(result => result.data!.crearTipoReaccion));
  }

  // Actualizar - CAMBIO AQUÍ: String! → ID!
  update(id: string, tipo: Partial<TipoReaccion>): Observable<TipoReaccion> {
    return this.apollo
      .mutate<{ actualizarTipoReaccion: TipoReaccion }>({
        mutation: gql`
          mutation($id: ID!, $key: String!, $label: String!, $activo: Boolean!, $orden: Int!) {
            actualizarTipoReaccion(id: $id, key: $key, label: $label, activo: $activo, orden: $orden) {
              id
              key
              label
              activo
              orden
            }
          }
        `,
        variables: {
          id: id,
          key: tipo.key!,
          label: tipo.label!,
          activo: tipo.activo ?? true,
          orden: tipo.orden ?? 1
        }
      })
      .pipe(map(result => result.data!.actualizarTipoReaccion));
  }

  // Eliminar - CAMBIO AQUÍ: String! → ID!
  delete(id: string): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarTipoReaccion: boolean }>({
        mutation: gql`
          mutation($id: ID!) {
            eliminarTipoReaccion(id: $id)
          }
        `,
        variables: { id }
      })
      .pipe(map(result => result.data?.eliminarTipoReaccion ?? false));
  }
}