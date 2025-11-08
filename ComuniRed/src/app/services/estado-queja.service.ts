import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface EstadoQueja {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface EstadoQuejaPage {
  content: EstadoQueja[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadosQuejaService {
  constructor(private apollo: Apollo) {}

  obtenerEstadosQueja(page: number, size: number): Observable<EstadoQuejaPage> {
    return this.apollo.watchQuery<{ obtenerEstados_queja: EstadoQuejaPage }>({
      query: gql`
        query ($page: Int!, $size: Int!) {
          obtenerEstados_queja(page: $page, size: $size) {
            content {
              id
              clave
              nombre
              descripcion
              orden
            }
            totalElements
            totalPages
            number
            size
          }
        }
      `,
      variables: { page, size }
    }).valueChanges.pipe(
      map(result => result.data.obtenerEstados_queja)
    );
  }

  crearEstadoQueja(clave: string, nombre: string, descripcion: string, orden: number, page: number, size: number): Observable<EstadoQueja> {
    return this.apollo.mutate<{ crearEstado: EstadoQueja }>({
      mutation: gql`
        mutation ($clave: String!, $nombre: String!, $descripcion: String, $orden: Int!) {
          crearEstado(
            clave: $clave,
            nombre: $nombre,
            descripcion: $descripcion,
            orden: $orden
          ) {
            id
            clave
            nombre
            descripcion
            orden
          }
        }
      `,
      variables: { clave, nombre, descripcion, orden },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerEstados_queja(page: $page, size: $size) {
                content { id clave nombre descripcion orden }
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
    }).pipe(
      map(result => result.data!.crearEstado)
    );
  }

  actualizarEstadoQueja(id: string, clave: string, nombre: string, descripcion: string, orden: number, page: number, size: number): Observable<EstadoQueja> {
    return this.apollo.mutate<{ actualizarEstado: EstadoQueja }>({
      mutation: gql`
        mutation ($id: ID!, $clave: String!, $nombre: String!, $descripcion: String, $orden: Int!) {
          actualizarEstado(
            id: $id,
            clave: $clave,
            nombre: $nombre,
            descripcion: $descripcion,
            orden: $orden
          ) {
            id
            clave
            nombre
            descripcion
            orden
          }
        }
      `,
      variables: { id, clave, nombre, descripcion, orden },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerEstados_queja(page: $page, size: $size) {
                content { id clave nombre descripcion orden }
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
    }).pipe(
      map(result => result.data!.actualizarEstado)
    );
  }

  buscarEstadoPorNombre(nombre: string): Observable<EstadoQueja | null> {
    return this.apollo.watchQuery<{ buscarEstadoPorNombre: EstadoQueja }>({
      query: gql`
        query ($nombre: String!) {
          buscarEstadoPorNombre(nombre: $nombre) {
            id
            clave
            nombre
            descripcion
            orden
          }
        }
      `,
      variables: { nombre }
    }).valueChanges.pipe(
      map(result => result.data.buscarEstadoPorNombre)
    );
  }

  eliminarEstadoQueja(id: string, page: number, size: number): Observable<boolean> {
    return this.apollo.mutate<{ eliminarEstado: boolean }>({
      mutation: gql`
        mutation ($id: ID!) {
          eliminarEstado(id: $id)
        }
      `,
      variables: { id },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerEstados_queja(page: $page, size: $size) {
                content { id clave nombre descripcion orden }
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
    }).pipe(
      map(result => result.data!.eliminarEstado)
    );
  }
}
