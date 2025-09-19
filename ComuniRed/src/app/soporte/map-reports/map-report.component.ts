import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Reporte } from '../soporte.component';

@Component({
  selector: 'app-map-reports',
  templateUrl: './map-report.component.html',
  styleUrls: ['./map-report.component.css']
})
export class MapReportComponent implements AfterViewInit, OnChanges {
  @Input() reportes: Reporte[] = [];
  @Input() reporteSeleccionado?: Reporte;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  private limaBounds: L.LatLngBoundsExpression = [
    [-12.1, -77.2],
    [-11.9, -76.9]
  ];

  ngAfterViewInit(): void {
    this.map = L.map('mapa', {
      maxBounds: this.limaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 11,
      maxZoom: 16
    }).setView([-12.0464, -77.0428], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.actualizarMarcadores();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['reportes'] || changes['reporteSeleccionado'])) {
      this.actualizarMarcadores();
    }
  }

  private async actualizarMarcadores() {
    // Limpiar marcadores antiguos
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Seleccionar qué reportes mostrar
    const reportesAMostrar = this.reporteSeleccionado ? [this.reporteSeleccionado] : this.reportes;

    for (const r of reportesAMostrar) {
      // Si no tiene coordenadas, geocodificar
      if (r.lat === undefined || r.lng === undefined) {
        const coords = await this.geocodeDireccion(r.ubicacion);
        if (coords) {
          r.lat = coords[0];
          r.lng = coords[1];
        }
      }

      if (r.lat !== undefined && r.lng !== undefined) {
        const marker = L.marker([r.lat, r.lng], { icon: this.iconoRojo() }).addTo(this.map);
        marker.bindPopup(`<b>${r.titulo}</b><br>${r.ubicacion}<br>${r.descripcion}`);
        this.markers.push(marker);
      }
    }

    // Ajustar vista para centrar los marcadores
    const group = L.featureGroup(this.markers);
    if (this.markers.length > 0) {
      this.map.fitBounds(group.getBounds().pad(0.2));
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
      console.error('Error geocoding:', error);
      return null;
    }
  }

  private iconoRojo() {
    return L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  }
}
