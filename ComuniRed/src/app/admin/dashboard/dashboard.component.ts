import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Input() userEmail: string = '';

  // Datos principales del sistema de reportes comunitarios
  stats = {
    totalUsuarios: 0,
    reportesEnviados: 0,
    reportesResueltos: 0,
    reportesPendientes: 0,
    crecimientoUsuarios: 0,
    crecimientoReportes: 0,
    crecimientoResueltos: 0,
    cambioPendientes: 0
  };

  // Datos para gráficos
  infraMasReportada: any[] = [];         // Tipos de infraestructuras más reportadas
  evolucionReportes: any[] = [];         // Evolución de reportes por mes
  barriosMasIncidentes: any[] = [];      // Barrios con más incidentes
  estadoReportes: any[] = [];            // Estado (resueltos/pendientes)

  // constructor(private dashboardService: DashboardService) {}
  constructor() {}

  ngOnInit(): void {
    this.loadStats();
    this.loadGraphs();
  }

  loadStats() {
    // Ejemplo con servicio real:
    // this.dashboardService.getStats().subscribe(data => {
    //   this.stats = data;
    // });
    // Demo: datos simulados
    this.stats = {
      totalUsuarios: 250,
      reportesEnviados: 320,
      reportesResueltos: 220,
      reportesPendientes: 100,
      crecimientoUsuarios: 2.8,
      crecimientoReportes: 4.1,
      crecimientoResueltos: 3.5,
      cambioPendientes: -1.8
    };
  }

  loadGraphs() {
    // Ejemplo con servicio real:
    // this.dashboardService.getGraphs().subscribe(data => {
    //   this.infraMasReportada = data.infraMasReportada;
    //   this.evolucionReportes = data.evolucionReportes;
    //   this.barriosMasIncidentes = data.barriosMasIncidentes;
    //   this.estadoReportes = data.estadoReportes;
    // });
    // Demo: datos simulados
    this.infraMasReportada = [];
    this.evolucionReportes = [];
    this.barriosMasIncidentes = [];
    this.estadoReportes = [];
  }
}