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
  sexo: string;
  distrito: string;
  codigo_postal: string;
  direccion: string;
  email: string;
  password?: string;
  rol_id: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
  ultimaActividad?: string;  // 👈 NUEVO
  estaEnLinea?: boolean;     // 👈 NUEVO
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

export interface EstadoRelacion {
  estaSiguiendo: boolean;
  teSigue: boolean;
  seguimientoMutuo: boolean;
  solicitudPendiente: boolean;
  solicitudEnviada: boolean;
}

// ========================================
// QUERIES
// ========================================

const OBTENER_USUARIOS = gql`
  query ObtenerUsuarios($page: Int!, $size: Int!) {
    obtenerUsuarios(page: $page, size: $size) {
      content {
        id foto_perfil nombre apellido dni numero_telefono
        sexo distrito codigo_postal direccion email rol_id
        fecha_nacimiento fecha_registro
        ultimaActividad estaEnLinea
      }
      totalElements totalPages number size
    }
  }
`;

const OBTENER_TODOS_LOS_USUARIOS = gql`
  query ObtenerTodosLosUsuarios {
    obtenerTodosLosUsuarios {
      id foto_perfil nombre apellido dni numero_telefono
      sexo distrito codigo_postal direccion email rol_id
      fecha_nacimiento fecha_registro
      ultimaActividad estaEnLinea
    }
  }
`;

const OBTENER_USUARIO_POR_ID = gql`
  query ObtenerUsuarioPorId($id: ID!) {
    obtenerUsuarioPorId(id: $id) {
      id foto_perfil nombre apellido dni numero_telefono
      sexo distrito codigo_postal direccion email rol_id
      fecha_nacimiento fecha_registro
      ultimaActividad estaEnLinea
    }
  }
`;

const OBTENER_PERFIL_PUBLICO = gql`
  query ObtenerPerfilPublico($id: ID!) {
    obtenerUsuarioPorId(id: $id) {
      id foto_perfil nombre apellido distrito
      fecha_registro fecha_nacimiento
      ultimaActividad estaEnLinea
    }
  }
`;

const CONTAR_USUARIOS_POR_ROL = gql`
  query ContarUsuariosPorRol($rol_id: ID!) {
    contarUsuariosPorRol(rol_id: $rol_id)
  }
`;

const ESTADO_SEGUIMIENTO = gql`
  query EstadoSeguimiento($usuarioActualId: ID!, $otroUsuarioId: ID!) {
    estadoSeguimiento(usuarioActualId: $usuarioActualId, otroUsuarioId: $otroUsuarioId) {
      estaSiguiendo teSigue seguimientoMutuo
      solicitudPendiente solicitudEnviada
    }
  }
`;

const CONTAR_SEGUIDORES = gql`
  query ContarSeguidores($usuarioId: ID!) {
    contarSeguidores(usuarioId: $usuarioId)
  }
`;

const CONTAR_SEGUIDOS = gql`
  query ContarSeguidos($usuarioId: ID!) {
    contarSeguidos(usuarioId: $usuarioId)
  }
`;

// ========================================
// MUTATIONS
// ========================================

const CREAR_USUARIO = gql`
  mutation CrearUsuario($usuario: UsuarioInput!) {
    crearUsuario(usuario: $usuario) {
      id foto_perfil nombre apellido dni numero_telefono
      sexo distrito codigo_postal direccion email rol_id
      fecha_nacimiento fecha_registro
      ultimaActividad estaEnLinea
    }
  }
`;

const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario($id: ID!, $usuario: UsuarioInput!) {
    actualizarUsuario(id: $id, usuario: $usuario) {
      id foto_perfil nombre apellido dni numero_telefono
      sexo distrito codigo_postal direccion email rol_id
      fecha_nacimiento fecha_registro
      ultimaActividad estaEnLinea
    }
  }
`;

const ELIMINAR_USUARIO = gql`
  mutation EliminarUsuario($id: ID!) {
    eliminarUsuario(id: $id)
  }
