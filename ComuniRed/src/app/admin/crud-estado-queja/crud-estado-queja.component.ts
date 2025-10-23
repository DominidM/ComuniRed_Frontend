import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EstadosQuejaService, EstadoQueja } from '../../services/estado-queja.service';

@Component({
  selector: 'app-crud-estado-queja',
  templateUrl: './crud-estado-queja.component.html',
  styleUrls: ['./crud-estado-queja.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CrudEstadoQuejaComponent implements OnInit {

  estados: EstadoQueja[] = [];
  allEstados: EstadoQueja[] = [];
  estadosFiltrados: EstadoQueja[] = [];
  modalVisible = false;
  modoEdicion = false;
  estadoActual: EstadoQueja = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
  nombreBuscado: string = '';

  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50];
  totalEstados: number = 0;
  currentPage = 1;
  totalPages = 1;

  loading = false;
  saving = false;
  deleting = false;

  constructor(
    private estadosService: EstadosQuejaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  trackByEstadoId(index: number, estado: EstadoQueja): any {
    return estado.id || index;
  }

  obtenerEstados() {
    this.loading = true;
    
    this.estadosService.listarEstadosQueja()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: EstadoQueja[]) => {
          this.allEstados = [...data];
          this.totalEstados = data.length;
          
          if (this.nombreBuscado.trim()) {
            this.aplicarFiltro();
          } else {
            this.estadosFiltrados = [...this.allEstados];
          }
          
          this.calcularPaginacion();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener estados:', err);
          alert('Error al cargar los estados');
        }
      });
  }

  calcularPaginacion() {
    this.totalPages = Math.ceil(this.estadosFiltrados.length / this.pageSize);
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  aplicarFiltro() {
    const busqueda = this.nombreBuscado.trim().toLowerCase();
    
    if (!busqueda) {
      this.estadosFiltrados = [...this.allEstados];
    } else {
      this.estadosFiltrados = this.allEstados.filter(estado =>
        (estado.nombre ?? '').toLowerCase().includes(busqueda) ||
        (estado.clave ?? '').toLowerCase().includes(busqueda) ||
        (estado.descripcion ?? '').toLowerCase().includes(busqueda)
      );
    }
  }

  onPageSizeChange(event: any): void {
    const newSize = +event.target.value;
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.calcularPaginacion();
    }
  }

  get paginatedEstados(): EstadoQueja[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.estadosFiltrados.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
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

    const paginaGuardada = this.currentPage;
    this.saving = true;

    if (this.modoEdicion) {
      this.estadosService.actualizarEstadoQueja(
        this.estadoActual.id,
        this.estadoActual.clave,
        this.estadoActual.nombre,
        this.estadoActual.descripcion ?? '',
        this.estadoActual.orden
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.currentPage = paginaGuardada;
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
        this.estadoActual.orden
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.currentPage = paginaGuardada;
          this.obtenerEstados();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el estado');
        }
      });
    }
  }

  buscar() {
    const busqueda = this.nombreBuscado.trim();
    
    if (!busqueda) {
      this.currentPage = 1;
      this.obtenerEstados();
      return;
    }

    this.loading = true;
    
    this.estadosService.buscarEstadoPorNombre(busqueda)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (estado) => {
          this.allEstados = estado ? [estado] : [];
          this.estadosFiltrados = [...this.allEstados];
          this.totalEstados = this.allEstados.length;
          this.currentPage = 1;
          this.calcularPaginacion();
        },
        error: (err) => {
          console.error('Error al buscar estado:', err);
          this.allEstados = [];
          this.estadosFiltrados = [];
          this.totalEstados = 0;
          this.currentPage = 1;
          this.calcularPaginacion();
        }
      });
  }

  eliminarEstado(id: string) {
    if (!confirm('¿Deseas eliminar este estado de queja?')) return;

    if (!id || id === undefined || id === null || id === '') {
      alert('Error: ID de estado no válido');
      return;
    }

    let paginaGuardada = this.currentPage;
    
    if (this.paginatedEstados.length === 1 && this.currentPage > 1) {
      paginaGuardada = this.currentPage - 1;
    }

    this.deleting = true;

    this.estadosService.eliminarEstadoQueja(String(id))
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (result) => {
          if (result) {
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