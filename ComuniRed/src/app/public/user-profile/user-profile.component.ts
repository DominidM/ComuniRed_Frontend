import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Usuario, EstadoRelacion } from '../../services/usuario.service';
import { SeguimientoService, Seguimiento } from '../../services/seguimiento.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentTab = 'actividad';
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';

  usuario: Usuario | null = null;
  usuarioActualId: string = '';
  estadoRelacion: EstadoRelacion | null = null;
  seguidoresCount: number = 0;
  seguidosCount: number = 0;
  cargando = true;
  procesando = false;
  esPropioUsuario = false;

  mostrarModalSeguidores: boolean = false;
  mostrarModalSeguidos: boolean = false;
  listaSeguidores: Usuario[] = [];
  listaSeguidos: Usuario[] = [];
  loadingModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService
  ) {}

  ngOnInit(): void {
    const usuarioActual = this.usuarioService.getUser();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioActualId = usuarioActual.id;

    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.esPropioUsuario = userId === this.usuarioActualId;
        
        if (this.esPropioUsuario) {
          // Si es tu propio perfil, redirige a /public/profile
          this.router.navigate(['/public/profile']);
        } else {
          this.cargarPerfil(userId);
        }
      }
    });
  }

  cargarPerfil(userId: string): void {
    this.cargando = true;

    this.usuarioService.obtenerPerfilPublico(userId).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.cargarEstadoRelacion(userId);
        this.cargarContadores(userId);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        alert('Error al cargar el perfil del usuario');
        this.cargando = false;
      }
    });
  }

  cargarEstadoRelacion(userId: string): void {
    this.usuarioService.obtenerEstadoSeguimiento(this.usuarioActualId, userId).subscribe({
      next: (estado) => {
        this.estadoRelacion = estado;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estado de seguimiento:', err);
        this.cargando = false;
      }
    });
  }

  cargarContadores(userId: string): void {
    this.usuarioService.contarSeguidores(userId).subscribe({
      next: (count) => this.seguidoresCount = count
    });

    this.usuarioService.contarSeguidos(userId).subscribe({
      next: (count) => this.seguidosCount = count
    });
  }

  seguir(): void {
    if (!this.usuario || this.procesando) return;
    
    this.procesando = true;
    this.seguimientoService.enviarSolicitud(this.usuarioActualId, this.usuario.id).subscribe({
      next: () => {
        this.procesando = false;
        this.cargarEstadoRelacion(this.usuario!.id);
      },
      error: (err) => {
        console.error('Error al enviar solicitud:', err);
        alert('Error al enviar solicitud de seguimiento');
        this.procesando = false;
      }
    });
  }

  dejarDeSeguir(): void {
    if (!this.usuario || this.procesando) return;
    
    if (!confirm('¿Seguro que deseas dejar de seguir a este usuario?')) return;

    this.procesando = true;
    this.seguimientoService.dejarDeSeguir(this.usuarioActualId, this.usuario.id).subscribe({
      next: () => {
        this.procesando = false;
        this.cargarEstadoRelacion(this.usuario!.id);
        this.seguidoresCount--;
      },
      error: (err) => {
        console.error('Error al dejar de seguir:', err);
        alert('Error al dejar de seguir');
        this.procesando = false;
      }
    });
  }

  enviarMensaje(): void {
    if (!this.usuario) return;
    this.router.navigate(['/public/messages', this.usuario.id]);
  }

  get botonSeguir(): string {
    if (!this.estadoRelacion) return 'Seguir';
    if (this.estadoRelacion.estaSiguiendo) return 'Siguiendo';
    if (this.estadoRelacion.solicitudEnviada) return 'Solicitud enviada';
    return 'Seguir';
  }

  get urlFotoPerfil(): string {
    return this.usuario?.foto_perfil || this.DEFAULT_AVATAR;
  }

  calcularEdad(): number | null {
    if (!this.usuario?.fecha_nacimiento) return null;
    return this.usuarioService.calcularEdad(this.usuario.fecha_nacimiento);
  }

  verSeguidores() {
    if (!this.usuario?.id) return;

    this.mostrarModalSeguidores = true;
    this.loadingModal = true;
    this.listaSeguidores = [];

    this.seguimientoService.obtenerSeguidores(this.usuario.id, 0, 50).subscribe({
      next: (pageData) => {
        const seguimientosSeguidores = pageData.content;
        
        seguimientosSeguidores.forEach((seg: Seguimiento) => {
          this.usuarioService.obtenerUsuarioPorId(seg.seguidorId).subscribe({
            next: (usuario) => {
              this.listaSeguidores.push(usuario);
            },
            error: (error) => {
              console.error('Error cargando seguidor:', error);
            }
          });
        });
        
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error cargando seguidores:', error);
        this.loadingModal = false;
      }
    });
  }

  verSeguidos() {
    if (!this.usuario?.id) return;

    this.mostrarModalSeguidos = true;
    this.loadingModal = true;
    this.listaSeguidos = [];

    this.seguimientoService.obtenerSeguidos(this.usuario.id, 0, 50).subscribe({
      next: (pageData) => {
        const seguimientosSeguidos = pageData.content;
        
        seguimientosSeguidos.forEach((seg: Seguimiento) => {
          this.usuarioService.obtenerUsuarioPorId(seg.seguidoId).subscribe({
            next: (usuario) => {
              this.listaSeguidos.push(usuario);
            },
            error: (error) => {
              console.error('Error cargando seguido:', error);
            }
          });
        });
        
        this.loadingModal = false;
      },
      error: (error) => {
        console.error('Error cargando seguidos:', error);
        this.loadingModal = false;
      }
    });
  }

  cerrarModal() {
    this.mostrarModalSeguidores = false;
    this.mostrarModalSeguidos = false;
  }

  verPerfil(usuario: Usuario) {
    this.cerrarModal();
    this.router.navigate(['/public/user-profile', usuario.id]);
  }

  obtenerFoto(foto_perfil?: string): string {
    if (!foto_perfil || foto_perfil.trim() === '') {
      return this.DEFAULT_AVATAR;
    }
    
    if (this.usuarioService.esFotoCloudinary(foto_perfil)) {
      return this.usuarioService.obtenerFotoMiniatura(foto_perfil, 48);
    }
    
    return foto_perfil;
  }

  changeTab(tab: string): void {
    this.currentTab = tab;
  }
}
