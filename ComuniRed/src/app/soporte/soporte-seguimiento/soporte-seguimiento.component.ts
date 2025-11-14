import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reporte, REPORTES } from '../json/json';

interface FiltroSeguimiento {
  estado: string;
  busqueda: string;
  ordenPor: 'fecha' | 'prioridad' | 'estado';
}

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-seguimiento.component.html',
  styleUrls: ['./soporte-seguimiento.component.css']
})
export class SoporteSeguimientoComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  reporteSeleccionado: Reporte | null = null;
  mostrarTimeline: boolean = false;

  filtros: FiltroSeguimiento = {
    estado: '',
    busqueda: '',
    ordenPor: 'fecha'
  };

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.reportesFiltrados = [...this.reportes];
    this.ordenarReportes();
  }

  get totalReportes(): number {
    return this.reportes.length;
  }

  get reportesEnProceso(): number {
    return this.reportes.filter(r => r.estado === 'en progreso').length;
  }

  get reportesResueltos(): number {
    return this.reportes.filter(r => r.estado === 'resuelto').length;
  }

  get reportesPendientes(): number {
    return this.reportes.filter(r => r.estado === 'pendiente').length;
  }

  aplicarFiltros(): void {
    let filtrados = [...this.reportes];

    if (this.filtros.estado) {
      filtrados = filtrados.filter(r => r.estado === this.filtros.estado);
    }

    if (this.filtros.busqueda.trim()) {
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) ||
        r.cliente.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase())
      );
    }

    this.reportesFiltrados = filtrados;
    this.ordenarReportes();
  }

  ordenarReportes(): void {
    switch (this.filtros.ordenPor) {
      case 'fecha':
        this.reportesFiltrados.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        break;
      case 'prioridad':
        const prioridadOrden = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
        this.reportesFiltrados.sort((a, b) => 
          prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]
        );
        break;
      case 'estado':
        this.reportesFiltrados.sort((a, b) => a.estado.localeCompare(b.estado));
        break;
    }
  }

  verTimeline(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
    this.mostrarTimeline = true;
  }

  cerrarTimeline(): void {
    this.mostrarTimeline = false;
    this.reporteSeleccionado = null;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente': return '#f59e0b';
      case 'en progreso': return '#3b82f6';
      case 'resuelto': return '#10b981';
      default: return '#6b7280';
    }
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#10b981';
      default: return '#6b7280';
    }
  }

  getProgreso(reporte: Reporte): number {
    if (!reporte.historial || reporte.historial.length === 0) return 0;
    
    const estados = ['enviado', 'observado', 'en progreso', 'resuelto'];
    const ultimoEstado = reporte.historial[reporte.historial.length - 1].estado;
    const index = estados.indexOf(ultimoEstado || 'enviado');
    
    return Math.round(((index + 1) / estados.length) * 100);
  }

  getDiasTranscurridos(fecha: Date): number {
    const hoy = new Date();
    const fechaReporte = new Date(fecha);
    const diferencia = hoy.getTime() - fechaReporte.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  getEstadoIcono(estado: string): string {
    switch (estado) {
      case 'enviado': return '📩';
      case 'observado': return '👁️';
      case 'en progreso': return '⚙️';
      case 'resuelto': return '✅';
      default: return '📌';
    }
  }
}
