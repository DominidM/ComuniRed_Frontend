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

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor(private apollo: Apollo) {}

  // 🔹 1. Listar todas las categorías
  listarCategorias(): Observable<Categoria[]> {
    return this.apollo.watchQuery<{ listarCategorias: Categoria[] }>({
      query: gql`
        query {
          listarCategorias {
            id
            nombre
            descripcion
            activo
          }
        }
      `
    }).valueChanges.pipe(
      map(result => result.data.listarCategorias)
    );
  }

  // 🔹 2. Buscar categoría por nombre
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

  // 🔹 3. Crear una nueva categoría
  crearCategoria(nombre: string, descripcion: string, activo: boolean): Observable<Categoria> {
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
      variables: { nombre, descripcion, activo }
    }).pipe(
      map(result => result.data!.crearCategoria)
    );
  }

  // 🔹 4. Actualizar categoría por ID
  actualizarCategoria(id: string, nombre: string, descripcion: string, activo: boolean): Observable<Categoria | null> {
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
      variables: { id, nombre, descripcion, activo }
    }).pipe(
      map(result => result.data?.actualizarCategoria ?? null)
    );
  }

  // 🔹 5. Eliminar categoría por ID
  eliminarCategoria(id: string): Observable<boolean> {
    return this.apollo.mutate<{ eliminarCategoria: boolean }>({
      mutation: gql`
        mutation ($id: ID!) {
          eliminarCategoria(id: $id)
        }
      `,
      variables: { id }
    }).pipe(
      map(result => result.data!.eliminarCategoria)
    );
  }
}
