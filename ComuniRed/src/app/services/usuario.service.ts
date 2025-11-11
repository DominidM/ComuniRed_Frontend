import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface Usuario {
  id: string;
  foto_perfil?: string;  // URL de Cloudinary
  nombre: string;
  apellido: string;
  dni: string;
  numero_telefono: string;
  sexo: string;
  distrito: string;
  codigo_postal: string;
  direccion: string;
  email: string;
  password?: string;
  rol_id: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
}

export interface UsuarioInput {
  foto_perfil?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  numero_telefono?: string;
  sexo?: string;
  distrito?: string;
  codigo_postal?: string;
  direccion?: string;
  email: string;
  password?: string;
  rol_id: string;
  fecha_nacimiento?: string;
}

export interface UsuarioPage {
  content: Usuario[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Mantén tus queries y mutations existentes
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
        sexo
        distrito
        codigo_postal
        direccion
        email
        rol_id
        fecha_nacimiento
        fecha_registro
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
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
      fecha_nacimiento
      fecha_registro
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
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
      fecha_nacimiento
      fecha_registro
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
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
      fecha_nacimiento
      fecha_registro
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
      sexo
      distrito
      codigo_postal
      direccion
      email
      rol_id
      fecha_nacimiento
      fecha_registro
    }
  }
`;

const ELIMINAR_FOTO_PERFIL = gql`
  mutation EliminarFotoPerfil($usuarioId: ID!) {
    eliminarFotoPerfil(usuarioId: $usuarioId)
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
        fecha_registro
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

export const TOKEN_KEY = 'comunired_token';
export const USER_KEY = 'comunired_user';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiBase = '/graphql';
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
      this.usuarioSubject.next(null);
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
  
  solicitarCodigoRecuperacion(email: string): Observable<boolean> {
    return this.apollo.mutate<{ solicitarCodigoRecuperacion: boolean }>({
      mutation: SOLICITAR_CODIGO_RECUPERACION,
      variables: { email }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] solicitarCodigoRecuperacion raw:', raw)),
      map(result => result.data?.solicitarCodigoRecuperacion ?? false)
    );
  }

  verificarCodigoRecuperacion(email: string, codigo: string): Observable<boolean> {
    return this.apollo.mutate<{ verificarCodigoRecuperacion: boolean }>({
      mutation: VERIFICAR_CODIGO_RECUPERACION,
      variables: { email, codigo }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] verificarCodigoRecuperacion raw:', raw)),
      map(result => result.data?.verificarCodigoRecuperacion ?? false)
    );
  }

  cambiarPasswordConCodigo(email: string, codigo: string, nuevaPassword: string): Observable<boolean> {
    return this.apollo.mutate<{ cambiarPasswordConCodigo: boolean }>({
      mutation: CAMBIAR_PASSWORD_CON_CODIGO,
      variables: { email, codigo, nuevaPassword }
    }).pipe(
      tap(raw => console.debug('[UsuarioService] cambiarPasswordConCodigo raw:', raw)),
      map(result => result.data?.cambiarPasswordConCodigo ?? false)
    );
  }

  // 🆕 MÉTODOS CLOUDINARY

  /**
   * Eliminar foto de perfil (de Cloudinary y MongoDB)
   */
  eliminarFotoPerfil(usuarioId: string): Observable<boolean> {
    return this.apollo.mutate<{ eliminarFotoPerfil: boolean }>({
      mutation: ELIMINAR_FOTO_PERFIL,
      variables: { usuarioId },
      refetchQueries: [
        { query: OBTENER_USUARIO_POR_ID, variables: { id: usuarioId } }
      ]
    }).pipe(
      tap(raw => console.debug('[UsuarioService] eliminarFotoPerfil raw:', raw)),
      map(result => result.data?.eliminarFotoPerfil ?? false)
    );
  }

  /**
   * Subir foto directamente a Cloudinary desde el frontend
   */
  async subirFotoCloudinary(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'ml_default');  // ← CAMBIAR: era 'usuarios'
    formData.append('folder', 'usuarios');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/da4wxtjwu/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.secure_url;
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Actualizar foto de perfil (subir y guardar en un solo paso)
   */
  async actualizarFotoPerfil(usuarioId: string, archivo: File): Promise<Usuario | undefined> {
    try {
      // 1. Subir imagen a Cloudinary
      const url = await this.subirFotoCloudinary(archivo);

      // 2. Obtener datos actuales del usuario
      const usuario = await this.obtenerUsuarioPorId(usuarioId).toPromise();

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // 3. Actualizar usuario con la nueva URL
      return this.actualizarUsuario(usuarioId, {
        ...usuario,
        foto_perfil: url
      }).toPromise();
    } catch (error) {
      console.error('Error actualizando foto de perfil:', error);
      throw error;
    }
  }

  /**
   * Verificar si la foto es URL de Cloudinary
   */
  esFotoCloudinary(foto_perfil?: string): boolean {
    return foto_perfil?.includes('cloudinary.com') ?? false;
  }

  /**
   * Obtener URL optimizada para miniatura
   */
  obtenerFotoMiniatura(foto_perfil?: string, width: number = 150): string {
    if (!foto_perfil) {
      return '/assets/img/default-avatar.png';
    }

    if (!this.esFotoCloudinary(foto_perfil)) {
      return foto_perfil;
    }

    // Transformar URL de Cloudinary para miniatura optimizada
    return foto_perfil.replace(
      '/upload/',
      `/upload/w_${width},h_${width},c_fill,g_face,q_auto,f_auto/`
    );
  }

  /**
   * Obtener placeholder mientras carga la imagen
   */
  obtenerPlaceholderFoto(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e0e0e0" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="48" dy="0.35em" x="50%" y="50%" text-anchor="middle"%3E👤%3C/text%3E%3C/svg%3E';
  }

  // MÉTODOS AUXILIARES

  calcularEdad(fechaNacimiento: string): number | null {
    if (!fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  formatearFechaRegistro(fechaRegistro: string): string {
    if (!fechaRegistro) return 'Sin fecha';
    
    const fecha = new Date(fechaRegistro);
    return fecha.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
