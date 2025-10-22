import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ReportCardComponent } from './report-card/report-card.component';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportStatsComponent } from './report-stats/report-stats.component';

import { Reporte, REPORTES } from '../json/json';
import { Soporte, Usuario_soporte } from '../json/json';
import { Cliente, Usuario_cliente } from '../json/json';

@Component({
  selector: 'app-soporte-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportCardComponent,
    ReportFiltersComponent,
    ReportStatsComponent
  ],
  templateUrl: './soporte-home.component.html',
  styleUrls: ['./soporte-home.component.css']
})
export class SoporteHomeComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  reporteSeleccionado?: Reporte;
  soporte!: Soporte;
  cliente!: Cliente;

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
