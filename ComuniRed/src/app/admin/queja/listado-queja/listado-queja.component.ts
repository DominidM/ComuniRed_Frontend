import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuejaService } from '../../../services/queja.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EstadosQuejaService } from '../../../services/estado-queja.service';
import { LoadingOverlayComponent } from '../../../shared/components/loading/loading.component';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableCellDirective,
} from '../../../shared/components/data-table/data-table.component';

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
  selector: 'app-listado-queja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    DataTableComponent,
    DataTableCellDirective,
    WorkspaceHeaderComponent,
  ],
  templateUrl: './listado-queja.component.html',
  styleUrls: ['./listado-queja.component.css'],
})
export class ListadoQuejaComponent implements OnInit {
  quejas: Queja[] = [];
  estados: EstadoQueja[] = [];

  showModalCambioEstado = false;
  loading = false;

  quejaSeleccionada: Queja | null = null;
  nuevoEstadoId = '';
  nuevoEstadoNombre = '';
  observacionEstado = '';

  page = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  columns: DataTableColumn[] = [
    { key: 'descripcion_custom', label: 'Descripción', width: '32%' },
    { key: 'fecha_creacion', label: 'Fecha', width: '13%' },
    { key: 'usuario_nombre', label: 'Usuario', width: '13%' },
    { key: 'estado_nombre', label: 'Estado', width: '13%' },
    { key: 'estado_select', label: 'Cambiar Estado', width: '16%' },
    { key: 'imagen_custom', label: 'Imagen', width: '7%' },
    { key: 'acciones', label: 'Acciones', width: '6%' },
  ];

  constructor(
    private quejaService: QuejaService,
    private usuarioService: UsuarioService,
    private estadosQuejaService: EstadosQuejaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadEstados();
    this.loadQuejas();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.page = p;
    this.loadQuejas();
  }

  trackByQueja = (_index: number, row: Queja): string => row.id;

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
            ubicacion: q.ubicacion || '',
          }));
          this.totalElements = pageData?.totalElements || 0;
          this.totalPages = pageData?.totalPages || 0;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error cargando quejas:', err);
          this.quejas = [];
          this.loading = false;
        },
      });
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

  // ── Cambio de estado ──────────────────────────────────────────────
  iniciarCambioEstado(queja: Queja, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nuevoEstadoId = target.value;
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
        next: (quejaActualizada: any) => {
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
          alert(`Estado cambiado a: ${quejaActualizada.estado?.nombre}`);
        },
        error: (err) => {
          this.loading = false;
          const msg =
            err?.graphQLErrors?.[0]?.message || 'Error al cambiar el estado.';
          alert(msg);
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

  // ── Navegación ───────────────────────────────────────────────────
  verDetalle(queja: Queja): void {
    this.router.navigate(['/admin/queja', queja.id]);
  }

  // ── CSS helpers ──────────────────────────────────────────────────
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
}
