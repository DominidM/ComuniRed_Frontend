import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface Usuario {
  id: string;
  foto_perfil?: string;
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
  password?: string;
  rol_id: string;
}

export interface UsuarioInput {
  foto_perfil?: string;
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
  password?: string;
  rol_id: string;
}

export interface UsuarioPage {
  content: Usuario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/* Queries / Mutations */
const OBTENER_USUARIOS = gql`
  query ObtenerUsuarios($page: Int!, $size: Int!) {
    obtenerUsuarios(page: $page, size: $size) {
      content {
        id
        foto_perfil
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
      foto_perfil
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
  query ObtenerUsuarioPorId($id: ID!) {
    obtenerUsuarioPorId(id: $id) {
      id
      foto_perfil
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
  query ContarUsuariosPorRol($rol_id: ID!) {
    contarUsuariosPorRol(rol_id: $rol_id)
  }
`;

const CREAR_USUARIO = gql`
  mutation CrearUsuario($usuario: UsuarioInput!) {
    crearUsuario(usuario: $usuario) {
      id
      foto_perfil
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
  mutation ActualizarUsuario($id: ID!, $usuario: UsuarioInput!) {
    actualizarUsuario(id: $id, usuario: $usuario) {
      id
      foto_perfil
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
  mutation EliminarUsuario($id: ID!) {
    eliminarUsuario(id: $id)
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      usuario {
        id
        foto_perfil
        nombre
        apellido
        email
        rol_id
      }
    }
  }
  `;

  const SOLICITAR_CODIGO_RECUPERACION = gql`
    mutation SolicitarCodigoRecuperacion($email: String!) {
      solicitarCodigoRecuperacion(email: $email)
    }
  `;

  const VERIFICAR_CODIGO_RECUPERACION = gql`
    mutation VerificarCodigoRecuperacion($email: String!, $codigo: String!) {
      verificarCodigoRecuperacion(email: $email, codigo: $codigo)
    }
  `;

  const CAMBIAR_PASSWORD_CON_CODIGO = gql`
    mutation CambiarPasswordConCodigo($email: String!, $codigo: String!, $nuevaPassword: String!) {
      cambiarPasswordConCodigo(email: $email, codigo: $codigo, nuevaPassword: $nuevaPassword)
    }
  `;

export interface LoginResult {
  token?: string;
  usuario?: Usuario | null;
}

export interface LoginResult {
  token?: string;
  usuario?: Usuario | null;
}

export const TOKEN_KEY = 'comunired_token';
export const USER_KEY = 'comunired_user';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiBase = '/graphql';

