import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { QuejaService } from '../../services/queja.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { EstadosQuejaService } from '../../services/estado-queja.service';

interface Queja {
  id: string;
  titulo?: string;
  descripcion: string;
  fecha_creacion: string;
  usuario_id: string;
  usuario_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  imagen_url?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  ubicacion?: string;
}

interface EstadoQueja {
  id: string;
  nombre: string;
  clave?: string;
}

@Component({
  selector: 'app-crud-queja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-queja.component.html',
  styleUrls: ['./crud-queja.component.css'],
})
export class CrudQuejaComponent implements OnInit {
  quejas: Queja[] = [];
  usuarios: Usuario[] = [];
  estados: EstadoQueja[] = [];
  showModal = false;
  editingQueja: Queja | null = null;
  quejaData: Partial<Queja> = {};
  loading = false;

  // Paginado
  page = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  showModalCambioEstado = false;
  quejaSeleccionada: Queja | null = null;
  nuevoEstadoId = '';
  nuevoEstadoNombre = '';
  observacionEstado = '';

  private ACTUALIZAR_QUEJA = gql`
    mutation ActualizarQueja($id: ID!, $imagen_url: String) {
      actualizarQueja(id: $id, imagen_url: $imagen_url) {
        id
        imagen_url
      }
    }
  `;

  constructor(
    private apollo: Apollo,
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private estadosQuejaService: EstadosQuejaService,
  ) {}

  ngOnInit(): void {
    this.loadEstados();
    this.loadUsuarios();
    this.loadQuejas();
  }

