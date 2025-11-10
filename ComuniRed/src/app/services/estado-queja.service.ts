import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

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
  
  // 🔥 Observable centralizado para el conteo total de estados
  private estadoCountSubject = new BehaviorSubject<number>(0);
  public estadoCount$ = this.estadoCountSubject.asObservable();

  constructor(private apollo: Apollo) {
    // Inicializa el conteo al arrancar el servicio
    this.refreshEstadoCount();
  }

  // 🔥 Método para refrescar el conteo total desde el backend
  refreshEstadoCount(): void {
    this.apollo.query<{ contarEstadosQueja: number }>({
      query: gql`
        query {
          contarEstadosQueja
        }
      `,
      fetchPolicy: 'network-only'
    }).subscribe({
      next: (result) => {
        const count = result.data?.contarEstadosQueja ?? 0;
        this.estadoCountSubject.next(count);
        console.debug('[EstadosQuejaService] estadoCount refreshed:', count);
      },
      error: (err) => console.error('Error al contar estados de queja:', err)
    });
  }

  // ============================================================
  // Métodos de paginación y CRUD
  // ============================================================

  obtenerEstadosQueja(page: number, size: number): Observable<EstadoQuejaPage> {
    return this.apollo.watchQuery<{ obtenerEstados_queja: EstadoQuejaPage }>({
      query: gql`
        query ($page: Int!, $size: Int!) {
          obtenerEstados_queja(page: $page, size: $size) {
            content {
              id clave nombre descripcion orden
            }
            totalElements totalPages number size
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
          crearEstado(clave: $clave, nombre: $nombre, descripcion: $descripcion, orden: $orden) {
            id clave nombre descripcion orden
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
                totalElements totalPages number size
              }
            }
          `,
          variables: { page, size }
        }
      ]
    }).pipe(
      tap(() => this.refreshEstadoCount()), // 🔥 Refresca el conteo tras crear
      map(result => result.data!.crearEstado)
    );
  }

  actualizarEstadoQueja(id: string, clave: string, nombre: string, descripcion: string, orden: number, page: number, size: number): Observable<EstadoQueja> {
    return this.apollo.mutate<{ actualizarEstado: EstadoQueja }>({
      mutation: gql`
        mutation ($id: ID!, $clave: String!, $nombre: String!, $descripcion: String, $orden: Int!) {
          actualizarEstado(id: $id, clave: $clave, nombre: $nombre, descripcion: $descripcion, orden: $orden) {
            id clave nombre descripcion orden
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
                totalElements totalPages number size
              }
            }
          `,
          variables: { page, size }
        }
      ]
    }).pipe(
      tap(() => this.refreshEstadoCount()), // 🔥 Refresca el conteo tras actualizar
      map(result => result.data!.actualizarEstado)
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
                totalElements totalPages number size
              }
            }
          `,
          variables: { page, size }
        }
      ]
    }).pipe(
      tap(() => this.refreshEstadoCount()), // 🔥 Refresca el conteo tras eliminar
      map(result => result.data!.eliminarEstado)
    );
  }

  buscarEstadoPorNombre(nombre: string): Observable<EstadoQueja | null> {
    return this.apollo.watchQuery<{ buscarEstadoPorNombre: EstadoQueja }>({
      query: gql`
        query ($nombre: String!) {
          buscarEstadoPorNombre(nombre: $nombre) {
            id clave nombre descripcion orden
          }
        }
      `,
      variables: { nombre }
    }).valueChanges.pipe(
      map(result => result.data.buscarEstadoPorNombre)
    );
  }
}