`;

const ELIMINAR_FOTO_PERFIL = gql`
  mutation EliminarFotoPerfil($usuarioId: ID!) {
    eliminarFotoPerfil(usuarioId: $usuarioId)
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      usuario {
        id foto_perfil nombre apellido email rol_id fecha_registro
        ultimaActividad estaEnLinea
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
  private userCountSubject = new BehaviorSubject<number>(0);
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getUser());
  
  public usuario$ = this.usuarioSubject.asObservable();
  public userCount$ = this.userCountSubject.asObservable();

  constructor(private apollo: Apollo) {
    this.refreshUserCount();
  }

  // ========================================
  // QUERIES BÁSICAS
  // ========================================

  obtenerUsuarios(page: number, size: number): Observable<UsuarioPage> {
    return this.apollo.watchQuery<{ obtenerUsuarios: UsuarioPage }>({
      query: OBTENER_USUARIOS,
      variables: { page, size },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map(result => result.data?.obtenerUsuarios || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size: size
      } as UsuarioPage)
    );
  }

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.apollo.watchQuery<{ obtenerTodosLosUsuarios: Usuario[] }>({
      query: OBTENER_TODOS_LOS_USUARIOS,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data?.obtenerTodosLosUsuarios || [])
    );
  }

  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.apollo.watchQuery<{ obtenerUsuarioPorId: Usuario }>({
      query: OBTENER_USUARIO_POR_ID,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.obtenerUsuarioPorId)
    );
  }

  obtenerPerfilPublico(usuarioId: string): Observable<Usuario> {
    return this.apollo.query<{ obtenerUsuarioPorId: Usuario }>({
      query: OBTENER_PERFIL_PUBLICO,
      variables: { id: usuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.obtenerUsuarioPorId)
    );
  }

  contarUsuariosPorRol(rolId: string): Observable<number> {
    return this.apollo.watchQuery<{ contarUsuariosPorRol: number }>({
      query: CONTAR_USUARIOS_POR_ROL,
      variables: { rol_id: rolId },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.contarUsuariosPorRol)
    );
  }

  // ========================================
  // 🆕 MÉTODOS DE ESTADO EN LÍNEA
  // ========================================

  /**
   * Verifica si un usuario está en línea
   */
  estaEnLinea(usuario: Usuario): boolean {
    return usuario?.estaEnLinea ?? false;
  }

  /**
   * Obtiene el texto del estado
   */
  obtenerTextoEstado(usuario: Usuario): string {
    return this.estaEnLinea(usuario) ? 'En línea' : 'Desconectado';
  }

  /**
   * Obtiene la última actividad formateada
   */
  obtenerUltimaActividad(usuario: Usuario): string {
    if (!usuario?.ultimaActividad) {
      return 'Sin actividad reciente';
    }

    const fecha = new Date(usuario.ultimaActividad);
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas}h`;
    
    const dias = Math.floor(horas / 24);
    return `Hace ${dias}d`;
  }

  // ========================================
  // ESTADO DE SEGUIMIENTO
  // ========================================

  obtenerEstadoSeguimiento(usuarioActualId: string, otroUsuarioId: string): Observable<EstadoRelacion> {
    return this.apollo.query<{ estadoSeguimiento: EstadoRelacion }>({
      query: ESTADO_SEGUIMIENTO,
      variables: { usuarioActualId, otroUsuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.estadoSeguimiento || {
        estaSiguiendo: false,
        teSigue: false,
        seguimientoMutuo: false,
        solicitudPendiente: false,
        solicitudEnviada: false
      })
    );
  }

  contarSeguidores(usuarioId: string): Observable<number> {
    return this.apollo.query<{ contarSeguidores: number }>({
      query: CONTAR_SEGUIDORES,
      variables: { usuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.contarSeguidores || 0)
    );
  }

  contarSeguidos(usuarioId: string): Observable<number> {
    return this.apollo.query<{ contarSeguidos: number }>({
      query: CONTAR_SEGUIDOS,
      variables: { usuarioId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.contarSeguidos || 0)
    );
  }

  // ========================================
  // MUTATIONS CRUD
  // ========================================

  crearUsuario(usuario: UsuarioInput): Observable<Usuario> {
    return this.apollo.mutate<{ crearUsuario: Usuario }>({
      mutation: CREAR_USUARIO,
      variables: { usuario },
      refetchQueries: [
        { query: OBTENER_USUARIOS, variables: { page: 0, size: 10 } },
        { query: OBTENER_TODOS_LOS_USUARIOS }
      ]
    }).pipe(
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
      tap(() => this.refreshUserCount()),
      map(result => result.data!.eliminarUsuario)
    );
  }

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  login(email: string, password: string) {
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
      .pipe(map(page => page?.totalElements ?? 0))
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

  // ========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ========================================

  solicitarCodigoRecuperacion(email: string): Observable<boolean> {
    return this.apollo.mutate<{ solicitarCodigoRecuperacion: boolean }>({
      mutation: SOLICITAR_CODIGO_RECUPERACION,
      variables: { email }
    }).pipe(
      map(result => result.data?.solicitarCodigoRecuperacion ?? false)
    );
  }

  verificarCodigoRecuperacion(email: string, codigo: string): Observable<boolean> {
    return this.apollo.mutate<{ verificarCodigoRecuperacion: boolean }>({
      mutation: VERIFICAR_CODIGO_RECUPERACION,
      variables: { email, codigo }
    }).pipe(
      map(result => result.data?.verificarCodigoRecuperacion ?? false)
    );
  }

  cambiarPasswordConCodigo(email: string, codigo: string, nuevaPassword: string): Observable<boolean> {
    return this.apollo.mutate<{ cambiarPasswordConCodigo: boolean }>({
      mutation: CAMBIAR_PASSWORD_CON_CODIGO,
      variables: { email, codigo, nuevaPassword }
    }).pipe(
      map(result => result.data?.cambiarPasswordConCodigo ?? false)
    );
  }

  // ========================================
  // CLOUDINARY
  // ========================================

  eliminarFotoPerfil(usuarioId: string): Observable<boolean> {
    return this.apollo.mutate<{ eliminarFotoPerfil: boolean }>({
      mutation: ELIMINAR_FOTO_PERFIL,
      variables: { usuarioId },
      refetchQueries: [
        { query: OBTENER_USUARIO_POR_ID, variables: { id: usuarioId } }
      ]
    }).pipe(
      map(result => result.data?.eliminarFotoPerfil ?? false)
    );
  }

  async subirFotoCloudinary(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'ml_default');
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

  async actualizarFotoPerfil(usuarioId: string, archivo: File): Promise<Usuario | undefined> {
    try {
      const url = await this.subirFotoCloudinary(archivo);
      const usuario = await this.obtenerUsuarioPorId(usuarioId).toPromise();

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return this.actualizarUsuario(usuarioId, {
        ...usuario,
        foto_perfil: url
      }).toPromise();
    } catch (error) {
      console.error('Error actualizando foto de perfil:', error);
      throw error;
    }
  }

  esFotoCloudinary(foto_perfil?: string): boolean {
    return foto_perfil?.includes('cloudinary.com') ?? false;
  }

  obtenerFotoMiniatura(foto_perfil?: string, width: number = 150): string {
    if (!foto_perfil) {
      return '/assets/img/default-avatar.png';
    }

    if (!this.esFotoCloudinary(foto_perfil)) {
      return foto_perfil;
    }

    return foto_perfil.replace(
      '/upload/',
      `/upload/w_${width},h_${width},c_fill,g_face,q_auto,f_auto/`
    );
  }

  obtenerPlaceholderFoto(): string {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e0e0e0" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="48" dy="0.35em" x="50%" y="50%" text-anchor="middle"%3E👤%3C/text%3E%3C/svg%3E';
  }

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
