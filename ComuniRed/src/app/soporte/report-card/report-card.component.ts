import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../ajson/json';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.css']
})
export class ReportCardComponent {
  @Input() reporte!: Reporte;
  @Output() seleccionar = new EventEmitter<Reporte>(); 

  mostrarDetalles = false;
  mostrarUbicacion = false;

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
