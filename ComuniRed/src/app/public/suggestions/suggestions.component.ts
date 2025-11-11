import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { SeguimientoService, EstadoSeguimiento, Seguimiento } from '../../services/seguimiento.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.css']
})
export class SuggestionsComponent implements OnInit {
  // 🆕 Control de tabs
  tabActual: 'sugerencias' | 'solicitudes' = 'sugerencias';
  
  // Sugerencias
  sugerencias: Usuario[] = [];
  estadosSeguimiento: Map<string, EstadoSeguimiento> = new Map();
  cargandoSeguimiento: Set<string> = new Set();
  
  // 🆕 Solicitudes pendientes
  solicitudes: Seguimiento[] = [];
  usuariosSolicitudes: Map<string, Usuario> = new Map();
  procesandoSolicitud: Set<string> = new Set();
  totalSolicitudes: number = 0;
  
  usuarioActual: Usuario | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService
  ) {}

  ngOnInit() {
    this.usuarioActual = this.usuarioService.getUser();
    this.cargarSugerencias();
    this.contarSolicitudesPendientes();
  }

  // ========================================
  // TABS
  // ========================================

  cambiarTab(tab: 'sugerencias' | 'solicitudes') {
    this.tabActual = tab;
    this.page = 0;
    
    if (tab === 'sugerencias') {
      this.cargarSugerencias();
    } else {
      this.cargarSolicitudes();
    }
  }

  // ========================================
  // SUGERENCIAS
  // ========================================

  cargarSugerencias() {
    if (!this.usuarioActual?.id) return;

    this.loading = true;
    
    this.seguimientoService
      .obtenerUsuariosSugeridos(this.usuarioActual.id, this.page, this.size)
      .subscribe({
        next: (pageData) => {
          this.sugerencias = pageData.content || [];
          this.totalElements = pageData.totalElements || 0;
          this.totalPages = pageData.totalPages || 0;
          this.loading = false;
          
          this.cargarEstadosSeguimiento();
        },
        error: (error) => {
          console.error('Error cargando sugerencias:', error);
          this.loading = false;
        }
      });
  }

  cargarEstadosSeguimiento() {
    if (!this.usuarioActual?.id) return;

    this.sugerencias.forEach(usuario => {
      this.seguimientoService
        .obtenerEstadoSeguimiento(this.usuarioActual!.id, usuario.id)
        .subscribe({
          next: (estado) => {
            this.estadosSeguimiento.set(usuario.id, estado);
          },
          error: (error) => {
            console.error(`Error obteniendo estado:`, error);
          }
        });
    });
  }

  buscar() {
    if (!this.searchTerm.trim()) {
      this.cargarSugerencias();
      return;
    }

    this.loading = true;
    
    this.seguimientoService
      .buscarUsuarios(this.searchTerm, this.page, this.size)
      .subscribe({
        next: (pageData) => {
          this.sugerencias = pageData.content || [];
          this.totalElements = pageData.totalElements || 0;
          this.totalPages = pageData.totalPages || 0;
          this.loading = false;
          
          this.cargarEstadosSeguimiento();
        },
        error: (error) => {
          console.error('Error buscando usuarios:', error);
          this.loading = false;
        }
      });
  }

  toggleSeguir(usuario: Usuario) {
    if (!this.usuarioActual?.id) return;

    const estado = this.estadosSeguimiento.get(usuario.id);
    
    if (estado?.estaSiguiendo) {
      this.dejarDeSeguir(usuario);
    } else if (estado?.solicitudEnviada) {
      alert('Ya enviaste una solicitud a este usuario');
    } else {
      this.seguir(usuario);
    }
  }

  seguir(usuario: Usuario) {
    if (!this.usuarioActual?.id) return;

    this.cargandoSeguimiento.add(usuario.id);

    this.seguimientoService
      .enviarSolicitud(this.usuarioActual.id, usuario.id)
      .subscribe({
        next: () => {
          console.log('✅ Solicitud enviada a', usuario.nombre);
          
          this.estadosSeguimiento.set(usuario.id, {
            estaSiguiendo: false,
            teSigue: false,
            seguimientoMutuo: false,
            solicitudPendiente: false,
            solicitudEnviada: true
          });
          
          this.cargandoSeguimiento.delete(usuario.id);
        },
        error: (error) => {
          console.error('Error enviando solicitud:', error);
          alert('Error al enviar solicitud. Intenta de nuevo.');
          this.cargandoSeguimiento.delete(usuario.id);
        }
      });
  }

  dejarDeSeguir(usuario: Usuario) {
    if (!this.usuarioActual?.id) return;

    this.cargandoSeguimiento.add(usuario.id);

    this.seguimientoService
      .dejarDeSeguir(this.usuarioActual.id, usuario.id)
      .subscribe({
        next: () => {
          console.log('❌ Dejaste de seguir a', usuario.nombre);
          
          this.estadosSeguimiento.set(usuario.id, {
            estaSiguiendo: false,
            teSigue: false,
            seguimientoMutuo: false,
            solicitudPendiente: false,
            solicitudEnviada: false
          });
          
          this.cargandoSeguimiento.delete(usuario.id);
        },
        error: (error) => {
          console.error('Error dejando de seguir:', error);
          alert('Error al dejar de seguir. Intenta de nuevo.');
          this.cargandoSeguimiento.delete(usuario.id);
        }
      });
  }

  // ========================================
  // SOLICITUDES PENDIENTES
  // ========================================

  contarSolicitudesPendientes() {
    if (!this.usuarioActual?.id) return;

    this.seguimientoService
      .obtenerSolicitudesPendientes(this.usuarioActual.id, 0, 1)
      .subscribe({
        next: (pageData) => {
          this.totalSolicitudes = pageData.totalElements || 0;
        },
        error: (error) => {
          console.error('Error contando solicitudes:', error);
        }
      });
  }

  cargarSolicitudes() {
    if (!this.usuarioActual?.id) return;

    this.loading = true;
    
    this.seguimientoService
      .obtenerSolicitudesPendientes(this.usuarioActual.id, this.page, this.size)
      .subscribe({
        next: (pageData) => {
          this.solicitudes = pageData.content || [];
          this.totalElements = pageData.totalElements || 0;
          this.totalPages = pageData.totalPages || 0;
          this.totalSolicitudes = pageData.totalElements || 0;
          this.loading = false;
          
          // Cargar datos de usuarios
          this.cargarDatosUsuariosSolicitudes();
        },
        error: (error) => {
          console.error('Error cargando solicitudes:', error);
          this.loading = false;
        }
      });
  }

  cargarDatosUsuariosSolicitudes() {
    this.solicitudes.forEach(solicitud => {
      this.usuarioService
        .obtenerUsuarioPorId(solicitud.seguidorId)
        .subscribe({
          next: (usuario) => {
            this.usuariosSolicitudes.set(solicitud.seguidorId, usuario);
          },
          error: (error) => {
            console.error('Error cargando usuario:', error);
          }
        });
    });
  }

  obtenerUsuarioSolicitud(seguidorId: string): Usuario | undefined {
    return this.usuariosSolicitudes.get(seguidorId);
  }

  aceptarSolicitud(solicitud: Seguimiento) {
    this.procesandoSolicitud.add(solicitud.id);

    this.seguimientoService
      .aceptarSolicitud(solicitud.id)
      .subscribe({
        next: () => {
          console.log('✅ Solicitud aceptada');
          
          // Remover de la lista
          this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
          this.totalElements--;
          this.totalSolicitudes--;
          
          this.procesandoSolicitud.delete(solicitud.id);
        },
        error: (error) => {
          console.error('Error aceptando solicitud:', error);
          alert('Error al aceptar solicitud.');
          this.procesandoSolicitud.delete(solicitud.id);
        }
      });
  }

  rechazarSolicitud(solicitud: Seguimiento) {
    this.procesandoSolicitud.add(solicitud.id);

    this.seguimientoService
      .rechazarSolicitud(solicitud.id)
      .subscribe({
        next: () => {
          console.log('❌ Solicitud rechazada');
          
          // Remover de la lista
          this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
          this.totalElements--;
          this.totalSolicitudes--;
          
          this.procesandoSolicitud.delete(solicitud.id);
        },
        error: (error) => {
          console.error('Error rechazando solicitud:', error);
          alert('Error al rechazar solicitud.');
          this.procesandoSolicitud.delete(solicitud.id);
        }
      });
  }

  estaProcesandoSolicitud(solicitud: Seguimiento): boolean {
    return this.procesandoSolicitud.has(solicitud.id);
  }

  // ========================================
  // UTILIDADES
  // ========================================

  obtenerEstado(usuario: Usuario): EstadoSeguimiento | undefined {
    return this.estadosSeguimiento.get(usuario.id);
  }

  estaCargando(usuario: Usuario): boolean {
    return this.cargandoSeguimiento.has(usuario.id);
  }

  obtenerFoto(foto_perfil?: string): string {
    return this.usuarioService.obtenerFotoMiniatura(foto_perfil, 44);
  }

  calcularEdad(fecha_nacimiento?: string): number | null {
    if (!fecha_nacimiento) return null;
    return this.usuarioService.calcularEdad(fecha_nacimiento);
  }

  verPerfil(usuario: Usuario) {
    console.log('👁️ Ver perfil de:', usuario.nombre);
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      
      if (this.tabActual === 'sugerencias') {
        if (this.searchTerm.trim()) {
          this.buscar();
        } else {
          this.cargarSugerencias();
        }
      } else {
        this.cargarSolicitudes();
      }
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      
      if (this.tabActual === 'sugerencias') {
        if (this.searchTerm.trim()) {
          this.buscar();
        } else {
          this.cargarSugerencias();
        }
      } else {
        this.cargarSolicitudes();
      }
    }
  }
}
