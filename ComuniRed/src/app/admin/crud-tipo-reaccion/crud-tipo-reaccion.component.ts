import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoReaccionService, TipoReaccion } from '../../services/tipo-reaccion.service';

@Component({
  selector: 'app-crud-tipo-reaccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-tipo-reaccion.component.html',
  styleUrls: ['./crud-tipo-reaccion.component.css']
})
export class CrudTipoReaccionComponent implements OnInit {
  tipos: TipoReaccion[] = [];
  tiposFiltrados: TipoReaccion[] = [];
  showModal = false;
  editingTipo: TipoReaccion | null = null;
  tipoData: Partial<TipoReaccion> = {};
  busqueda: string = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private tipoReaccionService: TipoReaccionService) {}

  ngOnInit(): void {
    this.loadTipos();
  }

  trackByTipoId(index: number, tipo: TipoReaccion): any {
    return tipo.id || index;
  }

  loadTipos() {
    this.tipoReaccionService.getAll().subscribe({
      next: (data) => {
        this.tipos = data;
        this.filtrar();
      },
      error: (err) => console.error('Error al cargar tipos:', err)
    });
  }

  buscarPorNombre() {
    const label = this.busqueda.trim();
    if (!label) {
      this.loadTipos();
      return;
    }

    this.tipoReaccionService.buscarPorNombre(label).subscribe({
      next: (result) => {
        this.tipos = result ? [result] : [];
        this.filtrar();
      },
      error: (err) => {
        console.error('Error al buscar tipo:', err);
        this.tipos = [];
        this.filtrar();
      }
    });
  }

  filtrar() {
    this.tiposFiltrados = this.tipos.slice();
    this.totalPages = Math.ceil(this.tiposFiltrados.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
  }

  get paginatedTipos(): TipoReaccion[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.tiposFiltrados.slice(start, end);
  }

  cambiarCantidad(event: any) {
    this.itemsPerPage = +event.target.value;
    this.filtrar();
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
  }

  openAddModal() {
    this.editingTipo = null;
    this.tipoData = { activo: true, orden: 1 };
    this.showModal = true;
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

    if (this.editingTipo) {
      this.tipoReaccionService.update(this.editingTipo.id, this.tipoData).subscribe({
        next: () => {
          this.loadTipos();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el tipo');
        }
      });
    } else {
      this.tipoReaccionService.create(this.tipoData).subscribe({
        next: () => {
          this.loadTipos();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el tipo');
        }
      });
    }
  }

  deleteTipo(tipo: TipoReaccion) {
    if (confirm(`¿Seguro que deseas eliminar el tipo "${tipo.label}"?`)) {
      const id = tipo.id;

      if (!id) {
        alert('Error: ID de tipo no válido');
        return;
      }

      this.tipoReaccionService.delete(id).subscribe({
        next: () => {
          this.loadTipos();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert(`Error al eliminar tipo: ${error.message || 'Error interno del servidor'}`);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingTipo = null;
    this.tipoData = {};
  }
}