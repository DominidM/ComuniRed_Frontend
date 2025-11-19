import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { SeguimientoService, Seguimiento } from '../../services/seguimiento.service';
import { QuejaService } from '../../services/queja.service';
import { ComentarioService } from '../../services/comentario.service';
import { ReaccionService } from '../../services/reaccion.service'; // ✅

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentTab = 'actividad';
  private readonly DEFAULT_AVATAR = 'https://res.cloudinary.com/da4wxtjwu/image/upload/v1762842677/61e50034-ab7c-4dc5-9d75-7c27a2265cee.png';

  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    foto_perfil: string;
    fecha_registro: string | null;
  } | null = null;

  seguidoresCount: number = 0;
  seguidosCount: number = 0;
  loading: boolean = false;

  // Actividad
  misQuejas: any[] = [];
  quejasComentadas: any[] = [];
  cantidadQuejas: number = 0;
  cantidadComentarios: number = 0;
  cantidadReacciones: number = 0; // ✅
  loadingActividad: boolean = false;

  mostrarModalSeguidores: boolean = false;
  mostrarModalSeguidos: boolean = false;

  listaSeguidores: Usuario[] = [];
  listaSeguidos: Usuario[] = [];
  loadingModal: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
    private quejaService: QuejaService,
    private comentarioService: ComentarioService,
    private reaccionService: ReaccionService, // ✅
    private router: Router
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser();

    if (u) {
      this.user = {
        id: (u as any).id,
        nombre: (u as any).nombre || 'Usuario',
        apellido: (u as any).apellido || '',
        email: (u as any).email || 'correo@ejemplo.com',
        foto_perfil: (u as any).foto_perfil || this.DEFAULT_AVATAR,
        fecha_registro: (u as any).fecha_registro || null
      };
      
      this.cargarContadores();
      this.cargarActividad();
    } else {
      this.user = {
        id: '',
        nombre: 'Usuario',
        apellido: '',
        email: 'correo@ejemplo.com',
        foto_perfil: this.DEFAULT_AVATAR,
        fecha_registro: null
      };
    }
  }

  cargarContadores() {
    if (!this.user?.id) return;

    this.loading = true;

    this.seguimientoService.contarSeguidores(this.user.id).subscribe({
      next: (count) => {
        this.seguidoresCount = count;
      },
      error: (error: any) => {
        console.error('Error contando seguidores:', error);
      }
    });

    this.seguimientoService.contarSeguidos(this.user.id).subscribe({
      next: (count) => {
        this.seguidosCount = count;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error contando seguidos:', error);
        this.loading = false;
      }
    });
  }

  cargarActividad() {
    if (!this.user?.id) return;

    this.loadingActividad = true;

    // Cargar quejas del usuario
    this.quejaService.quejasPorUsuario(this.user.id, this.user.id).subscribe({
      next: (quejas: any[]) => {
        this.misQuejas = quejas || [];
        this.cantidadQuejas = quejas?.length || 0;
      },
      error: (error: any) => {
        console.error('Error cargando quejas:', error);
        this.misQuejas = [];
      }
    });

    // Cargar quejas donde el usuario comentó
    this.comentarioService.obtenerReportesComentados(this.user.id, 0, 10).subscribe({
      next: (quejas: any[]) => {
        this.quejasComentadas = quejas;
        this.loadingActividad = false;
      },
      error: (error: any) => {
        console.error('Error cargando quejas comentadas:', error);
        this.quejasComentadas = [];
        this.loadingActividad = false;
      }
    });

    // Contar comentarios
    this.comentarioService.contarComentariosPorUsuario(this.user.id).subscribe({
      next: (count: number) => {
        this.cantidadComentarios = count;
      },
      error: (error: any) => {
        console.error('Error contando comentarios:', error);
      }
    });

    // ✅ Contar reacciones del usuario
    this.reaccionService.contarReaccionesPorUsuario(this.user.id).subscribe({
      next: (count: number) => {
        this.cantidadReacciones = count;
        console.log('✅ Reacciones cargadas:', count);
      },
      error: (error: any) => {
        console.error('❌ Error contando reacciones:', error);
        this.cantidadReacciones = 0;
      }
    });
  }

  verSeguidores() {
    if (!this.user?.id) return;

    this.mostrarModalSeguidores = true;
    this.loadingModal = true;
    this.listaSeguidores = [];

    this.seguimientoService
      .obtenerSeguidores(this.user.id, 0, 50)
      .subscribe({
        next: (pageData: any) => {
          const seguimientosSeguidores = pageData.content;
          
          seguimientosSeguidores.forEach((seg: Seguimiento) => {
            this.usuarioService
              .obtenerUsuarioPorId(seg.seguidorId)
              .subscribe({
                next: (usuario) => {
                  this.listaSeguidores.push(usuario);
                },
                error: (error: any) => {
                  console.error('Error cargando seguidor:', error);
                }
              });
          });
          
          this.loadingModal = false;
        },
        error: (error: any) => {
          console.error('Error cargando seguidores:', error);
          this.loadingModal = false;
        }
      });
  }

  verSeguidos() {
    if (!this.user?.id) return;

    this.mostrarModalSeguidos = true;
    this.loadingModal = true;
    this.listaSeguidos = [];

    this.seguimientoService
      .obtenerSeguidos(this.user.id, 0, 50)
      .subscribe({
        next: (pageData: any) => {
          const seguimientosSeguidos = pageData.content;
          
          seguimientosSeguidos.forEach((seg: Seguimiento) => {
            this.usuarioService
              .obtenerUsuarioPorId(seg.seguidoId)
              .subscribe({
                next: (usuario) => {
                  this.listaSeguidos.push(usuario);
                },
                error: (error: any) => {
                  console.error('Error cargando seguido:', error);
                }
              });
          });
          
          this.loadingModal = false;
        },
        error: (error: any) => {
          console.error('Error cargando seguidos:', error);
          this.loadingModal = false;
        }
      });
  }

  cerrarModal() {
    this.mostrarModalSeguidores = false;
    this.mostrarModalSeguidos = false;
  }

  dejarDeSeguir(usuario: Usuario) {
    if (!this.user?.id) return;

    this.seguimientoService
      .dejarDeSeguir(this.user.id, usuario.id)
      .subscribe({
        next: () => {
          console.log('Dejaste de seguir a', usuario.nombre);
          
          this.listaSeguidos = this.listaSeguidos.filter(u => u.id !== usuario.id);
          this.seguidosCount--;
        },
        error: (error: any) => {
          console.error('Error dejando de seguir:', error);
          alert('Error al dejar de seguir');
        }
      });
  }

  verPerfil(usuario: Usuario) {
    this.router.navigate(['/public/user-profile', usuario.id]);
  }

  verQueja(queja: any) {
    this.router.navigate(['/public/feed/queja', queja.id]);
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
