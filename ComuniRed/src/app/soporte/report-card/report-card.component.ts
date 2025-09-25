import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte, Cliente, Soporte } from '../ajson/json';
import { ModalDetallesComponent } from './modal-detalles/modal-detalles.component';
import { ModalUbicacionComponent } from './modal-ubicacion/modal-ubicacion.component';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, ModalDetallesComponent, ModalUbicacionComponent],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent {
  @Input() reporte!: Reporte ;
  @Input() cliente!: Cliente ;
  @Input() soporte!: Soporte ;
  @Output() seleccionar = new EventEmitter<Reporte>(); 

  mostrarDetalles = false;
  mostrarUbicacion = false;
  imagenSeleccionada: string | null = null; 
  reporteSeleccionado?: Reporte;

  abrirDetalles(event: Event) {
    event.stopPropagation();
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
  }

  abrirUbicacion(event: Event) {
    event.stopPropagation();
    this.mostrarUbicacion = true;
  }

  cerrarUbicacion() {
    this.mostrarUbicacion = false;
  }

  abrirImagenCompleta(img: string) {
    this.imagenSeleccionada = img;
  }

  cerrarImagenCompleta() {
    this.imagenSeleccionada = null;
  }

  getEstadoClase(): string {
    switch (this.reporte.estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'en progreso': return 'estado-progreso';
      case 'resuelto': return 'estado-resuelto';
      default: return 'estado-default';
    }
  }

  seleccionarReporte() {
    this.seleccionar.emit(this.reporte);
  }
}
