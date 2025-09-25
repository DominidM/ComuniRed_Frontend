import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ReportCardComponent } from './report-card/report-card.component';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportStatsComponent } from './report-stats/report-stats.component';
//import { MapReportComponent } from './map-reports/map-report.component';
import { HeaderComponent } from './header/header.component';

import { Reporte, REPORTES } from './ajson/json';
import { Soporte, Usuario_soporte } from './ajson/json';
import { Cliente, Usuario_cliente } from './ajson/json';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [
    CommonModule,
    ReportFiltersComponent,
    ReportStatsComponent,
    RouterModule,
    //MapReportComponent,
    ReportCardComponent,
    HeaderComponent
  ],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css']
})
export class SoporteComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  reporteSeleccionado?: Reporte = undefined;
  soporte!:Soporte;
  cliente!:Cliente;

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.reportesFiltrados = [...this.reportes];
    this.soporte = Usuario_soporte[0];
    this.cliente = Usuario_cliente[0];
  }

  seleccionarReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
  }

  aplicarFiltro(filtrados: Reporte[]) {
    this.reportesFiltrados = filtrados;
  }
}
