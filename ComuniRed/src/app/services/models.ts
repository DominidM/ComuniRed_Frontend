// Interfaces principales (camelCase) para usar en el frontend

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
  rolId: number;
  rol?: Rol;
  fotoPerfil?: string; // campo útil para avatarUrl
}

export interface EstadoQueja {
  id: number;
  nombre: string;
  descripcion?: string;
  clave?: string;
}

export interface TipoReaccion {
  id: number;
  nombre: string;
  icono?: string;
}

export interface Reaccion {
  id: number;
  usuarioId: number;
  usuario?: Usuario;
  quejaId: number;
  queja?: Queja;
  tipoReaccionId: number;
  tipoReaccion?: TipoReaccion;
  fecha: string;
}

// Minimal evidence/evidencia model
export interface Evidencia {
  id: string;
  url: string;
  type?: 'IMAGE' | 'VIDEO' | string;
  thumbnailUrl?: string;
}

// Votes summary
export interface VotesSummary {
  yes: number;
  no: number;
  total: number;
}

// Reactions summary for UI
export interface ReactionsSummary {
  counts: Record<string, number>;
  userReaction?: string | null;
  total?: number;
}

// Publicación / Queja usada en el feed
export interface Queja {
  id: number | string;
  descripcion: string;
  fechaCreacion: string;         // iso string
  usuarioId: number;
  estadoId: number;
  imagenUrl?: string;

  // Relaciones embebidas (opcionales, si el backend incluye)
  usuario?: Usuario;
  estado?: EstadoQueja;

  // Campos para UI (opcional, backend o mapper debe proveer)
  title?: string;                // opcional si quieres separar
  category?: { id: string; clave?: string; nombre?: string };
  address?: string;
  location?: { lat: number; lng: number };

  evidence?: Evidencia[];        // evidencias asociadas
  votes?: VotesSummary;
  userVote?: 'YES' | 'NO' | null;
  canVote?: boolean;
  votingEndAt?: string | null;

  reactions?: ReactionsSummary;

  commentsCount?: number;
  comments?: Array<{ id: string; author: Usuario | { name: string }; text: string; createdAt: string }>;

  assignedTo?: { id: string; name: string } | null;
  statusTags?: string[];
  meta?: { saved?: boolean; sharedCount?: number };

  // legacy fields for compatibility with older code
  imagen_url?: string; // optional: keep original if some code uses it
}