  // ── Paginado ──────────────────────────────────────────────────
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.page = p;
    this.loadQuejas();
  }

  // ── Carga de datos ────────────────────────────────────────────
  loadQuejas(): void {
    this.loading = true;
    const adminUser = this.usuarioService.getUser();
    const usuarioActualId = adminUser ? (adminUser as any).id : '';

    this.quejaService
      .obtenerQuejasAdminPaginadas(usuarioActualId, this.page, this.pageSize)
      .subscribe({
        next: (pageData: any) => {
          this.quejas = (pageData?.content || []).map((q: any) => ({
            id: q.id,
            titulo: q.titulo || '',
            descripcion: q.descripcion,
            fecha_creacion: q.fecha_creacion,
            usuario_id: q.usuario?.id || '',
            usuario_nombre:
              `${q.usuario?.nombre || ''} ${q.usuario?.apellido || ''}`.trim(),
            estado_id: q.estado?.id || '',
            estado_nombre: q.estado?.nombre || '',
            imagen_url: q.imagen_url || '',
            categoria_id: q.categoria?.id || '',
            categoria_nombre: q.categoria?.nombre || '',
          }));
          this.totalElements = pageData?.totalElements || 0;
          this.totalPages = pageData?.totalPages || 0;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Error cargando quejas:', err);
          this.loading = false;
          this.quejas = [];
        },
      });
  }

  loadUsuarios(): void {
    if (
      typeof (this.usuarioService as any).obtenerTodosLosUsuarios === 'function'
    ) {
      (this.usuarioService as any).obtenerTodosLosUsuarios().subscribe({
        next: (users: any) => {
          this.usuarios = users;
        },
        error: () => {
          this.usuarios = [];
        },
      });
    }
  }

  loadEstados(): void {
    this.estadosQuejaService.obtenerEstadosQueja(0, 100).subscribe({
      next: (page: any) => {
        this.estados = (page?.content || []).map((e: any) => ({
          id: e.id,
          nombre: e.nombre,
          clave: e.clave,
        }));
      },
      error: () => {
        this.estados = [];
      },
    });
  }

  // ── Cambio de estado ──────────────────────────────────────────
  iniciarCambioEstado(queja: Queja, event: any): void {
    const nuevoEstadoId = event.target.value;
    if (!nuevoEstadoId || nuevoEstadoId === queja.estado_id) return;

    const estadoEncontrado = this.estados.find((e) => e.id === nuevoEstadoId);
    if (!estadoEncontrado) return;

    this.quejaSeleccionada = queja;
    this.nuevoEstadoId = nuevoEstadoId;
    this.nuevoEstadoNombre = estadoEncontrado.nombre;
    this.observacionEstado = '';
    this.showModalCambioEstado = true;
  }

  confirmarCambioEstado(): void {
    if (!this.quejaSeleccionada || !this.nuevoEstadoId) return;

    const adminUser = this.usuarioService.getUser();
    if (!adminUser) {
      alert('No hay usuario admin autenticado');
      return;
    }

    this.loading = true;
    const estadoEncontrado = this.estados.find(
      (e) => e.id === this.nuevoEstadoId,
    );
    const claveEstado = estadoEncontrado?.clave || this.nuevoEstadoId;

    this.quejaService
      .cambiarEstadoQueja(
        this.quejaSeleccionada.id,
        (adminUser as any).id,
        claveEstado,
        this.observacionEstado || undefined,
      )
      .subscribe({
        next: (quejaActualizada) => {
          const index = this.quejas.findIndex(
            (q) => q.id === quejaActualizada.id,
          );
          if (index !== -1) {
            this.quejas[index] = {
              ...this.quejas[index],
              estado_id: quejaActualizada.estado?.id || '',
              estado_nombre: quejaActualizada.estado?.nombre || '',
            };
          }
          this.loading = false;
          this.cerrarModalEstado();
          alert(`✅ Estado cambiado a: ${quejaActualizada.estado?.nombre}`);
        },
        error: (err) => {
          this.loading = false;
          const msg =
            err.graphQLErrors?.[0]?.message || 'Error al cambiar el estado.';
          alert(`❌ ${msg}`);
        },
      });
  }

  cerrarModalEstado(): void {
    this.showModalCambioEstado = false;
    this.quejaSeleccionada = null;
    this.nuevoEstadoId = '';
    this.nuevoEstadoNombre = '';
    this.observacionEstado = '';
  }

  // ── CRUD ──────────────────────────────────────────────────────
  getEstadosDisponibles(queja: Queja): EstadoQueja[] {
    return this.estados.filter((e) => e.id !== queja.estado_id);
  }

  getEstadoClass(estadoNombre?: string): string {
    if (!estadoNombre) return 'estado-default';
    const n = estadoNombre.toLowerCase();
    if (n.includes('pendiente')) return 'estado-pendiente';
    if (n.includes('aprobado') || n.includes('espera'))
      return 'estado-aprobado';
    if (n.includes('votaci')) return 'estado-votacion';
    if (n.includes('proceso')) return 'estado-proceso';
    if (n.includes('resuel')) return 'estado-resuelto';
    if (n.includes('rechaz')) return 'estado-rechazado';
    return 'estado-default';
  }

  openEditModal(queja: Queja): void {
    this.editingQueja = { ...queja };
    this.quejaData = { ...queja };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQueja = null;
    this.quejaData = {};
  }

  saveQueja(): void {
    if (!this.quejaData.descripcion) {
      alert('Por favor completa la descripción');
      return;
    }
    this.loading = true;
    if (!this.editingQueja) return;

    // Llamada REST en vez de GraphQL
    const body = {
      titulo: this.quejaData.titulo,
      descripcion: this.quejaData.descripcion,
      categoriaId: this.quejaData.categoria_id,
      ubicacion: this.quejaData.ubicacion,
      imagenUrl: this.quejaData.imagen_url,
    };

    fetch(`http://localhost:8080/api/quejas/${this.editingQueja.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error HTTP: ' + res.status);
        return res.json();
      })
      .then(() => {
        // Si el estado cambió, usar cambiarEstadoQueja GraphQL
        if (this.quejaData.estado_id !== this.editingQueja!.estado_id) {
          const adminUser = this.usuarioService.getUser();
          const estadoEncontrado = this.estados.find(
            (e) => e.id === this.quejaData.estado_id,
          );
          const claveEstado = estadoEncontrado?.clave || '';
          this.quejaService
            .cambiarEstadoQueja(
              this.editingQueja!.id,
              (adminUser as any).id,
              claveEstado,
            )
            .subscribe({
              next: () => this.finalizeSave(),
              error: () => this.finalizeSave(),
            });
        } else {
          this.finalizeSave();
        }
      })
      .catch((err) => {
        this.loading = false;
        alert('Error al actualizar: ' + err.message);
      });
  }

  private finalizeSave(): void {
    this.loadQuejas();
    this.closeModal();
    this.loading = false;
    alert('✅ Queja actualizada correctamente');
  }

  deleteQueja(queja: Queja): void {
    if (
      !confirm(
        `¿Eliminar "${queja.titulo || queja.descripcion.substring(0, 30)}"?`,
      )
    )
      return;
    this.loading = true;
    this.quejaService.eliminarQueja(queja.id, '').subscribe({
      next: (ok) => {
        if (ok) this.loadQuejas();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ GraphQL errors:', err?.graphQLErrors);
        console.error('❌ Network error:', err?.networkError?.error);
        console.error('❌ Message:', err?.message);
        const msg =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          'Error desconocido';
        alert(`Error: ${msg}`);
      },
    });
  }

  private updateImagenUrl(id: string, imagenUrl: string): Promise<any> {
    return this.apollo
      .mutate({
        mutation: this.ACTUALIZAR_QUEJA,
        variables: { id, imagen_url: imagenUrl },
      })
      .toPromise();
  }
}
