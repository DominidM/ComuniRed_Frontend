import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reporte, REPORTES } from '../json/json';

interface EstadoValidacion {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
}

@Component({
  selector: 'app-validacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-validacion.component.html',
  styleUrls: ['./soporte-validacion.component.css']
})
export class SoporteValidacionComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesPendientes: Reporte[] = [];
  reporteSeleccionado: Reporte | null = null;
  
  estadosValidacion: EstadoValidacion[] = [
    {
      id: 'pendiente',
      nombre: 'Pendiente',
      descripcion: 'Esperando validación',
      color: '#f59e0b',
      icono: '⏳'
    },
    {
      id: 'en progreso',
      nombre: 'Aprobado',
      descripcion: 'Reporte validado y en proceso',
      color: '#10b981',
      icono: '✅'
    },
    {
      id: 'resuelto',
      nombre: 'Resuelto',
      descripcion: 'Reporte completado',
      color: '#3b82f6',
      icono: '✔️'
    }
  ];

  filtroEstado: string = '';
  busqueda: string = '';
  reportesFiltrados: Reporte[] = [];
  
  mostrarModal: boolean = false;
  motivoRechazo: string = '';
  comentarioValidacion: string = '';

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.reportesPendientes = this.reportes.filter(r => 
      r.estado === 'pendiente'
    );
    this.reportesFiltrados = [...this.reportesPendientes];
  }

  get totalPendientes(): number {
    return this.reportes.filter(r => r.estado === 'pendiente').length;
  }

  get totalAprobados(): number {
    return this.reportes.filter(r => r.estado === 'en progreso').length;
  }

  get totalResueltos(): number {
    return this.reportes.filter(r => r.estado === 'resuelto').length;
  }

  get tasaAprobacion(): number {
    const total = this.reportes.length;
    if (total === 0) return 0;
    const aprobados = this.totalAprobados + this.totalResueltos;
    return Math.round((aprobados / total) * 100);
  }

  aplicarFiltros(): void {
    let filtrados = [...this.reportesPendientes];

    if (this.filtroEstado) {
      filtrados = filtrados.filter(r => r.estado === this.filtroEstado);
    }

    if (this.busqueda.trim()) {
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        r.cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    this.reportesFiltrados = filtrados;
  }

  seleccionarReporte(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
    this.mostrarModal = true;
    this.motivoRechazo = '';
    this.comentarioValidacion = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteSeleccionado = null;
    this.motivoRechazo = '';
    this.comentarioValidacion = '';
  }

  aprobarReporte(): void {
    if (!this.reporteSeleccionado) return;

    const confirmar = confirm(`¿Estás seguro de aprobar el reporte "${this.reporteSeleccionado.titulo}"?`);
    if (!confirmar) return;

    this.reporteSeleccionado.estado = 'en progreso';
    
    if (!this.reporteSeleccionado.historial) {
      this.reporteSeleccionado.historial = [];
    }

    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: `Reporte aprobado y en proceso${this.comentarioValidacion ? ': ' + this.comentarioValidacion : ''}`,
      estado: 'en progreso'
    });

    this.actualizarListas();
    this.cerrarModal();
    alert('Reporte aprobado exitosamente');
  }

  rechazarReporte(): void {
    if (!this.reporteSeleccionado) return;

    if (!this.motivoRechazo.trim()) {
      alert('Por favor, ingresa un motivo de rechazo');
      return;
    }

    const confirmar = confirm(`¿Estás seguro de rechazar el reporte "${this.reporteSeleccionado.titulo}"?`);
    if (!confirmar) return;

    this.reporteSeleccionado.estado = 'pendiente';
    
    if (!this.reporteSeleccionado.historial) {
      this.reporteSeleccionado.historial = [];
    }

    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: `Reporte rechazado: ${this.motivoRechazo}`,
      estado: 'enviado'
    });

    this.actualizarListas();
    this.cerrarModal();
    alert('Reporte rechazado y devuelto a pendiente');
  }

  solicitarRevision(): void {
    if (!this.reporteSeleccionado) return;

    if (!this.comentarioValidacion.trim()) {
      alert('Por favor, ingresa un comentario explicando qué información se necesita');
      return;
    }

    this.reporteSeleccionado.estado = 'pendiente';
    
    if (!this.reporteSeleccionado.historial) {
      this.reporteSeleccionado.historial = [];
    }

    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: `Solicitada revisión: ${this.comentarioValidacion}`,
      estado: 'observado'
    });

    this.actualizarListas();
    this.cerrarModal();
    alert('Se ha solicitado revisión del reporte');
  }

  private actualizarListas(): void {
    this.reportesPendientes = this.reportes.filter(r => 
      r.estado === 'pendiente'
    );
    this.aplicarFiltros();
  }

  getEstadoColor(estado: string): string {
    const estadoObj = this.estadosValidacion.find(e => e.id === estado);
    return estadoObj ? estadoObj.color : '#6b7280';
  }

  getEstadoNombre(estado: string): string {
    const estadoObj = this.estadosValidacion.find(e => e.id === estado);
    return estadoObj ? estadoObj.nombre : 'Sin estado';
  }
}
