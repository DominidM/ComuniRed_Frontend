import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Reporte, REPORTES, Cliente, Usuario_cliente, Soporte, Usuario_soporte } from '../json/json';

type Estado = 'enviado' | 'observado' | 'en progreso' | 'resuelto';

@Component({
  selector: 'app-editar-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte-report.component.html',
  styleUrls: ['./soporte-report.component.css']
})
export class SoporteReportComponent implements OnInit {
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];
  reporteSeleccionado?: Reporte;
  soporte!: Soporte;
  cliente!: Cliente;

  // Estados y modales
  mostrarDetalles = false;
  mostrarUbicacion = false;
  mostrarEnvioMensaje = false;
  imagenSeleccionada: string | null = null;
  ultimoEstadoModal: Estado | null = null;

  // Filtros
  busqueda = '';
  tipoReporte = '';
  estadoSeleccionado = '';
  prioridadSeleccionada = '';
  periodoSeleccionado = '';

  tiposReporte = ['Incidente', 'Mantenimiento', 'Sugerencia'];
  estados = ['Pendiente', 'En progreso', 'Resuelto'];
  prioridades = ['Baja', 'Media', 'Alta'];
  periodos = ['Hoy', 'Esta semana', 'Este mes'];

  // Mensaje
  mensaje: string = '';

  private googleMapsApiKey = 'TU_API_KEY_DE_GOOGLE_MAPS';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.reportes = REPORTES;
    this.reportesFiltrados = [...this.reportes];
    this.soporte = Usuario_soporte[0];
    this.cliente = Usuario_cliente[0];
  }

  // ========== ESTADÍSTICAS ==========
  get total() {
    return this.reportesFiltrados.length;
  }

  get nuevos() {
    return this.reportesFiltrados.filter(r => r.estado === 'pendiente').length;
  }

  get enProceso() {
    return this.reportesFiltrados.filter(r => r.estado === 'en progreso').length;
  }

  get resueltos() {
    return this.reportesFiltrados.filter(r => r.estado === 'resuelto').length;
  }

  get tasaResolucion() {
    return this.total > 0 ? Math.round((this.resueltos / this.total) * 100) : 0;
  }

  // ========== FILTROS ==========
  aplicarFiltro() {
    let filtrados = this.reportes;

    if (this.busqueda.trim()) {
      filtrados = filtrados.filter(r =>
        r.titulo.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    if (this.tipoReporte) {
      filtrados = filtrados.filter(r => r.tipo === this.tipoReporte);
    }

    if (this.estadoSeleccionado) {
      filtrados = filtrados.filter(r => r.estado === this.estadoSeleccionado);
    }

    if (this.prioridadSeleccionada) {
      filtrados = filtrados.filter(r => r.prioridad === this.prioridadSeleccionada);
    }

    this.reportesFiltrados = filtrados;
  }

  // ========== SELECCIÓN DE REPORTE ==========
  seleccionarReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
  }

  // ========== MODALES ==========
  abrirDetalles(reporte: Reporte, event?: Event) {
    if (event) event.stopPropagation();
    this.reporteSeleccionado = reporte;
    this.mostrarDetalles = true;

    if (reporte.ubicacion && (reporte.lat === undefined || reporte.lng === undefined)) {
      this.obtenerCoordenadas(reporte.ubicacion);
    }

    this.ultimoEstadoModal = reporte.historial?.length
      ? (reporte.historial[reporte.historial.length - 1].estado ?? null)
      : 'enviado';
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.reporteSeleccionado = undefined;
  }

  abrirUbicacion(reporte: Reporte, event?: Event) {
    if (event) event.stopPropagation();
    this.reporteSeleccionado = reporte;
    this.mostrarUbicacion = true;
  }

  cerrarUbicacion() {
    this.mostrarUbicacion = false;
    this.reporteSeleccionado = undefined;
  }

  abrirImagenCompleta(img: string) {
    this.imagenSeleccionada = img;
  }

  cerrarImagenCompleta() {
    this.imagenSeleccionada = null;
  }

  cerrarDesdeFondo(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.cerrarDetalles();
      this.cerrarUbicacion();
    }
  }

  // ========== MENSAJES ==========
  abrirEnvioMensaje() {
    this.mostrarEnvioMensaje = true;
  }

  cerrarEnvioMensaje() {
    this.mostrarEnvioMensaje = false;
    this.mensaje = '';
  }

  enviarMensaje() {
    if (!this.mensaje.trim() || !this.reporteSeleccionado) return;

    const estado = this.reporteSeleccionado.historial?.length
      ? this.reporteSeleccionado.historial[this.reporteSeleccionado.historial.length - 1].estado
      : 'enviado';

    this.agregarMensajeAlHistorial({ mensaje: this.mensaje, estado });
    this.cerrarEnvioMensaje();
  }

  agregarMensajeAlHistorial(event: { mensaje: string, estado?: string }) {
    if (!this.reporteSeleccionado) return;
    if (!this.reporteSeleccionado.historial) this.reporteSeleccionado.historial = [];

    const estado = (event.estado || 'enviado') as Estado;

    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: event.mensaje,
      estado: estado
    });

    this.ultimoEstadoModal = estado;
  }

  // ========== ESTADOS ==========
  cambiarEstado(nuevoEstado: string) {
    if (!this.reporteSeleccionado) return;

    const estado = nuevoEstado as Estado;
    this.ultimoEstadoModal = estado;

    if (!this.reporteSeleccionado.historial) this.reporteSeleccionado.historial = [];
    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: `Estado cambiado a ${estado}`,
      estado: estado
    });
  }

  avanzarProgreso() {
    if (!this.reporteSeleccionado) return;

    const estados: Estado[] = ['enviado', 'observado', 'en progreso', 'resuelto'];
    const ultimo = this.ultimoEstadoModal || 'enviado';
    const index = estados.indexOf(ultimo);

    if (index === -1 || index === estados.length - 1) return;

    const siguiente = estados[index + 1];
    this.ultimoEstadoModal = siguiente;

    if (!this.reporteSeleccionado.historial) this.reporteSeleccionado.historial = [];
    this.reporteSeleccionado.historial.push({
      id: this.reporteSeleccionado.historial.length + 1,
      fecha: new Date(),
      mensaje: `Estado cambiado a ${siguiente}`,
      estado: siguiente
    });
  }

  get ultimoHistorial() {
    if (this.reporteSeleccionado?.historial?.length) {
      return this.reporteSeleccionado.historial[this.reporteSeleccionado.historial.length - 1];
    }
    return null;
  }

  getEstadoClase(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'en progreso': return 'estado-progreso';
      case 'resuelto': return 'estado-resuelto';
      default: return 'estado-default';
    }
  }

  private obtenerCoordenadas(direccion: string): void {
    if (!this.reporteSeleccionado) return;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${this.googleMapsApiKey}`;
    this.http.get<{ status: string; results: { geometry: { location: { lat: number; lng: number } } }[] }>(url)
      .subscribe({
        next: (res) => {
          if (res.status === 'OK' && res.results.length > 0 && this.reporteSeleccionado) {
            this.reporteSeleccionado.lat = res.results[0].geometry.location.lat;
            this.reporteSeleccionado.lng = res.results[0].geometry.location.lng;
          }
        },
        error: (error) => console.error('Error al obtener coordenadas:', error)
      });
  }
}