  // BehaviorSubject que mantiene el contador global de usuarios (inicial 0)
  private userCountSubject = new BehaviorSubject<number>(0);
  
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getUser());
  public usuario$ = this.usuarioSubject.asObservable();

  public userCount$ = this.userCountSubject.asObservable();

  constructor(private apollo: Apollo) {
    this.refreshUserCount();
  }

  obtenerUsuarios(page: number, size: number): Observable<UsuarioPage> {
    return this.apollo.watchQuery<{ obtenerUsuarios: UsuarioPage }>({
      query: OBTENER_USUARIOS,
      variables: { page, size },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      tap((rawResult) => {
        console.debug('[UsuarioService] Apollo raw result:', rawResult);
        if ((rawResult as any).errors && (rawResult as any).errors.length > 0) {
          console.warn('[UsuarioService] GraphQL errors:', (rawResult as any).errors);
        }
      }),
      map(result => {
        if (result && result.data && result.data.obtenerUsuarios) {
          return result.data.obtenerUsuarios;
        }
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: page,
          size: size
        } as UsuarioPage;
      })
    );
  }

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.apollo.watchQuery<{ obtenerTodosLosUsuarios: Usuario[] }>({
      query: OBTENER_TODOS_LOS_USUARIOS,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      tap(raw => console.debug('[UsuarioService] obtenerTodos raw:', raw)),
      map(result => result.data?.obtenerTodosLosUsuarios || [])
    );
  }

  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.apollo.watchQuery<{ obtenerUsuarioPorId: Usuario }>({
      query: OBTENER_USUARIO_POR_ID,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      tap(raw => console.debug('[UsuarioService] obtenerUsuarioPorId raw:', raw)),
      map(result => result.data.obtenerUsuarioPorId)
    );
  }

  contarUsuariosPorRol(rolId: string): Observable<number> {
    return this.apollo.watchQuery<{ contarUsuariosPorRol: number }>({
      query: CONTAR_USUARIOS_POR_ROL,
      variables: { rol_id: rolId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      tap(raw => console.debug('[UsuarioService] contarUsuariosPorRol raw:', raw)),
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
      tap(raw => console.debug('[UsuarioService] crearUsuario raw:', raw)),
      tap(() => this.refreshUserCount()),
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
      tap(raw => console.debug('[UsuarioService] actualizarUsuario raw:', raw)),
      tap(() => this.refreshUserCount()),
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
      tap(raw => console.debug('[UsuarioService] eliminarUsuario raw:', raw)),
      tap(() => this.refreshUserCount()),
      map(result => result.data!.eliminarUsuario)
    );
  }

  login(email: string, password: string) {
    return this.apollo.mutate<{ login: { token?: string; usuario?: Usuario } }>({
      mutation: LOGIN,
      variables: { email, password }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] login raw:', raw)),
      map(result => {
        const payload = result.data?.login;
        return {
          token: payload?.token,
          usuario: payload?.usuario ?? null
        };
      })
    );
  }

  loginAndStore(email: string, password: string) {
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
      this.usuarioSubject.next(user);
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
      this.usuarioSubject.next(null); // <-- 🔁 limpiar usuario en memoria
    } catch (e) {}

    try {
      const client: any = (this.apollo as any).client || (this.apollo as any).getClient?.();
      if (client) {
        client.clearStore?.();
        client.resetStore?.();
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

  refreshUserCount(): void {
    this.obtenerUsuarios(0, 1)
      .pipe(
        map(page => page?.totalElements ?? (page?.content?.length ?? 0))
      )
      .subscribe({
        next: (count: number) => {
          this.userCountSubject.next(count);
          console.debug('[UsuarioService] userCount refreshed:', count);
        },
        error: (err) => {
          console.warn('No se pudo refrescar el contador de usuarios:', err);
        }
      });
  }
  
  /**
   * Solicita un código de recuperación que se envía al email del usuario
   * @param email Email del usuario
   * @returns Observable<boolean> true si se envió correctamente
   */
  solicitarCodigoRecuperacion(email: string): Observable<boolean> {
    return this.apollo.mutate<{ solicitarCodigoRecuperacion: boolean }>({
      mutation: SOLICITAR_CODIGO_RECUPERACION,
      variables: { email }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] solicitarCodigoRecuperacion raw:', raw)),
      map(result => result.data?.solicitarCodigoRecuperacion ?? false)
    );
  }

  /**
   * Verifica si un código de recuperación es válido
   * @param email Email del usuario
   * @param codigo Código de 6 dígitos recibido por email
   * @returns Observable<boolean> true si el código es válido
   */
  verificarCodigoRecuperacion(email: string, codigo: string): Observable<boolean> {
    return this.apollo.mutate<{ verificarCodigoRecuperacion: boolean }>({
      mutation: VERIFICAR_CODIGO_RECUPERACION,
      variables: { email, codigo }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] verificarCodigoRecuperacion raw:', raw)),
      map(result => result.data?.verificarCodigoRecuperacion ?? false)
    );
  }

  /**
   * Cambia la contraseña del usuario usando el código de recuperación
   * @param email Email del usuario
   * @param codigo Código de 6 dígitos
   * @param nuevaPassword Nueva contraseña
   * @returns Observable<boolean> true si se cambió correctamente
   */
  cambiarPasswordConCodigo(email: string, codigo: string, nuevaPassword: string): Observable<boolean> {
    return this.apollo.mutate<{ cambiarPasswordConCodigo: boolean }>({
      mutation: CAMBIAR_PASSWORD_CON_CODIGO,
      variables: { email, codigo, nuevaPassword }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] cambiarPasswordConCodigo raw:', raw)),
      map(result => result.data?.cambiarPasswordConCodigo ?? false)
    );
  }
  
}