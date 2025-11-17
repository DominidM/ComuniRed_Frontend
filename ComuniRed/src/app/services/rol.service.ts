import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface RolPage {
  content: Rol[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  constructor(private apollo: Apollo) {}

  obtenerRoles(page: number, size: number): Observable<RolPage> {
    return this.apollo.query<{ obtenerRoles: RolPage }>({
      query: gql`
        query ($page: Int!, $size: Int!) {
          obtenerRoles(page: $page, size: $size) {
            content {
              id
              nombre
              descripcion
            }
            totalPages
            totalElements
            number
            size
          }
        }
      `,
      variables: { page, size },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.obtenerRoles as RolPage)
    );
  }

  obtenerTodosLosRoles(): Observable<Rol[]> {
    console.log('[RolService] Ejecutando query obtenerTodosLosRoles...');
    return this.apollo.query<{ obtenerTodosLosRoles: Rol[] }>({
      query: gql`
        query ObtenerTodosLosRoles {
          obtenerTodosLosRoles {
            id
            nombre
            descripcion
          }
        }
      `,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        console.log('[RolService] Respuesta completa de Apollo:', result);
        const roles = result.data?.obtenerTodosLosRoles ?? [];
        console.log('[RolService] Roles extraídos:', roles);
        return roles;
      })
    );
  }

  crearRol(nombre: string, descripcion: string): Observable<Rol> {
    return this.apollo.mutate<{ crearRol: Rol }>({
      mutation: gql`
        mutation ($nombre: String!, $descripcion: String) {
          crearRol(nombre: $nombre, descripcion: $descripcion) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { nombre, descripcion }
    }).pipe(
      map(result => result.data?.crearRol as Rol)
    );
  }

  editarRol(id: string, nombre: string, descripcion: string): Observable<Rol> {
    return this.apollo.mutate<{ editarRol: Rol }>({
      mutation: gql`
        mutation ($id: ID!, $nombre: String!, $descripcion: String) {
          editarRol(id: $id, nombre: $nombre, descripcion: $descripcion) {
            id
            nombre
            descripcion
          }
        }
      `,
      variables: { id, nombre, descripcion }
    }).pipe(
      map(result => result.data?.editarRol as Rol)
    );
  }

  eliminarRol(id: string): Observable<boolean> {
    return this.apollo.mutate<{ eliminarRol: boolean }>({
      mutation: gql`
        mutation ($id: ID!) {
          eliminarRol(id: $id)
        }
      `,
      variables: { id },
      errorPolicy: 'all'
    }).pipe(
      map(result => result.data?.eliminarRol as boolean)
    );
  }
}