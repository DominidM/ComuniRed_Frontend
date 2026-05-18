import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  ConversacionService,
  Conversacion,
  Mensaje,
} from '../../../services/conversacion.service';
import { UsuarioService } from '../../../services/usuario.service';
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

  trends = [
    {
      tag: 'VíasEnMalEstado',
      count: 45,
      desc: 'Múltiples reportes sobre huecos',
    },
    {
      tag: 'AlumbradoPúblico',
      count: 23,
      desc: 'Postes dañados en varios sectores',
    },
    { tag: 'AguaPotable', count: 18, desc: 'Cortes reportados en la zona' },
  ];

  stats = { today: 247, solvedPercent: 89 };

  accessibilityOpen = false;
  textScale = 1;
  isHighContrast = false;
  isReducedMotion = false;

  private onKey = this.handleKeyDown.bind(this);
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
  ) {}

  ngOnInit(): void {
    this.loadAccesibilidad();
    document.addEventListener('keydown', this.onKey, true);

    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.currentUserId = u.id || u._id;
      this.loadConversaciones();
      this.iniciarSuscripcionMensajes();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKey, true);
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

  // ── Accesibilidad ─────────────────────────────────────────────
  private loadAccesibilidad(): void {
    const savedScale = parseFloat(localStorage.getItem('acc-textScale') || '1');
    this.textScale = isNaN(savedScale) ? 1 : savedScale;
    this.isHighContrast = localStorage.getItem('acc-highContrast') === '1';
    this.isReducedMotion = localStorage.getItem('acc-reducedMotion') === '1';

    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    if (this.isHighContrast)
      document.documentElement.classList.add('high-contrast');
    if (this.isReducedMotion)
      document.documentElement.classList.add('reduced-motion');
  }

  toggleAccessibility(): void {
    this.accessibilityOpen = !this.accessibilityOpen;
  }

  increaseText(): void {
    this.textScale = Math.min(1.6, +(this.textScale + 0.1).toFixed(2));
    this.applyTextScale();
  }
  decreaseText(): void {
    this.textScale = Math.max(0.8, +(this.textScale - 0.1).toFixed(2));
    this.applyTextScale();
  }
  resetText(): void {
    this.textScale = 1;
    this.applyTextScale();
    localStorage.removeItem('acc-textScale');
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    document.documentElement.classList.toggle(
      'high-contrast',
      this.isHighContrast,
    );
    this.isHighContrast
      ? localStorage.setItem('acc-highContrast', '1')
      : localStorage.removeItem('acc-highContrast');
  }

  toggleReducedMotion(): void {
    this.isReducedMotion = !this.isReducedMotion;
    document.documentElement.classList.toggle(
      'reduced-motion',
      this.isReducedMotion,
    );
    this.isReducedMotion
      ? localStorage.setItem('acc-reducedMotion', '1')
      : localStorage.removeItem('acc-reducedMotion');
  }

  private applyTextScale(): void {
    document.documentElement.style.fontSize = `${Math.round(this.textScale * 100)}%`;
    localStorage.setItem('acc-textScale', String(this.textScale));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.accessibilityOpen && e.key === 'Escape')
      this.accessibilityOpen = false;
  }
}
