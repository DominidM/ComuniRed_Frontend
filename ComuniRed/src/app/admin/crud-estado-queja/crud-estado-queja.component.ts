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
  modalVisible = false;
  modoEdicion = false;
  estadoActual: EstadoQueja = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
  nombreBuscado: string = '';


  constructor(private estadosService: EstadosQuejaService) {}

  ngOnInit(): void {
    this.obtenerEstados();
  }

  obtenerEstados() {
    this.estadosService.listarEstadosQueja().subscribe({
      next: (data: EstadoQueja[]) => this.estados = data,
      error: (err) => console.error('Error al obtener estados:', err)
    });
  }

  abrirModal() {
    this.modoEdicion = false;
    this.estadoActual = { id: '', clave: '', nombre: '', descripcion: '', orden: 1 };
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  editarEstado(estado: EstadoQueja) {
    this.modoEdicion = true;
    this.estadoActual = { ...estado };
    this.modalVisible = true;
  }

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
          this.obtenerEstados();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.estadosService.crearEstadoQueja(
        this.estadoActual.clave,
        this.estadoActual.nombre,
        this.estadoActual.descripcion ?? '',
        this.estadoActual.orden
      ).subscribe({
        next: () => {
          this.obtenerEstados();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

buscar() {
  if (!this.nombreBuscado.trim()) {
    this.obtenerEstados();
    return;
  }

  this.estadosService.buscarEstadoPorNombre(this.nombreBuscado)
    .subscribe(
      estado => {
        // Si existe, lo ponemos en un array de un solo elemento
        this.estados = estado ? [estado] : [];
      },
      error => console.error(error)
    );
}









  eliminarEstado(id: string) {
    if (confirm('¿Deseas eliminar este estado de queja?')) {
      this.estadosService.eliminarEstadoQueja(id).subscribe({
        next: () => this.obtenerEstados(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
