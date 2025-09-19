import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ IMPORT CORRECTO
import { Reporte } from '../ajson/json';
import { ReportCardComponent } from '../report-card/report-card.component';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,          // ✅ AHORA FUNCIONA
    ReportCardComponent
  ],
  templateUrl: './report-filters.component.html',
  styleUrls: ['./report-filters.component.css']
})
export class ReportFiltersComponent {
  @Input() reportes: Reporte[] = [];
  @Output() filtrar = new EventEmitter<Reporte[]>();

  busqueda: string = '';
  tipoReporte: string = '';
  estadoSeleccionado: string = '';
  prioridadSeleccionada: string = '';
  periodoSeleccionado: string = '';

  tiposReporte = ['Incidente', 'Mantenimiento', 'Sugerencia'];
  estados = ['Pendiente', 'En progreso', 'Resuelto'];
  prioridades = ['Baja', 'Media', 'Alta'];
  periodos = ['Hoy', 'Esta semana', 'Este mes'];

  reportesFiltrados: Reporte[] = [];

  ngOnInit() {
    this.reportesFiltrados = this.reportes;
  }

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

    this.reportesFiltrados = filtrados;
    this.filtrar.emit(filtrados);
  }
}
