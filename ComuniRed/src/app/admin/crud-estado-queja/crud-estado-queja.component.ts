import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EstadosQuejaService, EstadoQueja, EstadoQuejaPage } from '../../services/estado-queja.service';

@Component({
  selector: 'app-crud-estado-queja',
  templateUrl: './crud-estado-queja.component.html',
  styleUrls: ['./crud-estado-queja.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CrudEstadoQuejaComponent implements OnInit {

  estados: EstadoQueja[] = [];
  totalEstados: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50, 100];

  loading = false;
  saving = false;
  deleting = false;

  modalVisible = false;
  modoEdicion = false;
  estadoActual: EstadoQueja = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };

  constructor(
    private estadosService: EstadosQuejaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  trackByEstadoId(index: number, estado: EstadoQueja): string {
    return estado.id || index.toString();
  }

  obtenerEstados() {
    this.loading = true;
    this.estadosService.obtenerEstadosQueja(this.currentPage - 1, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: EstadoQuejaPage) => {
          this.estados = data.content;
          this.totalEstados = data.totalElements;
          this.totalPages = data.totalPages;
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
            this.obtenerEstados();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener estados:', err);
          alert('Error al cargar los estados');
        }
      });
  }

  onPageSizeChange(event: any): void {
    const newSize = +event.target.value;
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.obtenerEstados();
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
    this.obtenerEstados();
  }

  abrirModal() {
    this.modoEdicion = false;
    this.estadoActual = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.estadoActual = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
  }

  editarEstado(estado: EstadoQueja) {
    this.modoEdicion = true;
    this.estadoActual = { ...estado };
    this.modalVisible = true;
  }

  guardarEstado() {
    if (!this.estadoActual.clave?.trim()) {
      alert('La clave es obligatoria');
      return;
    }
    if (!this.estadoActual.nombre?.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!this.estadoActual.orden || this.estadoActual.orden < 1) {
      alert('El orden debe ser mayor a 0');
      return;
    }

    this.saving = true;
    if (this.modoEdicion) {
      this.estadosService.actualizarEstadoQueja(
        this.estadoActual.id,
        this.estadoActual.clave,
        this.estadoActual.nombre,
        this.estadoActual.descripcion ?? '',
        this.estadoActual.orden,
        this.currentPage - 1,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.obtenerEstados();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el estado');
        }
      });
    } else {
      this.estadosService.crearEstadoQueja(
        this.estadoActual.clave,
        this.estadoActual.nombre,
        this.estadoActual.descripcion ?? '',
        this.estadoActual.orden,
        this.currentPage - 1,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.obtenerEstados();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el estado');
        }
      });
    }
  }

  eliminarEstado(id: string) {
    if (!confirm('¿Deseas eliminar este estado de queja?')) return;
    let paginaGuardada = this.currentPage;
    if (this.estados.length === 1 && this.currentPage > 1) {
      paginaGuardada = this.currentPage - 1;
    }
    this.deleting = true;
    this.estadosService.eliminarEstadoQueja(id, paginaGuardada - 1, this.pageSize)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.currentPage = paginaGuardada;
            this.obtenerEstados();
          }
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert(`Error al eliminar estado: ${err.message || 'Error interno del servidor'}`);
        }
      });
  }
}
