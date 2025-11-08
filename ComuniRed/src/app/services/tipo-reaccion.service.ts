import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface TipoReaccion {
  id: string;
  key: string;
  label: string;
  activo: boolean;
  orden: number;
}

export interface TiposReaccionPage {
  content: TipoReaccion[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class TipoReaccionService {
  constructor(private apollo: Apollo) {}

  obtenerTipoReaccionPage(page: number, size: number): Observable<TiposReaccionPage> {
    return this.apollo
      .watchQuery<{ obtenerTipo_reaccion: TiposReaccionPage }>({
        query: gql`
          query ($page: Int!, $size: Int!) {
            obtenerTipo_reaccion(page: $page, size: $size) {
              content { id key label activo orden }
              totalElements
              totalPages
              number
              size
            }
          }
        `,
        variables: { page, size },
        fetchPolicy: 'network-only'  // 👈 Agrega esta línea
      })
      .valueChanges.pipe(map(result => result.data.obtenerTipo_reaccion));
  }


  buscarPorLabel(label: string): Observable<TipoReaccion | null> {
    return this.apollo
      .watchQuery<{ buscarTipoReaccionPorLabel: TipoReaccion | null }>({
        query: gql`
          query ($label: String!) {
            buscarTipoReaccionPorLabel(label: $label) {
              id key label activo orden
            }
          }
        `,
        variables: { label },
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(map(result => result.data.buscarTipoReaccionPorLabel));
  }

  crearTipoReaccion(tipo: Partial<TipoReaccion>, page: number, size: number): Observable<TipoReaccion> {
    return this.apollo
      .mutate<{ crearTipoReaccion: TipoReaccion }>({
        mutation: gql`
          mutation($key: String!, $label: String!, $activo: Boolean!, $orden: Int!) {
            crearTipoReaccion(key: $key, label: $label, activo: $activo, orden: $orden) {
              id key label activo orden
            }
          }
        `,
        variables: {
          key: tipo.key!,
          label: tipo.label!,
          activo: tipo.activo ?? true,
          orden: tipo.orden ?? 1
        },
        refetchQueries: [
          {
            query: gql`
              query ($page: Int!, $size: Int!) {
                obtenerTipo_reaccion(page: $page, size: $size) {
                  content { id key label activo orden }
                  totalElements
                  totalPages
                  number
                  size
                }
              }
            `,
            variables: { page, size }
          }
        ]
      })
      .pipe(map(result => result.data!.crearTipoReaccion));
  }

  actualizarTipoReaccion(id: string, tipo: Partial<TipoReaccion>, page: number, size: number): Observable<TipoReaccion> {
    return this.apollo
      .mutate<{ actualizarTipoReaccion: TipoReaccion }>({
        mutation: gql`
          mutation($id: ID!, $key: String!, $label: String!, $activo: Boolean!, $orden: Int!) {
            actualizarTipoReaccion(id: $id, key: $key, label: $label, activo: $activo, orden: $orden) {
              id key label activo orden
            }
          }
        `,
        variables: {
          id: id,
          key: tipo.key!,
          label: tipo.label!,
          activo: tipo.activo ?? true,
          orden: tipo.orden ?? 1
        },
        refetchQueries: [
          {
            query: gql`
              query ($page: Int!, $size: Int!) {
                obtenerTipo_reaccion(page: $page, size: $size) {
                  content { id key label activo orden }
                  totalElements
                  totalPages
                  number
                  size
                }
              }
            `,
            variables: { page, size }
          }
        ]
      })
      .pipe(map(result => result.data!.actualizarTipoReaccion));
  }

  eliminarTipoReaccion(id: string, page: number, size: number): Observable<boolean> {
    return this.apollo
      .mutate<{ eliminarTipoReaccion: boolean }>({
        mutation: gql`
          mutation($id: ID!) {
            eliminarTipoReaccion(id: $id)
          }
        `,
        variables: { id },
        refetchQueries: [
          {
            query: gql`
              query ($page: Int!, $size: Int!) {
                obtenerTipo_reaccion(page: $page, size: $size) {
                  content { id key label activo orden }
                  totalElements
                  totalPages
                  number
                  size
                }
              }
            `,
            variables: { page, size }
          }
        ]
      })
      .pipe(map(result => result.data?.eliminarTipoReaccion ?? false));
  }
}
