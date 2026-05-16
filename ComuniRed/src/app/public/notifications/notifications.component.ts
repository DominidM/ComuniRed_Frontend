import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import {
  NotificacionService,
  Notificacion,
} from '../../services/notificacion.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notificacion[] = [];
  loading = true;
  private currentUserId = '';
  private notifSub?: Subscription;

  constructor(
    private notificacionService: NotificacionService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const user = this.usuarioService.getUser() as any;
    if (user) {
      this.currentUserId = user.id || user._id;
      this.cargarNotificaciones();
      this.suscribirse();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  private cargarNotificaciones(): void {
    this.loading = true;
    this.notificacionService.misNotificaciones(this.currentUserId, 0, 50)
      .subscribe({
        next: (page) => {
          this.notifications = page.content;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private suscribirse(): void {
    this.notifSub = this.notificacionService
      .suscribirseANotificaciones(this.currentUserId)
      .subscribe({
        next: (notif) => {
          if (notif) {
            this.notifications.unshift(notif);
          }
        },
        error: () => {},
      });
  }

  marcarLeida(notif: Notificacion): void {
    if (notif.leida) return;
    this.notificacionService.marcarLeida(notif.id).subscribe({
      next: () => {
        notif.leida = true;
      },
      error: () => {},
    });
  }

  marcarTodasLeidas(): void {
    this.notificacionService
      .marcarTodasLeidas(this.currentUserId)
      .subscribe({
        next: () => {
          this.notifications.forEach((n) => (n.leida = true));
        },
        error: () => {},
      });
  }

  getIcon(tipo: string): string {
    switch (tipo) {
      case 'QUEJA_ESTADO_CAMBIADO':
        return 'published_with_changes';
      case 'QUEJA_CLASIFICADA':
        return 'category';
      case 'NUEVO_MENSAJE':
        return 'message';
      default:
        return 'notifications';
    }
  }

  formatTime(fecha: string): string {
    if (!fecha) return '';
    const diff = (Date.now() - new Date(fecha).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    if (days < 7) return `hace ${days}d`;
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    });
  }
}
