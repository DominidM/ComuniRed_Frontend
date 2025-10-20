import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

interface Queja {
  id: string;
  titulo: string;
  ubicacion: string;
  categoria: string;
  estado: string;
  lat: number;
  lng: number;
  posX?: number;
  posY?: number;
}

interface Categoria {
  nombre: string;
  color: string;
}

interface Estado {
  nombre: string;
  color: string;
}

@Component({
  selector: 'app-mapa-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-general.component.html',
  styleUrls: ['./mapa-general.component.css']
})
export class MapaGeneralComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaCanvas', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  categorias: Categoria[] = [
    { nombre: 'Baches', color: '#ef4444' },
    { nombre: 'Alumbrado Público', color: '#f59e0b' },
    { nombre: 'Alcantarillado', color: '#3b82f6' },
    { nombre: 'Basura', color: '#10b981' },
    { nombre: 'Señalización', color: '#8b5cf6' }
  ];

  estados: Estado[] = [
    { nombre: 'Pendiente', color: '#f59e0b' },
    { nombre: 'En Proceso', color: '#3b82f6' },
    { nombre: 'Resuelta', color: '#10b981' },
    { nombre: 'Rechazada', color: '#ef4444' }
  ];

  quejas: Queja[] = [
    { id: '1', titulo: 'Bache gigante en Av. Principal', ubicacion: 'Av. Principal #123, Cercado de Lima', categoria: 'Baches', estado: 'En Proceso', lat: -12.0464, lng: -77.0428 },
    { id: '2', titulo: 'Falta de iluminación en parque', ubicacion: 'Parque Central, Col. Roma', categoria: 'Alumbrado Público', estado: 'Pendiente', lat: -12.0750, lng: -77.0250 },
    { id: '3', titulo: 'Fuga de agua en la calle', ubicacion: 'Calle Insurgentes #456', categoria: 'Alcantarillado', estado: 'Resuelta', lat: -12.0500, lng: -77.0450 },
    { id: '4', titulo: 'Señal de alto vandalizada', ubicacion: 'Esquina Reforma y Juárez', categoria: 'Señalización', estado: 'Pendiente', lat: -12.0400, lng: -77.0500 },
    { id: '5', titulo: 'Acumulación de basura', ubicacion: 'Col. Condesa (sim), Calle Ámsterdam', categoria: 'Basura', estado: 'En Proceso', lat: -12.1191, lng: -77.0349 },
    { id: '6', titulo: 'Poste de luz caído', ubicacion: 'Av. Arequipa, Miraflores', categoria: 'Alumbrado Público', estado: 'Pendiente', lat: -12.1200, lng: -77.0300 },
    { id: '7', titulo: 'Basura acumulada', ubicacion: 'Jr. Lampa, Cercado de Lima', categoria: 'Basura', estado: 'Resuelta', lat: -12.0450, lng: -77.0330 }
  ];

  selectedCategoria: string = 'todas';
  selectedEstado: string = 'todos';
  quejasFiltradas: Queja[] = [];
  quejasTotal: number = 0;

  ngOnInit(): void {
    this.quejasTotal = this.quejas.length;
    this.quejasFiltradas = [...this.quejas];
  }

  ngAfterViewInit(): void {
    // Inicializa el mapa Leaflet
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-12.0464, -77.0428],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.updateMapMarkers();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  filterByCategoria(categoria: string): void {
    this.selectedCategoria = categoria;
    this.applyFilters();
  }

  filterByEstado(estado: string): void {
    this.selectedEstado = estado;
    this.applyFilters();
  }

  applyFilters(): void {
    this.quejasFiltradas = this.quejas.filter(q => {
      const matchCategoria = this.selectedCategoria === 'todas' || q.categoria === this.selectedCategoria;
      const matchEstado = this.selectedEstado === 'todos' || q.estado === this.selectedEstado;
      return matchCategoria && matchEstado;
    });
    this.updateMapMarkers();
  }

  getCategoriaColor(categoria: string): string {
    const cat = this.categorias.find(c => c.nombre === categoria);
    return cat ? cat.color : '#6b7280';
  }

  getEstadoColor(estado: string): string {
    const est = this.estados.find(e => e.nombre === estado);
    return est ? est.color : '#6b7280';
  }

  private updateMapMarkers(): void {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    this.quejasFiltradas.forEach(queja => {
      const color = this.getCategoriaColor(queja.categoria);
      const estadoColor = this.getEstadoColor(queja.estado);

      const marker = L.circleMarker([queja.lat, queja.lng], {
        radius: 10,
        color,
        weight: 2,
        fillColor: '#fff',
        fillOpacity: 1
      });

      const popupHtml = `
        <div style="font-size:14px">
          <strong>${queja.titulo}</strong><br/>
          <small>${queja.ubicacion}</small><br/>
          <div style="margin-top:6px;">
            <span style="display:inline-block;padding:4px 8px;border-radius:12px;background:${estadoColor};color:#fff;font-size:12px">
              ${queja.estado}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
      marker.addTo(this.markersLayer);
    });

    if (this.quejasFiltradas.length === 1) {
      const q = this.quejasFiltradas[0];
      this.map.setView([q.lat, q.lng], 14);
    } else if (this.quejasFiltradas.length > 1) {
      const bounds = L.latLngBounds(this.quejasFiltradas.map(q => [q.lat, q.lng] as [number, number]));
      this.map.fitBounds(bounds.pad(0.2));
    }
  }
}