import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  ConversacionService,
  Conversacion,
  Mensaje,
} from '../../../services/conversacion.service';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { SeguimientoService, EstadoSeguimiento } from '../../../services/seguimiento.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ChatPreview {
  id: string;
  conversacionId: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  preview: string;
  time: string;
  online: boolean;
  unread: boolean;
  unreadCount?: number;
}

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css'],
})
export class RightbarComponent implements OnInit, OnDestroy {
  mensajes: ChatPreview[] = [];
  loadingMensajes = true;

  sugerencias: Usuario[] = [];
  estadosSeguimiento: Map<string, EstadoSeguimiento> = new Map();
  cargandoSeguimiento: Set<string> = new Set();
  loadingSugerencias = false;

  private currentUserId = '';
  private mensajeSub?: Subscription;

  // Colores para avatares sin foto
  private readonly COLORS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
  ];

  constructor(
    private router: Router,
    private conversacionService: ConversacionService,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.currentUserId = u.id || u._id;
      this.loadConversaciones();
      this.iniciarSuscripcionMensajes();
      this.cargarSugerencias();
    }
  }

  ngOnDestroy(): void {
    this.mensajeSub?.unsubscribe();
  }

  private iniciarSuscripcionMensajes(): void {
    this.mensajeSub = this.conversacionService
      .suscribirseANuevosMensajes(this.currentUserId)
      .subscribe({
        next: (mensaje) => {
          if (!mensaje) return;
          const idx = this.mensajes.findIndex(
            (c) => c.conversacionId === mensaje.conversacionId,
          );
          if (idx >= 0) {
            const chat = this.mensajes[idx];
            this.mensajes[idx] = {
              ...chat,
              preview: mensaje.contenido,
              time: this.formatTime(mensaje.fechaEnvio),
              unread: true,
              unreadCount: (chat.unreadCount ?? 0) + 1,
            };
            this.mensajes = [...this.mensajes];
          } else {
            this.loadConversaciones();
          }
        },
        error: () => {},
      });
  }

  private loadConversaciones(): void {
    this.loadingMensajes = true;

    this.conversacionService
      .misConversaciones(this.currentUserId, 0, 10)
      .subscribe({
        next: (page) => {
          if (page.content.length === 0) {
            this.mensajes = [];
            this.loadingMensajes = false;
            return;
          }

          // Obtener el ID del otro participante de cada conversación
          const requests = page.content.map((conv, i) => {
            const otroId =
              conv.participante1Id === this.currentUserId
                ? conv.participante2Id
                : conv.participante1Id;

            return this.usuarioService.obtenerUsuarioPorId(otroId).pipe(
              catchError(() => of(null)),
              map((usuario) => this.mapConversacion(conv, i, usuario)),
            );
          });

          forkJoin(requests).subscribe({
            next: (chats) => {
              this.mensajes = chats.filter((c) => c.unread);
              this.loadingMensajes = false;
            },
            error: () => {
              this.loadingMensajes = false;
            },
          });
        },
        error: () => {
          this.loadingMensajes = false;
        },
      });
  }

  private mapConversacion(
    conv: Conversacion,
    index: number,
    usuario: any,
  ): ChatPreview {
    const otroId =
      conv.participante1Id === this.currentUserId
        ? conv.participante2Id
        : conv.participante1Id;

    const unread = conv.ultimoMensaje
      ? !conv.ultimoMensaje.leido &&
        conv.ultimoMensaje.emisorId !== this.currentUserId
      : false;

    const nombre = usuario
      ? `${usuario.nombre} ${usuario.apellido}`.trim()
      : otroId;

    const initials = usuario
      ? `${usuario.nombre?.[0] ?? ''}${usuario.apellido?.[0] ?? ''}`.toUpperCase()
      : '??';

    const avatarUrl = usuario
      ? this.usuarioService.obtenerFotoMiniatura(usuario.foto_perfil, 44)
      : null;

    return {
      id: otroId,
      conversacionId: conv.id,
      name: nombre,
      initials,
      color: avatarUrl ? '' : this.COLORS[index % this.COLORS.length],
      avatarUrl, // ← campo nuevo
      preview: unread
        ? conv.ultimoMensaje?.contenido || ''
        : conv.ultimoMensaje?.contenido || 'Sin mensajes',
      time: this.formatTime(conv.fechaUltimaActividad),
      online: usuario?.estaEnLinea ?? false,
      unread,
      unreadCount: unread ? 1 : undefined,
    };
  }
  private formatTime(fecha: string): string {
    if (!fecha) return '';
    const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  // ── Navegación ────────────────────────────────────────────────
  onAbrirChat(chat: ChatPreview): void {
    this.router.navigate(['/public/messages', chat.conversacionId]);
  }

  onNuevoMensaje(): void {
    this.router.navigate(['/public/messages/new']);
  }

  // ── Sugerencias ──────────────────────────────────────────────
  private cargarSugerencias(): void {
    if (!this.currentUserId) return;
    this.loadingSugerencias = true;
    this.seguimientoService.obtenerUsuariosSugeridos(this.currentUserId, 0, 5).subscribe({
      next: (page) => {
        this.sugerencias = page.content || [];
        this.sugerencias.forEach(u => this.cargarEstado(u));
        this.loadingSugerencias = false;
      },
      error: () => { this.loadingSugerencias = false; },
    });
  }

  private cargarEstado(usuario: Usuario): void {
    if (!this.currentUserId || !usuario.id) return;
    this.seguimientoService.obtenerEstadoSeguimiento(this.currentUserId, usuario.id).subscribe({
      next: (estado) => {
        this.estadosSeguimiento.set(usuario.id, estado);
        this.estadosSeguimiento = new Map(this.estadosSeguimiento);
      },
    });
  }

  getEstado(usuario: Usuario): EstadoSeguimiento | undefined {
    return this.estadosSeguimiento.get(usuario.id);
  }

  estaCargando(usuario: Usuario): boolean {
    return this.cargandoSeguimiento.has(usuario.id);
  }

  toggleSeguir(usuario: Usuario): void {
    if (!this.currentUserId || !usuario.id) return;
    const estado = this.getEstado(usuario);
    if (!estado) return;

    this.cargandoSeguimiento.add(usuario.id);

    if (estado.estaSiguiendo || estado.solicitudEnviada) {
      this.seguimientoService.dejarDeSeguir(this.currentUserId, usuario.id).subscribe({
        next: () => {
          this.estadosSeguimiento.set(usuario.id, {
            estaSiguiendo: false, teSigue: false,
            seguimientoMutuo: false, solicitudPendiente: false,
            solicitudEnviada: false,
          });
          this.estadosSeguimiento = new Map(this.estadosSeguimiento);
          this.cargandoSeguimiento.delete(usuario.id);
        },
        error: () => this.cargandoSeguimiento.delete(usuario.id),
      });
    } else {
      this.seguimientoService.enviarSolicitud(this.currentUserId, usuario.id).subscribe({
        next: () => {
          this.estadosSeguimiento.set(usuario.id, {
            ...estado, estaSiguiendo: true, solicitudEnviada: false,
          });
          this.estadosSeguimiento = new Map(this.estadosSeguimiento);
          this.cargandoSeguimiento.delete(usuario.id);
        },
        error: () => this.cargandoSeguimiento.delete(usuario.id),
      });
    }
  }

  verPerfil(usuario: Usuario): void {
    if (!usuario.id) return;
    usuario.id === this.currentUserId
      ? this.router.navigate(['/public/profile'])
      : this.router.navigate(['/public/user-profile', usuario.id]);
  }

  obtenerFoto(foto?: string): string {
    return this.usuarioService.obtenerFotoMiniatura(foto, 44);
  }
}
