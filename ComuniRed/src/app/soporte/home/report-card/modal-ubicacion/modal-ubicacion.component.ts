import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Reporte } from '../../../json/json';

@Component({
  selector: 'app-modal-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-ubicacion.component.html',
  styleUrls: ['./modal-ubicacion.component.css']
})
export class ModalUbicacionComponent implements AfterViewInit, OnChanges {
  @Input() reporte!: Reporte;
  @Output() cerrar = new EventEmitter<void>();

  private map!: L.Map;
  private marker?: L.Marker;

  private limaBounds: L.LatLngBoundsExpression = [
    [-12.1, -77.2],
    [-11.9, -76.9]
  ];

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.colocarMarcador();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reporte'] && this.map) {
      this.colocarMarcador();
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('mapa', {
      maxBounds: this.limaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 11,
      maxZoom: 16
    }).setView([-12.0464, -77.0428], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // ✅ Asegurar que el mapa se renderice correctamente en modal
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  private async colocarMarcador() {
    if (!this.reporte) return;

    console.log("📍 Reporte recibido en el modal:", this.reporte);

    // Limpiar marcador previo
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }

    let { lat, lng } = this.reporte;

    if (lat === undefined || lng === undefined) {
      console.log("🌍 Geocodificando ubicación:", this.reporte.ubicacion);
      const coords = await this.geocodeDireccion(this.reporte.ubicacion);
      if (coords) {
        lat = coords[0];
        lng = coords[1];
        this.reporte.lat = lat;
        this.reporte.lng = lng;
      }
    }

    if (lat !== undefined && lng !== undefined) {
      this.marker = L.marker([lat, lng], { icon: this.iconoRojo() }).addTo(this.map);
      this.marker.bindPopup(`<b>${this.reporte.titulo}</b><br>${this.reporte.ubicacion ?? ''}`);
      this.map.setView([lat, lng], 15);
    } else {
      console.warn("⚠️ No se pudo obtener coordenadas para:", this.reporte.ubicacion);
    }
  }

  private async geocodeDireccion(direccion: string): Promise<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      return null;
    } catch (error) {
      console.error('❌ Error geocoding:', error);
      return null;
    }
  }

  private iconoRojo() {
    return L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [0, -40],
      className: 'custom-icon'
    });
  }
}
