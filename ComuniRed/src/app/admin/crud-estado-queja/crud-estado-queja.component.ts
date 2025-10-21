import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  allEstados: EstadoQueja[] = []; // Para guardar todos los estados
  modalVisible = false;
  modoEdicion = false;
  estadoActual: EstadoQueja = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
  nombreBuscado: string = '';

  // Variables para paginación
  pageSize: number = 5;
  pageSizes: number[] = [5, 10, 20, 50];
  totalEstados: number = 0;

  constructor(private estadosService: EstadosQuejaService) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  // TrackBy para optimizar el *ngFor
  trackByEstadoId(index: number, estado: EstadoQueja): any {
    console.log('trackBy - index:', index, 'estado:', estado, 'estado.id:', estado.id);
    return estado.id || index;
  }

  // Obtener todos los estados
  obtenerEstados() {
    console.log('=== DEBUG OBTENER ESTADOS ===');
    this.estadosService.listarEstadosQueja().subscribe({
      next: (data: EstadoQueja[]) => {
        console.log('Estados recibidos del backend:', data);
        data.forEach((estado, index) => {
          console.log(`Estado ${index}:`, estado);
          console.log(`Estado ${index} ID:`, estado.id, 'tipo:', typeof estado.id);
        });
        this.allEstados = data;
        this.totalEstados = data.length;
        this.aplicarFiltro();
        this.nombreBuscado = ''; // Limpiar búsqueda
      },
      error: (err) => console.error('Error al obtener estados:', err)
    });
  }

  // Cambiar tamaño de página
  onPageSizeChange(event: any): void {
    this.pageSize = +event.target.value;
    this.aplicarFiltro();
  }

  // Aplicar filtro de cantidad
  aplicarFiltro(): void {
    this.estados = this.allEstados.slice(0, this.pageSize);
  }

  // Abrir modal para nuevo estado
  abrirModal() {
    this.modoEdicion = false;
    this.estadoActual = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
    this.modalVisible = true;
  }

  // Cerrar modal
  cerrarModal() {
    this.modalVisible = false;
  }

  // Editar estado
  editarEstado(estado: EstadoQueja) {
    this.modoEdicion = true;
    this.estadoActual = { ...estado };
    this.modalVisible = true;
  }

  // Guardar estado (crear o actualizar)
  guardarEstado() {
    if (this.modoEdicion) {
      this.estadosService.actualizarEstadoQueja(
        this.estadoActual.id,
        this.estadoActual.clave,
        this.estadoActual.nombre,
        this.estadoActual.descripcion ?? '',
        this.estadoActual.orden
      ).subscribe({
        next: () => {
          console.log('Estado actualizado exitosamente');
          this.obtenerEstados();
          this.cerrarModal();
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
      ).subscribe({
        next: () => {
          console.log('Estado creado exitosamente');
          this.obtenerEstados();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el estado');
        }
      });
    }
  }

  // Buscar estado por nombre
  buscar() {
    if (!this.nombreBuscado.trim()) {
      this.aplicarFiltro(); // Restaurar filtro
      return;
    }

    this.estadosService.buscarEstadoPorNombre(this.nombreBuscado)
      .subscribe({
        next: (estado) => {
          console.log('Estado encontrado:', estado);
          this.estados = estado ? [estado] : [];
        },
        error: (err) => {
          console.error('Error al buscar estado:', err);
          this.estados = [];
        }
      });
  }

  // Eliminar estado
  eliminarEstado(id: string) {
    console.log('=== DEBUG ELIMINAR ESTADO ===');
    console.log('1. ID a eliminar:', id);
    console.log('2. Tipo de ID:', typeof id);

    if (confirm('¿Deseas eliminar este estado de queja?')) {
      if (!id || id === undefined || id === null || id === '') {
        alert('Error: ID de estado no válido');
        console.error('ID inválido detectado');
        return;
      }

      this.estadosService.eliminarEstadoQueja(String(id)).subscribe({
        next: (result) => {
          console.log('Resultado de eliminación:', result);
          console.log('Estado eliminado exitosamente');
          this.obtenerEstados();
        },
        error: (err) => {
          console.error('Error completo:', err);
          console.error('Error message:', err.message);
          alert(`Error al eliminar estado: ${err.message || 'Error interno del servidor'}`);
        }
      });
    }
  }
}