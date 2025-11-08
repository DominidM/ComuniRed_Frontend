import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoriaService, Categoria, CategoriaPage } from '../../services/categoria.service';

@Component({
  selector: 'app-crud-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-categoria.component.html',
  styleUrls: ['./crud-categoria.component.css']
})
export class CrudCategoriaComponent implements OnInit {

  categorias: Categoria[] = [];

  idSeleccionado: string | null = null;
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  nombreBuscado: string = '';

  showModal: boolean = false;
  editingCategoria: boolean = false;

  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50, 100];
  totalCategorias: number = 0;
  currentPage: number = 1;  // GraphQL backend: index 0
  totalPages: number = 1;

  loading = false;
  saving = false;
  deleting = false;

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias(): void {
    this.loading = true;
    this.categoriaService.obtenerCategorias(this.currentPage - 1, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: CategoriaPage) => {
          this.categorias = data.content;
          this.totalCategorias = data.totalElements;
          this.totalPages = data.totalPages;
          // Si eliminaste el único registro de la última página, retrocede de página
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
            this.obtenerCategorias();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener categorías:', err);
          alert('Error al cargar las categorías');
        }
      });
  }

  onPageSizeChange(event: any): void {
    const newSize = +event.target.value;
    if (!isNaN(newSize) && newSize > 0) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.obtenerCategorias();
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
    this.obtenerCategorias();
  }

  openAddModal(): void {
    this.idSeleccionado = null;
    this.nombre = '';
    this.descripcion = '';
    this.activo = true;
    this.editingCategoria = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.limpiarCampos();
  }

  editarCategoria(cat: Categoria): void {
    this.idSeleccionado = cat.id;
    this.nombre = cat.nombre;
    this.descripcion = cat.descripcion;
    this.activo = cat.activo;
    this.editingCategoria = true;
    this.showModal = true;
  }

  guardarCategoria(): void {
    if (!this.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!this.descripcion.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    this.saving = true;

    if (this.idSeleccionado) {
      this.categoriaService.actualizarCategoria(
        this.idSeleccionado,
        this.nombre,
        this.descripcion,
        this.activo,
        this.currentPage - 1,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.limpiarCampos();
          this.obtenerCategorias();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar la categoría');
        }
      });
    } else {
      this.categoriaService.crearCategoria(
        this.nombre,
        this.descripcion,
        this.activo,
        this.currentPage - 1,
        this.pageSize
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.limpiarCampos();
          this.obtenerCategorias();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear la categoría');
        }
      });
    }
  }

  eliminarCategoria(id: string): void {
    if (!confirm('¿Deseas eliminar esta categoría?')) return;

    let paginaGuardada = this.currentPage;
    if (this.categorias.length === 1 && this.currentPage > 1) {
      paginaGuardada = this.currentPage - 1;
    }

    this.deleting = true;
    this.categoriaService.eliminarCategoria(id, paginaGuardada - 1, this.pageSize)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.currentPage = paginaGuardada;
            this.obtenerCategorias();
          }
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert(`Error al eliminar categoría: ${err.message || 'Error interno del servidor'}`);
        }
      });
  }
  trackByCategoriaId(index: number, cat: Categoria): string {
    return cat.id || index.toString();
  }
  limpiarCampos(): void {
    this.idSeleccionado = null;
    this.nombre = '';
    this.descripcion = '';
    this.activo = true;
    this.editingCategoria = false;
    this.showModal = false;
  }
}
