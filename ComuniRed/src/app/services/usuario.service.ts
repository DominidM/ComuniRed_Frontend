import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  numero_telefono: string;
  edad: number;
  sexo: string;
  distrito: string;
  codigo_postal: string;
  direccion: string;
  email: string;
  password?: string; // Opcional para no enviarlo en respuestas
  rol_id: string;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  dni?: string;
  numero_telefono?: string;
  edad?: number;
  sexo?: string;
  distrito?: string;
  codigo_postal?: string;
  direccion?: string;
  email: string;
  password: string;
  rol_id: string;
}

export interface UsuarioPage {
  content: Usuario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/* Queries / Mutations existentes */
const OBTENER_USUARIOS = gql`
  query ObtenerUsuarios($page: Int!, $size: Int!) {
    obtenerUsuarios(page: $page, size: $size) {
      content {
        id
        nombre
        apellido
        dni
        numero_telefono
        edad
        sexo
        distrito
        codigo_postal
        direccion
        email
        rol_id
      }
      totalElements
      totalPages
      number
      size
    }
  }
`;

const OBTENER_TODOS_LOS_USUARIOS = gql`
  query ObtenerTodosLosUsuarios {
    obtenerTodosLosUsuarios {
      id
      nombre
      apellido
      dni
      numero_telefono
      edad
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
    }
  }
`;

const OBTENER_USUARIO_POR_ID = gql`
  query ObtenerUsuarioPorId($id: String!) {
    obtenerUsuarioPorId(id: $id) {
      id
      nombre
      apellido
      dni
      numero_telefono
      edad
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
    }
  }
`;

const CONTAR_USUARIOS_POR_ROL = gql`
  query ContarUsuariosPorRol($rol_id: String!) {
    contarUsuariosPorRol(rol_id: $rol_id)
  }
`;

const CREAR_USUARIO = gql`
  mutation CrearUsuario($usuario: UsuarioInput!) {
    crearUsuario(usuario: $usuario) {
      id
      nombre
      apellido
      dni
      numero_telefono
      edad
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
    }
  }
`;

const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario($id: String!, $usuario: UsuarioInput!) {
    actualizarUsuario(id: $id, usuario: $usuario) {
      id
      nombre
      apellido
      dni
      numero_telefono
      edad
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
    }
  }
`;

const ELIMINAR_USUARIO = gql`
  mutation EliminarUsuario($id: String!) {
    eliminarUsuario(id: $id)
  }
`;

/*
  LOGIN: actualizado para devolver token + usuario (si tu backend lo soporta).
*/
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      usuario {
        id
        nombre
        apellido
        email
        rol_id
      }
    }
  }
`;

/* Resultado esperado de login */
export interface LoginResult {
  token?: string;
  usuario?: Usuario | null;
}

/* Llave localStorage (puedes cambiar si ya usas otra) */
export const TOKEN_KEY = 'comunired_token';
export const USER_KEY = 'comunired_user';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private apollo: Apollo) {}

  obtenerUsuarios(page: number, size: number): Observable<UsuarioPage> {
    return this.apollo.watchQuery<{ obtenerUsuarios: UsuarioPage }>({
      query: OBTENER_USUARIOS,
      variables: { page, size }
    }).valueChanges.pipe(
      map(result => result.data.obtenerUsuarios)
    );
  }

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.apollo.watchQuery<{ obtenerTodosLosUsuarios: Usuario[] }>({
      query: OBTENER_TODOS_LOS_USUARIOS
    }).valueChanges.pipe(
      map(result => result.data.obtenerTodosLosUsuarios)
    );
  }

  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.apollo.watchQuery<{ obtenerUsuarioPorId: Usuario }>({
      query: OBTENER_USUARIO_POR_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.obtenerUsuarioPorId)
    );
  }

  contarUsuariosPorRol(rolId: string): Observable<number> {
    return this.apollo.watchQuery<{ contarUsuariosPorRol: number }>({
      query: CONTAR_USUARIOS_POR_ROL,
      variables: { rol_id: rolId }
    }).valueChanges.pipe(
      map(result => result.data.contarUsuariosPorRol)
    );
  }

  crearUsuario(usuario: UsuarioInput): Observable<Usuario> {
    return this.apollo.mutate<{ crearUsuario: Usuario }>({
      mutation: CREAR_USUARIO,
      variables: { usuario },
      refetchQueries: [
        { query: OBTENER_USUARIOS, variables: { page: 0, size: 10 } },
        { query: OBTENER_TODOS_LOS_USUARIOS }
      ]
    }).pipe(
      map(result => result.data!.crearUsuario)
    );
  }

  actualizarUsuario(id: string, usuario: UsuarioInput): Observable<Usuario> {
    return this.apollo.mutate<{ actualizarUsuario: Usuario }>({
      mutation: ACTUALIZAR_USUARIO,
      variables: { id, usuario },
      refetchQueries: [
        { query: OBTENER_USUARIOS, variables: { page: 0, size: 10 } },
        { query: OBTENER_TODOS_LOS_USUARIOS }
      ]
    }).pipe(
      map(result => result.data!.actualizarUsuario)
    );
  }

  eliminarUsuario(id: string): Observable<boolean> {
    return this.apollo.mutate<{ eliminarUsuario: boolean }>({
      mutation: ELIMINAR_USUARIO,
      variables: { id },
      refetchQueries: [
        { query: OBTENER_USUARIOS, variables: { page: 0, size: 10 } },
        { query: OBTENER_TODOS_LOS_USUARIOS }
      ]
    }).pipe(
      map(result => result.data!.eliminarUsuario)
    );
  }

  login(email: string, password: string): Observable<LoginResult> {
    return this.apollo.mutate<{ login: { token?: string; usuario?: Usuario } }>({
      mutation: LOGIN,
      variables: { email, password }
    }).pipe(
      map(result => {
        const payload = result.data?.login;
        return {
          token: payload?.token,
          usuario: payload?.usuario ?? null
        };
      })
    );
  }

  loginAndStore(email: string, password: string): Observable<LoginResult> {
    return this.login(email, password).pipe(
      tap(res => {
        if (res?.token) this.saveToken(res.token);
        if (res?.usuario) this.saveUser(res.usuario);
      })
    );
  }

  saveToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('No se pudo guardar token en localStorage', e);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  saveUser(user: Usuario) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('No se pudo guardar usuario en localStorage', e);
    }
  }

  getUser(): Usuario | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch (e) {
      return null;
    }
  }

  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      // ignore
    }

    // Intenta limpiar / resetear cache de Apollo (sin forzar errores si no existe)
    try {
      const client: any = (this.apollo as any).client || (this.apollo as any).getClient?.();
      if (client) {
        client.clearStore?.(); // limpia cache
        client.resetStore?.(); // resetea store
      }
    } catch (err) {
      console.warn('No se pudo limpiar Apollo store', err);
    }
  }

  isLoggedIn(): boolean {
    const t = this.getToken();
    return !!t && t.length > 0;
  }

  getRoles(): string[] {
    const u = this.getUser();
    if (!u) return [];
    return u.rol_id ? [u.rol_id] : [];
  }
}