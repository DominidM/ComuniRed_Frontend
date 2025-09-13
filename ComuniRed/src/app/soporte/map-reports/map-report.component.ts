import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Reporte } from '../soporte.component';

@Component({
  selector: 'app-map-reports',
  templateUrl: './map-report.component.html',
  styleUrls: ['./map-report.component.css']
})
export class MapReportComponent implements AfterViewInit, OnChanges {
  @Input() reportes: Reporte[] = [];

  private map!: L.Map;
  private markers: L.Marker[] = [];

  private limaBounds: L.LatLngBoundsExpression = [
    [-12.1, -77.2],
    [-11.9, -76.9]
  ];

  ngAfterViewInit(): void 
  {
    this.map = L.map('mapa', {
      maxBounds: this.limaBounds,   
      maxBoundsViscosity: 1.0,
      minZoom: 11,
      maxZoom: 16
    }).setView([-12.0464, -77.0428], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.agregarMarcadores();
  }

  ngOnChanges(changes: SimpleChanges): void 
  {
    if (changes['reportes'] && this.map) 
    {
      this.agregarMarcadores();
    }
  }

  private agregarMarcadores() 
  {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.reportes.forEach(r => {
      const coords = this.obtenerCoordenadas(r.ubicacion);
      if (coords) 
        {
        const marker = L.marker(coords, { icon: this.iconoRojo() }).addTo(this.map);
        marker.bindPopup(`<b>${r.titulo}</b><br>${r.descripcion}`);
        this.markers.push(marker);
      }
    });
  }

  private obtenerCoordenadas(direccion: string): [number, number] | null 
  {
    const lat = -12.0464 + (Math.random() - 0.5) * 0.2;
    const lng = -77.0428 + (Math.random() - 0.5) * 0.3;
    return [lat, lng];
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
