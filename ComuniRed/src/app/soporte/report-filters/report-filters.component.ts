import { Component, Input } from '@angular/core';
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
export class ReportFiltersComponent 
{
  @Input() reportes: Reporte[] = [];

  busqueda: string = '';
  categoriaSeleccionada: string = 'Todos';
  categorias: string[] = ['Todos', 'Alumbrado', 'Limpieza', 'Seguridad'];
  tipo: 'recientes' | 'votados' | 'urgentes' = 'recientes';

  setTipo(nuevoTipo: 'recientes' | 'votados' | 'urgentes') {
    this.tipo = nuevoTipo;
  }

  filtrarReportes(): Reporte[] {
    let filtrados = [...this.reportes];

    // 🔎 Buscar por texto
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

    switch (this.tipo) 
    {
      case 'votados':
        return filtrados.sort((a, b) => b.reacciones.likes - a.reacciones.likes);

      case 'urgentes':
        return filtrados
          .filter(r => r.estado.toLowerCase() === 'pendiente')
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

      case 'recientes':
      default:
        return filtrados.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

  }
}
