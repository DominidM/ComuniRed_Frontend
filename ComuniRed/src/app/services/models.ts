export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol_id: number;
  rol?: Rol;
}

export interface EstadoQueja {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Queja {
  id: number;
  descripcion: string;
  fecha_creacion: string;
  usuario_id: number;
  estado_id: number;
  imagen_url?: string;
  usuario?: Usuario;
  estado?: EstadoQueja;
}

export interface Asignacion {
  id: number;
  queja_id: number;
  queja?: Queja;
  soporte_id: number;
  soporte?: Usuario;
  fecha_asignacion: string;
  atendida: boolean;
}

export interface TipoReaccion {
  id: number;
  nombre: string;
  icono?: string;
}

export interface Reaccion {
  id: number;
  usuario_id: number;
  usuario?: Usuario;
  queja_id: number;
  queja?: Queja;
  tipo_reaccion_id: number;
  tipo_reaccion?: TipoReaccion;
  fecha: string;
}