import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, Categoria } from '../../services/categoria.service';

@Component({
  selector: 'app-crud-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './crud-categoria.component.html',
  styleUrls: ['./crud-categoria.component.css']
})

export class CrudCategoriaComponent implements OnInit {

  categorias: Categoria[] = [];
  allCategorias: Categoria[] = [];
  idSeleccionado: string | null = null;
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  nombreBuscado: string = '';

  showModal: boolean = false;
  editingCategoria: boolean = false;

  // 👇 NUEVAS variables para paginación
  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50];
  totalCategorias: number = 0;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  // 🔹 Obtener todas las categorías
  obtenerCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => {
        this.allCategorias = cats; // Guardar todas
        this.totalCategorias = cats.length;
        this.aplicarFiltro(); // Aplicar filtro de cantidad
      },
      error: (err) => console.error('Error al obtener categorías:', err)
    });
  }

  // 👇 NUEVO método para cambiar el tamaño de página
  onPageSizeChange(event: any): void {
    this.pageSize = +event.target.value;
    this.aplicarFiltro();
  }

  // 👇 NUEVO método para aplicar filtro de cantidad
  aplicarFiltro(): void {
    this.categorias = this.allCategorias.slice(0, this.pageSize);
  }

  // 🔹 Crear o actualizar categoría
  guardarCategoria(): void {
    if (!this.nombre.trim() || !this.descripcion.trim()) {
      alert('Debe llenar todos los campos');
      return;
    }

    if (this.idSeleccionado) {
      this.categoriaService.actualizarCategoria(this.idSeleccionado, this.nombre, this.descripcion, this.activo)
        .subscribe({
          next: () => { 
            alert('Categoría actualizada correctamente');
            this.limpiarCampos();
            this.obtenerCategorias();
          },
          error: (err) => console.error('Error al actualizar:', err)
        });
    } else {
      this.categoriaService.crearCategoria(this.nombre, this.descripcion, this.activo)
        .subscribe({
          next: () => { 
            alert('Categoría creada correctamente');
            this.limpiarCampos();
            this.obtenerCategorias();
          },
          error: (err) => console.error('Error al crear:', err)
        });
    }
  }

  // 🔹 Cargar datos al formulario para editar
  editarCategoria(cat: Categoria): void {
    this.idSeleccionado = cat.id;
    this.nombre = cat.nombre;
    this.descripcion = cat.descripcion;
    this.activo = cat.activo;
    this.editingCategoria = true;
    this.showModal = true;
  }

  // 🔹 Eliminar categoría
  eliminarCategoria(id: string): void {
    if (confirm('¿Deseas eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: (ok) => {
          if (ok) alert('Categoría eliminada correctamente');
          this.obtenerCategorias();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  // 👇 MODIFICADO para trabajar con filtro
  buscarCategoria(): void {
    if (!this.nombreBuscado.trim()) {
      this.aplicarFiltro(); // Restaurar filtro
      return;
    }

    this.categoriaService.buscarCategoriaPorNombre(this.nombreBuscado)
      .subscribe({
        next: (categoria) => {
          this.categorias = categoria ? [categoria] : [];
        },
        error: (err) => console.error('Error al buscar categoría:', err)
      });
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
  }

  trackByCategoriaId(index: number, cat: Categoria): string {
    return cat.id;
  }

  limpiarCampos(): void {
    this.idSeleccionado = null;
    this.nombre = '';
    this.descripcion = '';
    this.activo = true;
    this.closeModal();
  }
}