import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Reporte } from '../../../json/json';

type Estado = 'enviado' | 'observado' | 'en progreso' | 'resuelto';

@Component({
  selector: 'app-modal-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-detalles.component.html',
  styleUrls: ['./modal-detalles.component.css']
})
export class ModalDetallesComponent implements OnInit {
  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();
  @Input() isOpen: boolean = false;

  ultimoEstadoModal: Estado | null = null;

  private http: HttpClient = inject(HttpClient);
  private googleMapsApiKey = 'TU_API_KEY_DE_GOOGLE_MAPS';

  ngOnInit(): void {
    if (this.reporte.ubicacion && (this.reporte.lat === undefined || this.reporte.lng === undefined)) {
      this.obtenerCoordenadas(this.reporte.ubicacion);
    }

    this.ultimoEstadoModal = this.reporte.historial?.length
      ? (this.reporte.historial[this.reporte.historial.length - 1].estado ?? null)
      : 'enviado';
  }


  cerrarModal(): void {
    this.cerrar.emit();
  }

  cerrarDesdeFondo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.cerrarModal();
    }
  }

  private obtenerCoordenadas(direccion: string): void {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${this.googleMapsApiKey}`;
    this.http.get<{ status: string; results: { geometry: { location: { lat: number; lng: number } } }[] }>(url)
      .subscribe({
        next: (res) => {
          if (res.status === 'OK' && res.results.length > 0) {
            this.reporte.lat = res.results[0].geometry.location.lat;
            this.reporte.lng = res.results[0].geometry.location.lng;
          } else {
            console.warn('No se encontraron coordenadas para esta dirección:', direccion);
          }
        },
        error: (error) => {
          console.error('Error al obtener coordenadas:', error);
        }
      });
  }

  getUltimoEstado(): Estado | null {
    return this.ultimoEstadoModal;
  }

  avanzarProgreso(): void {
    const estados: Estado[] = ['enviado', 'observado', 'en progreso', 'resuelto'];
    const ultimo = this.ultimoEstadoModal || 'enviado';
    const index = estados.indexOf(ultimo);

    if (index === -1 || index === estados.length - 1) return;

    const siguiente = estados[index + 1];


    this.ultimoEstadoModal = siguiente;

    if (!this.reporte.historial) this.reporte.historial = [];
    this.reporte.historial.push({
      id: this.reporte.historial.length + 1,
      fecha: new Date(),
      mensaje: `Estado cambiado a ${siguiente}`,
      estado: siguiente
    });
  }

  get ultimoHistorial() {
  if (this.reporte?.historial?.length) {
    return this.reporte.historial[this.reporte.historial.length - 1];
  }
  return null;
}
}
