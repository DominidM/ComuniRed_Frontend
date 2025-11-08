import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { TipoReaccionService, TipoReaccion, TiposReaccionPage } from '../../services/tipo-reaccion.service';

@Component({
  selector: 'app-crud-tipo-reaccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-tipo-reaccion.component.html',
  styleUrls: ['./crud-tipo-reaccion.component.css']
})
export class CrudTipoReaccionComponent implements OnInit {
  tipos: TipoReaccion[] = [];
  totalTipos: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50, 100];

  loading = false;
  saving = false;
  deleting = false;

  showModal = false;
  editingTipo: TipoReaccion | null = null;
  tipoData: Partial<TipoReaccion> = {};

  constructor(
    private tipoReaccionService: TipoReaccionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTipos();
  }

  trackByTipoId(index: number, tipo: TipoReaccion): string {
    return tipo.id || index.toString();
  }

  loadTipos() {
    this.loading = true;
    this.tipoReaccionService.obtenerTipoReaccionPage(this.currentPage - 1, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: TiposReaccionPage) => {
          this.tipos = data.content;
          this.totalTipos = data.totalElements;
          this.totalPages = data.totalPages;
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
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

  onPageSizeChange(event: any): void {
    const newSize = +event.target.value;
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.loadTipos();
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
    this.loadTipos();
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
        this.currentPage - 1,
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
        this.currentPage - 1,
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

    let paginaGuardada = this.currentPage;
    if (this.tipos.length === 1 && this.currentPage > 1) {
      paginaGuardada = this.currentPage - 1;
    }

    this.deleting = true;
    this.tipoReaccionService.eliminarTipoReaccion(id, paginaGuardada - 1, this.pageSize)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.currentPage = paginaGuardada;
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
