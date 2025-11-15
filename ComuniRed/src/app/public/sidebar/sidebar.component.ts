import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService } from '../../services/usuario.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';
  private destroy$ = new Subject<void>();

  menuItems = [
    { label: 'Inicio', icon: 'home', route: '/public/home' },
    { label: 'Tendencias', icon: 'trending_up', route: '/public/trending' },
    { label: 'Reels', icon: 'video_library', route: '/public/reels' },
    { label: 'Perfil', icon: 'person', route: '/public/profile/', soft: true },
    { label: 'Sugerencias', icon: 'post_add', route: '/public/suggestions', soft: true },
    { label: 'Mensajes', icon: 'message', route: '/public/messages' },
    { label: 'Configuración', icon: 'settings', route: '/public/settings' },
    { label: 'Ayuda', icon: 'help_outline', route: '/public/help' }
  ];

  user: { name: string; handle: string; avatarUrl: string } | null = null;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioInicial();
    this.suscribirActualizacionesUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarUsuarioInicial(): void {
    const usuario = this.usuarioService.getUser();
    if (usuario) {
      this.actualizarVistaUsuario(usuario);
    } else {
      this.establecerUsuarioPorDefecto();
    }
  }

  private suscribirActualizacionesUsuario(): void {
    this.usuarioService.usuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          if (usuario) {
            this.actualizarVistaUsuario(usuario);
          } else {
            this.user = null;
          }
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.establecerUsuarioPorDefecto();
        }
      });
  }

  private actualizarVistaUsuario(usuario: any): void {
    const nombre = usuario.nombre?.trim() ?? '';
    const apellido = usuario.apellido?.trim() ?? '';
    const email = usuario.email?.trim() ?? '';
    
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const avatarUrl = this.obtenerAvatarUrl(usuario.foto_perfil);

    this.user = {
      name: nombreCompleto || email || 'Usuario',
      handle: email ? `@${email.split('@')[0]}` : '@usuario',
      avatarUrl
    };
  }

  private obtenerAvatarUrl(fotoPerfil: string | null | undefined): string {
    if (!fotoPerfil || fotoPerfil.trim() === '') {
      return this.DEFAULT_AVATAR;
    }

    if (this.usuarioService.esFotoCloudinary(fotoPerfil)) {
      return this.usuarioService.obtenerFotoMiniatura(fotoPerfil, 40);
    }

    return fotoPerfil;
  }

  private establecerUsuarioPorDefecto(): void {
    this.user = {
      name: 'Tu Usuario',
      handle: '@usuario',
      avatarUrl: this.DEFAULT_AVATAR
    };
  }

  onSalir(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']).catch(err => {
      console.error('Error al navegar a login:', err);
    });
  }
}
