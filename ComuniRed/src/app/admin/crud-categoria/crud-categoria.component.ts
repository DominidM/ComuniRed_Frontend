import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoriaService, Categoria, CategoriaPage } from '../../services/categoria.service';
import { LoadingOverlayComponent } from '../../shared/components/loading/loading.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableCellDirective,
} from '../../shared/components/data-table/data-table.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-crud-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent, DataTableComponent, DataTableCellDirective, WorkspaceHeaderComponent],
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
  page: number = 0;
  totalPages: number = 1;

  loading = false;
  saving = false;
  deleting = false;

  columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activo', label: 'Activo' },
    { key: 'acciones', label: 'Acciones' },
  ];

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  obtenerCategorias(): void {
    this.loading = true;
    this.categoriaService.obtenerCategorias(this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: CategoriaPage) => {
          this.categorias = data.content;
          this.totalCategorias = data.totalElements;
          this.totalPages = data.totalPages;
          if (this.page >= this.totalPages && this.totalPages > 0) {
            this.page = this.totalPages - 1;
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

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.page = p;
    this.obtenerCategorias();
  }

  onPageSizeChange(newSize: number): void {
    if (newSize > 0) {
      this.pageSize = newSize;
      this.page = 0;
      this.obtenerCategorias();
    }
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
        this.page,
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
        this.page,
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

    let paginaGuardada = this.page;
    if (this.categorias.length === 1 && this.page > 0) {
      paginaGuardada = this.page - 1;
    }

    this.deleting = true;
    this.categoriaService.eliminarCategoria(id, paginaGuardada, this.pageSize)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.page = paginaGuardada;
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
