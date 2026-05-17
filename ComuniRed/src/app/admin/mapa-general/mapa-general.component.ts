import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { QuejaService, Queja } from '../../services/queja.service';
import * as L from 'leaflet';

interface MapaQueja {
  id: string;
  titulo: string;
  ubicacion: string;
  categoria: string;
  estado: string;
  lat: number;
  lng: number;
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
  imports: [CommonModule, WorkspaceHeaderComponent],
  templateUrl: './mapa-general.component.html',
  styleUrls: ['./mapa-general.component.css']
})
export class MapaGeneralComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaCanvas', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  private readonly COLORES = [
    '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];

  categorias: Categoria[] = [];
  estados: Estado[] = [];
  quejas: MapaQueja[] = [];
  quejasFiltradas: MapaQueja[] = [];
  quejasTotal: number = 0;
  loading = true;

  selectedCategoria: string = 'todas';
  selectedEstado: string = 'todos';

  constructor(private quejaService: QuejaService) {}

  ngOnInit(): void {
    this.cargarQuejas();
  }

  private mapReady = false;

  private cargarQuejas(): void {
    this.loading = true;
    this.quejaService.obtenerQuejas('').subscribe({
      next: (data) => {
        const conCoordenadas = data.filter(q => q.lat != null && q.lng != null);
        this.quejas = conCoordenadas.map(q => ({
          id: q.id,
          titulo: q.titulo,
          ubicacion: q.ubicacion || '',
          categoria: q.categoria?.nombre || 'Sin categoria',
          estado: q.estado?.nombre || 'Pendiente',
          lat: q.lat!,
          lng: q.lng!
        }));
        this.quejasTotal = this.quejas.length;
        this.quejasFiltradas = [...this.quejas];
        this.categorias = this.extrarLista('categoria');
        this.estados = this.extrarLista('estado');
        this.loading = false;
        if (this.mapReady) this.updateMapMarkers();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private extrarLista(tipo: 'categoria' | 'estado'): { nombre: string; color: string }[] {
    const nombres = [...new Set(this.quejas.map(q => q[tipo]))].sort();
    return nombres.map((nombre, i) => ({
      nombre,
      color: this.COLORES[i % this.COLORES.length]
    }));
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-12.0464, -77.0428],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.mapReady = true;
    if (!this.loading) this.updateMapMarkers();
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
    setTimeout(() => this.map.invalidateSize(), 100);
  }
}