import { Component, OnInit } from '@angular/core'; // ✅ Aquí se importa OnInit
import { CommonModule } from '@angular/common';
import { ReportCardComponent, REPORTES } from './report-card/report-card.component';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportStatsComponent } from './report-stats/report-stats.component';
import { MapReportComponent } from './map-reports/map-report.component';
import { HomeComponent } from './home/home.component'



export interface Reacciones 
{
  likes: number;
  helpful?: number;
  love?: number;
  wow?: number;
  sad?: number;
}

export interface Usuario {
  nombre: string;
  avatar: string;
}

export interface Comentario {
  autor: string;
  texto: string;
  fecha: Date;
}

export interface Historial {
  accion: string;
  autor: string;
  fecha: Date;
}

export interface Reporte {
  id: number;
  usuario: string;
  usuarioAvatar: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en progreso' | 'resuelto';
  fecha: Date;
  ubicacion: string;
  imagenes: string[];
  reacciones: Reacciones;
  comentarios: Comentario[];
  historial: Historial[];
}

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
export class SoporteComponent implements OnInit 
{

  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];

  ngOnInit(): void 
  {
    this.reportes = REPORTES;
    this.reportesFiltrados = [...this.reportes];
  }
}
