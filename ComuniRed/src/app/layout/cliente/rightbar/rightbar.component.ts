import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { SeguimientoService, EstadoSeguimiento } from '../../../services/seguimiento.service';

@Component({
  selector: 'app-rightbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css'],
})
export class RightbarComponent implements OnInit {
  sugerencias: Usuario[] = [];
  estadosSeguimiento: Map<string, EstadoSeguimiento> = new Map();
  cargandoSeguimiento: Set<string> = new Set();
  loadingSugerencias = false;

  private currentUserId = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private seguimientoService: SeguimientoService,
  ) {}

  ngOnInit(): void {
    const u = this.usuarioService.getUser() as any;
    if (u) {
      this.currentUserId = u.id || u._id;
      this.cargarSugerencias();
    }
  }

  private cargarSugerencias(): void {
    if (!this.currentUserId) return;
    this.loadingSugerencias = true;
    this.usuarioService.obtenerUsuarios(0, 50).subscribe({
      next: (page) => {
        const users = (page.content || [])
          .filter(u => u.id !== this.currentUserId)
          .sort((a, b) => {
            const da = a.fecha_registro ? new Date(a.fecha_registro).getTime() : 0;
            const db = b.fecha_registro ? new Date(b.fecha_registro).getTime() : 0;
            return db - da;
          })
          .slice(0, 8);
        this.sugerencias = users;
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
