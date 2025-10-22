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

@Injectable({
  providedIn: 'root'
})
export class EstadosQuejaService {

  constructor(private apollo: Apollo) {}

  listarEstadosQueja(): Observable<any[]> {
    return this.apollo.watchQuery({
      query: gql`
        query {
          listarEstados {
            id
            clave
            nombre
            descripcion
            orden
          }
        }
      `
    }).valueChanges.pipe(
      map((result: any) => result.data.listarEstados)
    );
  }

  crearEstadoQueja(clave: string, nombre: string, descripcion: string, orden: number): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation($clave: String!, $nombre: String!, $descripcion: String, $orden: Int!) {
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
      variables: { clave, nombre, descripcion, orden }
    });
  }

  actualizarEstadoQueja(id: string, clave: string, nombre: string, descripcion: string, orden: number): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation($id: ID!, $clave: String!, $nombre: String!, $descripcion: String, $orden: Int!) {
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
      variables: { id, clave, nombre, descripcion, orden }
    });
  }

buscarEstadoPorNombre(nombre: string): Observable<EstadoQueja | null> {
  return this.apollo.watchQuery({
    query: gql`
      query($nombre: String!) {
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
    map((result: any) => result.data.buscarEstadoPorNombre) // <-- devuelve un objeto o null
  );
}



  eliminarEstadoQueja(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation($id: ID!) {
          eliminarEstado(id: $id)
        }
      `,
      variables: { id }
    });
  }
}
