import { Component, type OnInit, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  @Input() userEmail = ""

  stats = {
    totalUsuarios: 250,
    reportesEnviados: 320,
    reportesResueltos: 220,
    reportesPendientes: 100,
    crecimientoUsuarios: 2.8,
    crecimientoReportes: 4.1,
    crecimientoResueltos: 3.5,
    cambioPendientes: 1.8,
  }

  // Datos para gráficos con información realista
  infraMasReportada = [
    { tipo: "Alumbrado Público", cantidad: 85 },
    { tipo: "Pavimentación", cantidad: 72 },
    { tipo: "Alcantarillado", cantidad: 58 },
    { tipo: "Parques", cantidad: 43 },
    { tipo: "Señalización", cantidad: 31 },
  ]

  evolucionReportes = [
    { mes: "Ene", cantidad: 45 },
    { mes: "Feb", cantidad: 52 },
    { mes: "Mar", cantidad: 48 },
    { mes: "Abr", cantidad: 61 },
    { mes: "May", cantidad: 58 },
    { mes: "Jun", cantidad: 67 },
    { mes: "Jul", cantidad: 54 },
    { mes: "Ago", cantidad: 73 },
    { mes: "Sep", cantidad: 69 },
    { mes: "Oct", cantidad: 78 },
  ]

  barriosMasIncidentes = [
    { barrio: "Centro", porcentaje: 40, cantidad: 128 },
    { barrio: "Norte", porcentaje: 30, cantidad: 96 },
    { barrio: "Sur", porcentaje: 20, cantidad: 64 },
    { barrio: "Oriente", porcentaje: 10, cantidad: 32 },
  ]

  estadoReportes = [
    { mes: "Ene", resueltos: 28, pendientes: 17 },
    { mes: "Feb", resueltos: 35, pendientes: 17 },
    { mes: "Mar", resueltos: 31, pendientes: 17 },
    { mes: "Abr", resueltos: 42, pendientes: 19 },
    { mes: "May", resueltos: 38, pendientes: 20 },
    { mes: "Jun", resueltos: 45, pendientes: 22 },
    { mes: "Jul", resueltos: 36, pendientes: 18 },
    { mes: "Ago", resueltos: 51, pendientes: 22 },
    { mes: "Sep", resueltos: 47, pendientes: 22 },
    { mes: "Oct", cantidad: 56, pendientes: 22 },
  ]

  constructor() {}

  ngOnInit(): void {
    this.loadStats()
    this.loadGraphs()
  }

  loadStats() {
    // Los datos ya están definidos arriba
  }

  loadGraphs() {
    // Los datos de gráficos ya están definidos arriba
  }
}