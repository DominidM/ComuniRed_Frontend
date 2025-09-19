import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportCardComponent } from '../report-card/report-card.component';
import { Reporte } from '../soporte.component';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportCardComponent],
  templateUrl: './report-filters.component.html',
  styleUrls: ['./report-filters.component.css']
})
export class ReportFiltersComponent {
  @Input() reportes: Reporte[] = [];

  @Output() filtrar = new EventEmitter<Reporte[]>(); // ✅ AHORA EXISTE

  busqueda: string = '';
  categoriaSeleccionada: string = 'Todos';
  categorias: string[] = ['Todos', 'Alumbrado', 'Limpieza', 'Seguridad'];
  tipo: 'recientes' | 'votados' | 'urgentes' = 'recientes';

  setTipo(nuevoTipo: 'recientes' | 'votados' | 'urgentes') {
    this.tipo = nuevoTipo;
    this.emitirFiltrados(); // ✅ cada vez que cambias el tipo, emites los resultados
  }

  filtrarReportes(): Reporte[] {
    let filtrados = [...this.reportes];

    if (this.busqueda.trim() !== '') {
      const query = this.busqueda.toLowerCase();
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(query) ||
        r.descripcion.toLowerCase().includes(query)
      );
    }

    if (this.categoriaSeleccionada !== 'Todos') {
      filtrados = filtrados.filter(r => r.categoria === this.categoriaSeleccionada);
    }

    switch (this.tipo) {
      case 'votados':
        filtrados.sort((a, b) => b.reacciones.likes - a.reacciones.likes);
        break;

      case 'urgentes':
        filtrados = filtrados
          .filter(r => r.estado.toLowerCase() === 'pendiente')
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        break;

      case 'recientes':
      default:
        filtrados.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        break;
    }

    return filtrados;
  }

  emitirFiltrados() {
    const filtrados = this.filtrarReportes();
    this.filtrar.emit(filtrados); // ✅ esto manda el array filtrado al padre
  }
}
