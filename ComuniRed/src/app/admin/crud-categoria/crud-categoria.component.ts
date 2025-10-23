import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoriaService, Categoria } from '../../services/categoria.service';

@Component({
  selector: 'app-crud-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-categoria.component.html',
  styleUrls: ['./crud-categoria.component.css']
})
export class CrudCategoriaComponent implements OnInit {

  categorias: Categoria[] = [];
  allCategorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  
  idSeleccionado: string | null = null;
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  nombreBuscado: string = '';

  showModal: boolean = false;
  editingCategoria: boolean = false;

  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50];
  totalCategorias: number = 0;
  currentPage: number = 1;
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

  trackByCategoriaId(index: number, cat: Categoria): string {
    return cat.id || index.toString();
  }

  obtenerCategorias(): void {
    this.loading = true;
    
    this.categoriaService.listarCategorias()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (cats) => {
          this.allCategorias = [...cats];
          this.totalCategorias = cats.length;
          
          if (this.nombreBuscado.trim()) {
            this.aplicarFiltro();
          } else {
            this.categoriasFiltradas = [...this.allCategorias];
          }
          
          this.calcularPaginacion();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener categorías:', err);
          alert('Error al cargar las categorías');
        }
      });
  }

  calcularPaginacion(): void {
    this.totalPages = Math.ceil(this.categoriasFiltradas.length / this.pageSize);
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  aplicarFiltro(): void {
    const busqueda = this.nombreBuscado.trim().toLowerCase();
    
    if (!busqueda) {
      this.categoriasFiltradas = [...this.allCategorias];
    } else {
      this.categoriasFiltradas = this.allCategorias.filter(cat =>
        (cat.nombre ?? '').toLowerCase().includes(busqueda) ||
        (cat.descripcion ?? '').toLowerCase().includes(busqueda)
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

  get paginatedCategorias(): Categoria[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const paginated = this.categoriasFiltradas.slice(start, end);
    this.categorias = paginated;
    return paginated;
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
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

    const paginaGuardada = this.currentPage;
    this.saving = true;

    if (this.idSeleccionado) {
      this.categoriaService.actualizarCategoria(
        this.idSeleccionado,
        this.nombre,
        this.descripcion,
        this.activo
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.limpiarCampos();
          this.currentPage = paginaGuardada;
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
        this.activo
      )
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.limpiarCampos();
          this.currentPage = paginaGuardada;
          this.obtenerCategorias();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear la categoría');
        }
      });
    }
  }

  buscarCategoria(): void {
    const busqueda = this.nombreBuscado.trim();
    
    if (!busqueda) {
      this.currentPage = 1;
      this.obtenerCategorias();
      return;
    }

    this.loading = true;
    
    this.categoriaService.buscarCategoriaPorNombre(busqueda)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (categoria) => {
          this.allCategorias = categoria ? [categoria] : [];
          this.categoriasFiltradas = [...this.allCategorias];
          this.totalCategorias = this.allCategorias.length;
          this.currentPage = 1;
          this.calcularPaginacion();
        },
        error: (err) => {
          console.error('Error al buscar categoría:', err);
          this.allCategorias = [];
          this.categoriasFiltradas = [];
          this.totalCategorias = 0;
          this.currentPage = 1;
          this.calcularPaginacion();
        }
      });
  }

  eliminarCategoria(id: string): void {
    if (!confirm('¿Deseas eliminar esta categoría?')) return;

    if (!id || id === undefined || id === null || id === '') {
      alert('Error: ID de categoría no válido');
      return;
    }

    let paginaGuardada = this.currentPage;
    
    if (this.paginatedCategorias.length === 1 && this.currentPage > 1) {
      paginaGuardada = this.currentPage - 1;
    }

    this.deleting = true;

    this.categoriaService.eliminarCategoria(id)
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

  limpiarCampos(): void {
    this.idSeleccionado = null;
    this.nombre = '';
    this.descripcion = '';
    this.activo = true;
    this.editingCategoria = false;
    this.showModal = false;
  }
}