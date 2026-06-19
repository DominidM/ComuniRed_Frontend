import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConversacionService, Mensaje } from '../../../services/conversacion.service';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-message-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="msg-notif-overlay" (click)="cerrar()">
      <div class="msg-notif-card" (click)="$event.stopPropagation()">
        <button class="msg-notif-close" (click)="cerrar()">&times;</button>
        <div class="msg-notif-body" (click)="irConversacion()">
          <img [src]="emisorAvatar" class="msg-notif-avatar" />
          <div class="msg-notif-content">
            <span class="msg-notif-name">{{ emisorNombre }}</span>
            <span class="msg-notif-preview">{{ mensaje?.contenido }}</span>
          </div>
        </div>
        <div class="msg-notif-timer"><div class="msg-notif-bar"></div></div>
      </div>
    </div>
  `,
  styles: [`
    .msg-notif-overlay {
      position: fixed; top: 16px; right: 16px; z-index: 9999;
      animation: msgSlideIn 0.3s ease;
    }
    @keyframes msgSlideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .msg-notif-card {
      background: #1e1e32; border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      width: 320px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .msg-notif-close {
      position: absolute; top: 6px; right: 8px;
      background: none; border: none; color: rgba(255,255,255,0.4);
      font-size: 18px; cursor: pointer; z-index: 1; line-height: 1;
    }
    .msg-notif-close:hover { color: #fff; }
    .msg-notif-body {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; cursor: pointer;
    }
    .msg-notif-body:hover { background: rgba(255,255,255,0.04); }
    .msg-notif-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      object-fit: cover; flex-shrink: 0;
    }
    .msg-notif-content {
      display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;
    }
    .msg-notif-name {
      font-size: 13px; font-weight: 700; color: #fff;
    }
    .msg-notif-preview {
      font-size: 12px; color: rgba(255,255,255,0.55);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .msg-notif-timer {
      height: 3px; background: rgba(255,255,255,0.08);
    }
    .msg-notif-bar {
      height: 100%; background: #0095f6;
      animation: msgShrink 5s linear forwards;
    }
    @keyframes msgShrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `]
})
export class MessageNotificationComponent implements OnInit, OnDestroy {
  visible = false;
  mensaje: Mensaje | null = null;
  emisorNombre = '';
  emisorAvatar = 'assets/img/default-avatar.png';
  private sub!: Subscription;
  private authSub!: Subscription;
  private timer: any;
  private currentUserId = '';

  constructor(
    private conversacionService: ConversacionService,
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authSub = this.usuarioService.usuario$.subscribe(user => {
      if (user?.id) {
        this.currentUserId = user.id;
        this.iniciarSuscripcion();
      } else {
        this.currentUserId = '';
        this.sub?.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.authSub?.unsubscribe();
    clearTimeout(this.timer);
  }

  private iniciarSuscripcion(): void {
    this.sub?.unsubscribe();
    this.sub = this.conversacionService.suscribirseANuevosMensajes(this.currentUserId).subscribe({
      next: (msg) => this.mostrar(msg),
      error: () => {},
    });
  }

  private mostrar(msg: Mensaje): void {
    this.mensaje = msg;
    this.cargarEmisor(msg.emisorId);
    this.reproducirSonido();
    this.visible = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.visible = false, 5000);
  }

  private cargarEmisor(emisorId: string): void {
    this.usuarioService.obtenerUsuarioPorId(emisorId).subscribe({
      next: (u: Usuario) => {
        this.emisorNombre = `${u.nombre} ${u.apellido}`;
        this.emisorAvatar = u.foto_perfil || 'assets/img/default-avatar.png';
      },
      error: () => {
        this.emisorNombre = 'Usuario';
      },
    });
  }

  private reproducirSonido(): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  }

  irConversacion(): void {
    this.visible = false;
    if (this.mensaje) {
      this.router.navigate(['/public/messages'], {
        queryParams: { conversationId: this.mensaje.conversacionId }
      });
    }
  }

  cerrar(): void {
    this.visible = false;
    clearTimeout(this.timer);
  }
}
