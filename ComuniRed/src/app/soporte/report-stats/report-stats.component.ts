import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../soporte.component';


@Component({
  selector: 'app-report-stats',
    standalone: true,
  imports: [CommonModule],
  templateUrl: './report-stats.component.html',
  styleUrls: ['./report-stats.component.css']
})
export class ReportStatsComponent {
  @Input() reportes: Reporte[] = [];

  get total() {
    return this.reportes.length;
  }

  get pendientes() {
    return this.reportes.filter(r => r.estado === 'pendiente').length;
  }

  get enProgreso() {
    return this.reportes.filter(r => r.estado === 'en progreso').length;
  }

  get resueltos() {
    return this.reportes.filter(r => r.estado === 'resuelto').length;
  }
}
