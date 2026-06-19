import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { TipoReaccionService, TipoReaccion, TiposReaccionPage } from '../../services/tipo-reaccion.service';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableCellDirective,
} from '../../shared/components/data-table/data-table.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { AdminSearchComponent } from '../../shared/components/admin-search/admin-search.component';

@Component({
  selector: 'app-crud-tipo-reaccion',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent, DataTableComponent, DataTableCellDirective, WorkspaceHeaderComponent, AdminSearchComponent],
  templateUrl: './crud-tipo-reaccion.component.html',
  styleUrls: ['./crud-tipo-reaccion.component.css']
})
export class CrudTipoReaccionComponent implements OnInit {
  tipos: TipoReaccion[] = [];
  private _totalTipos: number = 0;
  page: number = 0;
  totalPages: number = 1;
  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50, 100];
  searchText: string = '';

  get tiposFiltrados(): TipoReaccion[] {
    if (!this.searchText || this.searchText.trim() === '') return this.tipos;
    const s = this.searchText.toLowerCase().trim();
    return this.tipos.filter(t =>
      t.key.toLowerCase().includes(s) ||
      t.label.toLowerCase().includes(s)
    );
  }

  get totalTipos(): number {
    return this.tiposFiltrados.length;
  }

  loading = false;
  saving = false;
  deleting = false;

  showModal = false;
  editingTipo: TipoReaccion | null = null;
  tipoData: Partial<TipoReaccion> = {};

  columns: DataTableColumn[] = [
    { key: 'key', label: 'Clave (Key)' },
    { key: 'label', label: 'Nombre (Label)' },
    { key: 'activo', label: 'Estado' },
    { key: 'orden', label: 'Orden' },
    { key: 'acciones', label: 'Acciones' },
  ];

  constructor(
    private tipoReaccionService: TipoReaccionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTipos();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  trackByTipoId(index: number, tipo: TipoReaccion): string {
    return tipo.id || index.toString();
  }

  buscarTipos(): void {}
  limpiarBusqueda(): void {
    this.searchText = '';
  }

  loadTipos() {
    this.loading = true;
    this.tipoReaccionService.obtenerTipoReaccionPage(this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: TiposReaccionPage) => {
          this.tipos = data.content;
          this._totalTipos = data.totalElements;
          this.totalPages = data.totalPages;
          if (this.page >= this.totalPages && this.totalPages > 0) {
            this.page = this.totalPages - 1;
            this.loadTipos();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar tipos:', err);
          alert('Error al cargar los tipos de reacción');
        }
      });
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.page = p;
    this.loadTipos();
  }

  onPageSizeChange(newSize: number): void {
    if (newSize > 0) {
      this.pageSize = newSize;
      this.page = 0;
      this.loadTipos();
    }
  }

  openAddModal() {
    this.editingTipo = null;
    this.tipoData = { activo: true, orden: 1 };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTipo = null;
    this.tipoData = {};
  }

  openEditModal(tipo: TipoReaccion) {
    this.editingTipo = tipo;
    this.tipoData = { ...tipo };
    this.showModal = true;
  }

  saveTipo() {
    if (!this.tipoData.key || !this.tipoData.label) {
      alert('La clave (key) y el nombre (label) son obligatorios');
      return;
    }

    this.saving = true;

    if (this.editingTipo) {
      this.tipoReaccionService.actualizarTipoReaccion(
        this.editingTipo.id,
        this.tipoData,
        this.page,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadTipos();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el tipo');
        }
      });
    } else {
      this.tipoReaccionService.crearTipoReaccion(
        this.tipoData,
        this.page,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadTipos();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el tipo');
        }
      });
    }
  }

  deleteTipo(tipo: TipoReaccion) {
    if (!confirm(`¿Seguro que deseas eliminar el tipo "${tipo.label}"?`)) return;

    const id = tipo.id;
    if (!id) {
      alert('Error: ID de tipo no válido');
      return;
    }

    let paginaGuardada = this.page;
    if (this.tipos.length === 1 && this.page > 0) {
      paginaGuardada = this.page - 1;
    }

    this.deleting = true;
    this.tipoReaccionService.eliminarTipoReaccion(id, paginaGuardada, this.pageSize)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.page = paginaGuardada;
            this.loadTipos();
          }
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert(`Error al eliminar tipo: ${error.message || 'Error interno del servidor'}`);
        }
      });
  }
}
