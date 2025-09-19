import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Rol {
  nombre: string;
  descripcion: string;
  id?: string;
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
      variables: {
        page,
        size
      }
    }).pipe(map(result => result.data?.obtenerRoles as RolPage));
  }
}