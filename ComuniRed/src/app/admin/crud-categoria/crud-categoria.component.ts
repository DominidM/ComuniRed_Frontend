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
  idSeleccionado: string | null = null;
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  // 🔹 Obtener todas las categorías
  obtenerCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (cats) => this.categorias = cats,
      error: (err) => console.error('Error al obtener categorías:', err)
    });
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

  // 🔹 Limpiar el formulario
  limpiarCampos(): void {
    this.idSeleccionado = null;
    this.nombre = '';
    this.descripcion = '';
    this.activo = true;
  }
}
