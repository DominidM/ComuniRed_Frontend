import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reporte } from '../ajson/json';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-filters.component.html',
  styleUrls: ['./report-filters.component.css']
})
export class ReportFiltersComponent {
  @Input() reportes: Reporte[] = [];
  @Output() filtrar = new EventEmitter<Reporte[]>();

  busqueda = '';
  tipoReporte = '';
  estadoSeleccionado = '';
  prioridadSeleccionada = '';
  periodoSeleccionado = '';

  tiposReporte = ['Incidente', 'Mantenimiento', 'Sugerencia'];
  estados = ['Pendiente', 'En progreso', 'Resuelto'];
  prioridades = ['Baja', 'Media', 'Alta'];
  periodos = ['Hoy', 'Esta semana', 'Este mes'];

  aplicarFiltro() {
    let filtrados = this.reportes;

    if (this.busqueda.trim()) {
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    if (this.tipoReporte) {
      filtrados = filtrados.filter(r => r.tipo === this.tipoReporte);
    }

    if (this.estadoSeleccionado) {
      filtrados = filtrados.filter(r => r.estado === this.estadoSeleccionado);
    }

    if (this.prioridadSeleccionada) {
      filtrados = filtrados.filter(r => r.prioridad === this.prioridadSeleccionada);
    }

    this.filtrar.emit(filtrados);
  }
}
