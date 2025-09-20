import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from './report-card/report-card.component';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportStatsComponent } from './report-stats/report-stats.component';
import { MapReportComponent } from './map-reports/map-report.component';
import { HomeComponent } from './header/header.component';

import { Reporte, REPORTES } from './ajson/json';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [
    CommonModule,
    ReportFiltersComponent,
    ReportStatsComponent,
    MapReportComponent,
    HomeComponent
  ],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css']
})
export class SoporteComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  reporteSeleccionado?: Reporte = undefined;

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.reportesFiltrados = [...this.reportes];
  }

  seleccionarReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
  }

  aplicarFiltro(filtrados: Reporte[]) {
    this.reportesFiltrados = filtrados;
  }
}
