import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { UsuarioService, Usuario } from '../../services/usuario.service';

export type BadgeType = 'count' | 'dot' | 'new' | null;

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  soft?: boolean;
  badgeType?: BadgeType;
  badgeCount?: number;
}

interface SidebarUser {
  name: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
}

@Component({
  selector: 'app-public-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: SidebarUser | null = null;
  userId: string | null = null;

  // ── Grupos del menú ─────────────────────────────────────────────
  menuPrimary: MenuItem[] = [
    { label: 'Inicio',         icon: 'home',          route: '/public/home',        exact: true },
    { label: 'Mensajes',       icon: 'chat_bubble',   route: '/public/messages',    badgeType: 'count', badgeCount: 0 },
    { label: 'Tendencias',     icon: 'trending_up',   route: '/public/trending' },
    { label: 'Reels',          icon: 'video_library', route: '/public/reels',       badgeType: 'new' },
  ];

  menuSecondary: MenuItem[] = [
    { label: 'Sugerencias',    icon: 'group_add',     route: '/public/suggestions', soft: true, badgeType: 'dot' },
    { label: 'Perfil',         icon: 'person',        route: '/public/profile',     soft: true },
  ];

  menuSettings: MenuItem[] = [
    { label: 'Configuración',  icon: 'settings',      route: '/public/settings' },
    { label: 'Ayuda',          icon: 'help_outline',  route: '/public/help' },
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.usuarioService.usuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario) => {
        if (usuario) {
          this.userId = usuario.id;
          this.actualizarVistaUsuario(usuario);
          this.cargarContadores(usuario.id);
        } else {
          this.user = null;
          this.userId = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private actualizarVistaUsuario(usuario: Usuario): void {
    const nombre   = usuario.nombre?.trim()   ?? '';
    const apellido = usuario.apellido?.trim() ?? '';
    const email    = usuario.email?.trim()    ?? '';

    this.user = {
      name:           `${nombre} ${apellido}`.trim() || email || 'Usuario',
      handle:         email ? `@${email.split('@')[0]}` : '@usuario',
      initials:       this.obtenerIniciales(nombre, apellido, email),
      avatarUrl:      this.obtenerAvatarUrl(usuario.foto_perfil),
      followersCount: 0,
      followingCount: 0,
    };
  }

  private cargarContadores(usuarioId: string): void {
    forkJoin({
      seguidores: this.usuarioService.contarSeguidores(usuarioId).pipe(catchError(() => of(0))),
      seguidos:   this.usuarioService.contarSeguidos(usuarioId).pipe(catchError(() => of(0))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ seguidores, seguidos }) => {
        if (this.user) {
          this.user = { ...this.user, followersCount: seguidores, followingCount: seguidos };
        }
        // Punto rojo en Sugerencias si sigue a pocas personas
        const sugerencias = this.menuSecondary.find(m => m.route === '/public/suggestions');
        if (sugerencias) {
          sugerencias.badgeType = seguidos < 5 ? 'dot' : null;
        }
      });
  }

  private obtenerIniciales(nombre: string, apellido: string, email: string): string {
    if (nombre && apellido) return `${nombre[0]}${apellido[0]}`.toUpperCase();
    if (nombre) return nombre.slice(0, 2).toUpperCase();
    return email.slice(0, 2).toUpperCase();
  }

  private obtenerAvatarUrl(fotoPerfil: string | undefined): string | null {
    if (!fotoPerfil?.trim()) return null;
    if (this.usuarioService.esFotoCloudinary(fotoPerfil)) {
      return this.usuarioService.obtenerFotoMiniatura(fotoPerfil, 52);
    }
    return fotoPerfil;
  }

  formatearContador(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
  }

  badgeLabel(item: MenuItem): string {
    const n = item.badgeCount ?? 0;
    return n > 99 ? '99+' : n.toString();
  }

  onCrearPublicacion(): void {
    this.router.navigate(['/public/create']).catch(console.error);
  }

  onSalir(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']).catch(console.error);
  }
}