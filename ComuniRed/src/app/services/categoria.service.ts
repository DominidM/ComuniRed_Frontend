import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CategoriaPage {
  content: Categoria[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(private apollo: Apollo) {}

  obtenerCategorias(page: number, size: number): Observable<CategoriaPage> {
    return this.apollo.watchQuery<{ obtenerCategorias: CategoriaPage }>({
      query: gql`
        query ($page: Int!, $size: Int!) {
          obtenerCategorias(page: $page, size: $size) {
            content {
              id
              nombre
              descripcion
              activo
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
      map(result => result.data.obtenerCategorias)
    );
  }

  buscarCategoriaPorNombre(nombre: string): Observable<Categoria | null> {
    return this.apollo.watchQuery<{ buscarCategoriaPorNombre: Categoria }>({
      query: gql`
        query ($nombre: String!) {
          buscarCategoriaPorNombre(nombre: $nombre) {
            id
            nombre
            descripcion
            activo
          }
        }
      `,
      variables: { nombre }
    }).valueChanges.pipe(
      map(result => result.data.buscarCategoriaPorNombre)
    );
  }

  crearCategoria(nombre: string, descripcion: string, activo: boolean, page: number, size: number): Observable<Categoria> {
    return this.apollo.mutate<{ crearCategoria: Categoria }>({
      mutation: gql`
        mutation ($nombre: String!, $descripcion: String!, $activo: Boolean!) {
          crearCategoria(nombre: $nombre, descripcion: $descripcion, activo: $activo) {
            id
            nombre
            descripcion
            activo
          }
        }
      `,
      variables: { nombre, descripcion, activo },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerCategorias(page: $page, size: $size) {
                content { id nombre descripcion activo }
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
      map(result => result.data!.crearCategoria)
    );
  }

  actualizarCategoria(id: string, nombre: string, descripcion: string, activo: boolean, page: number, size: number): Observable<Categoria | null> {
    return this.apollo.mutate<{ actualizarCategoria: Categoria }>({
      mutation: gql`
        mutation ($id: ID!, $nombre: String!, $descripcion: String!, $activo: Boolean!) {
          actualizarCategoria(id: $id, nombre: $nombre, descripcion: $descripcion, activo: $activo) {
            id
            nombre
            descripcion
            activo
          }
        }
      `,
      variables: { id, nombre, descripcion, activo },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerCategorias(page: $page, size: $size) {
                content { id nombre descripcion activo }
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
      map(result => result.data?.actualizarCategoria ?? null)
    );
  }

  eliminarCategoria(id: string, page: number, size: number): Observable<boolean> {
    return this.apollo.mutate<{ eliminarCategoria: boolean }>({
      mutation: gql`
        mutation ($id: ID!) {
          eliminarCategoria(id: $id)
        }
      `,
      variables: { id },
      refetchQueries: [
        {
          query: gql`
            query ($page: Int!, $size: Int!) {
              obtenerCategorias(page: $page, size: $size) {
                content { id nombre descripcion activo }
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
      map(result => result.data!.eliminarCategoria)
    );
  }
}
